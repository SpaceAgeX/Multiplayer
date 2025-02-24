class StaticObject {
    constructor(scene, width, height, depth, color, positions) {
        this.geometry = new THREE.BoxGeometry(width, height, depth);
        this.material = new THREE.MeshStandardMaterial({ color });

        if (Array.isArray(positions)) {
            this.mesh = new THREE.InstancedMesh(this.geometry, this.material, positions.length);
            positions.forEach((pos, i) => {
                const matrix = new THREE.Matrix4();
                matrix.setPosition(pos.x, pos.y, pos.z);
                this.mesh.setMatrixAt(i, matrix);
            });
            this.mesh.instanceMatrix.needsUpdate = true;
        } else {
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.position.set(positions.x, positions.y, positions.z);
        }

        this.mesh.castShadow = true;
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
