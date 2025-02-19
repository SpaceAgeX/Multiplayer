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

    // If there's no first player yet, assign this player as "It"
    if (!firstPlayer) {
        firstPlayer = socket.id;
    }

    // Assign player data
    players[socket.id] = {
        id: socket.id,
        x: 0,
        y: 0,
        color: Math.floor(Math.random() * 0xffffff), // Random color
        is_tagged: socket.id === firstPlayer
    };

    // ✅ Send assigned color to the client
    socket.emit("playerColor", { color: players[socket.id].color });

    // ✅ Send the entire players list to the new player
    socket.emit("currentPlayers", players);

    // ✅ Notify all players about the new player
    io.emit("newPlayer", players[socket.id]);

    // ✅ Ensure the first player gets the "It" status
    socket.emit('assignTag', { id: firstPlayer });


    

    socket.on('pingTest', (callback) => {
        callback(); // Respond immediately to measure latency
    });
    

    

    socket.on('tagPlayer', (data) => {
      
        console.log(`🔴 Player ${socket.id} tagged Player ${data.id}`);
    
        if (typeof data.id !== "string" || !players[data.id]) {  
            console.error(`❌ Error: Attempted to tag non-existent player ${data.id}`);
            return;
        }
    
        if (socket.id === firstPlayer) {
            firstPlayer = data.id; // ✅ Assign new "It"
            io.emit('assignTag', { id: firstPlayer });
    
            console.log(`🟢 New "It" player is ${firstPlayer}`);
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
