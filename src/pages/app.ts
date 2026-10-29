import '../styles/base.css';
import { getAllBoxes, getBoxDef } from '../boxes';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { transformDieline } from '../core/orient';
import { createStore } from '../core/store';
import { calcEffectiveParams } from '../core/thickness';
import { buildDimensionLines } from '../render2d/dimensions';
import { renderSvgView } from '../render2d/svgView';
import { setupZoomPan, type ZoomPanController } from '../render2d/zoomPan';
import { initMockupCard, type MockupCardController } from '../ui/app/mockupCard';
import { initParamPanel, type AppDocState } from '../ui/app/paramPanel';
import { createStepBar, type StepId } from '../ui/app/stepBar';

// Điểm vào trang Studio: kết nối thanh tham số, khung 2D, mockup 3D và xuất file
function initStudio() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') ?? 'fefco-0201';

  const targetBox = getBoxDef(type) ?? getBoxDef('fefco-0201');
  if (!targetBox) {
    console.error('Không tìm thấy loại hộp:', type);
    return;
  }
  const boxDef = targetBox;

  // Đọc từ localStorage nếu có, URL query luôn ưu tiên
  let saved: Partial<AppDocState> = {};
  try {
    const raw = localStorage.getItem('boxmaker:doc');
    if (raw) saved = JSON.parse(raw);
  } catch {
    // bỏ qua nếu lỗi parse
  }

  // Nếu chuyển sang loại hộp khác với lưu trong cache, ưu tiên defaults của loại hộp đó
  const isDifferentBox = saved.boxId && saved.boxId !== boxDef.id;

  const initialStore: AppDocState = {
    boxId: boxDef.id,
    unit: (params.get('unit') as AppDocState['unit']) ?? (isDifferentBox ? 'mm' : saved.unit) ?? 'mm',
    sizeType: (params.get('sizeType') as 'inner' | 'outer') ?? (isDifferentBox ? 'inner' : saved.sizeType) ?? 'inner',
    l: Number(params.get('l')) || (isDifferentBox ? boxDef.defaults.l : saved.l) || boxDef.defaults.l,
    w: Number(params.get('w')) || (isDifferentBox ? boxDef.defaults.w : saved.w) || boxDef.defaults.w,
    h: Number(params.get('h')) || (isDifferentBox ? boxDef.defaults.h : saved.h) || boxDef.defaults.h,
    t: Number(params.get('t')) || (isDifferentBox ? boxDef.defaults.t : saved.t) || boxDef.defaults.t,
    compensate: isDifferentBox ? false : (saved.compensate ?? false),
    opts: isDifferentBox ? {} : (saved.opts ?? {}),
    orient: saved.orient ?? 'normal',
  };

  const store = createStore<AppDocState>(initialStore);

  // Thiết lập thanh top-bar
  const topBar = document.getElementById('top-bar');
  if (topBar) {
    topBar.style.cssText =
      'display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 50px; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); gap: 12px;';
  }

  // Tinh chỉnh link Thư viện và dropdown chọn hộp
  const backLink = topBar?.querySelector('a');
  if (backLink) {
    backLink.style.cssText =
      'color: var(--text-secondary); text-decoration: none; font-size: var(--font-size-sm); font-weight: 500; white-space: nowrap;';
  }

  // Thay thế hoặc gắn bộ chọn hộp vào topBar
  const titleEl = document.getElementById('doc-title');
  let metaSpan: HTMLElement | null = null;
  if (titleEl) {
    titleEl.innerHTML = '';
    titleEl.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const select = document.createElement('select');
    select.id = 'box-select';
    select.style.cssText = `
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      font-size: var(--font-size-sm);
      font-weight: 600;
      cursor: pointer;
      outline: none;
    `;

    const allBoxes = getAllBoxes();
    allBoxes.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.name} (${b.code ?? b.id})`;
      if (b.id === boxDef.id) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      window.location.search = `?type=${encodeURIComponent(select.value)}`;
    });

    metaSpan = document.createElement('span');
    metaSpan.id = 'doc-meta';
    metaSpan.style.cssText = 'font-size: var(--font-size-xs); color: var(--text-secondary);';

    titleEl.appendChild(select);
    titleEl.appendChild(metaSpan);
  }

  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.style.cssText = 'font-size: var(--font-size-xs); color: var(--text-muted); margin-left: 4px;';
  }

  // Thiết lập bố cục khung làm việc
  const workspace = document.getElementById('workspace');
  if (workspace) {
    workspace.style.cssText = 'display: flex; height: calc(100vh - 50px); overflow: hidden; position: relative;';
  }

  const paramContainer = document.getElementById('param-panel');
  if (paramContainer) {
    paramContainer.style.width = '280px';
    initParamPanel(paramContainer, store, boxDef);
  }

  const viewport = document.getElementById('viewport-2d');
  if (viewport) {
    viewport.style.cssText =
      'flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative;';
  }

  // Khởi tạo thẻ nổi Mockup 3D
  const mockupContainer = document.getElementById('mockup-card');
  let mockupController: MockupCardController | null = null;

  function switchStep(newStep: StepId) {
    if (newStep === 'mockup') {
      if (viewport) viewport.style.display = 'none';
      if (mockupContainer) {
        mockupContainer.style.display = 'block';
        mockupContainer.style.flex = '1';
        mockupContainer.style.height = '100%';
      }
      mockupController?.setMode('fullscreen');
    } else if (newStep === 'dieline') {
      if (viewport) viewport.style.display = 'flex';
      if (mockupContainer) {
        mockupContainer.style.display = 'block';
        mockupContainer.style.flex = 'none';
        mockupContainer.style.height = 'auto';
      }
      mockupController?.setMode('pip');
    }
  }

  const stepBarContainer = document.getElementById('step-bar');
  if (stepBarContainer) {
    stepBarContainer.appendChild(
      createStepBar('dieline', (step: StepId) => {
        switchStep(step);
      })
    );
  }

  if (mockupContainer) {
    mockupController = initMockupCard(mockupContainer, store, boxDef, () => {
      // Phóng to sang bước 3D
      const mockupBtn = stepBarContainer?.querySelector('[data-step="mockup"]') as HTMLButtonElement | null;
      if (mockupBtn) {
        mockupBtn.click();
      } else {
        switchStep('mockup');
      }
    });
  }

  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.style.cssText =
      'background: var(--accent); color: var(--accent-text); border: none; padding: 6px 14px; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;';
    btnExport.addEventListener('click', () => {
      const exportBtn = stepBarContainer?.querySelector('[data-step="export"]') as HTMLButtonElement | null;
      exportBtn?.click();
    });
  }

  let zoomController: ZoomPanController | null = null;

  function updateDielineView(s: AppDocState) {
    if (metaSpan) {
      const mode = s.sizeType === 'outer' ? 'phủ bì' : 'lòng';
      metaSpan.textContent = `— ${s.l}×${s.w}×${s.h} mm (${mode})`;
    }

    const effectiveParams = calcEffectiveParams(s);
    const nodes = boxDef.build(effectiveParams);
    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);
    const orientedDieline = transformDieline(dieline, s.orient);
    const dimLines = buildDimensionLines(boxDef.dims, layouts, { l: s.l, w: s.w, h: s.h }, s.unit);

    if (viewport) {
      const svg = renderSvgView(viewport, orientedDieline, dimLines);
      if (!zoomController) {
        zoomController = setupZoomPan(viewport, svg);
      }
    }

    // Đồng bộ sang mô hình 3D
    mockupController?.updateModel(s, boxDef);
  }

  updateDielineView(store.get());
  store.subscribe(
    (s) => s,
    (s) => updateDielineView(s)
  );

  // Tự động lưu trạng thái vào localStorage khi có thay đổi (debounce 300ms)
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  store.subscribe(
    (s) => s,
    (state) => {
      if (saveStatus) saveStatus.textContent = 'Đang lưu...';
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem('boxmaker:doc', JSON.stringify(state));
          if (saveStatus) saveStatus.textContent = 'Đã lưu';
        } catch (err) {
          console.warn('Lỗi lưu document vào localStorage:', err);
        }
      }, 300);
    }
  );
}

document.addEventListener('DOMContentLoaded', initStudio);
