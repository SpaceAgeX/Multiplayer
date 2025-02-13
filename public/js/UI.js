class UI {
    constructor() {
        this.fps = 0;
        this.ping = 0;
        this.lastFrameTime = performance.now();
        this.timer = 60; // Countdown timer in seconds

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

        // Track FPS
        this.updateFPS();

        // Track Ping (updates every second)
        setInterval(() => {
            this.measurePing();
        }, 1000);

        // Start countdown timer
        this.startTimer();
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

    updateUI() {
        this.updateFPS();
        this.uiContainer.innerHTML = `FPS: ${this.fps} <br> Ping: ${this.ping} ms <br> Timer: ${this.timer}s`;
    }
}
