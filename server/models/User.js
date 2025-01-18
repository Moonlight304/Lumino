const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    display_name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: false,
        default: '',
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: '',
    },
    profile_picture: {
        type: String,
        required: false,
        default: '',
    },
    age: {
        type: String,
        default: '',
    },
    gender : {
        type: String,
        default: 'dont-specify',
        enum: ['Male', 'Female', 'dont-specify'],
    },
    favourite_games: {
        type: [String],
        default: []
    },
    favourite_genres: {
        type: [String],
        default: []
    },
    platform: {
        type: String,
        enum: ['PC', 'PlayStation', 'Xbox', 'Android', 'IOS', ''],
        default: '',
    },
    playstyle: {
        type: String,
        enum: ['Casual', 'Competitive', ''],
        default: '',
    },
    communication_preference: {
        type: String,
        default: '',
        enum: ['Voice', 'Text', ''],
    },
    discord_username: {
        type: String,
        required: false,
        default: '',
    },
    steam_id: {
        type: String,
        required: false,
        default: '',
    },
    connectedIDs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        }
    ],
    receivedIDs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        }
    ],
    sentIDs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        }
    ],
    followersCount: {
        type: Number,
        default: 0, 
        required: true,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        }
    ],
    followingCount: {
        type: Number,
        default: 0,
        required: true,
    },
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        }
    ],
})

const User = mongoose.model('User', userSchema);

module.exports = User;