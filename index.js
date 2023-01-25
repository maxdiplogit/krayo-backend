// Set the environment file
require('dotenv').config();


// Packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


// Routers
const authRouter = require('./router/authRouter');
const fileRouter = require('./router/fileRouter');


// Create Express Application
const app = express();


// Connecting to remote MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
        console.log('Mongoose Connection Open ...');
    })
    .catch((err) => {
        console.log('Mongoose Connection Error!');
        console.log(err);
    });


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes
// ------------------------------------------------------------------------------------

// Home Route
app.get('/', (req, res, next) => {
    res.send('Krayo Backend');
});

// Auth Router
app.use('/auth', authRouter);

// File Router
app.use('/file', fileRouter);

// ------------------------------------------------------------------------------------


app.listen(4500, () => {
    console.log('Server started listening on port 4500 ...');
});