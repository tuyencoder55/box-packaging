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
  resetView: () => void;
  setDragMode: (mode: 'orbit' | 'pan') => void;
  getDragMode: () => 'orbit' | 'pan';
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

  // Điều khiển chuột & cảm ứng: Xoay tự do (Orbit), Cầm nắm di chuyển (Pan), Phóng to/thu nhỏ (Zoom)
  let isDragging = false;
  let activeMouseButton = 0; // 0: trái, 1: giữa, 2: phải
  let isShiftOrSpace = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let controlsEnabled = true;
  let dragMode: 'orbit' | 'pan' = 'orbit';

  // Chặn menu chuột phải trên canvas 3D để dùng cho việc cầm nắm di chuyển (Pan)
  domEl.addEventListener('contextmenu', (e) => e.preventDefault());
  domEl.style.touchAction = 'none';

  const onMouseDown = (e: MouseEvent) => {
    if (!controlsEnabled) return;
    isDragging = true;
    activeMouseButton = e.button;
    isShiftOrSpace = e.shiftKey || e.altKey;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !controlsEnabled) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    // Xác định chế độ: Pan (cầm nắm kéo lên xuống) khi:
    // 1. Chuột phải (button === 2) hoặc Chuột giữa (button === 1)
    // 2. Giữ phím Shift hoặc Alt
    // 3. Hoặc chế độ dragMode đang là 'pan'
    const isPan = activeMouseButton === 2 || activeMouseButton === 1 || isShiftOrSpace || dragMode === 'pan';

    if (isPan) {
      // Tính tốc độ pan tỉ lệ chuẩn xác theo độ cao khung nhìn và vị trí camera
      const fovRad = (camera.fov * Math.PI) / 360;
      const visibleHeightAtDist = 2 * Math.tan(fovRad) * Math.abs(camera.position.z);
      const panFactor = visibleHeightAtDist / Math.max(container.clientHeight || 400, 100);

      rootGroup.position.x += deltaX * panFactor;
      rootGroup.position.y -= deltaY * panFactor; // Trục Y trong Three.js hướng lên trên
    } else {
      // Xoay (Orbit) quanh tâm
      rootGroup.rotation.y += deltaX * 0.01;
      rootGroup.rotation.x += deltaY * 0.01;
    }

    render();
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  // Hỗ trợ cảm ứng màn hình (Touch gestures)
  let touchStartDist = 0;
  let prevTouchX = 0;
  let prevTouchY = 0;

  const onTouchStart = (e: TouchEvent) => {
    if (!controlsEnabled) return;
    if (e.touches.length === 1) {
      isDragging = true;
      prevTouchX = e.touches[0].clientX;
      prevTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDist = Math.hypot(dx, dy);
      prevTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      prevTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!controlsEnabled) return;
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - prevTouchX;
      const deltaY = e.touches[0].clientY - prevTouchY;
      prevTouchX = e.touches[0].clientX;
      prevTouchY = e.touches[0].clientY;

      if (dragMode === 'pan') {
        const fovRad = (camera.fov * Math.PI) / 360;
        const visibleHeightAtDist = 2 * Math.tan(fovRad) * Math.abs(camera.position.z);
        const panFactor = visibleHeightAtDist / Math.max(container.clientHeight || 400, 100);
        rootGroup.position.x += deltaX * panFactor;
        rootGroup.position.y -= deltaY * panFactor;
      } else {
        rootGroup.rotation.y += deltaX * 0.01;
        rootGroup.rotation.x += deltaY * 0.01;
      }
      render();
    } else if (e.touches.length === 2) {
      // 2 ngón tay: vừa pan vừa pinch-zoom
      const curX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const curY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const deltaX = curX - prevTouchX;
      const deltaY = curY - prevTouchY;
      prevTouchX = curX;
      prevTouchY = curY;

      const fovRad = (camera.fov * Math.PI) / 360;
      const visibleHeightAtDist = 2 * Math.tan(fovRad) * Math.abs(camera.position.z);
      const panFactor = visibleHeightAtDist / Math.max(container.clientHeight || 400, 100);
      rootGroup.position.x += deltaX * panFactor;
      rootGroup.position.y -= deltaY * panFactor;

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const curDist = Math.hypot(dx, dy);
      if (touchStartDist > 0) {
        const factor = touchStartDist / curDist;
        camera.position.z = Math.max(100, Math.min(3000, camera.position.z * factor));
        touchStartDist = curDist;
      }
      render();
    }
  };

  const onTouchEnd = () => {
    isDragging = false;
    touchStartDist = 0;
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
  domEl.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('touchcancel', onTouchEnd);

  const resetView = () => {
    rootGroup.position.set(0, 0, 0);
    rootGroup.rotation.set(0.35, -0.55, 0);
    render();
  };

  const setDragMode = (mode: 'orbit' | 'pan') => {
    dragMode = mode;
  };

  const getDragMode = () => dragMode;

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
    domEl.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
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
    resetView,
    setDragMode,
    getDragMode,
  };
}
