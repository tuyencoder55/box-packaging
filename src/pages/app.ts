import '../styles/base.css';
import { getBoxDef } from '../boxes';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { createStore } from '../core/store';
import { calcEffectiveParams } from '../core/thickness';
import { renderSvgView } from '../render2d/svgView';
import { initParamPanel, type AppDocState } from '../ui/app/paramPanel';

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

  const initialStore: AppDocState = {
    boxId: boxDef.id,
    unit: 'mm',
    sizeType: 'inner',
    l: Number(params.get('l')) || boxDef.defaults.l,
    w: Number(params.get('w')) || boxDef.defaults.w,
    h: Number(params.get('h')) || boxDef.defaults.h,
    t: Number(params.get('t')) || boxDef.defaults.t,
    compensate: false,
    opts: {},
    orient: 'normal',
  };

  const store = createStore<AppDocState>(initialStore);

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

    if (viewport) {
      renderSvgView(viewport, dieline);
    }
  }

  // Lắng nghe thay đổi kích thước và tham số từ Store
  store.subscribe(
    (s) => ({
      l: s.l,
      w: s.w,
      h: s.h,
      t: s.t,
      sizeType: s.sizeType,
      compensate: s.compensate,
      opts: s.opts,
    }),
    () => updateDielineView(store.get()),
    (a, b) =>
      a.l === b.l &&
      a.w === b.w &&
      a.h === b.h &&
      a.t === b.t &&
      a.sizeType === b.sizeType &&
      a.compensate === b.compensate &&
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
