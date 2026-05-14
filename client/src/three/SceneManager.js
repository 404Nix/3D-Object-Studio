import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.autoRotate = false;
    this.model = null;
    this.clock = new THREE.Clock();

    this._init();
  }

  _init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090f);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(5, 5, 5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 100;
    this.controls.target.set(0, 0, 0);

    this._setupLights();
    this._setupGrid();

    this.resizeObserver = new ResizeObserver(() => this._onResize());
    this.resizeObserver.observe(this.container);

    this._animate();
  }

  _setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const hemisphere = new THREE.HemisphereLight(0xa855f7, 0x06b6d4, 0.3);
    this.scene.add(hemisphere);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.4);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xa855f7, 0.3);
    backLight.position.set(0, 5, -10);
    this.scene.add(backLight);
  }

  _setupGrid() {
    const gridHelper = new THREE.GridHelper(20, 40, 0x2a2a3a, 0x1a1a24);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
  }

  _onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  _animate() {
    this.animationId = requestAnimationFrame(() => this._animate());

    const delta = this.clock.getDelta();

    if (this.autoRotate && this.model) {
      this.model.rotation.y += delta * 0.5;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  setModel(model) {
    if (this.model) {
      this.scene.remove(this.model);
      this._disposeObject(this.model);
    }

    this.model = model;
    this.scene.add(model);

    this._centerModel(model);
  }

  _centerModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;

    model.position.sub(center);
    model.scale.multiplyScalar(scale);

    const newBox = new THREE.Box3().setFromObject(model);
    const newCenter = newBox.getCenter(new THREE.Vector3());
    model.position.sub(newCenter);

    const newBox2 = new THREE.Box3().setFromObject(model);
    model.position.y -= newBox2.min.y;
  }

  resetCamera() {
    this.camera.position.set(5, 5, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  setWireframe(enabled) {
    if (!this.model) return;
    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => (mat.wireframe = enabled));
        } else {
          child.material.wireframe = enabled;
        }
      }
    });
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
  }

  applyState(state) {
    if (!state) return;

    if (state.cameraPosition) {
      this.camera.position.set(
        state.cameraPosition.x,
        state.cameraPosition.y,
        state.cameraPosition.z
      );
    }

    if (state.cameraTarget) {
      this.controls.target.set(
        state.cameraTarget.x,
        state.cameraTarget.y,
        state.cameraTarget.z
      );
    }

    if (state.objectRotation && this.model) {
      this.model.rotation.set(
        state.objectRotation.x,
        state.objectRotation.y,
        state.objectRotation.z
      );
    }

    this.setWireframe(state.wireframe || false);
    this.setAutoRotate(state.autoRotate || false);

    this.controls.update();
  }

  getState() {
    return {
      cameraPosition: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      },
      cameraTarget: {
        x: this.controls.target.x,
        y: this.controls.target.y,
        z: this.controls.target.z,
      },
      zoom: this.camera.zoom,
      objectRotation: this.model
        ? {
            x: this.model.rotation.x,
            y: this.model.rotation.y,
            z: this.model.rotation.z,
          }
        : { x: 0, y: 0, z: 0 },
      wireframe: false,
      autoRotate: this.autoRotate,
    };
  }

  _disposeObject(obj) {
    obj.traverse((child) => {
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
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.model) {
      this.scene.remove(this.model);
      this._disposeObject(this.model);
    }

    this.scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((mat) => mat.dispose());
      }
    });

    this.controls.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
  }
}

export default SceneManager;
