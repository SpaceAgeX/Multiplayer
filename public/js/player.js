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
        this.facingDirection = 1; // 1 = right, -1 = left
        this.isMoving = false;
        this.isJumping = false;
        this.lastDirection = 1;

        // Store the original color
        this.color = color;
        this.is_tagged = false; // Default: not tagged
        this.itIndicator = null; // The exclamation mark above "It"
        
        // Buff properties
        this.hasSpeedBuff = false;
        this.hasJumpBuff = false;
        this.speedBuffEndTime = 0;
        this.jumpBuffEndTime = 0;
        this.speedBuffEffect = null;
        this.jumpBuffEffect = null;
        this.BUFF_DURATION = 5000; // 5 seconds in milliseconds

        // Animation properties
        this.animationTime = 0;
        this.legAnimationSpeed = 5; // Speed of leg movement
        this.armAnimationSpeed = 4; // Speed of arm movement

        // Create the ninja character group
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0, 0);
        
        // Enable shadow casting
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Create the ninja character
        this.createNinjaCharacter(color);

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

    // Create a blocky ninja character
    createNinjaCharacter(color) {
        // Convert hex color to THREE.Color
        const playerColor = new THREE.Color(color);
        
        // Materials
        const bodyMaterial = new THREE.MeshToonMaterial({ 
            color: 0x333333, // Dark gray for ninja outfit
            flatShading: true
        });
        
        const blackMaterial = new THREE.MeshToonMaterial({ 
            color: 0x000000,
            flatShading: true
        });
        
        const whiteMaterial = new THREE.MeshToonMaterial({ 
            color: 0xffffff,
            flatShading: true
        });
        
        // Colored headband material (using player's assigned color)
        const headbandMaterial = new THREE.MeshToonMaterial({ 
            color: color,
            flatShading: true
        });
        
        // Body - create blocky torso
        const bodyGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.3);
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.3;
        this.mesh.add(this.body);
        
        // Head - slightly larger blocky head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        this.head = new THREE.Mesh(headGeometry, bodyMaterial);
        this.head.position.y = 0.7;
        this.mesh.add(this.head);
        
        // Ninja headband (using player's color for identification)
        const headbandGeometry = new THREE.BoxGeometry(0.45, 0.1, 0.45);
        this.headband = new THREE.Mesh(headbandGeometry, headbandMaterial);
        this.headband.position.y = 0.85;
        this.mesh.add(this.headband);
        
        // Ninja mask - black face covering
        const maskGeometry = new THREE.BoxGeometry(0.42, 0.2, 0.42);
        this.mask = new THREE.Mesh(maskGeometry, blackMaterial);
        this.mask.position.y = 0.65;
        this.mask.position.z = 0.01;
        this.mesh.add(this.mask);
        
        // Eyes - white rectangles
        const eyeGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.05);
        this.leftEye = new THREE.Mesh(eyeGeometry, whiteMaterial);
        this.leftEye.position.set(-0.1, 0.65, 0.22);
        this.mesh.add(this.leftEye);
        
        this.rightEye = new THREE.Mesh(eyeGeometry, whiteMaterial);
        this.rightEye.position.set(0.1, 0.65, 0.22);
        this.mesh.add(this.rightEye);
        
        // Ninja belt
        const beltGeometry = new THREE.BoxGeometry(0.55, 0.08, 0.35);
        this.belt = new THREE.Mesh(beltGeometry, headbandMaterial); // Same color as headband
        this.belt.position.y = 0.3;
        this.mesh.add(this.belt);
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        this.leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        this.leftArm.position.set(-0.33, 0.3, 0);
        this.mesh.add(this.leftArm);
        
        this.rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        this.rightArm.position.set(0.33, 0.3, 0);
        this.mesh.add(this.rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        this.leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        this.leftLeg.position.set(-0.15, -0.15, 0);
        this.mesh.add(this.leftLeg);
        
        this.rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        this.rightLeg.position.set(0.15, -0.15, 0);
        this.mesh.add(this.rightLeg);
        
        // Hitbox for collision (invisible)
        // We'll keep this the same size as the original sphere for consistent gameplay
        const hitboxGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const hitboxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.0 // Invisible
        });
        
        this.hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        this.mesh.add(this.hitbox);
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
        
        // Create a cartoony particle effect around the player (green star shape)
        const ringGeometry = new THREE.CircleGeometry(0.8, 5); // Pentagon for star-like shape
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
        
        // Create a cartoony particle effect (blue star shape)
        const ringGeometry = new THREE.CircleGeometry(0.8, 6); // Hexagon for star-like shape
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

        // Cartoony "it" indicator - exclamation mark
        const pyramidGeometry = new THREE.ConeGeometry(0.3, 0.6, 4); // Use 4 sides for more low-poly look
        const pyramidMaterial = new THREE.MeshToonMaterial({ 
            color: 0xff0000,
            flatShading: true
        });
        
        this.itIndicator = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        this.itIndicator.position.set(0, 1.3, 0); // Above the player
        this.itIndicator.rotation.set(Math.PI, 0, 0); // Flip it upside down
        
        // Add a small sphere on top for exclamation mark dot
        const dotGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const dotMaterial = new THREE.MeshToonMaterial({ 
            color: 0xff0000,
            flatShading: true
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(0, -1.0, 0);
        this.itIndicator.add(dot);
        
        this.mesh.add(this.itIndicator);
    }

    removeItIndicator() {
        if (this.itIndicator) {
            this.mesh.remove(this.itIndicator);
            this.itIndicator = null;
        }
    }
    
    // Animation for running
    animateRunning(deltaTime) {
        // Increase animation time
        this.animationTime += deltaTime * (this.hasSpeedBuff ? this.legAnimationSpeed * 1.5 : this.legAnimationSpeed);
        
        // Leg animation - alternating forward/back motion
        const legAngle = Math.sin(this.animationTime) * 0.5;
        this.leftLeg.rotation.x = -legAngle;
        this.rightLeg.rotation.x = legAngle;
        
        // Arm animation - opposite to legs
        const armAngle = Math.sin(this.animationTime) * 0.4;
        this.leftArm.rotation.x = armAngle;
        this.rightArm.rotation.x = -armAngle;
        
        // Slight body bounce
        this.body.position.y = 0.3 + Math.abs(Math.sin(this.animationTime)) * 0.05;
    }
    
    // Animation for jumping
    animateJumping() {
        // Set legs and arms to jumping pose
        this.leftLeg.rotation.x = -0.3;
        this.rightLeg.rotation.x = -0.3;
        this.leftArm.rotation.x = -0.5;
        this.rightArm.rotation.x = -0.5;
    }
    
    // Reset animation to idle pose
    resetAnimation() {
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = 0;
        this.body.position.y = 0.3;
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
        this.isMoving = false;

        // Horizontal movement (A/D)
        if (this.keys['a']) {
            moveX -= 1;
            this.facingDirection = -1;
            this.isMoving = true;
        }
        if (this.keys['d']) {
            moveX += 1;
            this.facingDirection = 1;
            this.isMoving = true;
        }

        // If direction changed, flip the character
        if (this.facingDirection !== this.lastDirection) {
            this.mesh.scale.x = this.facingDirection;
            this.lastDirection = this.facingDirection;
        }

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

        const wasOnGround = this.isOnGround;
        if (!this.checkCollision(staticObjects, this.mesh.position.x, newY)) {
            this.mesh.position.y = newY;
            this.isOnGround = false;
        } else {
            this.velocityY = 0;
            this.isOnGround = true;
        }

        // Check if just landed
        if (!wasOnGround && this.isOnGround) {
            // Landing effects or animation reset could go here
            this.isJumping = false;
        }

        // Jumping
        if (this.keys['w'] && this.isOnGround) {
            this.velocityY = this.jumpStrength;
            this.isOnGround = false;
            this.isJumping = true;
        }
        
        // Animations based on state
        if (this.isJumping) {
            this.animateJumping();
        } else if (this.isMoving) {
            this.animateRunning(deltaTime);
        } else {
            this.resetAnimation();
        }
        
        // Animate buff effects
        if (this.speedBuffEffect) {
            this.speedBuffEffect.rotation.z += 0.05;
            // Pulsing animation for cartoon effect
            const scale = 1.0 + 0.2 * Math.sin(now / 200);
            this.speedBuffEffect.scale.set(scale, scale, scale);
        }
        
        if (this.jumpBuffEffect) {
            this.jumpBuffEffect.rotation.z -= 0.05;
            // Pulsing animation for cartoon effect
            const scale = 1.0 + 0.2 * Math.sin(now / 200);
            this.jumpBuffEffect.scale.set(scale, scale, scale);
        }
        
        // Animate the "it" indicator for more cartoon feel
        if (this.itIndicator) {
            this.itIndicator.rotation.y += 0.03;
        }
    }
    
    checkCollision(staticObjects, newX, newY) {
        for (const obj of staticObjects) {
            const bounds = obj.getBounds();

            // Player's bounding box - using the same hitbox as before for consistency
            const playerRadius = 0.5; // Player's hitbox size
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
                if (!this.prevCollisions.has(id)) { // Only return if first entry
                    console.log(`✅ First-time collision detected with player ${id}!`);
                    newlyCollided = id;
                }
                this.prevCollisions.add(id); // Add to tracked collisions
            } else {
                this.prevCollisions.delete(id); // Remove from tracked collisions if they leave
            }
        }
        return newlyCollided; // Only return the first-time collision
    }
}