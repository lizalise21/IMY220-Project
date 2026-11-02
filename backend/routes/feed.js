const router = require('express').Router();
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { handle, decoratePosts } = require('../utils/helpers');

const AUTHOR = 'username name avatar';
const HOUR = 60 * 60 * 1000;

// ?scope=local|global &sort=newest|likes|comments &tag=hashtag
router.get('/', auth, handle(async (req, res) => {
  const { scope = 'local', sort = 'newest' } = req.query;
  const tag = (req.query.tag || '').replace(/^#+/, '').trim().toLowerCase();

  const filter = {};
  if (scope === 'local') {
    const me = await User.findById(req.user.id).select('friends');
    filter.user = { $in: [me._id, ...me.friends] };
  }

  const acts = (
    await Activity.find(filter)
      .sort('-createdAt')
      .limit(200)
      .populate('user', AUTHOR)
      .populate({ path: 'post', populate: { path: 'author', select: AUTHOR } })
      .populate({ path: 'album', populate: { path: 'posts', select: 'image' } })
  ).filter((a) => {
    if (!a.user) return false;
    if (a.type === 'post' && !a.post) return false;
    if (a.type !== 'post' && !a.album) return false;
    if (a.type === 'album_add' && !a.post) return false;
    if (!tag) return true;
    return [...(a.post ? a.post.hashtags : []), ...(a.album ? a.album.hashtags : [])].includes(tag);
  });

  // Merge photos added to the same album by the same user within an hour into one item
  const items = [];
  const open = {};
  for (const a of acts) {
    if (a.type === 'album_add') {
      const key = `${a.user._id}:${a.album._id}`;
      const group = open[key];
      if (group && group.createdAt - a.createdAt < HOUR) {
        group.posts.push(a.post);
        continue;
      }
      const item = { _id: a._id, type: 'album_add', user: a.user, album: a.album, posts: [a.post], createdAt: a.createdAt };
      open[key] = item;
      items.push(item);
    } else {
      items.push({ _id: a._id, type: a.type, user: a.user, post: a.post, album: a.album, createdAt: a.createdAt });
    }
  }

  const postItems = items.filter((i) => i.type === 'post');
  const decorated = await decoratePosts(postItems.map((i) => i.post));
  postItems.forEach((item, idx) => (item.post = decorated[idx]));

  if (sort !== 'newest') {
    const score = (i) => (i.type !== 'post' ? -1 : sort === 'likes' ? i.post.likes.length : i.post.commentCount);
    items.sort((a, b) => score(b) - score(a) || b.createdAt - a.createdAt);
  }
  res.json(items.slice(0, 50));
}));

module.exports = router;