const socket = io(); // Initialize socket connection

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

//UI
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

// Configure shadow properties



// Import Player and StaticObject
let player;
let otherPlayers = {};
let staticObjects = [];

let lastFrameTime = performance.now(); // Store last frame timestamp

window.addEventListener('load', () => {
    let playerSpawn = generateMap(scene, staticObjects);

    // Initialize player at spawn position
    player = new Player(scene);
    player.mesh.position.set(playerSpawn.x, playerSpawn.y, playerSpawn.z)

    update();
});



function update() {
    let now = performance.now();
    let deltaTime = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    player.update(staticObjects, deltaTime);

    if (player.is_tagged) {
        let taggedPlayer = player.checkPlayerCollision(otherPlayers);
        if (taggedPlayer) {
            socket.emit("tagPlayer", { id: taggedPlayer.id });
        }
    }

    socket.emit('updatePosition', {
        x: player.mesh.position.x,
        y: player.mesh.position.y,
        color: player.color,
        is_tagged: player.is_tagged
    });

    camera.position.y = player.mesh.position.y + 2;
    camera.position.x = player.mesh.position.x;

    renderer.render(scene, camera);
    ui.updateUI(); // Update FPS & Ping display
    requestAnimationFrame(update);
}

socket.on('tagged', (data) => {
    if (player.mesh.position.x === data.x && player.mesh.position.y === data.y) {
        player.setTagged(true);
    } else {
        player.setTagged(false);
    }
});


socket.on('assignTag', (data) => {
    if (!player) {
        console.error("Player instance is missing!");
        return;
    }

    console.log("Assigning tag status:", data.is_tagged);
    player.setTagged(data.is_tagged);
});


// Update player status when receiving positions
socket.on('updatePosition', (data) => {
    if (data.id === socket.id) return; // Ignore local player updates

    if (!otherPlayers[data.id]) {
        const newPlayer = new Player(scene);
        newPlayer.mesh.position.set(data.x, data.y, 0);
        scene.add(newPlayer.mesh);
        otherPlayers[data.id] = newPlayer;
    } else {
        otherPlayers[data.id].mesh.position.set(data.x, data.y, 0);
    }

    otherPlayers[data.id].setTagged(data.is_tagged);
});


socket.on('removePlayer', (id) => {
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id]); // Remove from scene
        delete otherPlayers[id]; // Remove from object tracking
    }
});
