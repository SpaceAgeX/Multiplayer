class Player {
    constructor(scene, color) {
        this.speed = 13;
        this.jumpStrength = 10;
        this.gravity = -11;
        this.velocityY = 0;
        this.isOnGround = false;
        this.keys = {};

        // Random color for each player
        this.color = color;
        this.is_tagged = false; // Default: not tagged
        this.itIndicator = null; // The pyramid above "It"

        // Create Player (Blue Sphere)
        this.geometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);

        // Enable shadow casting
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.prevCollisions = new Set();

        scene.add(this.mesh);

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
            console.log(`🏆 This player (${this.color}) is now IT!`);
            this.addItIndicator();
        } else {
            console.log(`❌ This player (${this.color}) is no longer IT.`);
            this.removeItIndicator();
        }
    }
    
    
    
    

    addItIndicator() {
        if (this.itIndicator) return; // Prevent duplicate indicators

        const pyramidGeometry = new THREE.ConeGeometry(0.3, 0.5, 3);
        const pyramidMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.itIndicator = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        this.itIndicator.position.set(0, 1.25, 0); // Above the player
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

        // Gravity
        this.velocityY += this.gravity*deltaTime;
        let newY = this.mesh.position.y + this.velocityY*deltaTime;
        let newX = this.mesh.position.x + moveX*deltaTime;

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

    checkPlayerCollision(otherPlayers) {
        let newlyCollided = null;

        for (const id in otherPlayers) {
            let other = otherPlayers[id];
            if (!other || !other.mesh || other === this) continue; // Ensure valid player object

            let dx = this.mesh.position.x - other.mesh.position.x;
            let dy = this.mesh.position.y - other.mesh.position.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1.0) {
                if (!this.prevCollisions.has(id)) { // ✅ Only return if first entry
                    console.log(`✅ First-time collision detected with player ${id}!`);
                    newlyCollided = id;
                }
                this.prevCollisions.add(id); // ✅ Add to tracked collisions
            } else {
                this.prevCollisions.delete(id); // ✅ Remove from tracked collisions if they leave
            }
        }
        return newlyCollided; // ✅ Only return the first-time collision
    }
    
    
    
}
