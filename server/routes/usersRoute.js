const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddle');

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