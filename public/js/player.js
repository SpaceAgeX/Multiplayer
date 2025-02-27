// player.js file

class Player {
    constructor(scene, color) {
        this.scene = scene;
        this.baseSpeed = 13;
        this.baseJumpStrength = 17.5;
        this.speed = this.baseSpeed;
        this.jumpStrength = this.baseJumpStrength;
        this.gravity = -35;
        this.velocityY = 0;
        this.isOnGround = false;
        this.keys = {};

        // Random color for each player
        this.color = color;
        this.is_tagged = false; // Default: not tagged
        this.itIndicator = null; // The pyramid above "It"
        
        // Buff properties
        this.hasSpeedBuff = false;
        this.hasJumpBuff = false;
        this.speedBuffEndTime = 0;
        this.jumpBuffEndTime = 0;
        this.speedBuffEffect = null;
        this.jumpBuffEffect = null;
        this.BUFF_DURATION = 5000; // 5 seconds in milliseconds

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
    
    applySpeedBuff() {
        this.hasSpeedBuff = true;
        this.speed = this.baseSpeed * 1.5; // 50% speed boost
        this.speedBuffEndTime = performance.now() + this.BUFF_DURATION;
        this.showSpeedBuffEffect();
        
        // Schedule the buff to end
        setTimeout(() => {
            this.removeSpeedBuff();
        }, this.BUFF_DURATION);
    }
    
    removeSpeedBuff() {
        this.hasSpeedBuff = false;
        this.speed = this.baseSpeed;
        this.hideSpeedBuffEffect();
    }
    
    applyJumpBuff() {
        this.hasJumpBuff = true;
        this.jumpStrength = this.baseJumpStrength * 1.4; // 40% jump boost
        this.jumpBuffEndTime = performance.now() + this.BUFF_DURATION;
        this.showJumpBuffEffect();
        
        // Schedule the buff to end
        setTimeout(() => {
            this.removeJumpBuff();
        }, this.BUFF_DURATION);
    }
    
    removeJumpBuff() {
        this.hasJumpBuff = false;
        this.jumpStrength = this.baseJumpStrength;
        this.hideJumpBuffEffect();
    }
    
    showSpeedBuffEffect() {
        if (this.speedBuffEffect) return;
        
        // Create a particle effect around the player (green ring)
        const ringGeometry = new THREE.RingGeometry(0.8, 0.9, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        this.speedBuffEffect = new THREE.Mesh(ringGeometry, ringMaterial);
        this.speedBuffEffect.rotation.x = Math.PI / 2; // Align with XY plane
        this.speedBuffEffect.position.y = -0.45; // Position at player's feet
        this.mesh.add(this.speedBuffEffect);
    }
    
    hideSpeedBuffEffect() {
        if (this.speedBuffEffect) {
            this.mesh.remove(this.speedBuffEffect);
            this.speedBuffEffect = null;
        }
    }
    
    showJumpBuffEffect() {
        if (this.jumpBuffEffect) return;
        
        // Create a particle effect around the player (blue ring)
        const ringGeometry = new THREE.RingGeometry(0.8, 0.9, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        this.jumpBuffEffect = new THREE.Mesh(ringGeometry, ringMaterial);
        this.jumpBuffEffect.rotation.x = Math.PI / 2; // Align with XY plane
        this.jumpBuffEffect.position.y = -0.45; // Position at player's feet
        this.mesh.add(this.jumpBuffEffect);
    }
    
    hideJumpBuffEffect() {
        if (this.jumpBuffEffect) {
            this.mesh.remove(this.jumpBuffEffect);
            this.jumpBuffEffect = null;
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
        // Check if buffs have expired
        const now = performance.now();
        if (this.hasSpeedBuff && now > this.speedBuffEndTime) {
            this.removeSpeedBuff();
        }
        
        if (this.hasJumpBuff && now > this.jumpBuffEndTime) {
            this.removeJumpBuff();
        }
        
        let moveX = 0;

        // Horizontal movement (A/D)
        if (this.keys['a']) moveX -= 1;
        if (this.keys['d']) moveX += 1;

        // Normalize movement to avoid diagonal speed boost
        if (moveX !== 0) {
            moveX = (moveX / Math.abs(moveX)) * this.speed;
        }

        // Gravity
        this.velocityY += this.gravity * deltaTime;
        let newY = this.mesh.position.y + this.velocityY * deltaTime;
        let newX = this.mesh.position.x + moveX * deltaTime;

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
        
        // Animate buff effects
        if (this.speedBuffEffect) {
            this.speedBuffEffect.rotation.z += 0.05;
        }
        
        if (this.jumpBuffEffect) {
            this.jumpBuffEffect.rotation.z -= 0.05;
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
