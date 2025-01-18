const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const { app, server } = require('./socket/socket');

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

app.use(cors());
app.use(express.json());

app.use('/auth', authRoute);
app.use('/message', messageRoute);
app.use('/users', usersRoute);


app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Lumino",
    })
})


app.get('/discover', authMiddleware, async (req, res) => {
    const { userID } = req.user;

    try {
        const {
            country,
            age,
            gender,
            favourite_games,
            favourite_genres,
            platform,
            playstyle,
            communication_preference,
        } = req.query;

        const user = await User.findById(userID);
        if (!user)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })

        let filterQuery = {
            _id: {
                $nin: [userID, ...user.sentIDs, ...user.connectedIDs, ...user.receivedIDs],
            },
        };


        // Add filters dynamically
        if (country) filterQuery.country = country;
        if (age) filterQuery.age = age;
        if (gender) filterQuery.gender = gender;
        if (platform) filterQuery.platform = platform;
        if (playstyle) filterQuery.playstyle = playstyle;
        if (communication_preference) filterQuery.communication_preference = communication_preference;

        if (favourite_games) {
            const gamesArray = favourite_games.split(',');
            filterQuery.favourite_games = { $in: gamesArray };
        }
        if (favourite_genres) {
            const genresArray = favourite_genres.split(',');
            filterQuery.favourite_genres = { $in: genresArray };
        }

        const allUsers = await User.find(filterQuery);

        return res.json({
            status: 'success',
            allUsers,
        });
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        });
    }
});



server.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
})