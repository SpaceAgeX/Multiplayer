class Block extends StaticObject {
    constructor(scene, position, width) {
        // Pass null for color, we'll set material manually
        super(scene, width, 1, 1, null, position);
        
        // Remove the default material
        this.mesh.material = null;
        
        // Create cartoony textures
        const sideTexture = createCartoonSideTexture();
        const topTexture = createCartoonTopTexture();
        
        // Set proper texture tiling based on width
        sideTexture.repeat.set(width, 1);
        topTexture.repeat.set(width, 1);
        
        // Create material with the texture - using MeshToonMaterial for cartoon look
        const materials = [
            new THREE.MeshToonMaterial({ map: sideTexture, flatShading: true }), // Right side
            new THREE.MeshToonMaterial({ map: sideTexture, flatShading: true }), // Left side
            new THREE.MeshToonMaterial({ map: topTexture, flatShading: true }), // Top
            new THREE.MeshToonMaterial({ map: sideTexture, flatShading: true }), // Bottom
            new THREE.MeshToonMaterial({ map: sideTexture, flatShading: true }), // Front
            new THREE.MeshToonMaterial({ map: sideTexture, flatShading: true })  // Back
        ];
        
        this.mesh.material = materials;
        
        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
}

// Function to create a cartoony side texture (dirt with grass on top)
function createCartoonSideTexture() {
    // Create a canvas for the texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base dirt color - warmer and more saturated for cartoon look
    ctx.fillStyle = '#B06B37';
    ctx.fillRect(0, 0, 64, 64);
    
    // Top grass color - brighter green for cartoon style
    ctx.fillStyle = '#44D62C';
    ctx.fillRect(0, 0, 64, 12);
    
    // Add distinct shapes for cartoon look instead of random dots
    ctx.fillStyle = '#65E24F';
    
    // Add a few distinct grass variations
    for (let i = 0; i < 5; i++) {
        const x = i * 12;
        ctx.beginPath();
        ctx.moveTo(x, 12);
        ctx.lineTo(x + 6, 8);
        ctx.lineTo(x + 12, 12);
        ctx.fill();
    }
    
    // Add a few distinct dirt shapes
    ctx.fillStyle = '#C67B43';
    for (let i = 0; i < 8; i++) {
        const x = Math.floor(Math.random() * 55) + 5;
        const y = Math.floor(Math.random() * 35) + 20;
        const size = Math.floor(Math.random() * 8) + 4;
        
        // Draw a simple polygon instead of a rectangle
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size - 2, y + size);
        ctx.lineTo(x - 2, y + size);
        ctx.fill();
    }
    
    // Add a simple black outline at the top for cartoon style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(64, 12);
    ctx.stroke();
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Important: Set the texture to repeat
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Set a fixed repeat value - we'll scale this based on width
    texture.repeat.set(1, 1);
    
    return texture;
}

// Function to create the cartoony top grass texture
function createCartoonTopTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base grass color - brighter for cartoon style
    ctx.fillStyle = '#44D62C';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add larger, more distinct shapes for cartoon grass
    ctx.fillStyle = '#65E24F';
    
    // Add some simple cartoon grass tufts
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const x = i * 8;
            const y = j * 8;
            
            if ((i + j) % 2 === 0) {
                ctx.fillRect(x, y, 8, 8);
            }
        }
    }
    
    // Add some simple cartoon grass details
    ctx.fillStyle = '#7DF967';
    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * 54) + 5;
        const y = Math.floor(Math.random() * 54) + 5;
        
        // Draw a simple cartoon grass tuft
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
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
        
        // Create a cartoony stone texture
        const stoneTexture = createCartoonStoneTexture();
        
        // Create material with the texture - using MeshToonMaterial for cartoon look
        const material = new THREE.MeshToonMaterial({ 
            map: stoneTexture,
            flatShading: true // Enable flat shading for low-poly look
        });
        
        this.mesh.material = material;
        
        // Enable shadows
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
}

// Function to create cartoony stone texture for walls
function createCartoonStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base stone color - lighter grey for cartoon look
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(0, 0, 64, 64);
    
    // Draw a grid pattern for cartoon stone blocks
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    
    // Horizontal lines
    for (let y = 0; y <= 64; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(64, y);
        ctx.stroke();
    }
    
    // Vertical lines with slight offsets for more interesting pattern
    for (let x = 0; x <= 64; x += 16) {
        const offset = (x % 32 === 0) ? 4 : 0;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 64);
        ctx.stroke();
    }
    
    // Add some stone variations with simple shapes
    ctx.fillStyle = '#CCCCCC';
    for (let i = 0; i < 8; i++) {
        const gridX = Math.floor(i / 2) * 16;
        const gridY = (i % 2) * 16;
        
        if ((i % 3) === 0) {
            ctx.fillRect(gridX + 4, gridY + 4, 8, 8);
        }
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
