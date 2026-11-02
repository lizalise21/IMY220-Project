const User = require('../models/User');
const Post = require('../models/Post');
const Album = require('../models/Album');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Wraps a route so errors become JSON responses (no try/catch in every route).
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    let status = e.status || 500;
    let error = e.message;
    if (e.name === 'CastError') [status, error] = [404, 'Not found'];
    if (e.code === 11000) [status, error] = [409, 'Username or email already in use'];
    res.status(status).json({ error });
  }
};

const cleanTags = (tags) => {
  const arr = Array.isArray(tags) ? tags : [];
  return [...new Set(arr.map((t) => String(t).replace(/^#+/, '').trim().toLowerCase()).filter(Boolean))];
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cleanUser = (u) => {
  const o = u.toObject();
  delete o.password;
  return o;
};

const notify = (user, text, link = '') => Notification.create({ user, text, link });

// Adds commentCount, a comment preview (or all comments) and reportCount to posts.
async function decoratePosts(posts, { allComments = false } = {}) {
  const ids = posts.map((p) => p._id);
  const [comments, reports] = await Promise.all([
    Comment.find({ post: { $in: ids } }).sort('createdAt').populate('author', 'username avatar'),
    Report.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: '$post', n: { $sum: 1 } } }]),
  ]);
  const byPost = {};
  comments.forEach((c) => (byPost[c.post] = byPost[c.post] || []).push(c));
  const counts = Object.fromEntries(reports.map((r) => [r._id.toString(), r.n]));
  return posts.map((p) => {
    const all = byPost[p._id] || [];
    return {
      ...p.toObject(),
      commentCount: all.length,
      comments: allComments ? all : all.slice(-2),
      reportCount: counts[p._id.toString()] || 0,
    };
  });
}

async function deleteAlbums(ids) {
  if (!ids.length) return;
  await Promise.all([Album.deleteMany({ _id: { $in: ids } }), Activity.deleteMany({ album: { $in: ids } })]);
}

// Deletes posts plus their comments, reports and activity. Albums left empty are deleted too.
async function deletePosts(ids) {
  if (!ids.length) return;
  const touched = await Album.find({ posts: { $in: ids } }).select('_id');
  await Promise.all([
    Post.deleteMany({ _id: { $in: ids } }),
    Comment.deleteMany({ post: { $in: ids } }),
    Report.deleteMany({ post: { $in: ids } }),
    Activity.deleteMany({ post: { $in: ids } }),
    Album.updateMany({ posts: { $in: ids } }, { $pull: { posts: { $in: ids } } }),
  ]);
  const emptied = await Album.find({ _id: { $in: touched.map((a) => a._id) }, posts: { $size: 0 } }).select('_id');
  await deleteAlbums(emptied.map((a) => a._id));
}

async function deleteUser(userId) {
  const posts = await Post.find({ author: userId }).select('_id');
  await deletePosts(posts.map((p) => p._id));
  const albums = await Album.find({ owner: userId }).select('_id');
  await deleteAlbums(albums.map((a) => a._id));
  await Promise.all([
    Comment.deleteMany({ author: userId }),
    Report.deleteMany({ reporter: userId }),
    Activity.deleteMany({ user: userId }),
    Notification.deleteMany({ user: userId }),
    Post.updateMany({}, { $pull: { likes: userId } }),
    User.updateMany({}, { $pull: { friends: userId, friendRequests: userId, sentRequests: userId } }),
    User.deleteOne({ _id: userId }),
  ]);
}

module.exports = {
  httpError, handle, cleanTags, escapeRegex, cleanUser, notify,
  decoratePosts, deleteAlbums, deletePosts, deleteUser,
};