const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddle');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const allPosts = await Post.find({}).sort({ createdAt: -1 });

        return res.json({
            status: 'success',
            allPosts
        })
    }
    catch (e) {
        return res.json({
            status: 'fail', 
            message: e.message,
        })
    }
})

router.get('/:postID', authMiddleware, async (req, res) => {
    try {
        const { postID } = req.params;

        if (!postID)
            return res.json({
                status: 'fail',
                message: 'postID is required',
            })

        const post = await Post.findById(postID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'post not found',
            })

        return res.json({
            status: 'success',
            post: post,
        })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.post('/new_post', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.user;
        const { body, imageURL } = req.body;

        if (!body)
            return res.json({
                status: 'fail',
                message: 'Incomplete Data',
            })

        const user = await User.findById(userID);

        const newPost = Post({ userID, display_name: user.display_name, user_avatar: user.profile_picture, body, imageURL });
        const savedPost = await newPost.save();      

        const postSaveUpdate = User.findOneAndUpdate(
            { _id: userID },
            {
                $push: { posts: savedPost._id }
            }
        );

        const notificationUpdate = async () => {
            const notification = {
                _id: new mongoose.mongo.ObjectId(),
                typeOfNotification: 'new post',
                message: `${user.display_name} just posted!`,
                action_url: `/post/${savedPost._id}`,
            };

            const notificationPromises = user.followers.map(async (followerID) => {
                const follower = await User.findById(followerID);
                follower.notifications.unshift(notification);
                await follower.save();
            });

            await Promise.all(notificationPromises);
        };

        await Promise.all([postSaveUpdate, notificationUpdate()]);


        return res.json({
            status: 'success',
            message: 'Post added successfully',
            newPost: savedPost
        })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.post('/edit_post/:postID', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.user;
        const { postID } = req.params;
        const { newHeading, newBody, newImageURL } = req.body;

        if (!newHeading || !newBody) {
            return res.json({
                status: 'fail',
                message: 'Incomplete Data',
            })
        }

        if (!postID)
            return res.json({
                status: 'fail',
                message: 'postID is required',
            })

        const post = await Post.findById(postID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'post not found',
            })

        if (userID !== post.userID._id.toString())
            return res.json({
                status: 'fail',
                message: 'cannot edit others posts',
            });


        post.heading = newHeading;
        post.body = newBody;

        if (newImageURL !== post.imageURL) {
            post.imageURL = newImageURL;
        }

        await post.save();

        return res.json({
            status: 'success',
            message: 'Edited Post',
        });
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.get('/delete_post/:postID', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.user;
        const { postID } = req.params;

        if (!postID)
            return res.json({
                status: 'fail',
                message: 'postID is required',
            })

        const post = await Post.findById(postID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'Post not found',
            })

        if (userID !== post.userID._id.toString())
            return res.json({
                status: 'fail',
                message: 'cannot delete others posts',
            })

        const postUpdate = Post.findByIdAndDelete(postID);
        const userUpdate =
            User.updateOne(
                { _id: userID },
                { $pull: { posts: postID } }
            );

        await Promise.all([postUpdate, userUpdate]);

        return res.json({
            status: 'success',
            message: 'Deleted post',
        })
    }
    catch (e) {
        return res.json({
            status: 'failure',
            message: e.message,
        })
    }
})

router.get('/like/:postID', authMiddleware, async (req, res) => {
    try {
        const { userID, display_name } = req.user;
        const { postID } = req.params;

        if (!postID)
            return res.json({
                status: 'fail',
                message: 'postID is required',
            });

        const post = await Post.findById(postID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'post not found',
            })


        if (post.likes.includes(userID))
            return res.json({
                status: 'fail',
                message: 'Already liked',
            })

        //update likecount and like array in post
        const postUpdate = Post.updateOne(
            { _id: postID },
            {
                $push: { likes: userID },
                $inc: { likeCount: 1 },
            }
        );

        const userUpdate = async () => {
            if (post?.display_name != display_name) {
                const notification = {
                    _id: new mongoose.mongo.ObjectId(),
                    typeOfNotification: 'like',
                    message: `${display_name} liked your post!`,
                    action_url: `/post/${post?._id}`
                };

                const user = await User.findById(post?.userID);
                user.notifications.unshift(notification);
                await user.save();
            }
        }

        await Promise.all([postUpdate, userUpdate()]);

        return res.json({
            status: 'success',
            message: 'Incremented like count',
            newLikeCount: post.likeCount + 1,
        })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.get('/dislike/:postID', authMiddleware, async (req, res) => {
    try {
        const userID = req.user.userID;
        const { postID } = req.params;

        if (!postID)
            return res.json({
                status: 'fail',
                message: 'postID is required',
            })

        const post = await Post.findById(postID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'post not found',
            })

        if (!post.likes.includes(userID))
            return res.json({
                status: 'fail',
                message: 'You did not like the post',
            })

        //update likecount and like array in post
        await Post.updateOne(
            { _id: postID },
            {
                $pull: { likes: userID },
                $inc: { likeCount: -1 },
            }
        );

        return res.json({
            status: 'success',
            message: 'Decremented like count',
            newLikeCount: post.likeCount - 1,
        })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})

router.get('/:postID/checkLiked', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.user;
        const { postID } = req.params;

        if (!postID)
            return res.json({
                status: 'fail',
                message: 'postID not found',
            })

        if (!userID)
            return res.json({
                status: 'fail',
                message: 'userID not found',
            })

        const post = await Post.findById(postID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'post not found',
            })


        if (post.likes.includes(userID))
            return res.json({
                status: 'success',
                message: JSON.stringify(true),
            })
        else
            return res.json({
                status: 'success',
                message: JSON.stringify(false),
            })
    }
    catch (e) {
        return res.json({
            status: 'fail',
            message: e.message,
        })
    }
})



module.exports = router;
