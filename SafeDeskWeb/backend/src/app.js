const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SafeDesk API' });
});

module.exports = app;