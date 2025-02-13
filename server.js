const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    }
});

// Serve static files from 'public'
app.use(express.static('public'));

// Catch-all route to serve index.html for unknown paths
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// WebSocket handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('updatePosition', (data) => {
        socket.broadcast.emit('updatePosition', { 
            id: socket.id, 
            x: data.x, 
            y: data.y, 
            color: data.color, 
            is_tagged: data.is_tagged 
        });
    });

    socket.on('disconnect', () => {
        io.emit('removePlayer', socket.id);
    });
});

// Use Vercel's dynamic port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Required for Vercel deployment
