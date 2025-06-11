const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

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
                avatarURL: ''
            },
            JWT_SECRET
        );

        return res.json({
            status: 'success',
            message: 'Signed up',
            jwt_token,
            userID: savedUser._id,
            display_name: savedUser.display_name,
            avatarURL: ''
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
                display_name: existingUser.display_name,
                avatarURL: existingUser.profile_picture
            },
            JWT_SECRET
        );

        return res.json({
            status: 'success',
            message: 'Logged in',
            jwt_token,
            userID: existingUser._id,
            display_name: existingUser.display_name,
            avatarURL: existingUser.profile_picture
        })
    }
    catch (e) {
        console.log(error.message);
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });

        const token = jwt.sign({
            email: user.email
        }, JWT_SECRET, { expiresIn: "15m" });

        const resetLink = `${process.env.client_url}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Lumino Password Reset",
            text: `Click the link to reset your password: ${resetLink}`
        });

        return res.json({
            status: "success",
            message: "Reset link sent to email",
            email: user.email
        });
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user)
            return res.status(400).json({
                status: "fail",
                message: "Invalid token"
            });

        // Hash new password
        const salt = await bcrypt.genSalt();
        const newPasswordHash = await bcrypt.hash(password, salt);
        
        user.passwordHash = newPasswordHash;
        await user.save();

        return res.json({
            status: "success",
            message: "Password reset successful"
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(400).json({
            status: "fail",
            message: "Invalid or expired token"
        });
    }
});


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
                favourite_games: req.body.favourite_games ? req.body.favourite_games.split(',').map(game => game.trim()) : [],
                favourite_genres: req.body.favourite_genres ? req.body.favourite_genres.split(',').map(genre => genre.trim()) : []
            }
        );


        return res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            profile_picture: user.profile_picture
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