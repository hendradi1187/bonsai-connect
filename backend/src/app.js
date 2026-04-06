const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/public', require('./routes/public'));
app.use('/api/participants', require('./routes/participants'));
app.use('/api/scoring', require('./routes/scoring'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/ranking', require('./routes/ranking'));
app.use('/api/event-control', require('./routes/eventControl'));
app.use('/api/upload', require('./routes/upload'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Bonsai Connect API' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
