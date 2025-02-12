class StaticObject {
    constructor(scene, width, height, depth, color, position) {
        this.geometry = new THREE.BoxGeometry(width, height, depth);
        this.material = new THREE.MeshStandardMaterial({ color }); // Use StandardMaterial for shadows
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);

        // Enable shadow receiving
        this.mesh.receiveShadow = true;

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
