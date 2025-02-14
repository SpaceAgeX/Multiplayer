const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public')); // Serve frontend files

let players = {};
let firstPlayer = null; // Track the first player who joins

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Assign the first player to be "It"
    if (!firstPlayer) {
        firstPlayer = socket.id;
    }

    // Store player data
    players[socket.id] = {
        id: socket.id,
        color: Math.random() * 0xffffff,
        is_tagged: socket.id === firstPlayer // First player is "It"
    };

    // Send the current players to the new connection
    socket.emit('currentPlayers', players);

    // Notify everyone of the new player
    io.emit('newPlayer', players[socket.id]);

    // Assign "It" role to the first player
    socket.emit('assignTag', { id: firstPlayer });

    // Handle player movement updates
    socket.on('updatePosition', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].is_tagged = socket.id === firstPlayer;

            io.emit('updatePosition', players[socket.id]);
        }
    });

    // Handle tagging (when "It" touches another player)
    socket.on('tagPlayer', (data) => {
        if (socket.id === firstPlayer && players[data.id]) {
            firstPlayer = data.id; // Transfer "It" to the tagged player
            io.emit('assignTag', { id: firstPlayer }); // Notify all players
        }
    });

    // Handle player disconnecting
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];

        // If "It" leaves, assign a new "It"
        if (socket.id === firstPlayer) {
            let playerIds = Object.keys(players);
            firstPlayer = playerIds.length > 0 ? playerIds[0] : null;
            io.emit('assignTag', { id: firstPlayer });
        }

        io.emit('removePlayer', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
