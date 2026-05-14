import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.currentModel = null;
  }

  load(url, onProgress = null) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this.currentModel = gltf.scene;

          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          resolve(gltf.scene);
        },
        (event) => {
          if (onProgress && event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.error('Failed to load model:', error);
          reject(new Error('Failed to load 3D model. The file may be corrupted.'));
        }
      );
    });
  }

  dispose() {
    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((mat) => {
            Object.values(mat).forEach((val) => {
              if (val && typeof val.dispose === 'function') {
                val.dispose();
              }
            });
            mat.dispose();
          });
        }
      });
      this.currentModel = null;
    }
  }
}

export default ModelLoader;
