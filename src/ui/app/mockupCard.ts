// Component thẻ Mockup 3D (Floating Card & Fullscreen Viewport)
import * as THREE from 'three';
import { layoutPanels } from '../../core/layout';
import type { Store } from '../../core/store';
import { calcEffectiveParams } from '../../core/thickness';
import type { BoxDef } from '../../core/types';
import { createFoldAnimator, type FoldAnimator } from '../../render3d/foldAnim';
import { buildFoldModel, type FoldModelResult } from '../../render3d/foldModel';
import { calcCameraDistance, create3DScene, type Scene3DContext } from '../../render3d/scene';
import { el } from '../dom';
import type { AppDocState } from './paramPanel';

export interface MockupCardController {
  setMode: (mode: 'pip' | 'fullscreen' | 'hidden') => void;
  updateModel: (state: AppDocState, boxDef: BoxDef) => void;
  dispose: () => void;
}

export function initMockupCard(
  container: HTMLElement,
  store: Store<AppDocState>,
  initialBox: BoxDef,
  onExpand?: () => void,
): MockupCardController {
  container.innerHTML = '';

  // Khung chứa thẻ nổi 3D
  const card = el('div', {
    class: 'mockup-card-container',
    style: `
      position: absolute;
      right: 20px;
      bottom: 20px;
      width: 280px;
      height: 220px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 50;
      transition: width 0.25s ease, height 0.25s ease, right 0.25s ease, bottom 0.25s ease;
    `,
  });

  // Header thẻ nổi
  const cardHeader = el('div', {
    style: `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--text-secondary);
    `,
  });

  const headerTitle = el('span', { text: 'Mô phỏng 3D' });
  const btnExpand = el('button', {
    type: 'button',
    text: 'Phóng to ↗',
    style: `
      background: transparent;
      border: none;
      color: var(--color-primary);
      font-size: var(--font-size-xs);
      font-weight: 600;
      cursor: pointer;
      padding: 2px 4px;
    `,
  });
  if (onExpand) {
    btnExpand.addEventListener('click', onExpand);
  }

  cardHeader.appendChild(headerTitle);
  cardHeader.appendChild(btnExpand);
  card.appendChild(cardHeader);

  // Khung vẽ 3D WebGL
  const canvasWrap = el('div', {
    style: 'flex: 1; position: relative; overflow: hidden; background: #181a20;',
  });
  card.appendChild(canvasWrap);

  // Thanh điều khiển gập mở bên dưới
  const controlsBar = el('div', {
    style: `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
    `,
  });

  const btnToggle = el('button', {
    type: 'button',
    text: 'Mở',
    style: `
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      border-radius: var(--radius-sm);
      padding: 4px 10px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    `,
  });

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '100'; // Mặc định hiển thị ở trạng thái đã gấp kín (100%)
  slider.style.cssText = 'flex: 1; accent-color: var(--color-primary); cursor: pointer;';

  const progressLabel = el('span', {
    text: '100%',
    style: 'font-size: var(--font-size-xs); color: var(--text-muted); min-width: 34px; text-align: right;',
  });

  controlsBar.appendChild(btnToggle);
  controlsBar.appendChild(slider);
  controlsBar.appendChild(progressLabel);
  card.appendChild(controlsBar);

  container.appendChild(card);

  // Khởi tạo Scene 3D
  const sceneCtx: Scene3DContext = create3DScene(canvasWrap);
  let currentModel: FoldModelResult | null = null;
  let animator: FoldAnimator | null = null;
  let currentBoxDef = initialBox;

  const updateModel = (s: AppDocState, boxDef: BoxDef) => {
    currentBoxDef = boxDef;

    // Dọn dẹp model cũ
    if (currentModel) {
      sceneCtx.rootGroup.remove(currentModel.rootGroup);
      currentModel.dispose();
      currentModel = null;
    }

    try {
      const effectiveParams = calcEffectiveParams(s);
      const nodes = boxDef.build(effectiveParams);
      const positioned = layoutPanels(nodes);

      currentModel = buildFoldModel(positioned);
      sceneCtx.rootGroup.add(currentModel.rootGroup);

      // Điều chỉnh khoảng cách camera theo kích thước lớn nhất của hộp
      const maxDim = Math.max(s.l, s.w, s.h);
      const dist = calcCameraDistance(maxDim, sceneCtx.camera.fov);
      sceneCtx.camera.position.set(0, dist * 0.4, dist);
      sceneCtx.camera.lookAt(0, 0, 0);

      // Tạo animator
      animator = createFoldAnimator(currentModel.hinges, (p) => {
        const percent = Math.round(p * 100);
        slider.value = percent.toString();
        progressLabel.textContent = `${percent}%`;
        btnToggle.textContent = p > 0.5 ? 'Mở' : 'Gấp';
        sceneCtx.render();
      });

      // Mặc định cho hộp ở trạng thái gập kín
      animator.setProgress(1);
      slider.value = '100';
      progressLabel.textContent = '100%';
      btnToggle.textContent = 'Mở';

      // Căn giữa hộp 3D tại tâm gốc toạ độ sau khi gập
      currentModel.rootGroup.updateMatrixWorld(true);
      const foldedBox = new THREE.Box3().setFromObject(currentModel.rootGroup);
      const foldedCenter = new THREE.Vector3();
      foldedBox.getCenter(foldedCenter);
      currentModel.rootGroup.position.sub(foldedCenter);

      sceneCtx.render();
    } catch (e) {
      console.error('Lỗi dựng mô hình 3D:', e);
    }
  };

  btnToggle.addEventListener('click', () => {
    if (animator) animator.toggle();
  });

  slider.addEventListener('input', () => {
    if (animator) {
      animator.stop();
      animator.setProgress(Number(slider.value) / 100);
    }
  });

  // Xoay nhẹ mô hình ban đầu cho đẹp góc nhìn nghiêng 3D
  sceneCtx.rootGroup.rotation.x = 0.35;
  sceneCtx.rootGroup.rotation.y = -0.55;

  // Dựng mô hình ban đầu
  updateModel(store.get(), initialBox);

  const setMode = (mode: 'pip' | 'fullscreen' | 'hidden') => {
    if (mode === 'hidden') {
      card.style.display = 'none';
      return;
    }

    card.style.display = 'flex';

    if (mode === 'fullscreen') {
      card.style.position = 'relative';
      card.style.right = '0';
      card.style.bottom = '0';
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.flex = '1';
      card.style.borderRadius = '0';
      card.style.border = 'none';
      btnExpand.style.display = 'none';
      headerTitle.textContent = `Mô phỏng 3D — ${currentBoxDef.name}`;
    } else {
      card.style.position = 'absolute';
      card.style.right = '20px';
      card.style.bottom = '20px';
      card.style.width = '280px';
      card.style.height = '220px';
      card.style.flex = 'none';
      card.style.borderRadius = 'var(--radius-lg)';
      card.style.border = '1px solid var(--border-subtle)';
      btnExpand.style.display = 'block';
      headerTitle.textContent = 'Mô phỏng 3D';
    }

    // Buộc renderer tính toán lại kích thước khung nhìn mới
    requestAnimationFrame(() => {
      if (canvasWrap.clientWidth > 0 && canvasWrap.clientHeight > 0) {
        sceneCtx.resize(canvasWrap.clientWidth, canvasWrap.clientHeight);
      }
    });
  };

  const dispose = () => {
    if (currentModel) currentModel.dispose();
    sceneCtx.dispose();
  };

  return {
    setMode,
    updateModel,
    dispose,
  };
}

