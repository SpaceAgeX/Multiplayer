class Block extends StaticObject {
    constructor(scene, position, width) {
        // Instead of using a simple color, we'll implement a textured material
        super(scene, width, 1, 1, null, position); // Pass null for color, we'll set material manually
        
        // Remove the default material
        this.mesh.material = null;
        
        // Create textures
        const sideTexture = createSideTexture();
        const topTexture = createTopTexture();
        
        // Set proper texture tiling based on width
        sideTexture.repeat.set(width, 1);
        topTexture.repeat.set(width, 1);
        
        // Create material with the texture
        const materials = [
            new THREE.MeshStandardMaterial({ map: sideTexture }), // Right side
            new THREE.MeshStandardMaterial({ map: sideTexture }), // Left side
            new THREE.MeshStandardMaterial({ map: topTexture }), // Top
            new THREE.MeshStandardMaterial({ map: sideTexture }), // Bottom
            new THREE.MeshStandardMaterial({ map: sideTexture }), // Front
            new THREE.MeshStandardMaterial({ map: sideTexture })  // Back
        ];
        
        this.mesh.material = materials;
        
        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
}

// Function to create the side texture (dirt with grass on top)
function createSideTexture() {
    // Create a canvas for the texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base dirt color
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 64, 64);
    
    // Top grass color
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 64, 10);
    
    // Add some grass texture variation
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 10);
        const size = Math.floor(Math.random() * 4) + 1;
        ctx.fillRect(x, y, size, size);
    }
    
    // Add some dirt speckles
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < 40; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 54) + 10;
        const size = Math.floor(Math.random() * 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Important: Set the texture to repeat
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Set a fixed repeat value - we'll scale this based on width
    texture.repeat.set(1, 1);
    
    return texture;
}

// Function to create the top grass texture
function createTopTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base grass color
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add grass texture variations
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 40; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        const size = Math.floor(Math.random() * 5) + 1;
        ctx.fillRect(x, y, size, size);
    }
    
    // Add some lighter grass patches
    ctx.fillStyle = '#7CFC00';
    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        const size = Math.floor(Math.random() * 4) + 1;
        ctx.fillRect(x, y, size, size);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Important: Set the texture to repeat
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Set a fixed repeat value - we'll scale this based on width
    texture.repeat.set(1, 1);
    
    return texture;
}

class InvisibleBlock extends StaticObject {
    constructor(scene, position, width) {
        super(scene, width, 1, 1, 0x000000, position);
        this.mesh.visible = false;
    }
}

class Wall extends StaticObject {
    constructor(scene, position) {
        // Create wall with stone texture
        super(scene, 1, 2, 1, null, position);
        
        // Remove the default material
        this.mesh.material = null;
        
        // Create a stone texture
        const stoneTexture = createStoneTexture();
        
        // Create material with the texture
        const material = new THREE.MeshStandardMaterial({ 
            map: stoneTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        this.mesh.material = material;
        
        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
}

// Function to create stone texture for walls
function createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base stone color
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add stone texture variations and cracks
    ctx.fillStyle = '#A9A9A9';
    for (let i = 0; i < 10; i++) {
        // Create random stone patterns
        const x = Math.floor(Math.random() * 64);
        const y = Math.floor(Math.random() * 64);
        const width = Math.floor(Math.random() * 15) + 5;
        const height = Math.floor(Math.random() * 15) + 5;
        
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();
    }
    
    // Add darker cracks
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const x1 = Math.floor(Math.random() * 64);
        const y1 = Math.floor(Math.random() * 64);
        const x2 = x1 + Math.floor(Math.random() * 20) - 10;
        const y2 = y1 + Math.floor(Math.random() * 20) - 10;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Set texture to repeat
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
}

// 32x32 Map (0 = empty, 1 = block, -1 = player spawn, -2 = light, 3 = invisible block, -3 = buff spawn location)
const mapData = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2],
    [2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];



// Function to create a light at a given position
function createLight(scene, position) {
    const light = new THREE.PointLight(0xffffff, 1, 10000); // Warm yellow light
    light.position.set(position.x, position.y, position.z);
    
    // Enable shadows for the light
    light.castShadow = true;
    
    // Improve shadow quality
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;

    scene.add(light);
}

function generateMap(scene, staticObjects) {
    let playerSpawn = { x: 0, y: 0, z: 0 }; // Default spawn position
    let buffLocations = []; // Array to store buff spawn locations

    for (let y = 0; y < mapData.length; y++) {
        let x = 0;
        while (x < mapData[y].length) {
            if (mapData[y][x] === 1) {
                let startX = x;
                while (x < mapData[y].length && mapData[y][x] === 1) {
                    x++; // Count contiguous blocks
                }
                let width = x - startX;
                let position = { x: startX - 16 + width / 2, y: (-y + 16) * 2, z: 0 };
                staticObjects.push(new Block(scene, position, width));
            } else if (mapData[y][x] === -1) {
                playerSpawn = { x: x - 16, y: (-y + 16) * 2, z: 0 };
                x++;
            } else if (mapData[y][x] === 2) {
                let startX = x;
                while (x < mapData[y].length && mapData[y][x] === 2) {
                    x++; // Count contiguous wall blocks
                }
                let width = x - startX;
                let position = { x: startX - 16 + width / 2, y: (-y + 15.75) * 2, z: 0 };
                
                // For walls, create individual blocks to prevent texture stretching
                for (let i = 0; i < width; i++) {
                    let singlePosition = { 
                        x: (startX + i) - 16 + 0.5, 
                        y: (-y + 15.75) * 2, 
                        z: 0 
                    };
                    staticObjects.push(new Wall(scene, singlePosition));
                }
            } else if (mapData[y][x] === -2) {
                createLight(scene, { x: x - 16, y: (-y + 16) * 2, z: 0 });
                x++;
            } else if (mapData[y][x] === 3) {
                let startX = x;
                while (x < mapData[y].length && mapData[y][x] === 3) {
                    x++; // Count contiguous invisible blocks
                }
                let width = x - startX;
                let position = { x: startX - 16 + width / 2, y: (-y + 16) * 2, z: 0 };
                staticObjects.push(new InvisibleBlock(scene, position, width));
            } else if (mapData[y][x] === -3) {
                // This is a buff spawn location
                buffLocations.push({ x: x - 16, y: (-y + 16) * 2, z: 0 });
                x++;
            } else {
                x++;
            }
        }
    }
    
    return {
        playerSpawn: playerSpawn,
        buffLocations: buffLocations
    };
}
