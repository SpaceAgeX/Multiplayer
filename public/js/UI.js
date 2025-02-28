//UI.js file

class UI {
    constructor() {
        this.fps = 0;
        this.ping = 0;
        this.lastFrameTime = performance.now();
        this.timer = 60; // Countdown timer in seconds
        this.nextBuffTime = 30; // Time until next buff spawn (30 seconds)

        // Create a UI display container with more cartoony style
        this.uiContainer = document.createElement("div");
        this.uiContainer.style.position = "absolute";
        this.uiContainer.style.top = "10px";
        this.uiContainer.style.left = "10px";
        this.uiContainer.style.color = "white";
        this.uiContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        this.uiContainer.style.padding = "10px";
        this.uiContainer.style.borderRadius = "10px";
        this.uiContainer.style.fontFamily = "'Comic Sans MS', cursive, sans-serif"; // More cartoon-like font
        this.uiContainer.style.fontSize = "16px";
        this.uiContainer.style.border = "3px solid white"; // Add border for cartoon feel
        document.body.appendChild(this.uiContainer);

        // Create buff status indicators with cartoon style
        this.buffContainer = document.createElement("div");
        this.buffContainer.style.position = "absolute";
        this.buffContainer.style.bottom = "10px";
        this.buffContainer.style.right = "10px";
        this.buffContainer.style.color = "white";
        this.buffContainer.style.display = "flex";
        this.buffContainer.style.flexDirection = "column";
        this.buffContainer.style.gap = "8px";
        document.body.appendChild(this.buffContainer);

        this.speedBuffIndicator = document.createElement("div");
        this.speedBuffIndicator.style.backgroundColor = "rgba(0, 255, 0, 0.7)";
        this.speedBuffIndicator.style.padding = "8px 15px";
        this.speedBuffIndicator.style.borderRadius = "10px";
        this.speedBuffIndicator.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        this.speedBuffIndicator.style.fontSize = "16px";
        this.speedBuffIndicator.style.display = "none";
        this.speedBuffIndicator.style.border = "2px solid #00AA00"; // Add border for cartoon feel
        this.speedBuffIndicator.style.boxShadow = "0 0 10px #00FF00"; // Add glow for cartoon effect
        this.speedBuffIndicator.textContent = "⚡ Speed Boost: 0s";
        this.buffContainer.appendChild(this.speedBuffIndicator);

        this.jumpBuffIndicator = document.createElement("div");
        this.jumpBuffIndicator.style.backgroundColor = "rgba(0, 0, 255, 0.7)";
        this.jumpBuffIndicator.style.padding = "8px 15px";
        this.jumpBuffIndicator.style.borderRadius = "10px";
        this.jumpBuffIndicator.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        this.jumpBuffIndicator.style.fontSize = "16px";
        this.jumpBuffIndicator.style.display = "none";
        this.jumpBuffIndicator.style.border = "2px solid #0000AA"; // Add border for cartoon feel
        this.jumpBuffIndicator.style.boxShadow = "0 0 10px #0000FF"; // Add glow for cartoon effect
        this.jumpBuffIndicator.textContent = "🦘 Jump Boost: 0s";
        this.buffContainer.appendChild(this.jumpBuffIndicator);

        this.shieldBuffIndicator = document.createElement("div");
        this.shieldBuffIndicator.style.backgroundColor = "rgba(255, 165, 0, 0.7)"; // Orange
        this.shieldBuffIndicator.style.padding = "8px 15px";
        this.shieldBuffIndicator.style.borderRadius = "10px";
        this.shieldBuffIndicator.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        this.shieldBuffIndicator.style.fontSize = "16px";
        this.shieldBuffIndicator.style.display = "none";
        this.shieldBuffIndicator.style.border = "2px solid #FF8C00"; // Dark orange
        this.shieldBuffIndicator.style.boxShadow = "0 0 10px #FFA500"; // Orange glow
        this.shieldBuffIndicator.textContent = "🛡️ Shield: 0s";
        this.buffContainer.appendChild(this.shieldBuffIndicator);

        // Create buff spawn timer with cartoon style
        this.buffTimerIndicator = document.createElement("div");
        this.buffTimerIndicator.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
        this.buffTimerIndicator.style.padding = "8px 15px";
        this.buffTimerIndicator.style.borderRadius = "10px";
        this.buffTimerIndicator.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        this.buffTimerIndicator.style.fontSize = "16px";
        this.buffTimerIndicator.style.border = "2px solid #AAAAAA"; // Add border for cartoon feel
        this.buffTimerIndicator.style.color = "#000000";
        this.buffTimerIndicator.textContent = "🎁 Next Buff: 30s";
        this.buffContainer.appendChild(this.buffTimerIndicator);

        // Add "tagged" indicator (only shows when player is tagged)
        this.taggedIndicator = document.createElement("div");
        this.taggedIndicator.style.position = "absolute";
        this.taggedIndicator.style.top = "10px";
        this.taggedIndicator.style.right = "10px";
        this.taggedIndicator.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
        this.taggedIndicator.style.padding = "10px 20px";
        this.taggedIndicator.style.borderRadius = "10px";
        this.taggedIndicator.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        this.taggedIndicator.style.fontSize = "20px";
        this.taggedIndicator.style.fontWeight = "bold";
        this.taggedIndicator.style.display = "none";
        this.taggedIndicator.style.border = "3px solid #AA0000"; // Add border for cartoon feel
        this.taggedIndicator.style.boxShadow = "0 0 15px #FF0000"; // Add glow for cartoon effect
        this.taggedIndicator.textContent = "YOU'RE IT! 👆";
        document.body.appendChild(this.taggedIndicator);

        // Track FPS
        this.updateFPS();

        // Track Ping (updates every second)
        setInterval(() => {
            this.measurePing();
        }, 1000);

        // Start countdown timer
        this.startTimer();
        
        // Start buff spawn timer
        this.startBuffTimer();
    }

    updateFPS() {
        let now = performance.now();
        this.fps = Math.round(1000 / (now - this.lastFrameTime));
        this.lastFrameTime = now;
    }

    measurePing() {
        let startTime = performance.now();
        socket.emit("pingTest", () => {
            this.ping = Math.round(performance.now() - startTime);
        });
    }

    startTimer() {
        setInterval(() => {
            this.timer--;
            if (this.timer < 0) {
                this.timer = 60; // Reset timer when it reaches 0
            }
        }, 1000); // Decrease every second
    }
    
    startBuffTimer() {
        setInterval(() => {
            this.nextBuffTime--;
            if (this.nextBuffTime <= 0) {
                this.nextBuffTime = 30; // Always reset to exactly 30 seconds
            }
            this.buffTimerIndicator.textContent = `🎁 Next Buff: ${this.nextBuffTime}s`;
        }, 1000);
    }
    
    updateBuffStatus(player) {
        if (!player) return;
        
        // Update speed buff status
        if (player.hasSpeedBuff) {
            const remainingTime = Math.ceil((player.speedBuffEndTime - performance.now()) / 1000);
            this.speedBuffIndicator.textContent = `⚡ Speed Boost: ${remainingTime}s`;
            this.speedBuffIndicator.style.display = "block";
        } else {
            this.speedBuffIndicator.style.display = "none";
        }
        
        // Update jump buff status
        if (player.hasJumpBuff) {
            const remainingTime = Math.ceil((player.jumpBuffEndTime - performance.now()) / 1000);
            this.jumpBuffIndicator.textContent = `🦘 Jump Boost: ${remainingTime}s`;
            this.jumpBuffIndicator.style.display = "block";
        } else {
            this.jumpBuffIndicator.style.display = "none";
        }
        
        // Update shield buff status
        if (player.hasShieldBuff) {
            const remainingTime = Math.ceil((player.shieldBuffEndTime - performance.now()) / 1000);
            this.shieldBuffIndicator.textContent = `🛡️ Shield: ${remainingTime}s`;
            this.shieldBuffIndicator.style.display = "block";
        } else {
            this.shieldBuffIndicator.style.display = "none";
        }
        
        // Update "tagged" status
        if (player.is_tagged) {
            this.taggedIndicator.style.display = "block";
        } else {
            this.taggedIndicator.style.display = "none";
        }
    }

    updateUI(player) {
        this.updateFPS();
        this.uiContainer.innerHTML = `🎮 FPS: ${this.fps} <br> 📡 Ping: ${this.ping} ms <br> ⏱️ Timer: ${this.timer}s`;
        
        // Update buff status indicators if player is provided
        if (player) {
            this.updateBuffStatus(player);
        }
    }
    
    // Reset the buff timer to 30 seconds
    resetBuffTimer() {
        this.nextBuffTime = 30; // Always reset to exactly 30 seconds
    }
}