const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));


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
        console.log(`Player disconnected: ${socket.id}`);
        io.emit('removePlayer', socket.id);
    });
});



server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
