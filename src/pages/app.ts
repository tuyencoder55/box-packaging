import '../styles/base.css';
import { getAllBoxes, getBoxDef } from '../boxes';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { transformDieline } from '../core/orient';
import { createStore } from '../core/store';
import { calcEffectiveParams } from '../core/thickness';
import type { Dieline } from '../core/types';
import { buildDimensionLines, type DimensionLine } from '../render2d/dimensions';
import { renderSvgView } from '../render2d/svgView';
import { setupZoomPan, type ZoomPanController } from '../render2d/zoomPan';
import { initMockupCard, type MockupCardController } from '../ui/app/mockupCard';
import { openExportModal } from '../ui/app/exportModal';
import { initParamPanel, type AppDocState } from '../ui/app/paramPanel';
import { createStepBar, type StepId } from '../ui/app/stepBar';
import { openImporterModal } from '../ui/importer/importerModal';

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

  // Thiết lập thanh top-bar cao cấp, bo góc tinh tế
  const topBar = document.getElementById('top-bar');
  if (topBar) {
    topBar.style.cssText =
      'display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 56px; background: #181b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08); gap: 14px;';
  }

  // Tinh chỉnh link Thư viện và dropdown chọn hộp
  const backLink = topBar?.querySelector('a');
  if (backLink) {
    backLink.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.15s ease;
    `;
    backLink.addEventListener('mouseenter', () => {
      backLink.style.background = 'rgba(255, 255, 255, 0.08)';
      backLink.style.color = 'var(--text-main)';
    });
    backLink.addEventListener('mouseleave', () => {
      backLink.style.background = 'rgba(255, 255, 255, 0.04)';
      backLink.style.color = 'var(--text-secondary)';
    });
  }

  // Thay thế hoặc gắn bộ chọn hộp vào topBar
  const titleEl = document.getElementById('doc-title');
  let metaSpan: HTMLElement | null = null;
  if (titleEl) {
    titleEl.innerHTML = '';
    titleEl.style.cssText = 'display: flex; align-items: center; gap: 10px;';

    const select = document.createElement('select');
    select.id = 'box-select';
    select.style.cssText = `
      background: #20242e;
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
    metaSpan.style.cssText = `
      font-size: 12px;
      color: var(--text-muted);
      background: #20242e;
      border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 4px 10px;
      border-radius: 9999px;
      white-space: nowrap;
    `;

    titleEl.appendChild(select);
    titleEl.appendChild(metaSpan);
  }

  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.style.cssText =
      'font-size: 11px; font-weight: 600; color: var(--color-primary); display: flex; align-items: center; gap: 5px;';
    saveStatus.innerHTML = '<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--color-primary);"></span> Đã lưu';
  }

  // Thiết lập bố cục khung làm việc
  const workspace = document.getElementById('workspace');
  if (workspace) {
    workspace.style.cssText = 'display: flex; height: calc(100vh - 56px); overflow: hidden; position: relative;';
  }

  const paramContainer = document.getElementById('param-panel');
  if (paramContainer) {
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
  let currentDieline: Dieline | null = null;
  let currentDimLines: DimensionLine[] = [];

  function switchStep(newStep: StepId) {
    if (newStep === 'mockup') {
      if (viewport) viewport.style.display = 'none';
      if (paramContainer) paramContainer.style.display = 'none';
      if (mockupContainer) {
        mockupContainer.style.display = 'flex';
        mockupContainer.style.flexDirection = 'column';
        mockupContainer.style.flex = '1';
        mockupContainer.style.height = '100%';
        mockupContainer.style.width = '100%';
      }
      mockupController?.setMode('fullscreen');
    } else if (newStep === 'dieline') {
      if (viewport) viewport.style.display = 'flex';
      if (paramContainer) paramContainer.style.display = 'flex';
      if (mockupContainer) {
        mockupContainer.style.display = 'block';
        mockupContainer.style.flex = 'none';
        mockupContainer.style.height = 'auto';
        mockupContainer.style.width = 'auto';
      }
      mockupController?.setMode('pip');
    } else if (newStep === 'export') {
      if (currentDieline) {
        openExportModal(
          store.get(),
          currentDieline,
          currentDimLines,
          () => mockupContainer?.querySelector('canvas') ?? null
        );
      }
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
    btnExport.style.cssText = `
      background: var(--color-primary);
      color: var(--color-primary-fg);
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 210, 135, 0.25);
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    `;
    btnExport.innerHTML = '<span>Xuất file</span> <span style="font-size:14px;">↓</span>';

    btnExport.addEventListener('mouseenter', () => {
      btnExport.style.transform = 'translateY(-1px)';
      btnExport.style.boxShadow = '0 4px 14px rgba(0, 210, 135, 0.35)';
    });
    btnExport.addEventListener('mouseleave', () => {
      btnExport.style.transform = 'translateY(0)';
      btnExport.style.boxShadow = '0 2px 10px rgba(0, 210, 135, 0.25)';
    });

    btnExport.addEventListener('click', () => {
      if (currentDieline) {
        openExportModal(
          store.get(),
          currentDieline,
          currentDimLines,
          () => mockupContainer?.querySelector('canvas') ?? null
        );
      }
    });
  }

  // Nút Nhập DXF / SVG trên top-bar
  const btnImport = document.createElement('button');
  btnImport.id = 'btn-import-modal';
  btnImport.type = 'button';
  btnImport.style.cssText = `
    background: #20242e;
    color: var(--text-main);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 8px 14px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    margin-right: 8px;
  `;
  btnImport.innerHTML = '<span>📥 Nhập DXF/SVG</span>';
  btnImport.addEventListener('mouseenter', () => {
    btnImport.style.background = '#282d3b';
    btnImport.style.borderColor = 'rgba(255, 255, 255, 0.22)';
  });
  btnImport.addEventListener('mouseleave', () => {
    btnImport.style.background = '#20242e';
    btnImport.style.borderColor = 'rgba(255, 255, 255, 0.12)';
  });
  btnImport.addEventListener('click', () => {
    openImporterModal((rescaledDieline, l, w, h, name) => {
      loadImportedDieline(rescaledDieline, l, w, h, name);
    });
  });

  if (btnExport && btnExport.parentElement) {
    btnExport.parentElement.insertBefore(btnImport, btnExport);
  }

  let zoomController: ZoomPanController | null = null;
  let isCustomImported = false;

  function loadImportedDieline(
    dieline: Dieline,
    l: number,
    w: number,
    h: number,
    name: string
  ) {
    isCustomImported = true;
    currentDieline = dieline;
    currentDimLines = [
      {
        start: [dieline.bbox[0], dieline.bbox[1]],
        end: [dieline.bbox[0] + dieline.bbox[2], dieline.bbox[1]],
        label: `Khổ phôi ngang: ${Math.round(dieline.bbox[2])} mm`,
        mid: [dieline.bbox[0] + dieline.bbox[2] / 2, dieline.bbox[1] - 15],
      },
      {
        start: [dieline.bbox[0] + dieline.bbox[2], dieline.bbox[1]],
        end: [dieline.bbox[0] + dieline.bbox[2], dieline.bbox[1] + dieline.bbox[3]],
        label: `Khổ phôi dọc: ${Math.round(dieline.bbox[3])} mm`,
        mid: [dieline.bbox[0] + dieline.bbox[2] + 15, dieline.bbox[1] + dieline.bbox[3] / 2],
      },
    ];

    if (metaSpan) {
      metaSpan.innerHTML = `— <b style="color:var(--color-primary);">${name}</b> (${l}×${w}×${h} mm)`;
    }

    if (viewport) {
      const svg = renderSvgView(viewport, dieline, currentDimLines, {
        cutColor: store.get().cutColor,
        creaseColor: store.get().creaseColor,
        dimColor: store.get().dimColor,
        dimFont: store.get().dimFont,
        dimFontSize: store.get().dimFontSize,
      });
      setupZoomPan(viewport, svg);
    }
  }

  function updateDielineView(s: AppDocState) {
    if (isCustomImported) return;

    if (metaSpan) {
      const mode = s.sizeType === 'outer' ? 'phủ bì' : 'lòng';
      metaSpan.textContent = `— ${s.l}×${s.w}×${s.h} mm (${mode})`;
    }

    const effectiveParams = calcEffectiveParams(s);
    const nodes = boxDef.build(effectiveParams);
    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);
    const orientedDieline = transformDieline(dieline, s.orient);
    currentDieline = orientedDieline;
    const dimLines = buildDimensionLines(boxDef.dims, layouts, { l: s.l, w: s.w, h: s.h, t: s.t, opts: s.opts }, s.unit, boxDef.id);
    currentDimLines = dimLines;

    if (viewport) {
      const svg = renderSvgView(viewport, orientedDieline, dimLines, {
        cutColor: s.cutColor,
        creaseColor: s.creaseColor,
        dimColor: s.dimColor,
        dimFont: s.dimFont,
        dimFontSize: s.dimFontSize,
      });
      if (!zoomController) {
        zoomController = setupZoomPan(viewport, svg);
      }
    }

    // Đồng bộ sang mô hình 3D
    mockupController?.updateModel(s, boxDef);
  }

  if (params.get('imported') === 'true') {
    try {
      const rawImported = sessionStorage.getItem('boxmaker:imported_dieline');
      if (rawImported) {
        const parsed = JSON.parse(rawImported);
        loadImportedDieline(parsed.dieline, parsed.l, parsed.w, parsed.h, parsed.name);
      } else {
        updateDielineView(store.get());
      }
    } catch {
      updateDielineView(store.get());
    }
  } else {
    updateDielineView(store.get());
  }

  store.subscribe(
    (s) => s,
    (s) => {
      isCustomImported = false;
      updateDielineView(s);
    }
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
