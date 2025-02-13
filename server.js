const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (for now)
        methods: ["GET", "POST"]
    }
});

// Serve static files from 'public'
app.use(express.static('public'));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' https://vercel.live;");
    next();
});


// WebSocket logic
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('updatePosition', (data) => {
        console.log(`Player ${socket.id} position: x=${data.x}, y=${data.y}, color=${data.color.toString(16)}, is_tagged=${data.is_tagged}`);
        socket.broadcast.emit('updatePosition', { 
            id: socket.id, 
            x: data.x, 
            y: data.y, 
            color: data.color, 
            is_tagged: data.is_tagged 
        });
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        io.emit('removePlayer', socket.id);
    });
});

// Set port dynamically for Vercel
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Required for Vercel
