const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require('helmet');
const connectDB = require('./config/database');
const userRouter = require('./routes/user');
const TransacRouter = require('./routes/transaction');
const cookieParser = require('cookie-parser');

const app = express()

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
dotenv.config();

app.use('/api/v1/',userRouter);
app.use('/api/v1/',TransacRouter);



app.listen(3000,()=>{
  connectDB();
  console.log("listening on localhost:3000");
});

