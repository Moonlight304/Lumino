const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddle');

router.get('/:remoteID', authMiddleware, async (req, res) => {
    const { remoteID } = req.params;
    const { userID } = req.user;

    try {
        if (!remoteID) return;

        const remoteUser = await User.findById(remoteID);
        if (!remoteUser)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })

        const allMessages = await Message.find({
            $or: [
                { senderID: userID, receiverID: remoteID },
                { senderID: remoteID, receiverID: userID },
            ],
        }).sort({ createdAt: 1 });

        return res.json({
            status: 'success',
            allMessages,
        })
    }
    catch (e) {
        console.log(e.message);
        return res.json({
            status: 'fail',
            message: e.message
        });
    }
})

router.post('/new_message/:remoteID', authMiddleware, async (req, res) => {
    const { remoteID } = req.params;
    const { userID } = req.user;
    const { newMessage, imageURL } = req.body;

    try {
        const remoteUser = await User.findById(remoteID);
        if (!remoteUser)
            return res.json({
                status: 'fail',
                message: 'User not found'
            })

        const message = Message({ senderID: userID, receiverID: remoteID, text: newMessage, image: imageURL });
        await message.save()

        return res.json({
            status: 'success',
        })
    }
    catch (e) {
        console.log(e.message);
        return res.json({
            status: 'fail',
            message: e.message
        });
    }
})

router.get('/send_request/:senderID/:receiverID', authMiddleware, async (req, res) => {
    const { senderID, receiverID } = req.params;

    try {
        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);
        if (!sender || !receiver) {
            return res.json({
                success: 'fail',
                message: 'User not found'
            });
        }

        const senderUpdate = User.updateOne(
            { _id: senderID },
            {
                $push: { sentIDs: receiverID }
            }
        )

        const receiverUpdate = User.updateOne(
            { _id: receiverID },
            {
                $push: { receivedIDs: senderID }
            }
        )

        receiver.notifications.unshift({
            _id: new mongoose.mongo.ObjectId(),
            typeOfNotification: 'connection request',
            message: `${sender.display_name} is requesting to connect`,
            action_url: `/connections`,
        });


        await Promise.all([senderUpdate, receiverUpdate, receiver.save()]);

        return res.json({
            success: 'success',
            message: `Connection request sent to ${receiver.display_name}`
        });
    }
    catch (e) {
        console.log(e.message);
        return res.json({
            success: 'fail',
            message: e.message
        });
    }
});

router.get('/accept_request/:receiverID/:senderID', authMiddleware, async (req, res) => {
    const { senderID, receiverID } = req.params;

    try {
        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);
        if (!sender || !receiver) {
            return res.json({
                success: 'fail',
                message: 'User not found'
            });
        }

        const senderUpdate = User.updateOne(
            { _id: senderID },
            {
                $pull: { sentIDs: receiverID },
                $push: { connectedIDs: receiverID }
            }
        )
        const receiverUpdate = User.updateOne(
            { _id: receiverID },
            {
                $pull: { receivedIDs: senderID },
                $push: { connectedIDs: senderID }
            }
        )

        sender.notifications.unshift({
            _id: new mongoose.mongo.ObjectId(),
            typeOfNotification: 'connection accepted',
            message: `${receiver.display_name} accepted your request`,
            action_url: `/connections`,
        });

        await Promise.all([senderUpdate, receiverUpdate, sender.save()]);

        return res.json({
            status: 'success',
            message: `Connected`
        })
    }
    catch (e) {
        console.log(e.message);
        return res.json({
            success: 'fail',
            message: e.message
        });
    }
})

router.get('/cancel_request/:receiverID/:senderID', authMiddleware, async (req, res) => {
    const { senderID, receiverID } = req.params;

    try {
        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);
        if (!sender || !receiver) {
            return res.json({
                success: 'fail',
                message: 'User not found'
            });
        }

        const senderUpdate = User.updateOne(
            { _id: senderID },
            {
                $pull: { sentIDs: receiverID },
            }
        )
        const receiverUpdate = User.updateOne(
            { _id: receiverID },
            {
                $pull: { receivedIDs: senderID },
            }
        )

        await Promise.all([senderUpdate, receiverUpdate]);

        return res.json({
            status: 'success',
            message: 'Removed Request'
        })
    }
    catch (e) {
        console.log(e.message);
        return res.json({
            success: 'fail',
            message: e.message
        });
    }
})

router.get('/check/:remoteID', authMiddleware, async (req, res) => {
    const { remoteID } = req.params;
    const { userID } = req.user;

    console.log(remoteID)

    try {
        const user = await User.findById(userID);

        if (!user)
            return res.json({
                status: "fail",
                message: "User not found"
            })

            
            


        if (user.connectedIDs.map(id => id.toString()).includes(remoteID.toString())) {
            return res.json({
                status: 'success',
                message: 'Connected'
            });
        }
        else if (user.sentIDs.map(id => id.toString()).includes(remoteID.toString())) {
            return res.json({
                status: 'success',
                message: 'Sent'
            });
        }
        else if (user.receivedIDs.map(id => id.toString()).includes(remoteID.toString())) {
            return res.json({
                status: 'success',
                message: 'Accept'
            });
        }
        else {
            return res.json({
                status: 'success',
                message: 'Nothing'
            });
        }

    }
    catch (e) {
        console.log(e.message);
        return res.json({
            success: 'fail',
            message: e.message
        });
    }
})

module.exports = router;