const router = require('express').Router();
const Post = require('../models/Post');
const Album = require('../models/Album');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const User = require('../models/User');
const auth = require('../middleware/auth');

const REASONS = ['Spam', 'Harassment', 'Hate speech', 'Nudity or sexual content', 'Violence', 'Misinformation', 'Other'];

const cleanTags = (tags) => {
  const arr = Array.isArray(tags) ? tags : [];
  return [...new Set(arr.map((t) => String(t).replace(/^#+/, '').trim().toLowerCase()).filter(Boolean))];
};
const canEdit = (post, user) => post.author.equals(user.id) || user.role === 'admin';

router.get('/reasons', auth, (req, res) => res.json(REASONS));

// Feed: ?scope=local|global &author=id &tag=hashtag
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.scope === 'local') {
      const me = await User.findById(req.user.id);
      filter.author = { $in: [me._id, ...me.friends] };
    }
    if (req.query.author) filter.author = req.query.author;
    if (req.query.tag) filter.hashtags = req.query.tag.replace('#', '').toLowerCase();
    const posts = await Post.find(filter).sort('-createdAt').limit(50).populate('author', 'username avatar');
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { image, description, hashtags } = req.body;
    if (!image) return res.status(400).json({ error: 'An image is required' });
    const post = await Post.create({
      author: req.user.id,
      image,
      description: description || '',
      hashtags: cleanTags(hashtags),
    });
    await post.populate('author', 'username avatar');
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch {
    res.status(404).json({ error: 'Post not found' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!canEdit(post, req.user)) return res.status(403).json({ error: 'Not your post' });
    if (req.body.description !== undefined) post.description = req.body.description;
    if (req.body.hashtags !== undefined) post.hashtags = cleanTags(req.body.hashtags);
    await post.save();
    await post.populate('author', 'username avatar');
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!canEdit(post, req.user)) return res.status(403).json({ error: 'Not your post' });
    await Promise.all([
      Post.deleteOne({ _id: post._id }),
      Comment.deleteMany({ post: post._id }),
      Report.deleteMany({ post: post._id }),
      Album.updateMany({}, { $pull: { posts: post._id } }),
    ]);
    res.json({ message: 'Post deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Like / unlike
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const liked = post.likes.some((l) => l.equals(req.user.id));
    if (liked) post.likes.pull(req.user.id);
    else post.likes.push(req.user.id);
    await post.save();
    res.json({ likes: post.likes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Comments
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).sort('createdAt').populate('author', 'username avatar');
    res.json(comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Comment cannot be empty' });
    if (!(await Post.exists({ _id: req.params.id }))) return res.status(404).json({ error: 'Post not found' });
    const c = await Comment.create({ post: req.params.id, author: req.user.id, text });
    await c.populate('author', 'username avatar');
    res.status(201).json(c);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const c = await Comment.findById(req.params.commentId);
    if (!c) return res.status(404).json({ error: 'Comment not found' });
    if (!c.author.equals(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your comment' });
    await c.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Report
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { reason, details } = req.body;
    if (!reason) return res.status(400).json({ error: 'Please choose a reason' });
    if (!(await Post.exists({ _id: req.params.id }))) return res.status(404).json({ error: 'Post not found' });
    if (await Report.exists({ post: req.params.id, reporter: req.user.id }))
      return res.status(409).json({ error: 'You already reported this post' });
    await Report.create({ post: req.params.id, reporter: req.user.id, reason, details: details || '' });
    res.status(201).json({ message: 'Report submitted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;