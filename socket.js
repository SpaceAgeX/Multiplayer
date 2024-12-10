// Store connected players
const players = new Map();
const palette = [
    '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75',
    '#a7f070', '#38b764', '#257179', '#29366f', '#3b5dc9',
    '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57'
];

function getColorForId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    return palette[Math.abs(hash) % palette.length];
}

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        let playerId = null;

        // Assign color based on persistent player ID
        socket.on('setPlayerId', (id) => {
            playerId = id;

            const color = getColorForId(playerId); // Use playerId for consistent color
            const player = {
                id: socket.id, // Use socket.id for network purposes
                playerId, // Store persistent ID
                x: Math.random() * 800,
                y: Math.random() * 600,
                username: 'Player',
                color
            };

            players.set(socket.id, player);

            socket.emit('init', {
                id: socket.id,
                players: Array.from(players.values())
            });

            socket.broadcast.emit('playerJoined', player);
        });

        socket.on('setUsername', (username) => {
            const player = players.get(socket.id);
            if (player) {
                player.username = username;
                io.emit('usernameUpdate', {
                    id: socket.id,
                    username,
                    color: player.color
                });
            }
        });

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

        // Handle ping requests
        socket.on('ping-request', (callback) => {
            callback();
        });

        socket.on('disconnect', () => {
            players.delete(socket.id);
            io.emit('playerLeft', socket.id);
        });
    });
}

module.exports = { initializeSocket };
