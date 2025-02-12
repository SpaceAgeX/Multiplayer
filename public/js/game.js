const socket = io(); // Initialize socket connection

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

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

// Add Light Source for Shadows
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5); // Position the light above
light.castShadow = true; // Enable shadows

// Add Ambient Light for general brightness
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Soft white light, lower intensity
scene.add(ambientLight);

// Configure shadow properties
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
scene.add(light);

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
    let deltaTime = (now - lastFrameTime) / 1000; // Convert milliseconds to seconds
    lastFrameTime = now; // Update last frame time

    player.update(staticObjects, deltaTime); // Pass deltaTime to player

    // Send the player's position, color, and is_tagged status to the server
    socket.emit('updatePosition', {
        x: player.mesh.position.x,
        y: player.mesh.position.y,
        color: player.color,
        is_tagged: player.is_tagged
    });

    // Make the camera follow the player
    camera.position.y = player.mesh.position.y + 2;
    camera.position.x = player.mesh.position.x;

    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

socket.on('updatePosition', (data) => {
    if (data.id === socket.id) return; // Ignore updates for the local player

    if (!otherPlayers[data.id]) {
        // Create a new sphere for the other player
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: data.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(data.x, data.y, 0);
        scene.add(mesh);

        otherPlayers[data.id] = mesh;
    } else {
        // Update existing player's position
        otherPlayers[data.id].position.set(data.x, data.y, 0);
    }
})

socket.on('removePlayer', (id) => {
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id]); // Remove from scene
        delete otherPlayers[id]; // Remove from object tracking
    }
});
