const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    display_name: {
        type: String,
    },
    body: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const postSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    display_name: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    imageURL: {
        type: String,
    },
    visibility: {
        type: String,
        enum: ['everyone', 'connections']
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likeCount: {
        type: Number,
        default: 0,
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    comments: [commentSchema],
}, { timestamps: true });
postSchema.index({ _id: 1, likes: 1 })

const Post = mongoose.model('Post', postSchema);

module.exports = Post;