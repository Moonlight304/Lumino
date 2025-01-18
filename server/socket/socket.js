const express = require('express');
const http = require('http');
const app = express();
const socket = require('socket.io');

const client_url = process.env.client_url;

const server = http.createServer(app);
const io = socket(server, {
    cors: {
        origin: [client_url]
    }
});

const usersSocketMap = {};

io.on('connection', (socket) => {
    console.log(`A user connected : ${socket.id}`);

    const userID = socket.handshake.query.userID;
    if (userID)
        usersSocketMap[userID] = socket.id;

    socket.on('messageObject', (messageObject) => {
        console.log(`Message : ${messageObject}`);
    })
    
    socket.on('disconnect', () => {
        console.log(`A user disconnected : ${socket.id}`);
    })
})

module.exports =  { app, server }