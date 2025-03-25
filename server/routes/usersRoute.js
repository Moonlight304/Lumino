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

router.get('/me', authMiddleware, async (req, res) => {
    const { userID } = req.user;

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

router.get('/getUserByName/:display_name', authMiddleware, async (req, res) => {
    const { display_name } = req.params;

    try {
        if (!display_name)
            return res.json({
                status: 'fail',
                message: 'Display Name is required'
            })

        const user = await User.findOne({ display_name });
        if (!user)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })

        const userObject = user.toObject();
        const { passwordHash, ...safeUser } = userObject;

        console.log(safeUser);

        return res.json({
            status: 'success',
            user: safeUser
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

router.post('/edit_user/:userID', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.params;

        if (!userID)
            return res.json({
                status: 'fail',
                message: 'no username found',
            })

        const user = await User.findById(userID);

        if (!user)
            return res.json({
                status: 'fail',
                message: 'user not found',
            })

        console.log(req.body)

        await User.updateOne(
            { _id: userID },
            {
                age: req.body.age,
                bio: req.body.bio,
                profile_picture: req.body.profile_picture,
                country: req.body.country,
                gender: req.body.gender,
                platform: req.body.platform,
                playstyle: req.body.playstyle,
                communication_preference: req.body.communication_preference,
                steam_id: req.body.steam_id,
                discord_username: req.body.discord_username,
                favourite_games: req.body.favourite_games ? req.body.favourite_games.split(',').map(game => game.trim()) : [],
                favourite_genres: req.body.favourite_genres ? req.body.favourite_genres.split(',').map(genre => genre.trim()) : []
            }
        );

        return res.json({
            status: 'success',
            message: 'Updated profile',
        })
    }
    catch (e) {
        console.log(e.message)
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.get('/delete_user/:username', authMiddleware, async (req, res) => {
    try {
        const { username } = req.params;

        if (!username)
            return res.json({
                status: 'fail',
                message: 'Username not found',
            })

        await User.deleteOne({ username });

        return res.json({
            status: 'success',
            message: 'Deleted account',
        })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: 'Error : ' + e,
        })
    }
})

module.exports = router;