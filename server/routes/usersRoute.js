const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddle');

router.get('/discover', authMiddleware, async (req, res) => {
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

router.get('/getUser/:userID', authMiddleware, async (req, res) => {
    const { userID } = req.params;
    try {
        if (!userID)
            return res.json({
                status: 'fail',
                message: 'UserId is required'
            })

        const user = await User.findById(userID);
        if (!user)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })
        
        return res.json({
            status: 'success',
            user
        });
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

module.exports = router;