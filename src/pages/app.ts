import '../styles/base.css';
import { getBoxDef } from '../boxes';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { renderSvgView } from '../render2d/svgView';

// Điểm vào trang Studio: kết nối thanh tham số, khung 2D, mockup 3D và xuất file
function initStudio() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') ?? 'fefco-0201';

  const boxDef = getBoxDef(type) ?? getBoxDef('fefco-0201');
  if (!boxDef) {
    console.error('Không tìm thấy loại hộp:', type);
    return;
  }

  const l = Number(params.get('l')) || boxDef.defaults.l;
  const w = Number(params.get('w')) || boxDef.defaults.w;
  const h = Number(params.get('h')) || boxDef.defaults.h;
  const t = Number(params.get('t')) || boxDef.defaults.t;

  // Cập nhật tiêu đề tài liệu
  const titleEl = document.getElementById('doc-title');
  if (titleEl) {
    titleEl.textContent = `${boxDef.name} (${l}×${w}×${h} mm)`;
  }

  // Dựng cây panel và phân loại dieline
  const nodes = boxDef.build({ l, w, h, t, opts: {} });
  const layouts = layoutPanels(nodes);
  const dieline = buildDieline(layouts);

  // Hiển thị SVG trong viewport
  const viewport = document.getElementById('viewport-2d');
  if (viewport) {
    viewport.style.cssText = 'flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px;';
    renderSvgView(viewport, dieline);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudio);
} else {
  initStudio();
}
