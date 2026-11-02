const router = require('express').Router();
const Album = require('../models/Album');
const Post = require('../models/Post');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { handle, httpError, cleanTags, deleteAlbums } = require('../utils/helpers');

const canEdit = (album, user) => album.owner.equals(user.id) || user.role === 'admin';

const loadEditable = async (req) => {
  const album = await Album.findById(req.params.id);
  if (!album) throw httpError(404, 'Album not found');
  if (!canEdit(album, req.user)) throw httpError(403, 'Not your album');
  return album;
};

// ?owner=userId (omit for all albums)
router.get('/', auth, handle(async (req, res) => {
  const filter = req.query.owner ? { owner: req.query.owner } : {};
  res.json(await Album.find(filter).sort('-createdAt').populate('owner', 'username').populate('posts', 'image'));
}));

router.post('/', auth, handle(async (req, res) => {
  const { name, description, hashtags } = req.body;
  if (!name || !name.trim()) throw httpError(400, 'Album name is required');
  const album = await Album.create({
    owner: req.user.id,
    name: name.trim(),
    description: description || '',
    hashtags: cleanTags(hashtags),
  });
  await Activity.create({ type: 'album', user: req.user.id, album: album._id });
  res.status(201).json(album);
}));

router.get('/:id', auth, handle(async (req, res) => {
  const album = await Album.findById(req.params.id)
    .populate('owner', 'username name avatar')
    .populate({ path: 'posts', populate: { path: 'author', select: 'username avatar' } });
  if (!album) throw httpError(404, 'Album not found');
  // Recommended hashtags: from the posts inside, most frequent first, no duplicates
  const counts = {};
  album.posts.forEach((p) => p.hashtags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const suggestedTags = Object.keys(counts)
    .filter((t) => !album.hashtags.includes(t))
    .sort((a, b) => counts[b] - counts[a]);
  res.json({ ...album.toObject(), suggestedTags });
}));

router.put('/:id', auth, handle(async (req, res) => {
  const album = await loadEditable(req);
  const { name, description, hashtags } = req.body;
  if (name !== undefined) {
    if (!name.trim()) throw httpError(400, 'Album name is required');
    album.name = name.trim();
  }
  if (description !== undefined) album.description = description;
  if (hashtags !== undefined) album.hashtags = cleanTags(hashtags);
  await album.save();
  res.json({ message: 'Album updated' });
}));

router.delete('/:id', auth, handle(async (req, res) => {
  const album = await loadEditable(req);
  await deleteAlbums([album._id]);
  res.json({ message: 'Album deleted' });
}));

router.post('/:id/posts/:postId', auth, handle(async (req, res) => {
  const album = await loadEditable(req);
  const post = await Post.findById(req.params.postId);
  if (!post) throw httpError(404, 'Post not found');
  if (!post.author.equals(album.owner)) throw httpError(403, 'You can only add posts by the album owner');
  const r = await Album.updateOne({ _id: album._id }, { $addToSet: { posts: post._id } });
  if (r.modifiedCount) await Activity.create({ type: 'album_add', user: album.owner, album: album._id, post: post._id });
  res.json({ message: 'Post added' });
}));

router.delete('/:id/posts/:postId', auth, handle(async (req, res) => {
  const album = await loadEditable(req);
  await Album.updateOne({ _id: album._id }, { $pull: { posts: req.params.postId } });
  await Activity.deleteMany({ type: 'album_add', album: album._id, post: req.params.postId });
  res.json({ message: 'Post removed' });
}));

module.exports = router;