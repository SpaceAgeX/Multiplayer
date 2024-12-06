const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resizeCanvas();

// Resize canvas when window is resized
window.addEventListener('resize', resizeCanvas);

// Connect to the server
const socket = io();

// Get username from localStorage
const username = localStorage.getItem('username') || 'Player';

// Game state
let myId = null;
const players = new Map();
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Square properties
const squareSize = 50;
const speed = 5;

// Initialize game when connected
socket.on('init', (data) => {
    myId = data.id;
    data.players.forEach(player => {
        players.set(player.id, player);
    });
    // Send username to server after initialization
    socket.emit('setUsername', username);
});

// Handle new player joining
socket.on('playerJoined', (player) => {
    players.set(player.id, player);
});

// Handle username updates
socket.on('usernameUpdate', (data) => {
    const player = players.get(data.id);
    if (player) {
        player.username = data.username;
    }
});

// Handle player movement
socket.on('playerMoved', (data) => {
    const player = players.get(data.id);
    if (player) {
        player.x = data.x;
        player.y = data.y;
    }
});

// Handle player disconnection
socket.on('playerLeft', (playerId) => {
    players.delete(playerId);
});

// Key event listeners
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Game loop
function update() {
    if (myId && players.has(myId)) {
        const player = players.get(myId);
        
        // Calculate movement vector
        let dx = 0;
        let dy = 0;
        
        if (keys.w) dy -= speed;
        if (keys.s) dy += speed;
        if (keys.a) dx -= speed;
        if (keys.d) dx += speed;

        // Apply movement with bounds checking
        if (dx !== 0 || dy !== 0) {
            const newX = player.x + dx;
            const newY = player.y + dy;

            if (newX >= 0 && newX <= canvas.width - squareSize) {
                player.x = newX;
            }
            if (newY >= 0 && newY <= canvas.height - squareSize) {
                player.y = newY;
            }

            // Send position update to server
            socket.emit('move', {
                x: player.x,
                y: player.y
            });
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all players
        players.forEach(p => {
            // Draw square
            ctx.fillStyle = p.id === myId ? '#4CAF50' : p.color;
            ctx.fillRect(p.x, p.y, squareSize, squareSize);
            
            // Draw username
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(p.username || 'Player', p.x + squareSize/2, p.y - 10);
        });
    }
    
    requestAnimationFrame(update);
}

// Start the game loop
update();
