const express = require('express');
const http = require('http');
const app = express();
const socket = require('socket.io');
const dotenv = require('dotenv').config();

const client_url = process.env.client_url;

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: client_url,
        methods: ["GET", "POST"]
    }
});


const usersSocketMap = {};
const socketsUserMap = {};

io.on('connection', (socket) => {
    console.log(`A user connected : ${socket.id}`);

    const userID = socket.handshake.auth.userID;


    if (userID) {
        usersSocketMap[userID] = socket.id;
        socketsUserMap[socket.id] = userID;
    }
    else
        console.log('Invalid User');

    console.log('Mapping : ');
    console.log(usersSocketMap);

    // call
    socket.on('new-call', ({ remoteUserID, offer }) => {
        io.to(usersSocketMap[remoteUserID]).emit('incoming-call', { callerSocketID: socket.id, offer });
    })

    socket.on('call-accepted', ({ callerSocketID, answer }) => {
        io.to(callerSocketID).emit('call-accepted', { remoteSocketID: socket.id, answer });
    })
    
    // message socket
    socket.on('messageObject', (messageObject) => {
        console.log('Sending message to : ', usersSocketMap[messageObject.receiverID]);
        console.log(messageObject);
        io.to(usersSocketMap[messageObject.receiverID]).emit('messageObject', messageObject);
    })

    // isTyping socket
    socket.on('isTyping', (isTyping, receiverID) => {
        io.to(usersSocketMap[receiverID]).emit('isTyping', isTyping);
    })

    socket.on('disconnect', () => {
        console.log(`A user disconnected : ${socket.id}`);

        // delete old socket mapping
        for (const id in usersSocketMap) {
            if (usersSocketMap[id] === socket.id) {
                delete usersSocketMap[id];
                break;
            }
        }
    })
})

module.exports = { app, server }