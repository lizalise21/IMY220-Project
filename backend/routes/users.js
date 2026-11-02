const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Album = require('../models/Album');
const auth = require('../middleware/auth');
const { handle, httpError, cleanUser, notify, decoratePosts, deleteUser } = require('../utils/helpers');

const SHORT = 'username name avatar';

const makeFriends = (a, b) =>
  Promise.all([
    User.updateOne({ _id: a }, { $pull: { friendRequests: b, sentRequests: b }, $addToSet: { friends: b } }),
    User.updateOne({ _id: b }, { $pull: { friendRequests: a, sentRequests: a }, $addToSet: { friends: a } }),
  ]);

router.get('/social', auth, handle(async (req, res) => {
  const me = await User.findById(req.user.id)
    .populate('friends', SHORT)
    .populate('friendRequests', SHORT)
    .populate('sentRequests', SHORT);
  res.json({ friends: me.friends, requests: me.friendRequests, sent: me.sentRequests });
}));

router.put('/me', auth, handle(async (req, res) => {
  const me = await User.findById(req.user.id);
  const { username, name, bio, pronouns, avatar, links } = req.body;
  if (username !== undefined) {
    const u = String(username).trim();
    if (u.length < 3) throw httpError(400, 'Username must be at least 3 characters');
    if (u !== me.username && (await User.exists({ username: u }))) throw httpError(409, 'Username taken');
    me.username = u;
  }
  if (name !== undefined) me.name = String(name).trim().slice(0, 60);
  if (bio !== undefined) me.bio = String(bio).slice(0, 300);
  if (pronouns !== undefined) me.pronouns = String(pronouns).trim().slice(0, 30);
  if (avatar !== undefined) {
    if (avatar && !/^data:image\//.test(avatar)) throw httpError(400, 'Invalid avatar image');
    me.avatar = avatar;
  }
  if (links !== undefined) {
    me.links = (Array.isArray(links) ? links : []).map(String).filter((l) => /^https?:\/\/\S+$/i.test(l)).slice(0, 5);
  }
  await me.save();
  res.json(cleanUser(me));
}));

router.delete('/me', auth, handle(async (req, res) => {
  await deleteUser(req.user.id);
  auth.logout(res);
  res.json({ message: 'Account deleted' });
}));

// Profile. Non-friends only get the name and picture.
router.get('/:id', auth, handle(async (req, res) => {
  const user = await User.findById(req.params.id).populate('friends', SHORT);
  if (!user) throw httpError(404, 'User not found');
  const me = await User.findById(req.user.id);
  let relationship = 'none';
  if (user._id.equals(me._id)) relationship = 'self';
  else if (me.friends.some((f) => f.equals(user._id))) relationship = 'friends';
  else if (me.sentRequests.some((f) => f.equals(user._id))) relationship = 'sent';
  else if (me.friendRequests.some((f) => f.equals(user._id))) relationship = 'received';

  const base = { _id: user._id, username: user.username, name: user.name, avatar: user.avatar };
  const full = ['self', 'friends'].includes(relationship) || req.user.role === 'admin';
  if (!full) return res.json({ user: base, relationship, restricted: true });

  const posts = await Post.find({ author: user._id }).sort('-createdAt').populate('author', SHORT);
  const albums = await Album.find({ owner: user._id }).sort('-createdAt').populate('posts', 'image');
  res.json({
    user: { ...base, bio: user.bio, pronouns: user.pronouns, links: user.links, createdAt: user.createdAt },
    friends: user.friends,
    posts: await decoratePosts(posts),
    albums,
    relationship,
    restricted: false,
  });
}));

router.post('/:id/request', auth, handle(async (req, res) => {
  const [me, other] = await Promise.all([User.findById(req.user.id), User.findById(req.params.id)]);
  if (!other) throw httpError(404, 'User not found');
  if (other._id.equals(me._id)) throw httpError(400, "You can't friend yourself");
  if (me.friends.some((f) => f.equals(other._id))) throw httpError(400, 'Already friends');
  if (me.friendRequests.some((f) => f.equals(other._id))) {
    await makeFriends(me._id, other._id);
    await notify(other._id, `${me.username} accepted your friend request`, `/profile/${me._id}`);
    return res.json({ relationship: 'friends' });
  }
  await User.updateOne({ _id: other._id }, { $addToSet: { friendRequests: me._id } });
  await User.updateOne({ _id: me._id }, { $addToSet: { sentRequests: other._id } });
  await notify(other._id, `${me.username} sent you a friend request`, '/friends');
  res.json({ relationship: 'sent' });
}));

router.post('/:id/accept', auth, handle(async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me.friendRequests.some((f) => f.equals(req.params.id))) throw httpError(400, 'No request from this user');
  await makeFriends(me._id, req.params.id);
  await notify(req.params.id, `${me.username} accepted your friend request`, `/profile/${me._id}`);
  res.json({ relationship: 'friends' });
}));

// Decline an incoming request OR cancel one you sent
router.delete('/:id/request', auth, handle(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $pull: { friendRequests: req.params.id, sentRequests: req.params.id } });
  await User.updateOne({ _id: req.params.id }, { $pull: { friendRequests: req.user.id, sentRequests: req.user.id } });
  res.json({ relationship: 'none' });
}));

router.delete('/:id/friend', auth, handle(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $pull: { friends: req.params.id } });
  await User.updateOne({ _id: req.params.id }, { $pull: { friends: req.user.id } });
  res.json({ relationship: 'none' });
}));

module.exports = router;