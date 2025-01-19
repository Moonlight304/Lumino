const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET_CODE;

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddle');


router.post('/signup', async (req, res) => {
    try {
        const { display_name, email, password } = req.body;
        
        if (!display_name || !password || !email)
            return res.json({
                status: 'fail',
                message: 'Insufficient data',
            })

        
        const existingUser = await User.findOne({ email });

        if (existingUser)
            return res.json({
                status: 'fail',
                message: 'Account already exists',
            })

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = User({ display_name, email, passwordHash });
        const savedUser = await newUser.save();

        
        const jwt_token = jwt.sign(
            {
                userID: savedUser._id,
                display_name: savedUser.display_name,
            },
            JWT_SECRET
        );

        return res.json({
            status: 'success',
            message: 'Signed up',
            jwt_token,
            userID: savedUser._id,
            display_name: savedUser.display_name
        })
    }
    catch (e) {
        res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.json({
                status: 'fail',
                message: 'Insufficient data',
            })


        const existingUser = await User.findOne({ email });

        if (!existingUser)
            return res.json({
                status: 'fail',
                message: 'Email or Password invalid',
            })

        const passwordValid = await bcrypt.compare(password, existingUser.passwordHash);

        if (!passwordValid)
            return res.json({
                status: 'fail',
                message: 'Email or Password invalid',
            })

        const jwt_token = jwt.sign(
            {
                userID: existingUser._id,
                display_name: existingUser.display_name
            },
            JWT_SECRET
        );

        return res.json({
            status: 'success',
            message: 'Logged in',
            jwt_token,
            userID: existingUser._id,
            display_name: existingUser.display_name
        })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.post('/onboarding', authMiddleware, async (req, res) => {
    const { userID } = req.user;    

    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        await User.updateOne({ _id: userID }, {
            age: req.body.age,
            bio: req.body.bio,
            profile_picture: req.body.profile_picture,
            country: req.body.country,
            gender: req.body.gender,
            platform: req.body.platform,
            playstyle: req.body.playstyle,
            communication_preference: req.body.communication_preference,
        })

        return res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
        });
    }
    catch (e) {
        return res.status(500).json({
            status: 'fail',
            message: e.message,
        });
    }
});

module.exports = router;