// Store connected players
const players = new Map();

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Get client's IP address
        const clientIp = socket.handshake.address.replace('::ffff:', '');
        
        // Initialize player with default values
        const player = {
            id: socket.id,
            x: Math.random() * 800,
            y: Math.random() * 600,
            username: 'Player',
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
        };
        players.set(socket.id, player);

        // Handle username setting (before sending initial state)
        socket.on('setUsername', (username) => {
            const player = players.get(socket.id);
            if (player) {
                player.username = username;
                io.emit('usernameUpdate', {
                    id: socket.id,
                    username: username
                });
            }
        });

        // Send initial game state
        socket.emit('init', {
            id: socket.id,
            players: Array.from(players.values())
        });

        // Broadcast new player to others
        socket.broadcast.emit('playerJoined', player);

        // Handle player movement
        socket.on('move', (data) => {
            const player = players.get(socket.id);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                socket.broadcast.emit('playerMoved', {
                    id: socket.id,
                    x: data.x,
                    y: data.y
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            const player = players.get(socket.id);
            console.log(`User disconnected: ${player?.username || 'Unknown'} (${clientIp})`);
            players.delete(socket.id);
            io.emit('playerLeft', socket.id);
        });
    });
}

module.exports = { initializeSocket };
