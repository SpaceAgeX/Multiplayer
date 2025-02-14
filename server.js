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

// Serve static files from 'public'
app.use(express.static('public'));

let firstPlayer = null;
let players = {}; // Global object to track all connected players


io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);


    // Ensure players object exists and assign a unique color
    players[socket.id] = {
        id: socket.id,
        x: 0,
        y: 0,
        color: Math.floor(Math.random() * 0xffffff), // Fixed color assigned
        is_tagged: socket.id === firstPlayer
    };

    // ✅ Send the assigned color to the client
    socket.emit("playerColor", { color: players[socket.id].color });

    // ✅ Send the entire players list to the new player
    socket.emit("currentPlayers", players);

    // ✅ Notify all players about the new player (ensuring the correct color)
    io.emit("newPlayer", players[socket.id]);

    
    if (!firstPlayer) {
        firstPlayer = socket.id;
    }

    socket.on('pingTest', (callback) => {
        callback(); // Respond immediately to measure latency
    });
    

    socket.emit('assignTag', { is_tagged: socket.id === firstPlayer });

    socket.on('tagPlayer', (data) => {
        if (socket.id === firstPlayer) {
            firstPlayer = data.id;
            io.emit('assignTag', { is_tagged: firstPlayer });
        }
    });

    socket.on('updatePosition', (data) => {
        socket.broadcast.emit('updatePosition', { 
            id: socket.id, 
            x: data.x, 
            y: data.y, 
            color: data.color, 
            is_tagged: socket.id === firstPlayer 
        });
    });

    socket.on('disconnect', () => {
        console.log(`❌ Player disconnected: ${socket.id}`);
    
        // Remove the player from the players list
        delete players[socket.id];
    
        // If the player who left was "It", reassign another player
        if (socket.id === firstPlayer) {
            let remainingPlayers = Object.keys(players);
            firstPlayer = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
            io.emit('assignTag', { id: firstPlayer });
            console.log(`⚠ New It: ${firstPlayer}`);
        }
    
        // Notify all clients to remove the player from their scene
        io.emit('removePlayer', socket.id);
    });
    
});


// Use port 3000 locally
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Required for Vercel deployment
