const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Album = require('./models/Album');
const Comment = require('./models/Comment');

const img = (c1, c2, label) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/><text x='400' y='320' font-size='54' text-anchor='middle' fill='white' font-family='sans-serif'>${label}</text></svg>`
  );

async function seed() {
  if ((await User.countDocuments()) > 0) return;
  const pw = await bcrypt.hash('Password123', 10);

  const alice = await User.create({ username: 'alice', email: 'alice@example.com', password: pw, bio: 'Photographer and coffee addict.' });
  const bob = await User.create({ username: 'bob', email: 'bob@example.com', password: pw, bio: 'I like hiking.' });
  const carol = await User.create({ username: 'carol', email: 'carol@example.com', password: pw, bio: 'New here!' });
  await User.create({ username: 'admin', email: 'admin@example.com', password: pw, role: 'admin', bio: 'Site administrator' });

  // alice <-> bob are friends
  await User.updateOne({ _id: alice._id }, { $set: { friends: [bob._id] } });
  await User.updateOne({ _id: bob._id }, { $set: { friends: [alice._id] } });

  const p1 = await Post.create({ author: alice._id, image: img('#e4572e', '#f3a712', 'Sunrise'), description: 'Sunrise over the city', hashtags: ['sunrise', 'city'] });
  const p2 = await Post.create({ author: bob._id, image: img('#2e86ab', '#1b4965', 'Trail'), description: 'Morning hike', hashtags: ['hiking', 'nature'] });
  await Post.create({ author: carol._id, image: img('#6a4c93', '#8ac926', 'Hello'), description: 'My first post', hashtags: ['hello'] });

  await Album.create({ owner: alice._id, name: 'Favourites', description: 'My best shots', hashtags: ['best'], posts: [p1._id] });
  await Comment.create({ post: p1._id, author: bob._id, text: 'Beautiful colours!' });
  await Comment.create({ post: p2._id, author: alice._id, text: 'Looks like a great trail.' });

  console.log('Database seeded. Login: alice@example.com / Password123');
}

module.exports = { seed };

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialapp')
    .then(async () => {
      await mongoose.connection.dropDatabase();
      await seed();
      process.exit(0);
    });
}