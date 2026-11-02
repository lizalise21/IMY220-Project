const router = require('express').Router();
const Post = require('../models/Post');
const Album = require('../models/Album');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Reason = require('../models/Reason');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { handle, httpError, cleanTags, notify, decoratePosts, deletePosts } = require('../utils/helpers');

const AUTHOR = 'username name avatar';
const isAdmin = (u) => u.role === 'admin';
const canEdit = (post, user) => post.author.equals(user.id) || isAdmin(user);

router.get('/reasons', auth, handle(async (req, res) => {
  res.json((await Reason.find().sort('name')).map((r) => r.name));
}));

// ?author=id
router.get('/', auth, handle(async (req, res) => {
  const filter = req.query.author ? { author: req.query.author } : {};
  const posts = await Post.find(filter).sort('-createdAt').limit(100).populate('author', AUTHOR);
  res.json(await decoratePosts(posts));
}));

router.post('/', auth, handle(async (req, res) => {
  const { image, description = '', hashtags } = req.body;
  const tags = cleanTags(hashtags);
  if (!image || !/^data:image\//.test(image)) throw httpError(400, 'An image is required');
  if (!description.trim()) throw httpError(400, 'A description is required');
  if (!tags.length) throw httpError(400, 'Add at least one hashtag');
  const post = await Post.create({ author: req.user.id, image, description: description.trim(), hashtags: tags });
  await Activity.create({ type: 'post', user: req.user.id, post: post._id });
  res.status(201).json({ _id: post._id });
}));

router.get('/:id', auth, handle(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', AUTHOR);
  if (!post) throw httpError(404, 'Post not found');
  const [decorated] = await decoratePosts([post], { allComments: true });
  const albums = await Album.find({ posts: post._id }).select('name owner').populate('owner', 'username');
  res.json({ ...decorated, albums });
}));

// Only the description and hashtags can be edited, never the image.
router.put('/:id', auth, handle(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post not found');
  if (!canEdit(post, req.user)) throw httpError(403, 'Not your post');
  if (req.body.description !== undefined) {
    if (!String(req.body.description).trim()) throw httpError(400, 'A description is required');
    post.description = String(req.body.description).trim();
  }
  if (req.body.hashtags !== undefined) {
    const tags = cleanTags(req.body.hashtags);
    if (!tags.length) throw httpError(400, 'Add at least one hashtag');
    post.hashtags = tags;
  }
  await post.save();
  res.json({ message: 'Post updated' });
}));

router.delete('/:id', auth, handle(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post not found');
  if (!canEdit(post, req.user)) throw httpError(403, 'Not your post');
  if (!post.author.equals(req.user.id)) {
    await notify(post.author, `An administrator removed your post "${post.description.slice(0, 40)}".`);
  }
  await deletePosts([post._id]);
  res.json({ message: 'Post deleted' });
}));

router.post('/:id/like', auth, handle(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw httpError(404, 'Post not found');
  if (post.likes.some((l) => l.equals(req.user.id))) post.likes.pull(req.user.id);
  else post.likes.push(req.user.id);
  await post.save();
  res.json({ likes: post.likes });
}));

router.post('/:id/comments', auth, handle(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) throw httpError(400, 'Comment cannot be empty');
  const post = await Post.findById(req.params.id).select('author');
  if (!post) throw httpError(404, 'Post not found');
  const c = await Comment.create({ post: post._id, author: req.user.id, text });
  if (!post.author.equals(req.user.id)) {
    await notify(post.author, `${req.user.username} commented on your post`, `/post/${post._id}`);
  }
  await c.populate('author', 'username avatar');
  res.status(201).json(c);
}));

router.delete('/:id/comments/:commentId', auth, handle(async (req, res) => {
  const c = await Comment.findById(req.params.commentId);
  if (!c) throw httpError(404, 'Comment not found');
  if (!c.author.equals(req.user.id) && !isAdmin(req.user)) throw httpError(403, 'Not your comment');
  await c.deleteOne();
  res.json({ message: 'Comment deleted' });
}));

router.post('/:id/report', auth, handle(async (req, res) => {
  const { reason, details } = req.body;
  const post = await Post.findById(req.params.id).select('author');
  if (!post) throw httpError(404, 'Post not found');
  if (post.author.equals(req.user.id)) throw httpError(400, 'You cannot report your own post');
  if (!reason || !(await Reason.exists({ name: reason }))) throw httpError(400, 'Please choose a valid reason');
  if (await Report.exists({ post: post._id, reporter: req.user.id })) throw httpError(409, 'You already reported this post');
  await Report.create({ post: post._id, reporter: req.user.id, reason, details: details || '' });
  res.status(201).json({ message: 'Report submitted' });
}));

module.exports = router;