// Thiết lập khung cảnh Three.js: Scene, Camera, Đèn, Renderer và điều khiển chuột
import * as THREE from 'three';

export interface Scene3DContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  rootGroup: THREE.Group;
  render: () => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
  setControlsEnabled: (enabled: boolean) => void;
}

/**
 * Tính khoảng cách camera phù hợp dựa trên kích thước hộp để xem trọn vẹn
 */
export function calcCameraDistance(maxDim: number, fov: number = 45): number {
  const rad = (fov * Math.PI) / 360;
  return Math.max(300, Math.round((maxDim / 2) / Math.tan(rad) * 1.5));
}

/**
 * Thiết lập hệ thống đèn cho Scene
 */
export function setupSceneLights(scene: THREE.Scene): { ambient: THREE.AmbientLight; dir1: THREE.DirectionalLight; dir2: THREE.DirectionalLight } {
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dir1.position.set(200, 400, 500);
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0x8bc34a, 0.2); // Ánh sáng phụ dịu nhẹ
  dir2.position.set(-300, -200, -200);
  scene.add(dir2);

  return { ambient, dir1, dir2 };
}

export function create3DScene(container: HTMLElement): Scene3DContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1d2027); // Nền đồng bộ tông màu tối của app

  const width = Math.max(container.clientWidth || 400, 100);
  const height = Math.max(container.clientHeight || 400, 100);

  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
  camera.position.set(0, 0, 600);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const domEl = renderer.domElement;
  domEl.style.width = '100%';
  domEl.style.height = '100%';
  domEl.style.display = 'block';

  container.appendChild(domEl);

  // Nhóm gốc chứa mô hình hộp
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // Hệ thống ánh sáng
  setupSceneLights(scene);

  // Điều khiển xoay chuột (Orbit-like)
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let controlsEnabled = true;

  const onMouseDown = (e: MouseEvent) => {
    if (!controlsEnabled) return;
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !controlsEnabled) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    rootGroup.rotation.y += deltaX * 0.01;
    rootGroup.rotation.x += deltaY * 0.01;
    render();
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    if (!controlsEnabled) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.08 : 0.92;
    camera.position.z = Math.max(100, Math.min(3000, camera.position.z * factor));
    render();
  };

  domEl.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  domEl.addEventListener('wheel', onWheel, { passive: false });

  const render = () => {
    renderer.render(scene, camera);
  };

  const resize = (w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    render();
  };

  // Tự động nhận diện thay đổi kích thước container
  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0) {
          resize(cr.width, cr.height);
        }
      }
    });
    resizeObserver.observe(container);
  }

  const dispose = () => {
    resizeObserver?.disconnect();
    domEl.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    domEl.removeEventListener('wheel', onWheel);
    renderer.dispose();
    if (domEl.parentElement === container) {
      container.removeChild(domEl);
    }
  };

  const setControlsEnabled = (enabled: boolean) => {
    controlsEnabled = enabled;
  };

  render();

  return {
    scene,
    camera,
    renderer,
    rootGroup,
    render,
    resize,
    dispose,
    setControlsEnabled,
  };
}
