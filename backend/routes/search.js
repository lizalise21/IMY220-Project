const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Album = require('../models/Album');
const auth = require('../middleware/auth');
const { handle, escapeRegex, decoratePosts } = require('../utils/helpers');

// ?q=term  (a leading # searches hashtags)
router.get('/', auth, handle(async (req, res) => {
  const raw = (req.query.q || '').trim();
  if (!raw) return res.json({ users: [], posts: [], albums: [], hashtags: [] });
  const isTag = raw.startsWith('#');
  const term = raw.replace(/^#+/, '').toLowerCase();
  const rx = new RegExp(escapeRegex(raw), 'i');
  const tagRx = new RegExp(escapeRegex(term), 'i');

  const [users, posts, albums, postTags, albumTags] = await Promise.all([
    isTag ? [] : User.find({ $or: [{ username: rx }, { name: rx }, { email: rx }] }).select('username name avatar').limit(20),
    Post.find(isTag ? { hashtags: term } : { description: rx }).sort('-createdAt').limit(30).populate('author', 'username name avatar'),
    Album.find(isTag ? { hashtags: term } : { $or: [{ name: rx }, { description: rx }] })
      .sort('-createdAt').limit(20).populate('owner', 'username').populate('posts', 'image'),
    Post.distinct('hashtags', { hashtags: tagRx }),
    Album.distinct('hashtags', { hashtags: tagRx }),
  ]);
  const hashtags = [...new Set([...postTags, ...albumTags])].filter((t) => tagRx.test(t)).sort().slice(0, 20);
  res.json({ users, posts: await decoratePosts(posts), albums, hashtags });
}));

module.exports = router;