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

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    if (!firstPlayer) {
        firstPlayer = socket.id;
    }

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
        io.emit('removePlayer', socket.id);
        if (socket.id === firstPlayer) {
            let remainingPlayers = Object.keys(io.sockets.sockets);
            firstPlayer = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
            io.emit('assignTag', { is_tagged: firstPlayer });
        }
    });
});


// Use port 3000 locally
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Required for Vercel deployment
