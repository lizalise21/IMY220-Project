const User = require('./models/User');
const Post = require('./models/Post');
const Album = require('./models/Album');
const Comment = require('./models/Comment');
const Report = require('./models/Report');
const Reason = require('./models/Reason');
const Activity = require('./models/Activity');
const Notification = require('./models/Notification');

const ago = (hours) => new Date(Date.now() - hours * 3600 * 1000);
const img = (name) => `/images/seed/${name}.jpg`;

async function seed() {
  if ((await User.countDocuments()) > 0) return;

  const mk = (username, name, email, extra = {}) =>
    User.create({ username, name, email, password: 'test1234', ...extra });

  const test = await mk('testuser', 'Test User', 'test@test.com', { pronouns: 'they/them', bio: 'Weekend hiker and coffee fan.', links: ['https://example.com/testuser'] });
  const alice = await mk('alice', 'Alice Dube', 'alice@example.com', { pronouns: 'she/her', bio: 'Street and city photographer.' });
  const bob = await mk('bob', 'Bob Nkosi', 'bob@example.com', { pronouns: 'he/him', bio: 'Trails, dogs and sunrises.' });
  const carol = await mk('carol', 'Carol Smith', 'carol@example.com', { bio: 'Cooking my way through every cuisine.' });
  const dave = await mk('dave', 'Dave Molefe', 'dave@example.com', { bio: 'Chasing still water at dawn.' });
  const erin = await mk('erin', 'Erin Pillay', 'erin@example.com', { bio: 'Astrophotography nerd.' });
  const frank = await mk('frank', 'Frank Jones', 'frank@example.com', { bio: 'Selling things.' });
    await mk('grace', 'Grace Khumalo', 'grace@example.com', { bio: 'Market stalls and street food.' });
  await mk('admin', 'Site Admin', 'admin@example.com', { role: 'admin', password: 'admin1234', bio: 'Keeping Frame(d) friendly.' });

  const befriend = (a, b) =>
    Promise.all([
      User.updateOne({ _id: a._id }, { $addToSet: { friends: b._id } }),
      User.updateOne({ _id: b._id }, { $addToSet: { friends: a._id } }),
    ]);
  await befriend(test, alice);
  await befriend(test, bob);
  await befriend(alice, bob);
  await befriend(carol, dave);
  // carol -> testuser: pending friend request
  await User.updateOne({ _id: test._id }, { $addToSet: { friendRequests: carol._id } });
  await User.updateOne({ _id: carol._id }, { $addToSet: { sentRequests: test._id } });

  const mkPost = async (author, image, description, hashtags, hours, likes = []) => {
    const p = await Post.create({ author: author._id, image: img(image), description, hashtags, likes: likes.map((u) => u._id), createdAt: ago(hours) });
    await Activity.create({ type: 'post', user: author._id, post: p._id, createdAt: ago(hours) });
    return p;
  };
  const mkAlbum = async (owner, name, description, hashtags, posts, hours) => {
    const a = await Album.create({ owner: owner._id, name, description, hashtags, posts: posts.map((p) => p._id), createdAt: ago(hours) });
    await Activity.create({ type: 'album', user: owner._id, album: a._id, createdAt: ago(hours) });
    for (const [i, p] of posts.entries()) {
      await Activity.create({ type: 'album_add', user: owner._id, album: a._id, post: p._id, createdAt: ago(hours - ((i + 1) * 5) / 60) });
    }
    return a;
  };

  const p1 = await mkPost(test, 'mountain', 'Sunrise over the mountains this morning', ['mountains', 'sunrise', 'hiking'], 50, [alice, bob]);
  const p2 = await mkPost(test, 'coffee', 'Saturday coffee ritual', ['coffee', 'weekend'], 40, [alice]);
  const p3 = await mkPost(alice, 'city', 'Golden hour in the city', ['city', 'goldenhour', 'streetphotography'], 36, [test, bob, carol]);
  const p4 = await mkPost(alice, 'beach', 'Quiet beach after the storm', ['beach', 'ocean'], 30, [test]);
  const p5 = await mkPost(bob, 'forest', 'Lost in the forest trail', ['forest', 'hiking', 'nature'], 26, [test, alice]);
  const p6 = await mkPost(bob, 'dog', 'Meet Biscuit, our new puppy', ['dog', 'pets'], 20, [test, alice, carol, dave]);
  const p7 = await mkPost(carol, 'food', 'Homemade pasta night', ['food', 'homemade'], 14, [dave]);
  const p8 = await mkPost(dave, 'lake', 'Still water at dawn', ['lake', 'sunrise', 'nature'], 9, [carol]);
  await mkPost(erin, 'night', 'Stars over the Karoo', ['stars', 'nightsky', 'karoo'], 5, [bob]);
  const p10 = await mkPost(frank, 'street', 'BUY CHEAP FOLLOWERS NOW - link in bio!!!', ['followers', 'promo'], 2);

  await mkAlbum(test, 'Weekend Favourites', 'My favourite weekend moments', ['weekend', 'favourites'], [p1, p2], 38);
  await mkAlbum(alice, 'Urban & Coast', 'City lights and quiet shores', ['city', 'coast'], [p3, p4], 28);
  await mkAlbum(bob, 'Adventures', 'Trails and the best hiking buddy', ['hiking', 'adventure'], [p5, p6], 18);
  await mkAlbum(carol, 'Kitchen Diary', 'What I cooked this month', ['food'], [p7], 12);
  await mkAlbum(dave, 'Water & Light', 'Early mornings by the water', ['water', 'dawn'], [p8], 7);

  const comment = (post, author, text, hours) => Comment.create({ post: post._id, author: author._id, text, createdAt: ago(hours) });
  await comment(p1, alice, 'What a view! Which trail is this?', 48);
  await comment(p1, bob, 'Beautiful colours!', 47);
  await comment(p1, test, 'Thanks! It was worth the early start.', 46);
  await comment(p3, test, 'The light is unreal.', 35);
  await comment(p5, alice, 'Looks like a great trail.', 25);
  await comment(p6, test, 'Biscuit is adorable!', 19);
  await comment(p6, carol, 'Puppy cuddles please', 18);
  await comment(p7, dave, 'Recipe please!', 13);

  await Promise.all(['Spam', 'Harassment', 'Hate speech', 'Nudity or sexual content', 'Violence', 'Misinformation', 'Other'].map((name) => Reason.create({ name })));

  // 3 reports -> hidden in feeds, visible to the admin
  for (const reporter of [alice, bob, carol]) {
    await Report.create({ post: p10._id, reporter: reporter._id, reason: 'Spam', details: 'Advertising fake followers' });
  }

  await Notification.create({ user: test._id, text: 'alice commented on your post', link: '/post/' + p1._id, createdAt: ago(35) });
  await Notification.create({ user: test._id, text: 'carol sent you a friend request', link: '/friends', createdAt: ago(3) });

  console.log('Database seeded. Login: test@test.com / test1234 (admin: admin@example.com / admin1234)');
}

module.exports = { seed };