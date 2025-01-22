const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const { app, server } = require('./socket/socketServer');

// middleware
const authMiddleware = require('./middleware/authMiddle');

// models
const User = require('./models/User');

// env variables
const PORT = process.env.PORT || 3000;


// Routes
const authRoute = require('./routes/authRoute');
const messageRoute = require('./routes/messageRoute');
const usersRoute = require('./routes/usersRoute');




mongoose.connect(process.env.dbURL)
    .then(() => {
        console.log('DB connected');
    })
    .catch((e) => {
        console.log(e.message);
    })

app.use(cors({ origin: process.env.client_url, credentials: true }));
app.use(express.json());

app.use('/auth', authRoute);
app.use('/message', messageRoute);
app.use('/users', usersRoute);


app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Lumino",
    })
})


server.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})