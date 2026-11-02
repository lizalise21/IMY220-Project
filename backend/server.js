const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { seed } = require('./seed');

const app = express();
app.use(express.json({ limit: '10mb' })); // images are sent as base64
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/socialapp';
const PORT = process.env.PORT || 5000;

// The only place the database connection is made.
async function start() {
  for (let i = 0; i < 15; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      break;
    } catch {
      console.log('Waiting for MongoDB...');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  await seed();
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}
start();