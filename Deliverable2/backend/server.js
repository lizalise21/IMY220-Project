const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { seed } = require('./seed');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // images are sent as base64

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/albums', require('./routes/albums'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/socialapp';
const PORT = process.env.PORT || 5000;

async function start() {
  for (let i = 0; i < 10; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      break;
    } catch (e) {
      console.log('Waiting for MongoDB...');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  await seed();
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}
start();