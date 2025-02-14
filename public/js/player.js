class Player {
    constructor(scene, color) {
        this.speed = 15;
        this.jumpStrength = 0.007;
        this.gravity = -0.75;
        this.velocityY = 0;
        this.isOnGround = false;
        this.keys = {};

        this.color = color;
        this.is_tagged = true; // Default to true for now
        this.itIndicator = null; // The pyramid above "It"

        // Create Player (Sphere)
        this.geometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);

        // Enable shadow casting
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        scene.add(this.mesh);

        // Add indicator on spawn
        if (this.is_tagged) {
            this.addItIndicator();
        }

        // Keyboard Events
        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }
    setTagged(isTagged) {
        this.is_tagged = isTagged;
    
        if (isTagged) {
            this.addItIndicator();
        } else {
            this.removeItIndicator();
        }
    }
    
    addItIndicator() {
        if (this.itIndicator) return; // Prevent duplicate indicators

        const pyramidGeometry = new THREE.ConeGeometry(0.3, 0.5, 3);
        const pyramidMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.itIndicator = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        this.itIndicator.position.set(0, 1.25, 0); // Positioned above the player
        this.itIndicator.rotation.set(Math.PI, 0, 0); // Flip it upside down
        this.mesh.add(this.itIndicator);
    }

    removeItIndicator() {
        if (this.itIndicator) {
            this.mesh.remove(this.itIndicator);
            this.itIndicator = null;
        }
    }

    update(staticObjects, deltaTime) {
        let moveX = 0;

        // Horizontal movement (A/D)
        if (this.keys['a']) moveX -= 1;
        if (this.keys['d']) moveX += 1;

        // Normalize movement to avoid diagonal speed boost
        if (moveX !== 0) {
            moveX = (moveX / Math.abs(moveX)) * this.speed;
        }

        // Apply deltaTime to movement
        let newX = this.mesh.position.x + moveX * deltaTime;

        // Apply gravity with deltaTime
        this.velocityY += this.gravity * deltaTime;
        let newY = this.mesh.position.y + this.velocityY;

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

        // Jumping with deltaTime scaling
        if (this.keys['w'] && this.isOnGround) {
            this.velocityY = this.jumpStrength / deltaTime;
            this.isOnGround = false;
        }
    }

    checkCollision(staticObjects, newX, newY) {
        for (const obj of staticObjects) {
            const bounds = obj.getBounds();

            // Player's bounding box
            const playerRadius = 0.5;
            const buffer = 0.05;

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
