const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddle');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.user;

        const user = await User.findById(userID);
        if (!user)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })


        const allPosts = await Post.find({
            $or: [
                { userID: userID },
                { visibility: 'everyone' },
                { visibility: 'connections', userID: { $in: user.connectedIDs } }
            ]
        }).sort({ createdAt: -1 });


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
        const { body, imageURL, visibility } = req.body;

        if (!body)
            return res.json({
                status: 'fail',
                message: 'Incomplete Data',
            })

        const user = await User.findById(userID);

        const newPost = Post({ userID, display_name: user.display_name, user_avatar: user.profile_picture, body, imageURL, visibility });
        const savedPost = await newPost.save();

        const postSaveUpdate = User.findOneAndUpdate(
            { _id: userID },
            {
                $push: { posts: savedPost._id }
            }
        );


        const notificationUpdate = async () => {

            if (user.connectedIDs.length > 0) {
                const notification = {
                    _id: new mongoose.mongo.ObjectId(),
                    typeOfNotification: 'new post',
                    message: `${user.display_name} just posted!`,
                    action_url: `/post/${savedPost._id}`,
                };

                const notificationPromises = user.connectedIDs.map(async (connectedID) => {
                    const connection = await User.findById(connectedID);
                    connection.notifications.unshift(notification);
                    await connection.save();
                });

                await Promise.all(notificationPromises);
            }

        };


        await Promise.all([postSaveUpdate, notificationUpdate()]);


        return res.json({
            status: 'success',
            message: 'Post added successfully',
            newPost: savedPost
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

router.post('/edit_post/:postID', authMiddleware, async (req, res) => {
    try {
        const { userID } = req.user;
        const { postID } = req.params;
        const { body, imageURL, visibility } = req.body;

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


        if (!body || !visibility) {
            return res.json({
                status: 'fail',
                message: 'Incomplete Data',
            })
        }


        if (userID !== post.userID._id.toString())
            return res.json({
                status: 'fail',
                message: 'cannot edit others posts',
            });
            
        
        await Post.findByIdAndUpdate(
            postID,
            { body, imageURL, visibility }
        )

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

router.get('/delete_post/:postID/:userID', authMiddleware, async (req, res) => {
    try {
        // const { userID } = req.user;
        const { userID, postID } = req.params;

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
                    action_url: `/user/${display_name}`
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

router.get('/savePost/:postID', authMiddleware, async (req, res) => {
    try {
        const { postID } = req.params;
        const { userID } = req.user;

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

        const user = await User.findById(userID);
        if (!user)
            return res.json({
                status: 'fail',
                message: 'user not found',
            })

        if (user.savedPosts.includes(postID))
            return res.json({
                status: 'fail',
                message: 'Already saved post',
            })

        await User.updateOne(
            { _id: userID },
            {
                $push: { savedPosts: postID }
            }
        )

        return res.json({
            status: 'success',
            message: 'post saved',
        })
    }
    catch (e) {
        res.json({
            status: 'fail',
            message: 'Error : ' + e,
        })
    }
})

router.get('/deleteSavedPost/:postID', authMiddleware, async (req, res) => {
    try {
        const { postID } = req.params;
        const { userID } = req.user;

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

        const user = await User.findById(userID);
        if (!user)
            return res.json({
                status: 'fail',
                message: 'user not found',
            })

        if (!user.savedPosts.includes(postID))
            return res.json({
                status: 'fail',
                message: 'did not even save post',
            })

        await User.updateOne(
            { _id: userID },
            { $pull: { savedPosts: postID } }
        )

        return res.json({
            status: 'success',
            message: 'removed post from saved items',
        })

    }
    catch (e) {
        res.json({
            status: 'fail',
            message: 'Error : ' + e,
        })
    }
})

router.get('/checkSaved/:postID', authMiddleware, async (req, res) => {
    try {
        const { postID } = req.params;
        const { userID } = req.user;

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
        const user = await User.findById(userID);

        if (!post)
            return res.json({
                status: 'fail',
                message: 'Post not found',
            })

        if (!user)
            return res.json({
                status: 'fail',
                messge: 'User not found'
            })

        if (user.savedPosts.includes(postID))
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
            message: 'Error : ' + e,
        })
    }
})

module.exports = router;
