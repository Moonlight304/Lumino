const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    typeOfNotification : {
        type : String,
        enum : ['like', 'new post', 'connection request', 'connection accepted'],
        required : true,
    },
    message : {
        type : String,
        required : true,
    },
    action_url : {
        type : String,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }
})

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
        type: Number,
        default: 0,
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
        enum: ['Any', 'PC', 'PlayStation', 'Xbox', 'Android', 'IOS', ''],
        default: '',
    },
    playstyle: {
        type: String,
        enum: ['Any', 'Casual', 'Competitive', ''],
        default: '',
    },
    communication_preference: {
        type: String,
        default: '',
        enum: ['Any', 'Voice', 'Text','Both', ''],
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
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            index: true,
        }
    ],
    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            index: true,
        }
    ],
    notifications : [notificationSchema],
})

const User = mongoose.model('User', userSchema);

module.exports = User;