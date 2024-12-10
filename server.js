const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { initializeSocket } = require('./socket');
const path = require('path');
const os = require('os');

// Function to get server IP addresses
function getServerAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (!interface.internal && interface.family === 'IPv4') {
                addresses.push(interface.address);
            }
        }
    }
    return addresses;
}

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
    const serverAddresses = getServerAddresses();
    console.log(`Server is running on port ${PORT} with IP addresses: ${serverAddresses.join(', ')}`);
});