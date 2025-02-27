//UI.js file

class UI {
    constructor() {
        this.fps = 0;
        this.ping = 0;
        this.lastFrameTime = performance.now();
        this.timer = 60; // Countdown timer in seconds
        this.nextBuffTime = 15; // Time until next buff spawn

        // Create a UI display container
        this.uiContainer = document.createElement("div");
        this.uiContainer.style.position = "absolute";
        this.uiContainer.style.top = "10px";
        this.uiContainer.style.left = "10px";
        this.uiContainer.style.color = "white";
        this.uiContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.uiContainer.style.padding = "8px";
        this.uiContainer.style.borderRadius = "5px";
        this.uiContainer.style.fontFamily = "Arial, sans-serif";
        this.uiContainer.style.fontSize = "14px";
        document.body.appendChild(this.uiContainer);

        // Create buff status indicators
        this.buffContainer = document.createElement("div");
        this.buffContainer.style.position = "absolute";
        this.buffContainer.style.bottom = "10px";
        this.buffContainer.style.right = "10px";
        this.buffContainer.style.color = "white";
        this.buffContainer.style.display = "flex";
        this.buffContainer.style.flexDirection = "column";
        this.buffContainer.style.gap = "5px";
        document.body.appendChild(this.buffContainer);

        this.speedBuffIndicator = document.createElement("div");
        this.speedBuffIndicator.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
        this.speedBuffIndicator.style.padding = "5px 10px";
        this.speedBuffIndicator.style.borderRadius = "5px";
        this.speedBuffIndicator.style.fontFamily = "Arial, sans-serif";
        this.speedBuffIndicator.style.fontSize = "14px";
        this.speedBuffIndicator.style.display = "none";
        this.speedBuffIndicator.textContent = "Speed Boost: 0s";
        this.buffContainer.appendChild(this.speedBuffIndicator);

        this.jumpBuffIndicator = document.createElement("div");
        this.jumpBuffIndicator.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
        this.jumpBuffIndicator.style.padding = "5px 10px";
        this.jumpBuffIndicator.style.borderRadius = "5px";
        this.jumpBuffIndicator.style.fontFamily = "Arial, sans-serif";
        this.jumpBuffIndicator.style.fontSize = "14px";
        this.jumpBuffIndicator.style.display = "none";
        this.jumpBuffIndicator.textContent = "Jump Boost: 0s";
        this.buffContainer.appendChild(this.jumpBuffIndicator);

        // Create buff spawn timer
        this.buffTimerIndicator = document.createElement("div");
        this.buffTimerIndicator.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        this.buffTimerIndicator.style.padding = "5px 10px";
        this.buffTimerIndicator.style.borderRadius = "5px";
        this.buffTimerIndicator.style.fontFamily = "Arial, sans-serif";
        this.buffTimerIndicator.style.fontSize = "14px";
        this.buffTimerIndicator.textContent = "Next Buff: 15s";
        this.buffContainer.appendChild(this.buffTimerIndicator);

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
            if (this.nextBuffTime < 0) {
                this.nextBuffTime = 15; // Reset buff timer when it reaches 0
            }
            this.buffTimerIndicator.textContent = `Next Buff: ${this.nextBuffTime}s`;
        }, 1000);
    }
    
    updateBuffStatus(player) {
        // Update speed buff status
        if (player && player.hasSpeedBuff) {
            const remainingTime = Math.ceil((player.speedBuffEndTime - performance.now()) / 1000);
            this.speedBuffIndicator.textContent = `Speed Boost: ${remainingTime}s`;
            this.speedBuffIndicator.style.display = "block";
        } else {
            this.speedBuffIndicator.style.display = "none";
        }
        
        // Update jump buff status
        if (player && player.hasJumpBuff) {
            const remainingTime = Math.ceil((player.jumpBuffEndTime - performance.now()) / 1000);
            this.jumpBuffIndicator.textContent = `Jump Boost: ${remainingTime}s`;
            this.jumpBuffIndicator.style.display = "block";
        } else {
            this.jumpBuffIndicator.style.display = "none";
        }
    }

    updateUI(player) {
        this.updateFPS();
        this.uiContainer.innerHTML = `FPS: ${this.fps} <br> Ping: ${this.ping} ms <br> Timer: ${this.timer}s`;
        
        // Update buff status indicators if player is provided
        if (player) {
            this.updateBuffStatus(player);
        }
    }
    
    // Reset the buff spawn timer when a buff spawns
    resetBuffTimer() {
        this.nextBuffTime = 15;
    }
}
