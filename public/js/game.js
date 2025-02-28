// game.js file

const socket = io(); // Initialize socket connection

// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

// Create a simple cartoon-style sky background
function createSkyBackground(scene) {
    // Set the renderer clear color to a vibrant cartoon blue
    renderer.setClearColor(0x5AADFF);
    
    // Create a sky plane that follows the camera
    const skyWidth = 2000;
    const skyHeight = 2000;
    const skyGeometry = new THREE.PlaneGeometry(skyWidth, skyHeight);
    
    // Create a gradient material with more vibrant colors for cartoon style
    const skyMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide
    });
    
    // Set vertex colors to create gradient - brighter colors for cartoon look
    const colors = [];
    const topBlue = new THREE.Color(0x3A8BFF); // Bright blue for top
    const bottomBlue = new THREE.Color(0x9BDBFF); // Light blue for bottom
    
    // Top vertices (darker blue)
    colors.push(topBlue.r, topBlue.g, topBlue.b);
    colors.push(topBlue.r, topBlue.g, topBlue.b);
    
    // Bottom vertices (lighter blue)
    colors.push(bottomBlue.r, bottomBlue.g, bottomBlue.b);
    colors.push(bottomBlue.r, bottomBlue.g, bottomBlue.b);
    
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

// Add Ambient Light for general brightness - brighter for cartoon style
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Higher intensity
scene.add(ambientLight);

// Import Player and StaticObject
let player;
let otherPlayers = {};
let staticObjects = [];
let lastFrameTime = performance.now(); // Store last frame timestamp
let lastTagTime = 0; // Global tag cooldown timer
let buffs = []; // Array to store active buffs
let buffLocations = []; // Will store possible buff spawn locations
const BUFF_SPAWN_INTERVAL = 30000; // 30 seconds in milliseconds

window.addEventListener('load', () => {
    socket.emit("requestColor"); // Request assigned color from server
});

socket.on("playerColor", (data) => {
    console.log(`Received color from server: ${data.color}`);
    
    let mapData = generateMap(scene, staticObjects);
    let playerSpawn = mapData.playerSpawn;
    buffLocations = mapData.buffLocations;
    
    // Send buff locations to server for synchronized spawning
    socket.emit('buffLocations', buffLocations);
    
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

    // Update all active buffs
    for (let i = buffs.length - 1; i >= 0; i--) {
        buffs[i].update(now);
    }

    // Check if player collected any buffs
    checkBuffCollection();

    player.update(staticObjects, deltaTime);

    if (player.is_tagged) {
        let taggedPlayerId = player.checkPlayerCollision(otherPlayers);
    
        if (taggedPlayerId) { 
            console.log(`✅ Player ${taggedPlayerId} was tagged! Sending event to server.`);
            socket.emit("tagPlayer", { id: taggedPlayerId });
        }
    }

    // Send position, animation states, and buff status to server
    socket.emit('updatePosition', {
        id: socket.id,
        x: player.mesh.position.x,
        y: player.mesh.position.y,
        color: player.color,
        is_tagged: player.is_tagged,
        hasSpeedBuff: player.hasSpeedBuff,
        hasJumpBuff: player.hasJumpBuff,
        hasShieldBuff: player.hasShieldBuff,
        facingDirection: player.facingDirection,
        isMoving: player.isMoving,
        isJumping: player.isJumping
    });

    // Update other players' animations
    for (const id in otherPlayers) {
        const otherPlayer = otherPlayers[id];
        
        // Apply appropriate animation based on state
        if (otherPlayer.isJumping) {
            otherPlayer.animateJumping();
        } else if (otherPlayer.isMoving) {
            otherPlayer.animateRunning(deltaTime);
        } else {
            otherPlayer.resetAnimation();
        }
    }

    camera.position.y = player.mesh.position.y + 2;
    camera.position.x = player.mesh.position.x;

    // Update sky position to follow camera
    sky.update();

    renderer.render(scene, camera);
    ui.updateUI(player); // Update UI with player status
    requestAnimationFrame(update);
}

function checkBuffCollection() {
    if (!player) return;
    
    for (let i = buffs.length - 1; i >= 0; i--) {
        const buff = buffs[i];
        const dx = player.mesh.position.x - buff.mesh.position.x;
        const dy = player.mesh.position.y - buff.mesh.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1.0) { // If player is close enough to collect
            console.log(`Player collected a ${buff.type === 0 ? 'Speed' : buff.type === 1 ? 'Jump' : 'Shield'} buff!`);
            
            // Notify server about the buff collection
            socket.emit('collectBuff', {
                id: socket.id,
                buffId: buff.id,
                buffType: buff.type
            });
        }
    }
}

// Listen for server-spawn buff events
socket.on('spawnBuff', (data) => {
    console.log(`Server spawned a ${data.type === 0 ? 'Speed' : data.type === 1 ? 'Jump' : 'Shield'} buff at position (${data.position.x}, ${data.position.y})`);
    
    // Create the buff with the ID from server
    const buff = new Buff(scene, data.position, data.type, data.id);
    buffs.push(buff);
    
    // Reset the UI buff timer
    ui.resetBuffTimer();
});

// Listen for buff collection events from server
socket.on('buffCollected', (data) => {
    console.log(`Player ${data.id} collected a ${data.buffType === 0 ? 'Speed' : data.buffType === 1 ? 'Jump' : 'Shield'} buff`);
    
    // Find and remove the buff with matching ID
    for (let i = buffs.length - 1; i >= 0; i--) {
        if (buffs[i].id === data.buffId) {
            buffs[i].remove(scene);
            buffs.splice(i, 1);
            break;
        }
    }
    
    // Apply buff to player if it's our player
    if (data.id === socket.id && player) {
        if (data.buffType === 0) { // Speed buff
            player.applySpeedBuff();
        } else if (data.buffType === 1) { // Jump buff
            player.applyJumpBuff();
        } else if (data.buffType === 2) { // Shield buff
            player.applyShieldBuff();
        }
    }
    
    // Update the visual effect on other players
    if (otherPlayers[data.id]) {
        if (data.buffType === 0) {
            otherPlayers[data.id].showSpeedBuffEffect();
        } else if (data.buffType === 1) {
            otherPlayers[data.id].showJumpBuffEffect();
        } else if (data.buffType === 2) {
            otherPlayers[data.id].showShieldBuffEffect();
        }
    }
});

// Listen for buff clear events from server
socket.on('clearBuffs', () => {
    // Clear all existing buffs
    for (const buff of buffs) {
        buff.remove(scene);
    }
    buffs = [];
});

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
        // Update facing direction if provided
        if (data.facingDirection !== undefined) {
            if (data.facingDirection !== otherPlayers[data.id].facingDirection) {
                otherPlayers[data.id].facingDirection = data.facingDirection;
                otherPlayers[data.id].mesh.scale.x = data.facingDirection;
            }
        }
        
        // Update animation states if provided
        if (data.isMoving !== undefined) {
            otherPlayers[data.id].isMoving = data.isMoving;
        }
        
        if (data.isJumping !== undefined) {
            otherPlayers[data.id].isJumping = data.isJumping;
        }
        
        // Update tagged status
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
        
        if (data.hasShieldBuff) {
            otherPlayers[data.id].showShieldBuffEffect();
        } else {
            otherPlayers[data.id].hideShieldBuffEffect();
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
    constructor(scene, position, type, id) {
        this.type = type; // 0 for speed, 1 for jump, 2 for shield
        this.id = id; // Store the server-assigned ID
        this.creationTime = performance.now();
        
        // Create the buff mesh - more cartoon-like with cel-shading effect
        const geometry = new THREE.DodecahedronGeometry(0.4, 0); // Low-poly geometry
        const material = new THREE.MeshToonMaterial({
            color: this.getColorForType(),
            emissive: this.getColorForType(),
            emissiveIntensity: 0.5,
            flatShading: true // Enable flat shading for low-poly look
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, 0);
        
        // Create a halo effect - simplified for cartoon look
        const haloGeometry = new THREE.RingGeometry(0.5, 0.6, 8); // Less segments for low-poly
        const haloMaterial = new THREE.MeshBasicMaterial({
            color: this.getColorForType(),
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
    
    getColorForType() {
        switch(this.type) {
            case 0: return 0x00ff00; // Green for speed
            case 1: return 0x0000ff; // Blue for jump
            case 2: return 0xffa500; // Orange for shield
            default: return 0xffffff; // White fallback
        }
    }
    
    update(currentTime) {
        // Make the buff hover and rotate - more exaggerated for cartoon feel
        this.mesh.position.y += Math.sin(currentTime / 300) * 0.002; // Faster, more noticeable
        this.mesh.rotation.y += 0.02; // Faster rotation
        this.mesh.rotation.x += 0.01; // Add X rotation for more dynamic movement
        this.halo.rotation.z += 0.03; // Faster halo rotation
    }
    
    remove(scene) {
        scene.remove(this.mesh);
    }
}