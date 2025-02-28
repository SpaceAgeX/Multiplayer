// server.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game variables
const players = {};
const BUFF_SPAWN_INTERVAL = 30000; // 30 seconds in milliseconds
let buffLocations = []; // Will store possible buff spawn locations
let activeBuffs = []; // Will track all active buffs in the game
let nextBuffId = 1; // Simple ID counter for buffs
let buffSpawnTimer = null;
let taggedPlayerId = null; // Track who is "it"

// Socket connection
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Assign random player color
    const color = Math.floor(Math.random() * 0xffffff);
    players[socket.id] = {
        id: socket.id,
        color: color,
        x: 0,
        y: 0,
        is_tagged: false,
        hasSpeedBuff: false,
        hasJumpBuff: false,
        hasShieldBuff: false,
        facingDirection: 1,
        isMoving: false,
        isJumping: false
    };

    // Send assigned color to player
    socket.emit('playerColor', { color: color });

    // Handle buff locations sent by clients
    socket.on('buffLocations', (locations) => {
        // Only accept locations from the first player to avoid duplicates
        if (buffLocations.length === 0 && locations.length > 0) {
            console.log('Received buff locations:', locations.length);
            buffLocations = locations;
            
            // Start buff spawning system if not already started
            if (!buffSpawnTimer) {
                startBuffSpawnSystem();
            }
        }
    });
    
    // Handle buff collection
    socket.on('collectBuff', (data) => {
        console.log(`Player ${data.id} collected buff ${data.buffId}`);
        
        // Find the buff in activeBuffs
        const buffIndex = activeBuffs.findIndex(buff => buff.id === data.buffId);
        
        if (buffIndex !== -1) {
            // Remove the buff from active list
            activeBuffs.splice(buffIndex, 1);
            
            // Broadcast to all clients that this buff was collected
            io.emit('buffCollected', {
                id: data.id,
                buffId: data.buffId,
                buffType: data.buffType
            });
        }
    });

    // Handle position updates
    socket.on('updatePosition', (data) => {
        // Update player data
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].is_tagged = data.is_tagged;
            players[socket.id].hasSpeedBuff = data.hasSpeedBuff;
            players[socket.id].hasJumpBuff = data.hasJumpBuff;
            players[socket.id].hasShieldBuff = data.hasShieldBuff;
            
            // Save animation states
            players[socket.id].facingDirection = data.facingDirection;
            players[socket.id].isMoving = data.isMoving;
            players[socket.id].isJumping = data.isJumping;
        }

        // Broadcast to all other clients
        socket.broadcast.emit('updatePosition', data);
    });

    // Handle tag events
    socket.on('tagPlayer', (data) => {
        console.log(`Player ${socket.id} tagged player ${data.id}`);
        
        // If the tagging player is "it"
        if (players[socket.id] && players[socket.id].is_tagged) {
            // Check if the target player has a shield
            if (players[data.id] && players[data.id].hasShieldBuff) {
                console.log(`Player ${data.id} was protected by a shield!`);
                return; // Don't tag the player
            }
            
            // Update the tagged status
            if (players[socket.id]) players[socket.id].is_tagged = false;
            if (players[data.id]) players[data.id].is_tagged = true;
            
            // Update the taggedPlayerId
            taggedPlayerId = data.id;
            
            // Broadcast the change to all clients
            io.emit('assignTag', { id: data.id });
        }
    });

    // Handle ping tests
    socket.on('pingTest', (callback) => {
        if (typeof callback === 'function') {
            callback();
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        // If the disconnected player was "it", assign a new player
        if (players[socket.id] && players[socket.id].is_tagged) {
            assignNewTaggedPlayer(socket.id);
        }
        
        // Remove player from the players object
        delete players[socket.id];
        
        // Broadcast removal to all clients
        io.emit('removePlayer', socket.id);
    });

    // If this is the first player or there's no tagged player, make them "it"
    if (Object.keys(players).length === 1 || !taggedPlayerId) {
        taggedPlayerId = socket.id;
        players[socket.id].is_tagged = true;
        io.emit('assignTag', { id: socket.id });
    } else {
        // Otherwise, tell this player who is currently "it"
        socket.emit('assignTag', { id: taggedPlayerId });
    }
});

// Function to assign a new tagged player when the current one disconnects
function assignNewTaggedPlayer(excludeId) {
    const playerIds = Object.keys(players).filter(id => id !== excludeId);
    
    if (playerIds.length > 0) {
        // Pick a random player
        const randomIndex = Math.floor(Math.random() * playerIds.length);
        const newTaggedId = playerIds[randomIndex];
        
        // Update the player
        players[newTaggedId].is_tagged = true;
        taggedPlayerId = newTaggedId;
        
        // Broadcast the change
        io.emit('assignTag', { id: newTaggedId });
    } else {
        taggedPlayerId = null;
    }
}

// Function to start the buff spawn system
function startBuffSpawnSystem() {
    console.log('Starting buff spawn system');
    
    // Immediately spawn first buff
    spawnRandomBuff();
    
    // Set up timer for future spawns - exactly every 30 seconds
    buffSpawnTimer = setInterval(() => {
        spawnRandomBuff();
    }, BUFF_SPAWN_INTERVAL); // 30000ms
}

// Function to spawn a random buff
function spawnRandomBuff() {
    if (buffLocations.length === 0) return;
    
    // Clear any existing buffs
    clearAllBuffs();
    
    // Choose a random location from the available buff locations
    const locationIndex = Math.floor(Math.random() * buffLocations.length);
    const location = buffLocations[locationIndex];
    
    // Decide which buff type to spawn (0 for speed, 1 for jump, 2 for shield)
    // All buffs should have equal chance (1/3)
    let buffType = Math.floor(Math.random() * 3);
    
    // Create a buff with a unique ID
    const buffId = nextBuffId++;
    const buff = {
        id: buffId,
        position: location,
        type: buffType
    };
    
    // Add to active buffs
    activeBuffs.push(buff);
    
    // Broadcast to all clients
    io.emit('spawnBuff', buff);
    
    console.log(`Spawned ${buffType === 0 ? 'Speed' : buffType === 1 ? 'Jump' : 'Shield'} buff #${buffId} at position (${location.x}, ${location.y})`);
}

// Function to clear all existing buffs
function clearAllBuffs() {
    if (activeBuffs.length > 0) {
        activeBuffs = [];
        io.emit('clearBuffs');
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});