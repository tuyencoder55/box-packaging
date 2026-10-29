import '../styles/base.css';
import { getBoxDef } from '../boxes';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { transformDieline } from '../core/orient';
import { createStore } from '../core/store';
import { calcEffectiveParams } from '../core/thickness';
import { buildDimensionLines } from '../render2d/dimensions';
import { renderSvgView } from '../render2d/svgView';
import { setupZoomPan, type ZoomPanController } from '../render2d/zoomPan';
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

  const initialStore: AppDocState = {
    boxId: params.get('type') ?? saved.boxId ?? boxDef.id,
    unit: (params.get('unit') as AppDocState['unit']) ?? saved.unit ?? 'mm',
    sizeType: (params.get('sizeType') as 'inner' | 'outer') ?? saved.sizeType ?? 'inner',
    l: Number(params.get('l')) || saved.l || boxDef.defaults.l,
    w: Number(params.get('w')) || saved.w || boxDef.defaults.w,
    h: Number(params.get('h')) || saved.h || boxDef.defaults.h,
    t: Number(params.get('t')) || saved.t || boxDef.defaults.t,
    compensate: saved.compensate ?? false,
    opts: saved.opts ?? {},
    orient: saved.orient ?? 'normal',
  };

  const store = createStore<AppDocState>(initialStore);

  // Thiết lập thanh top-bar
  const topBar = document.getElementById('top-bar');
  if (topBar) {
    topBar.style.cssText =
      'display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 50px; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);';
  }

  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.style.cssText = 'font-size: var(--font-size-xs); color: var(--text-muted); margin-left: 8px;';
  }

  const stepBarContainer = document.getElementById('step-bar');
  if (stepBarContainer) {
    stepBarContainer.appendChild(
      createStepBar('dieline', (step: StepId) => {
        console.log('Chuyển sang bước:', step);
      })
    );
  }

  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.style.cssText =
      'background: var(--accent); color: var(--accent-text); border: none; padding: 6px 14px; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;';
  }

  // Thiết lập bố cục khung làm việc
  const workspace = document.getElementById('workspace');
  if (workspace) {
    workspace.style.cssText = 'display: flex; height: calc(100vh - 50px); overflow: hidden;';
  }

  const paramContainer = document.getElementById('param-panel');
  if (paramContainer) {
    paramContainer.style.width = '280px';
    initParamPanel(paramContainer, store, boxDef);
  }

  const viewport = document.getElementById('viewport-2d');
  if (viewport) {
    viewport.style.cssText =
      'flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px;';
  }

  let zoomController: ZoomPanController | null = null;

  function updateDielineView(s: AppDocState) {
    const titleEl = document.getElementById('doc-title');
    if (titleEl) {
      const mode = s.sizeType === 'outer' ? 'phủ bì' : 'lòng';
      titleEl.textContent = `${boxDef.name} (${s.l}×${s.w}×${s.h} mm, ${mode})`;
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
  }

  let saveTimer: number | undefined;
  function triggerSave(currentState: AppDocState) {
    if (saveStatus) saveStatus.textContent = 'Đang lưu...';
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem('boxmaker:doc', JSON.stringify(currentState));
        if (saveStatus) saveStatus.textContent = 'Đã lưu';
      } catch (e) {
        console.error('Không thể lưu vào localStorage:', e);
      }
    }, 300);
  }

  // Lắng nghe thay đổi kích thước và tham số từ Store
  store.subscribe(
    (s) => ({
      l: s.l,
      w: s.w,
      h: s.h,
      t: s.t,
      unit: s.unit,
      sizeType: s.sizeType,
      compensate: s.compensate,
      orient: s.orient,
      opts: s.opts,
    }),
    () => {
      const current = store.get();
      updateDielineView(current);
      triggerSave(current);
    },
    (a, b) =>
      a.l === b.l &&
      a.w === b.w &&
      a.h === b.h &&
      a.t === b.t &&
      a.unit === b.unit &&
      a.sizeType === b.sizeType &&
      a.compensate === b.compensate &&
      a.orient === b.orient &&
      JSON.stringify(a.opts) === JSON.stringify(b.opts)
  );

  // Vẽ lần đầu
  updateDielineView(store.get());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudio);
} else {
  initStudio();
}
