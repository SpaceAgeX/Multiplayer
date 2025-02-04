const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
const maxPlayers = 4;
const playerColors = ["red", "green", "blue", "yellow"];
let assignedColors = new Set();

io.on('connection', (socket) => {
    if (Object.keys(players).length >= maxPlayers) {
        socket.disconnect();
        return;
    }

    let availableColors = playerColors.filter(color => !assignedColors.has(color));
    let playerColor = availableColors.length > 0 ? availableColors[0] : null;
    if (playerColor) assignedColors.add(playerColor);
    
    players[socket.id] = {
        x: Math.random() * 500,
        y: Math.random() * 500,
        color: playerColor,
        radius: 20
    };
    
    io.emit('updatePlayers', players);
    
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit('updatePlayers', players);
        }
    });
    
    socket.on('ping', (timestamp) => {
        socket.emit('pong', Date.now() - timestamp);
    });
    
    socket.on('disconnect', () => {
        if (players[socket.id]) {
            assignedColors.delete(players[socket.id].color);
            delete players[socket.id];
            io.emit('updatePlayers', players);
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
