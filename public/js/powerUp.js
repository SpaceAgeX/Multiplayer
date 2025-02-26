class PowerUp {
    constructor(scene, type, position) {
      this.type = type;
      this.position = position;
  
      let color;
      switch (type) {
        case "speed":
          color = 0xffd700;
          break; // Gold
        case "jump":
          color = 0x00ff00;
          break; // Green
        case "invisibility":
          color = 0x888888;
          break; // Gray
        case "shield":
          color = 0x0000ff;
          break; // Blue
        case "portal":
          color = 0xff00ff;
          break; // Purple
      }
  
      this.geometry = new THREE.SphereGeometry(0.3, 8, 8);
      this.material = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.8,
      });
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.position.set(position.x, position.y, position.z);
  
      this.mesh.castShadow = true;
      scene.add(this.mesh);
    }
  
    applyEffect(player) {
      switch (this.type) {
        case "speed":
          player.speed *= 1.5;
          setTimeout(() => (player.speed /= 1.5), 5000);
          break;
        case "jump":
          player.jumpStrength *= 1.5;
          setTimeout(() => (player.jumpStrength /= 1.5), 5000);
          break;
        case "invisibility":
          player.mesh.material.opacity = 0.3;
          setTimeout(() => (player.mesh.material.opacity = 1), 5000);
          break;
        case "shield":
          player.isShielded = true;
          setTimeout(() => (player.isShielded = false), 5000);
          break;
        case "portal":
          player.mesh.position.set(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            0,
          );
          break;
      }
    }
  }
  