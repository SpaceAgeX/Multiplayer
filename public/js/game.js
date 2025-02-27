// game.js file

const socket = io(); // Initialize socket connection

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

// Create a simple reliable sky background
function createSkyBackground(scene) {
    // Set the renderer clear color to a nice blue
    renderer.setClearColor(0x87CEEB);
    
    // Create a sky plane that follows the camera
    const skyWidth = 2000;
    const skyHeight = 2000;
    const skyGeometry = new THREE.PlaneGeometry(skyWidth, skyHeight);
    
    // Create a gradient material directly with colors
    const skyMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide
    });
    
    // Set vertex colors to create gradient
    const colors = [];
    const darkBlue = new THREE.Color(0x4682B4); // Steel blue for top
    const lightBlue = new THREE.Color(0xADD8E6); // Light blue for bottom
    
    // Top vertices (darker blue)
    colors.push(darkBlue.r, darkBlue.g, darkBlue.b);
    colors.push(darkBlue.r, darkBlue.g, darkBlue.b);
    
    // Bottom vertices (lighter blue)
    colors.push(lightBlue.r, lightBlue.g, lightBlue.b);
    colors.push(lightBlue.r, lightBlue.g, lightBlue.b);
    
    // Add colors attribute to geometry
    skyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.position.z = -800;
    scene.add(sky);
    
    // Function to update sky position to follow camera
    function updateSkyPosition() {
        sky.position.x = camera.position.x;
        sky.position.y = camera.position.y + 200; // Position sky above the player
        sky.lookAt(camera.position);
    }
    
    // Return both the sky and the update function
    return { mesh: sky, update: updateSkyPosition };
}

// Create the sky
let sky = createSkyBackground(scene);

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
let buffs = []; // Array to store active buffs
let lastBuffSpawnTime = 0; // Track when the last buff was spawned
const BUFF_SPAWN_INTERVAL = 15000; // 15 seconds in milliseconds
let buffLocations = []; // Will store possible buff spawn locations

window.addEventListener('load', () => {
    socket.emit("requestColor"); // Request assigned color from server
});

socket.on("playerColor", (data) => {
    console.log(`Received color from server: ${data.color}`);
    
    let mapData = generateMap(scene, staticObjects);
    let playerSpawn = mapData.playerSpawn;
    buffLocations = mapData.buffLocations;
    
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

    // Check if it's time to spawn a new buff
    if (now - lastBuffSpawnTime > BUFF_SPAWN_INTERVAL && buffLocations.length > 0) {
        spawnRandomBuff();
        lastBuffSpawnTime = now;
    }

    // Update all active buffs
    updateBuffs(now);

    // Check if player collected any buffs
    checkBuffCollection();

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
        is_tagged: player.is_tagged,
        hasSpeedBuff: player.hasSpeedBuff,
        hasJumpBuff: player.hasJumpBuff
    });

    camera.position.y = player.mesh.position.y + 2;
    camera.position.x = player.mesh.position.x;

    // Update sky position to follow camera
    sky.update();

    renderer.render(scene, camera);
    ui.updateUI(); // Update FPS & Ping display
    requestAnimationFrame(update);
}

// Function to spawn a random buff at a random location
function spawnRandomBuff() {
    if (buffLocations.length === 0) return;
    
    // Remove any existing buffs
    clearBuffs();
    
    // Choose a random location from the available buff locations
    const locationIndex = Math.floor(Math.random() * buffLocations.length);
    const location = buffLocations[locationIndex];
    
    // Decide which buff type to spawn (0 for speed, 1 for jump)
    const buffType = Math.floor(Math.random() * 2);
    
    // Create the buff
    const buff = new Buff(scene, location, buffType);
    buffs.push(buff);
    
    console.log(`Spawned ${buffType === 0 ? 'Speed' : 'Jump'} buff at position (${location.x}, ${location.y})`);
}

// Function to clear all existing buffs
function clearBuffs() {
    for (const buff of buffs) {
        buff.remove(scene);
    }
    buffs = [];
}

// Function to update all active buffs
function updateBuffs(currentTime) {
    for (const buff of buffs) {
        buff.update(currentTime);
    }
}

// Function to check if player collected any buffs
function checkBuffCollection() {
    if (!player) return;
    
    for (let i = buffs.length - 1; i >= 0; i--) {
        const buff = buffs[i];
        const dx = player.mesh.position.x - buff.mesh.position.x;
        const dy = player.mesh.position.y - buff.mesh.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1.0) { // If player is close enough to collect
            console.log(`Player collected a ${buff.type === 0 ? 'Speed' : 'Jump'} buff!`);
            
            // Apply buff to player
            if (buff.type === 0) { // Speed buff
                player.applySpeedBuff();
            } else { // Jump buff
                player.applyJumpBuff();
            }
            
            // Remove the buff
            buff.remove(scene);
            buffs.splice(i, 1);
            
            // Notify other players about the buff collection
            socket.emit('buffCollected', {
                id: socket.id,
                buffType: buff.type
            });
        }
    }
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
        
        // Update buff status
        if (data.hasSpeedBuff) {
            otherPlayers[data.id].showSpeedBuffEffect();
        } else {
            otherPlayers[data.id].hideSpeedBuffEffect();
        }
        
        if (data.hasJumpBuff) {
            otherPlayers[data.id].showJumpBuffEffect();
        } else {
            otherPlayers[data.id].hideJumpBuffEffect();
        }
    }
});

socket.on('buffCollected', (data) => {
    console.log(`Player ${data.id} collected a ${data.buffType === 0 ? 'Speed' : 'Jump'} buff`);
    
    // Update the visual effect on other players
    if (otherPlayers[data.id]) {
        if (data.buffType === 0) {
            otherPlayers[data.id].showSpeedBuffEffect();
        } else {
            otherPlayers[data.id].showJumpBuffEffect();
        }
    }
});

socket.on('removePlayer', (id) => {
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id].mesh); // Remove player sphere from scene
        delete otherPlayers[id]; // Remove from tracking
        console.log(`Removed player: ${id}`);
    }
});

// Buff class definition
class Buff {
    constructor(scene, position, type) {
        this.type = type; // 0 for speed, 1 for jump
        this.creationTime = performance.now();
        
        // Create the buff mesh
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: this.type === 0 ? 0x00ff00 : 0x0000ff, // Green for speed, Blue for jump
            emissive: this.type === 0 ? 0x00ff00 : 0x0000ff,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        
        // Create a halo effect
        const haloGeometry = new THREE.RingGeometry(0.4, 0.5, 32);
        const haloMaterial = new THREE.MeshBasicMaterial({
            color: this.type === 0 ? 0x00ff00 : 0x0000ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        this.halo = new THREE.Mesh(haloGeometry, haloMaterial);
        this.halo.position.set(0, 0, 0);
        this.halo.rotation.x = Math.PI / 2; // Align with the XY plane
        
        this.mesh.add(this.halo);
        scene.add(this.mesh);
    }
    
    update(currentTime) {
        // Make the buff hover and rotate
        this.mesh.position.y += Math.sin(currentTime / 500) * 0.001;
        this.mesh.rotation.y += 0.01;
        this.halo.rotation.z += 0.02;
    }
    
    remove(scene) {
        scene.remove(this.mesh);
    }
}
