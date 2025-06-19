const express = require('express');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../middleware/multer');

const User = require('../models/User');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddle');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

router.post('/upload', upload.single('imageFile'), authMiddleware, async (req, res) => {
    const { userID } = req.user;
    const folder = req.query.folder || 'avatars';

    let height, width;

    if (folder === 'avatars') {
        height = 500;
        width = 500;
    }
    else if (folder === 'posts') {
        height = 1080;
        width = 1920;
    }
    else if (folder === 'chats') {
        height = 1080;
        width = 1920;
    }

    const transformation = [
        { height, width },
    ]

    try {
        const fileBuffer = req.file.buffer;


        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation
            },
            (error, result) => {
                if (error) return res.status(500).json({ error: error.message });

                return res.json({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        uploadStream.end(fileBuffer);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/delete', authMiddleware, async (req, res) => {
    const { public_id } = req.body;

    try {
        await cloudinary.uploader.destroy(public_id);

        return res.status(200).json({
            status: 'success',
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

module.exports = router;