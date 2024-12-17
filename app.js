const express = require("express");
// const cors = require('cors');
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const helmet = require('helmet');
const connectDB = require('./config/database');
const userRoute = require('./routes/user');
const transactionRoute = require('./routes/transaction');
const cookieParser = require('cookie-parser');

const app = express()
const PORT = 8000

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/about', (req, res) => {
  res.send('About route 🎉 ')
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})
