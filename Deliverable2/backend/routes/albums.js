const router = require('express').Router();
const Album = require('../models/Album');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const cleanTags = (tags) => {
  const arr = Array.isArray(tags) ? tags : [];
  return [...new Set(arr.map((t) => String(t).replace(/^#+/, '').trim().toLowerCase()).filter(Boolean))];
};
const canEdit = (album, user) => album.owner.equals(user.id) || user.role === 'admin';

// ?owner=userId (omit for all albums)
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.query.owner ? { owner: req.query.owner } : {};
    const albums = await Album.find(filter).sort('-createdAt').populate('owner', 'username').populate('posts', 'image');
    res.json(albums);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, hashtags } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Album name is required' });
    const album = await Album.create({
      owner: req.user.id,
      name: name.trim(),
      description: description || '',
      hashtags: cleanTags(hashtags),
    });
    res.status(201).json(album);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate({ path: 'posts', populate: { path: 'author', select: 'username avatar' } });
    if (!album) return res.status(404).json({ error: 'Album not found' });
    res.json(album);
  } catch {
    res.status(404).json({ error: 'Album not found' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    if (!canEdit(album, req.user)) return res.status(403).json({ error: 'Not your album' });
    const { name, description, hashtags } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Album name is required' });
      album.name = name.trim();
    }
    if (description !== undefined) album.description = description;
    if (hashtags !== undefined) album.hashtags = cleanTags(hashtags);
    await album.save();
    res.json(album);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    if (!canEdit(album, req.user)) return res.status(403).json({ error: 'Not your album' });
    await album.deleteOne();
    res.json({ message: 'Album deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/posts/:postId', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    if (!canEdit(album, req.user)) return res.status(403).json({ error: 'Not your album' });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.author.equals(req.user.id)) return res.status(403).json({ error: 'You can only add your own posts' });
    await Album.updateOne({ _id: album._id }, { $addToSet: { posts: post._id } });
    res.json({ message: 'Post added' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/posts/:postId', auth, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    if (!canEdit(album, req.user)) return res.status(403).json({ error: 'Not your album' });
    await Album.updateOne({ _id: album._id }, { $pull: { posts: req.params.postId } });
    res.json({ message: 'Post removed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;