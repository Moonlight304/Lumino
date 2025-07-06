const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

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

        const newUser = new User({ display_name, email, passwordHash });
        const savedUser = await newUser.save();

        const userDetails = {
            userID: savedUser._id,
            display_name: savedUser.display_name,
            avatarURL: ''
        };


        const access_token = jwt.sign(
            userDetails,
            ACCESS_SECRET,
            {
                expiresIn: '15m'
            }
        );

        const refresh_token = jwt.sign(
            userDetails,
            REFRESH_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })


        return res.json({
            status: 'success',
            message: 'Signed up',
            access_token,
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


        const userDetails = {
            userID: existingUser._id,
            display_name: existingUser.display_name,
            avatarURL: existingUser.profile_picture
        };


        const access_token = jwt.sign(
            userDetails,
            ACCESS_SECRET,
            {
                expiresIn: '15m'
            }
        );

        const refresh_token = jwt.sign(
            userDetails,
            REFRESH_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.json({
            status: 'success',
            message: 'Logged in',
            access_token,
            userID: existingUser._id,
            display_name: existingUser.display_name,
            avatarURL: existingUser.profile_picture
        })
    }
    catch (e) {
        console.log(e.message);
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.get('/refresh', async (req, res) => {
    console.log('COOKIES:')
    const token = req.cookies.refresh_token;
    console.log('Refreshed Access Token')


    if (!token) return res.status(401).json({ message: 'No token', tokenPresent: false });

    try {
        const payload = jwt.verify(token, REFRESH_SECRET);
        console.log(payload);

        const existingUser = await User.findById(payload.userID);
        const userDetails = {
            userID: existingUser._id,
            display_name: existingUser.display_name,
            avatarURL: existingUser.profile_picture
        };

        let access_token;

        if (userDetails?.avatarURL !== payload?.avatarURL) {
            const refresh_token = jwt.sign(
                userDetails,
                REFRESH_SECRET,
                {
                    expiresIn: '7d'
                }
            );

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            access_token = jwt.sign(userDetails, ACCESS_SECRET, { expiresIn: '15m' });
        }
        else {
            delete payload?.iat;
            delete payload?.exp;

            access_token = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
        }


        return res.status(200).json({ access_token, tokenPresent: true });
    }
    catch (err) {
        console.log(err.message)
        return res.status(403).json({ message: 'Invalid token', tokenPresent: false });
    }
})

router.get('/check-refresh', (req, res) => {
    const token = req.cookies.refresh_token;

    try {
        return res.status(200).json({ tokenPresent: token ? true : false });
    }
    catch (err) {
        console.log(err.message)
        return res.status(403).json({ message: 'Invalid token', tokenPresent: false });
    }
})


router.get('/logout', (req, res) => {
    try {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/',
        });

        return res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    }
    catch (e) {
        console.log(e.message);
        return res.status(500).json({
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
        }, ACCESS_SECRET, { expiresIn: "15m" });

        const resetLink = `${process.env.client_url}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset Your Lumino Password",
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #0f0f0f; color: #f4f4f4; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; border: 1px solid #2c2c2c;">
                <h2 style="color: #ff3c3c; text-align: center;">Lumino</h2>
                <p style="font-size: 15px;">Hey ${user.name || "there"},</p>
                <p style="font-size: 15px;">
                    We received a request to reset your password. Click the button below to reset it:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetLink}" style="background-color: #ff3c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Reset Password
                    </a>
                </div>
                <p style="font-size: 13px; color: #aaaaaa;">
                    If you didn’t request this, you can safely ignore this email.
                </p>
                <p style="font-size: 13px; color: #aaaaaa;">
                    — The Lumino Team
                </p>
                </div>
            `,
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
        const decoded = jwt.verify(token, ACCESS_SECRET);
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