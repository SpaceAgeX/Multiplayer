class Player {
    constructor(scene) {
        this.speed = 0.2;
        this.jumpStrength = 0.3;
        this.gravity = -0.01;
        this.velocityY = 0;
        this.isOnGround = false;
        this.keys = {};

        // Random color for each player
        this.color = Math.random() * 0xffffff;
        this.is_tagged = false; // Default: not tagged

        // Create Player (Blue Sphere)
        this.geometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);

        // Enable shadow casting
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        scene.add(this.mesh);

        // Keyboard Events
        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }

    update(staticObjects) {
        let moveX = 0;

        // Horizontal movement (A/D)
        if (this.keys['a']) moveX -= 1;
        if (this.keys['d']) moveX += 1;

        // Normalize movement to avoid diagonal speed boost
        if (moveX !== 0) {
            moveX = (moveX / Math.abs(moveX)) * this.speed;
        }

        // Gravity
        this.velocityY += this.gravity;
        let newY = this.mesh.position.y + this.velocityY;
        let newX = this.mesh.position.x + moveX;

        // Collision Detection
        if (!this.checkCollision(staticObjects, newX, this.mesh.position.y)) {
            this.mesh.position.x = newX;
        }

        if (!this.checkCollision(staticObjects, this.mesh.position.x, newY)) {
            this.mesh.position.y = newY;
            this.isOnGround = false;
        } else {
            this.velocityY = 0;
            this.isOnGround = true;
        }

        // Jumping
        if (this.keys['w'] && this.isOnGround) {
            this.velocityY = this.jumpStrength;
            this.isOnGround = false;
        }
    }

    checkCollision(staticObjects, newX, newY) {
        for (const obj of staticObjects) {
            const bounds = obj.getBounds();

            // Player's bounding box
            const playerRadius = 0.5; // Player's size (Sphere)
            const buffer = 0.05; // Small buffer to avoid clipping
            
            if (
                newX + playerRadius > bounds.x - bounds.width / 2 - buffer &&
                newX - playerRadius < bounds.x + bounds.width / 2 + buffer &&
                newY + playerRadius > bounds.y - bounds.height / 2 - buffer &&
                newY - playerRadius < bounds.y + bounds.height / 2 + buffer
            ) {
                return true; // Collision detected
            }
        }
        return false; // No collision
    }
}
