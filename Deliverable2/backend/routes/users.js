const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Album = require('../models/Album');
const auth = require('../middleware/auth');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Search users
router.get('/', auth, async (req, res) => {
  try {
    const q = esc(req.query.q || '');
    const users = await User.find({ username: new RegExp(q, 'i'), _id: { $ne: req.user.id } })
      .select('username avatar bio')
      .limit(30);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// My friends + requests
router.get('/social', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .populate('friends', 'username avatar')
      .populate('friendRequests', 'username avatar')
      .populate('sentRequests', 'username avatar');
    res.json({ friends: me.friends, requests: me.friendRequests, sent: me.sentRequests });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Edit own profile
router.put('/me', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const me = await User.findById(req.user.id);
    if (username && username !== me.username) {
      if (await User.findOne({ username })) return res.status(409).json({ error: 'Username taken' });
      me.username = username;
    }
    if (bio !== undefined) me.bio = bio;
    if (avatar !== undefined) me.avatar = avatar;
    await me.save();
    const o = me.toObject();
    delete o.password;
    res.json(o);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// View a profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username avatar bio createdAt friends');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const me = await User.findById(req.user.id);
    let relationship = 'none';
    if (user._id.equals(me._id)) relationship = 'self';
    else if (me.friends.some((f) => f.equals(user._id))) relationship = 'friends';
    else if (me.sentRequests.some((f) => f.equals(user._id))) relationship = 'sent';
    else if (me.friendRequests.some((f) => f.equals(user._id))) relationship = 'received';
    const posts = await Post.find({ author: user._id }).sort('-createdAt').populate('author', 'username avatar');
    const albums = await Album.find({ owner: user._id }).sort('-createdAt');
    res.json({
      user: { _id: user._id, username: user.username, avatar: user.avatar, bio: user.bio, friendCount: user.friends.length },
      posts,
      albums,
      relationship,
    });
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Send a friend request (auto-accepts if they already requested you)
router.post('/:id/request', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const other = await User.findById(req.params.id);
    if (!other) return res.status(404).json({ error: 'User not found' });
    if (other._id.equals(me._id)) return res.status(400).json({ error: "You can't friend yourself" });
    if (me.friends.some((f) => f.equals(other._id))) return res.status(400).json({ error: 'Already friends' });

    if (me.friendRequests.some((f) => f.equals(other._id))) {
      await User.updateOne({ _id: me._id }, { $pull: { friendRequests: other._id }, $addToSet: { friends: other._id } });
      await User.updateOne({ _id: other._id }, { $pull: { sentRequests: me._id }, $addToSet: { friends: me._id } });
      return res.json({ relationship: 'friends' });
    }
    await User.updateOne({ _id: other._id }, { $addToSet: { friendRequests: me._id } });
    await User.updateOne({ _id: me._id }, { $addToSet: { sentRequests: other._id } });
    res.json({ relationship: 'sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Accept a friend request
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me.friendRequests.some((f) => f.equals(req.params.id)))
      return res.status(400).json({ error: 'No request from this user' });
    await User.updateOne({ _id: me._id }, { $pull: { friendRequests: req.params.id }, $addToSet: { friends: req.params.id } });
    await User.updateOne({ _id: req.params.id }, { $pull: { sentRequests: me._id }, $addToSet: { friends: me._id } });
    res.json({ relationship: 'friends' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Decline an incoming request OR cancel one you sent
router.delete('/:id/request', auth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $pull: { friendRequests: req.params.id, sentRequests: req.params.id } });
    await User.updateOne({ _id: req.params.id }, { $pull: { friendRequests: req.user.id, sentRequests: req.user.id } });
    res.json({ relationship: 'none' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Unfriend
router.delete('/:id/friend', auth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $pull: { friends: req.params.id } });
    await User.updateOne({ _id: req.params.id }, { $pull: { friends: req.user.id } });
    res.json({ relationship: 'none' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;