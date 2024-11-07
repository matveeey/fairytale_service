import { SceneModel } from '../model/model.js';
import { SceneView } from '../view/view.js';

export class SceneController {
    constructor() {
        this.model = new SceneModel();
        this.view = new SceneView(this.model);

        this.model.addLights();
        this.model.loadMeshAndTexture(
            '/painter/static/3d/meshes/simple-stone/textures/Material_108_baseColor.jpeg',
            '/painter/static/3d/meshes/simple-stone/scene.gltf'
        );
        this.model.animate();
    }
}