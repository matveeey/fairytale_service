import { loadMesh } from '../utils/meshLoader.js';

const defaultCamDistance = 300
const maxCamDistance = 5000
const defaultClipDistance = 10

export class SceneModel {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, defaultClipDistance, maxCamDistance);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement)
        this.loadedMesh = null;
        this.currentTool = 'rotate';
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.currentColor = '#000000';
        this.isZooming = false;
        this.initialDistance = 0;
        this.initialCameraZ = this.camera.position.z;
    }

    loadMeshAndTexture(texturePath, meshPath) {
        loadMesh(this.scene, texturePath, meshPath, (mesh) => {
            this.loadedMesh = mesh;
            this.camera.position.z = defaultCamDistance;
        });
    }

    addLights() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setColor(color) {
        this.currentColor = color;
    }

    handleMouseDown(e) {
        this.isMouseDown = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    handleMouseUp() {
        this.isMouseDown = false;
    }

    handleMouseMove(e) {
        if (!this.isMouseDown) return;

        if (this.currentTool === 'rotate') {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            if (this.loadedMesh) {
                this.loadedMesh.rotation.y += deltaX * 0.01;
                this.loadedMesh.rotation.x += deltaY * 0.01;
            }
        } else if (this.currentTool === 'brush') {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children);
            if (intersects.length > 0) {
                const uv = intersects[0].uv;
                const material = intersects[0].object.material;
                const canvas = material.map.image;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = this.currentColor;
                ctx.beginPath();
                ctx.arc(uv.x * canvas.width, (1 - uv.y) * canvas.height, 5, 0, Math.PI * 2);
                ctx.fill();
                material.map.needsUpdate = true;
            }
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    handleWheel(e) {
        const zoomFactor = 0.1;
        this.camera.position.z += e.deltaY * zoomFactor;
        this.camera.position.z = Math.max(1, Math.min(maxCamDistance, this.camera.position.z));
    }

    handleTouchStart(e) {
        if (e.touches.length === 2) {
            this.isZooming = true;
            this.initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            this.initialCameraZ = this.camera.position.z;
        }
    }

    handleTouchMove(e) {
        if (this.isZooming && e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const zoomFactor = 0.01;
            this.camera.position.z = this.initialCameraZ * (1 + (currentDistance - this.initialDistance) * zoomFactor);
            this.camera.position.z = Math.max(1, Math.min(maxCamDistance, this.camera.position.z));
        }
    }

    handleTouchEnd() {
        this.isZooming = false;
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}