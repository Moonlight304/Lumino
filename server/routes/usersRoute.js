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
            ageLower,
            ageUpper,
            gender,
            favourite_games,
            favourite_genres,
            platform,
            playstyle,
            communication_preference,
        } = req.query;

        console.log(req.query);


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
        if (gender) filterQuery.gender = gender;
        if (platform) filterQuery.platform = platform;
        if (playstyle) filterQuery.playstyle = playstyle;
        if (communication_preference) filterQuery.communication_preference = communication_preference;

        let ageL = Number(ageLower) || 0;
        let ageU = Number(ageUpper) || 100;


        if (!isNaN(ageL) || !isNaN(ageU)) {
            filterQuery.age = {};
            if (!isNaN(ageL)) filterQuery.age.$gte = ageL;
            if (!isNaN(ageU)) filterQuery.age.$lte = ageU;
        }

        if (favourite_games) {
            const gamesArray = favourite_games.split(',');
            console.log(gamesArray);
            filterQuery.favourite_games = { $in: gamesArray };
        }
        if (favourite_genres) {
            const genresArray = favourite_genres.split(',');
            filterQuery.favourite_genres = { $in: genresArray };
        }

        console.log(filterQuery);


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

router.get('/mark_notification/:notificationID', authMiddleware, async (req, res) => {
    const { userID } = req.user;
    const { notificationID } = req.params;

    try {
        if (!userID || !notificationID)
            return res.json({
                status: 'fail',
                message: 'Incomplete attributes'
            })

        const user = await User.findById(userID);

        if (!user)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })


        user?.notifications?.forEach((notification) => {
            if (notification._id == notificationID) {
                notification.read = true;
                return;
            }
        })

        await user.save();


        return res.json({
            status: 'success',
            message: 'marked as read'
        });
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message + 'fa;fkad;fk;kj',
        })
    }
})

router.get('/delete_notification/:notificationID', authMiddleware, async (req, res) => {
    const { userID } = req.user;
    const { notificationID } = req.params;

    try {
        if (!userID || !notificationID)
            return res.json({
                status: 'fail',
                message: 'Incomplete attributes'
            })

        const user = await User.findById(userID);

        if (!user)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })

        await User.updateOne(
            { _id: userID },
            { $pull: { notifications: { _id: notificationID } } }
        )

        // user?.notifications?.forEach((notification) => {
        //     if (notification._id == notificationID) {
        //         notification.read = true;
        //         return;
        //     }
        // })

        return res.json({
            status: 'success',
            message: 'deleted notification'
            
        });
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message + 'fa;fkad;fk;kj',
        })
    }
})

module.exports = router;