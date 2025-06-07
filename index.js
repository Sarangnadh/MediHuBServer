// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON request bodies

// MongoDB connection


connectDB();

// Routes

const indexRouter = require('./router/index.route');
app.use('/', indexRouter);


app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});
