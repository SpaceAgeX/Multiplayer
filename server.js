const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { initializeSocket } = require('./socket');
const path = require('path');

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Initialize socket.io handling
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});