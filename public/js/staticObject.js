class StaticObject {
    constructor(scene, width, height, depth, color, position) {
        this.geometry = new THREE.BoxGeometry(width, height, depth);
        this.material = new THREE.MeshStandardMaterial({ color }); // Supports shadows
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);

        // Enable shadows
        this.mesh.castShadow = true;  // Cast shadows onto other objects
        this.mesh.receiveShadow = true; // Receive shadows from other objects

        scene.add(this.mesh);
    }

    getBounds() {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
            width: this.geometry.parameters.width,
            height: this.geometry.parameters.height,
            depth: this.geometry.parameters.depth
        };
    }
}
