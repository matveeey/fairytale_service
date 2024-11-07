export function loadMesh(scene, texturePath, meshPath, onLoad) {
    const loader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(texturePath, (texture) => {
        loader.load(meshPath, (gltf) => {
            const mesh = gltf.scene;

            // Apply the texture to the mesh material
            mesh.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });

            // Add the mesh to the scene
            scene.add(mesh);

            // Call the onLoad callback with the loaded mesh
            if (onLoad)
                onLoad(mesh);

        }, undefined, (error) => {
            console.error('An error occurred while loading the mesh', error);
        });
    });
}