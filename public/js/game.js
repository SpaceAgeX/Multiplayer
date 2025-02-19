const socket = io(); // Initialize socket connection

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

// UI
const ui = new UI();

// Enable Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // High-quality shadows

// Set Renderer Size and Prevent Scroll Issues
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.style.overflow = "hidden"; // Prevent scrolling
document.body.style.margin = "0"; // Remove default margin

// Set Camera Position
camera.position.set(0, 2, 10);
camera.lookAt(0, 0, 0);

// Add Ambient Light for general brightness
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light, lower intensity
scene.add(ambientLight);

// Import Player and StaticObject
let player;
let otherPlayers = {};
let staticObjects = [];
let lastFrameTime = performance.now(); // Store last frame timestamp
let lastTagTime = 0; // Global tag cooldown timer


window.addEventListener('load', () => {
    socket.emit("requestColor"); // Request assigned color from server
});

socket.on("playerColor", (data) => {
    console.log(`Received color from server: ${data.color}`);
    
    let playerSpawn = generateMap(scene, staticObjects);
    
    // Initialize player with assigned color
    player = new Player(scene, data.color);
    player.mesh.position.set(playerSpawn.x, playerSpawn.y, playerSpawn.z);
    scene.add(player.mesh);

    update(); // Start game loop
});

function update() {
    if (!player) return; // Ensure player is initialized before updating

    let now = performance.now();
    let deltaTime = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    player.update(staticObjects, deltaTime);

    if (player.is_tagged) {
        let taggedPlayerId = player.checkPlayerCollision(otherPlayers); // ✅ Now this returns an ID string
    
        if (taggedPlayerId) { 
            console.log(`✅ Player ${taggedPlayerId} was tagged! Sending event to server.`);
            socket.emit("tagPlayer", { id: taggedPlayerId }); // ✅ Sends just the ID now
        } else {
            console.warn("⚠ No valid player found for tagging. Skipping.");
        }
    }
    
    
    

    socket.emit('updatePosition', {
        id: socket.id,
        x: player.mesh.position.x,
        y: player.mesh.position.y,
        color: player.color, // Ensure color is always sent
        is_tagged: player.is_tagged
    });

    camera.position.y = player.mesh.position.y + 2;
    camera.position.x = player.mesh.position.x;

    renderer.render(scene, camera);
    ui.updateUI(); // Update FPS & Ping display
    requestAnimationFrame(update);
}

socket.on('assignTag', (data) => {
    console.log(`🔄 Received "It" assignment: ${data.id}`);

    if (!data.id) {
        console.error("❌ Error: Received undefined 'It' player!");
        return;
    }

    if (player) {
        player.setTagged(socket.id === data.id);
    }

    for (const id in otherPlayers) {
        if (otherPlayers[id]) {
            otherPlayers[id].setTagged(data.id === id);
        }
    }
});



socket.on('updatePosition', (data) => {
    if (!otherPlayers[data.id]) {
        console.log(`Creating new player ${data.id} with color: ${data.color}`);
        otherPlayers[data.id] = new Player(scene, data.color);
        otherPlayers[data.id].mesh.position.set(data.x, data.y, 0);
        scene.add(otherPlayers[data.id].mesh);
    } else {
        otherPlayers[data.id].mesh.position.set(data.x, data.y, 0);
    }

    if (otherPlayers[data.id]) {
        otherPlayers[data.id].mesh.material.color.setHex(data.color); // Ensure assigned color is applied
        otherPlayers[data.id].setTagged(data.is_tagged);
    }
});

socket.on('removePlayer', (id) => {
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id].mesh); // Remove player sphere from scene
        delete otherPlayers[id]; // Remove from tracking
        console.log(`Removed player: ${id}`);
    }
});
