const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};
let keys = {};
const speed = 5;
const playerColors = ["red", "green", "blue", "yellow"];
const maxPlayers = 4;
const playerRadius = 20;
let assignedColors = new Set();

let fps = 0, lastFrameTime = performance.now(), ping = 0;
let lastPingTime = Date.now();

socket.on('updatePlayers', (serverPlayers) => {
    if (Object.keys(serverPlayers).length > maxPlayers) return;
    
    assignedColors.clear();
    for (let id in serverPlayers) {
        if (!players[id]) {
            let availableColors = playerColors.filter(color => !assignedColors.has(color));
            if (availableColors.length > 0) {
                serverPlayers[id].color = availableColors[0];
                assignedColors.add(availableColors[0]);
            }
        } else {
            serverPlayers[id].color = players[id].color;
            assignedColors.add(players[id].color);
            serverPlayers[id].x = players[id].x;
            serverPlayers[id].y = players[id].y;
        }
    }
    players = serverPlayers;
    draw();
});

socket.on('pong', () => {
    ping = Date.now() - lastPingTime;
});

window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    delete keys[event.key];
});

function gameLoop() {
    const now = performance.now();
    fps = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;

    if (players[socket.id]) {
        let player = players[socket.id];
        let movement = { x: 0, y: 0 };
        
        if (keys['ArrowUp']) movement.y -= 1;
        if (keys['ArrowDown']) movement.y += 1;
        if (keys['ArrowLeft']) movement.x -= 1;
        if (keys['ArrowRight']) movement.x += 1;
        
        let length = Math.sqrt(movement.x ** 2 + movement.y ** 2);
        if (length > 0) {
            movement.x = (movement.x / length) * speed;
            movement.y = (movement.y / length) * speed;
        }
        
        movement.x = Math.max(playerRadius, Math.min(canvas.width - playerRadius, player.x + movement.x));
        movement.y = Math.max(playerRadius, Math.min(canvas.height - playerRadius, player.y + movement.y));
        
        players[socket.id].x = movement.x;
        players[socket.id].y = movement.y;
        socket.emit('move', movement);
    }
    lastPingTime = Date.now();
    socket.emit('ping');
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${fps}`, 10, 20);
    ctx.fillText(`Ping: ${ping}ms`, 10, 40);
    
    for (let id in players) {
        let player = players[id];
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
