const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let itPlayer = null;

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    players[socket.id] = {
        x: Math.random() * 500,
        y: Math.random() * 500,
        radius: 10,
        isIt: itPlayer === null
    };
    
    if (itPlayer === null) {
        itPlayer = socket.id;
    }

    io.emit('updatePlayers', players);
    
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('tag', (playerId) => {
        if (players[socket.id] && players[playerId] && socket.id === itPlayer) {
            itPlayer = playerId;
            players[socket.id].isIt = false;
            players[playerId].isIt = true;
            io.emit('updatePlayers', players);
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        if (itPlayer === socket.id) {
            let keys = Object.keys(players);
            if (keys.length > 0) {
                itPlayer = keys[0];
                players[itPlayer].isIt = true;
            } else {
                itPlayer = null;
            }
        }
        io.emit('updatePlayers', players);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});