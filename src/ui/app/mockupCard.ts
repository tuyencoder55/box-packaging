// Component thẻ Mockup 3D (Floating Card & Fullscreen Viewport có bảng cài đặt chất liệu & ánh sáng)
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

  // Khung chứa toàn bộ giao diện 3D
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

  // Header thẻ nổi (hiển thị khi ở chế độ mini-card)
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

  // Thân chính: chia làm 2 cột (Cột vẽ 3D bên trái, Bảng cài đặt bên phải)
  const contentBody = el('div', {
    style: 'flex: 1; display: flex; overflow: hidden; position: relative;',
  });
  card.appendChild(contentBody);

  // Cột trái: Khung WebGL + Thanh trượt gập mở
  const canvasCol = el('div', {
    style: 'flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative;',
  });
  contentBody.appendChild(canvasCol);

  // Khung vẽ 3D WebGL
  const canvasWrap = el('div', {
    style: 'flex: 1; position: relative; overflow: hidden; background: #181a20;',
  });
  canvasCol.appendChild(canvasWrap);

  // Thanh công cụ nổi tiện ích trên khung 3D (Xoay, Cầm nắm, Căn giữa)
  const floatBar = el('div', {
    style: `
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(22, 24, 31, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 4px;
      z-index: 10;
    `,
  });

  const btnModeOrbit = el('button', {
    type: 'button',
    text: '⤾ Xoay',
    title: 'Chế độ xoay góc nhìn 3D (Chuột trái)',
    style: `
      background: var(--color-primary);
      color: var(--color-primary-fg);
      border: none;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    `,
  });

  const btnModePan = el('button', {
    type: 'button',
    text: '✋ Cầm nắm',
    title: 'Chế độ cầm nắm kéo di chuyển hộp (hoặc giữ chuột phải / Shift)',
    style: `
      background: transparent;
      color: var(--text-muted);
      border: none;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    `,
  });

  const btnResetCenter = el('button', {
    type: 'button',
    text: '⊙ Căn giữa',
    title: 'Đưa hộp về chính giữa màn hình',
    style: `
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    `,
  });

  floatBar.appendChild(btnModeOrbit);
  floatBar.appendChild(btnModePan);
  floatBar.appendChild(btnResetCenter);
  canvasWrap.appendChild(floatBar);

  // Thanh điều khiển gập mở bên dưới khung 3D
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
  slider.value = '100';
  slider.style.cssText = 'flex: 1; accent-color: var(--color-primary); cursor: pointer;';

  const progressLabel = el('span', {
    text: '100%',
    style: 'font-size: var(--font-size-xs); color: var(--text-muted); min-width: 34px; text-align: right;',
  });

  controlsBar.appendChild(btnToggle);
  controlsBar.appendChild(slider);
  controlsBar.appendChild(progressLabel);
  canvasCol.appendChild(controlsBar);

  // ==========================================
  // BẢNG CÀI ĐẶT 3D BÊN PHẢI (THEO HÌNH 1 CỦA USER)
  // ==========================================
  const settingsSidebar = el('div', {
    class: 'mockup-3d-sidebar',
    style: `
      width: 290px;
      background: #1b1e26;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px;
      display: none;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    `,
  });
  contentBody.appendChild(settingsSidebar);

  // 1. Nhóm: Màu nền giấy
  const secColor = el('div', {
    style: 'display: flex; flex-direction: column; gap: 8px;',
  });
  const lblColorRow = el('div', {
    style: 'display: flex; align-items: center; justify-content: space-between;',
  });
  lblColorRow.appendChild(el('span', {
    text: 'Màu nền giấy',
    style: 'font-size: 12px; font-weight: 600; color: var(--text-primary);',
  }));

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = store.get().paperColor || '#c8a882';
  colorInput.style.cssText = `
    width: 30px;
    height: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    padding: 0;
  `;
  lblColorRow.appendChild(colorInput);
  secColor.appendChild(lblColorRow);

  // Các chip màu giấy bao bì phổ biến
  const colorPresets = [
    { name: 'Kraft tự nhiên', hex: '#c8a882' },
    { name: 'Kraft mộc', hex: '#a88965' },
    { name: 'Trắng Duplex', hex: '#f4f3ed' },
    { name: 'Kraft vàng', hex: '#d49b4b' },
    { name: 'Đen huyền', hex: '#2b2b2b' },
  ];
  const chipsRow = el('div', { style: 'display: flex; gap: 6px;' });
  for (const cp of colorPresets) {
    const chip = el('button', {
      type: 'button',
      title: cp.name,
      style: `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${cp.hex};
        border: 2px solid ${cp.hex === colorInput.value ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'};
        cursor: pointer;
        padding: 0;
        transition: transform 0.1s ease;
      `,
    });
    chip.addEventListener('click', () => {
      colorInput.value = cp.hex;
      colorInput.dispatchEvent(new Event('input'));
    });
    chipsRow.appendChild(chip);
  }
  secColor.appendChild(chipsRow);
  settingsSidebar.appendChild(secColor);

  // 2. Nhóm: Độ dày giấy, kết cấu (4 mẫu texture)
  const secTexture = el('div', {
    style: 'display: flex; flex-direction: column; gap: 8px;',
  });
  secTexture.appendChild(el('span', {
    text: 'Độ dày giấy, kết cấu',
    style: 'font-size: 12px; font-weight: 600; color: var(--text-primary);',
  }));

  const texturesRow = el('div', {
    style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;',
  });

  const textureTypes: Array<{ id: 'ivory' | 'flute_e' | 'flute_b' | 'flute_bc'; label: string; desc: string }> = [
    { id: 'ivory', label: 'Ivory', desc: 'Giấy phẳng láng' },
    { id: 'flute_e', label: 'Sóng E', desc: 'Carton 3 lớp mỏng (~1.5mm)' },
    { id: 'flute_b', label: 'Sóng B/C', desc: 'Carton 3 lớp chuẩn (~3mm)' },
    { id: 'flute_bc', label: 'Sóng BC', desc: 'Carton 5 lớp dày (~6mm)' },
  ];

  let currentTexture = store.get().paperTexture || 'flute_b';
  const textureButtons = new Map<string, HTMLElement>();

  for (const t of textureTypes) {
    const isAct = t.id === currentTexture;
    const btnT = el('button', {
      type: 'button',
      title: `${t.label}: ${t.desc}`,
      style: `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 2px;
        background: ${isAct ? 'rgba(0, 210, 135, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
        border: 1.5px solid ${isAct ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)'};
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
      `,
    });

    // Icon mô phỏng lát cắt sóng carton
    const iconSpan = el('span', {
      style: `
        display: block;
        width: 32px;
        height: 16px;
        border-radius: 2px;
        background: #c8a882;
        border-top: 2px solid #5a442e;
        border-bottom: 2px solid #5a442e;
        ${t.id === 'ivory' ? 'border-top: none; height: 10px;' : ''}
        ${t.id === 'flute_bc' ? 'border-bottom: 4px double #5a442e; height: 18px;' : ''}
      `,
    });

    const nameSpan = el('span', {
      text: t.label,
      style: 'font-size: 10px; font-weight: 600; color: var(--text-secondary);',
    });

    btnT.appendChild(iconSpan);
    btnT.appendChild(nameSpan);
    textureButtons.set(t.id, btnT);

    btnT.addEventListener('click', () => {
      currentTexture = t.id;
      store.set({ paperTexture: t.id });
      textureButtons.forEach((b, k) => {
        const act = k === t.id;
        b.style.background = act ? 'rgba(0, 210, 135, 0.12)' : 'rgba(255, 255, 255, 0.04)';
        b.style.borderColor = act ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)';
      });
      if (currentModel) {
        currentModel.setPaperTexture(t.id);
        sceneCtx.render();
      }
    });

    texturesRow.appendChild(btnT);
  }
  secTexture.appendChild(texturesRow);
  settingsSidebar.appendChild(secTexture);

  // 3. Nút: Khôi phục lại góc nhìn
  const btnResetView = el('button', {
    type: 'button',
    text: '↺ Khôi phục lại góc nhìn',
    style: `
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: var(--text-primary);
      padding: 7px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    `,
  });
  btnResetView.addEventListener('mouseenter', () => (btnResetView.style.background = 'rgba(255, 255, 255, 0.09)'));
  btnResetView.addEventListener('mouseleave', () => (btnResetView.style.background = 'rgba(255, 255, 255, 0.05)'));
  settingsSidebar.appendChild(btnResetView);

  // 4. Nhóm: Ánh sáng toàn cầu (Ambient light)
  const secAmbient = el('div', {
    style: 'display: flex; flex-direction: column; gap: 6px;',
  });
  const ambientHead = el('div', {
    style: 'display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary);',
  });
  ambientHead.appendChild(el('span', { text: 'Ánh sáng toàn cầu' }));
  const ambientValLabel = el('span', { text: `${Math.round((store.get().ambientLight ?? 0.7) * 100)}%` });
  ambientHead.appendChild(ambientValLabel);
  secAmbient.appendChild(ambientHead);

  const sliderAmbient = document.createElement('input');
  sliderAmbient.type = 'range';
  sliderAmbient.min = '10';
  sliderAmbient.max = '200';
  sliderAmbient.value = String(Math.round((store.get().ambientLight ?? 0.7) * 100));
  sliderAmbient.style.cssText = 'accent-color: var(--color-primary); cursor: pointer;';
  secAmbient.appendChild(sliderAmbient);
  settingsSidebar.appendChild(secAmbient);

  // 5. Nhóm: Đèn pha (Directional light)
  const secDir = el('div', {
    style: 'display: flex; flex-direction: column; gap: 6px;',
  });
  const dirHead = el('div', {
    style: 'display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary);',
  });
  dirHead.appendChild(el('span', { text: 'Đèn pha' }));
  const dirValLabel = el('span', { text: `${Math.round((store.get().dirLight ?? 0.8) * 100)}%` });
  dirHead.appendChild(dirValLabel);
  secDir.appendChild(dirHead);

  const sliderDir = document.createElement('input');
  sliderDir.type = 'range';
  sliderDir.min = '10';
  sliderDir.max = '200';
  sliderDir.value = String(Math.round((store.get().dirLight ?? 0.8) * 100));
  sliderDir.style.cssText = 'accent-color: var(--color-primary); cursor: pointer;';
  secDir.appendChild(sliderDir);
  settingsSidebar.appendChild(secDir);

  // 6. Nút Lưu ảnh chụp 3D (dưới dạng hình ảnh)
  const btnCapture3D = el('button', {
    type: 'button',
    text: 'Lưu chế độ xem hiện tại dưới dạng hình ảnh',
    style: `
      margin-top: auto;
      background: #198754;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 9px 12px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(25, 135, 84, 0.3);
      transition: all 0.15s ease;
      text-align: center;
    `,
  });
  btnCapture3D.addEventListener('mouseenter', () => (btnCapture3D.style.background = '#157347'));
  btnCapture3D.addEventListener('mouseleave', () => (btnCapture3D.style.background = '#198754'));
  settingsSidebar.appendChild(btnCapture3D);

  container.appendChild(card);

  // ==========================================
  // KHỞI TẠO SCENE 3D THREE.JS
  // ==========================================
  const sceneCtx: Scene3DContext = create3DScene(canvasWrap);
  let currentModel: FoldModelResult | null = null;
  let animator: FoldAnimator | null = null;
  let currentBoxDef = initialBox;

  // Áp dụng độ sáng ban đầu
  if (store.get().ambientLight) sceneCtx.setAmbientIntensity(store.get().ambientLight!);
  if (store.get().dirLight) sceneCtx.setDirectionalIntensity(store.get().dirLight!);

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

      currentModel = buildFoldModel(positioned, {
        paperColor: s.paperColor || '#c8a882',
        paperTexture: s.paperTexture || 'flute_b',
      });
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

  btnModeOrbit.addEventListener('click', () => {
    sceneCtx.setDragMode('orbit');
    btnModeOrbit.style.background = 'var(--color-primary)';
    btnModeOrbit.style.color = 'var(--color-primary-fg)';
    btnModePan.style.background = 'transparent';
    btnModePan.style.color = 'var(--text-muted)';
  });

  btnModePan.addEventListener('click', () => {
    sceneCtx.setDragMode('pan');
    btnModePan.style.background = 'var(--color-primary)';
    btnModePan.style.color = 'var(--color-primary-fg)';
    btnModeOrbit.style.background = 'transparent';
    btnModeOrbit.style.color = 'var(--text-muted)';
  });

  btnResetCenter.addEventListener('click', () => {
    sceneCtx.resetView();
  });

  btnResetView.addEventListener('click', () => {
    sceneCtx.resetView();
  });

  slider.addEventListener('input', () => {
    if (animator) {
      animator.stop();
      animator.setProgress(Number(slider.value) / 100);
    }
  });

  // Tương tác bảng cài đặt 3D
  colorInput.addEventListener('input', () => {
    const hex = colorInput.value;
    store.set({ paperColor: hex });
    if (currentModel) {
      currentModel.setPaperColor(hex);
      sceneCtx.render();
    }
  });

  sliderAmbient.addEventListener('input', () => {
    const val = Number(sliderAmbient.value) / 100;
    ambientValLabel.textContent = `${sliderAmbient.value}%`;
    store.set({ ambientLight: val });
    sceneCtx.setAmbientIntensity(val);
  });

  sliderDir.addEventListener('input', () => {
    const val = Number(sliderDir.value) / 100;
    dirValLabel.textContent = `${sliderDir.value}%`;
    store.set({ dirLight: val });
    sceneCtx.setDirectionalIntensity(val);
  });

  btnCapture3D.addEventListener('click', () => {
    sceneCtx.render();
    const cvs = canvasWrap.querySelector('canvas');
    if (cvs) {
      const dataUrl = cvs.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${currentBoxDef.id}-3d-mockup.png`;
      a.click();
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
      cardHeader.style.display = 'none'; // Ở chế độ toàn màn hình, thanh tab trên đã có tiêu đề
      settingsSidebar.style.display = 'flex'; // Hiển thị bảng cài đặt 3D bên phải
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
      cardHeader.style.display = 'flex';
      headerTitle.textContent = 'Mô phỏng 3D';
      settingsSidebar.style.display = 'none'; // Ẩn bảng cài đặt ở chế độ thẻ mini
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
