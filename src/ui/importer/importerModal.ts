// Modal Nhập file DXF/SVG và Tự động Co Giãn Kích Thước Thông Minh (Smart Parametric Resizer)
import type { Dieline } from '../../core/types';
import { generateDxfContent } from '../../export/dxf';
import { generatePdfContent } from '../../export/pdf';
import { generateSvgContent } from '../../export/svg';
import {
  saveCustomTemplate,
  type CustomTemplate,
} from '../../importer/customTemplateStore';
import { generateImportedDimensions } from '../../importer/dimensionGenerator';
import { parseDxfString } from '../../importer/dxfParser';
import { autoDetectStructure, rescaleDieline } from '../../importer/parametricScaler';
import { parseSvgString } from '../../importer/svgParser';
import type { ImportedDieline } from '../../importer/types';
import type { DimensionLine } from '../../render2d/dimensions';
import { getSampleDxf, getSampleFefcoDxf, getSampleSvg } from './sampleFiles';

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Mở modal nhập file và co dãn thông minh
 * @param onOpenInStudio Callback khi người dùng nhấn "Mở trong Studio"
 * @param preloadedTemplate Mẫu tự tạo cần mở trực tiếp (tuỳ chọn)
 */
export function openImporterModal(
  onOpenInStudio?: (dieline: Dieline, l: number, w: number, h: number, name: string) => void,
  preloadedTemplate?: CustomTemplate
) {
  const existingModal = document.getElementById('importer-modal-backdrop');
  if (existingModal) {
    existingModal.remove();
  }

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'importer-modal-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(10, 12, 16, 0.75);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;

  // Dialog Container
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    width: 100%;
    max-width: 1140px;
    height: 90vh;
    max-height: 820px;
    background: #161922;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: scale(0.97);
    transition: transform 0.2s ease;
    position: relative;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: #1c202b;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  `;
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(0, 210, 135, 0.12); border: 1px solid rgba(0, 210, 135, 0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">📥</div>
      <div>
        <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
          Nhập Bản Vẽ DXF / SVG & Co Giãn Thông Minh (No-Code)
          <span style="font-size: 11px; background: #00d287; color: #000; padding: 2px 7px; border-radius: 9999px; font-weight: 800;">TỰ ĐỘNG</span>
        </h2>
        <p style="margin: 3px 0 0; font-size: 12px; color: #94a3b8;">
          Hệ thống tự động phát hiện cấu trúc $L_0, W_0, H_0$ và co dãn thông minh: bảo toàn 100% lưỡi dán, tai gài và khoá đáy không bị méo lệch.
        </p>
      </div>
    </div>
    <button id="modal-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 6px; border-radius: 8px; line-height: 1; transition: color 0.15s ease;">✕</button>
  `;

  // Body Layout (2 Columns: Controls on left, Live Canvas Preview on right)
  const body = document.createElement('div');
  body.style.cssText = `
    flex: 1;
    display: flex;
    overflow: hidden;
  `;

  // Left Sidebar (Controls)
  const leftCol = document.createElement('div');
  leftCol.style.cssText = `
    width: 380px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    background: #181b24;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  `;

  // Right Viewport (Canvas Preview)
  const rightCol = document.createElement('div');
  rightCol.style.cssText = `
    flex: 1;
    background: #0d0f14;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  `;

  body.appendChild(leftCol);
  body.appendChild(rightCol);
  dialog.appendChild(header);
  dialog.appendChild(body);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  // Smooth entrance
  requestAnimationFrame(() => {
    backdrop.style.opacity = '1';
    dialog.style.transform = 'scale(1)';
  });

  const closeModal = () => {
    backdrop.style.opacity = '0';
    dialog.style.transform = 'scale(0.97)';
    setTimeout(() => backdrop.remove(), 200);
  };

  header.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // ===================== STATE =====================
  let currentImported: ImportedDieline | null = null;
  let currentRawContent = '';
  let currentDimLines: DimensionLine[] = [];
  let showDimensions = true;
  let targetL = 100;
  let targetW = 60;
  let targetH = 160;
  let currentRescaledDieline: Dieline | null = null;

  // ===================== LEFT SIDEBAR UI =====================
  // 1. Dropzone & Sample selection
  const uploadSection = document.createElement('div');
  uploadSection.innerHTML = `
    <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">1. Chọn hoặc kéo thả file bản vẽ</div>
    <div id="dropzone" style="
      border: 2px dashed rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: all 0.2s ease;
    ">
      <div style="font-size: 24px; margin-bottom: 6px;">📂</div>
      <div style="font-size: 13px; font-weight: 600; color: #f1f5f9;">Kéo thả file .DXF hoặc .SVG vào đây</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Hoặc bấm để tải từ máy tính (AutoCAD, Illustrator, ...)</div>
      <input type="file" id="file-input" accept=".dxf,.svg" style="display: none;" />
    </div>

    <div style="display: flex; gap: 6px; margin-top: 10px;">
      <button id="btn-sample-dxf" type="button" style="
        flex: 1;
        padding: 6px 6px;
        background: #232733;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #cbd5e1;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      ">📦 Hộp Gài</button>
      <button id="btn-sample-fefco" type="button" style="
        flex: 1;
        padding: 6px 6px;
        background: #232733;
        border: 1px solid rgba(0, 210, 135, 0.3);
        border-radius: 6px;
        color: #00d287;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
      ">📦 Thùng A1</button>
      <button id="btn-sample-svg" type="button" style="
        flex: 1;
        padding: 6px 6px;
        background: #232733;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #cbd5e1;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      ">🎁 Đáy Khoá</button>
    </div>
  `;
  leftCol.appendChild(uploadSection);

  // 2. Info Card (Detected Dimensions)
  const infoCard = document.createElement('div');
  infoCard.id = 'detected-info-card';
  infoCard.style.cssText = `
    background: rgba(0, 210, 135, 0.06);
    border: 1px solid rgba(0, 210, 135, 0.2);
    border-radius: 10px;
    padding: 12px 14px;
    display: none;
  `;
  leftCol.appendChild(infoCard);

  // 3. Rescaling Form (Sliders + Inputs)
  const resizeSection = document.createElement('div');
  resizeSection.id = 'resize-section';
  resizeSection.style.cssText = 'display: none; flex-direction: column; gap: 14px;';
  resizeSection.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">2. Kích thước mong muốn (mm)</div>
      <button id="btn-reset-dims" style="background: none; border: none; color: #00d287; font-size: 11px; font-weight: 600; cursor: pointer; text-decoration: underline;">↺ Về kích thước gốc</button>
    </div>

    <!-- Dài (L) -->
    <div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
        <span>Chiều dài (L)</span>
        <span style="font-weight: 700; color: #ffffff;"><input id="input-l" type="number" min="20" max="800" style="width: 60px; background: #20242e; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; color: #fff; padding: 2px 6px; font-size: 12px; text-align: right;" /> mm</span>
      </div>
      <input id="slider-l" type="range" min="30" max="400" step="1" style="width: 100%; accent-color: #00d287;" />
    </div>

    <!-- Rộng (W) -->
    <div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
        <span>Chiều rộng (W)</span>
        <span style="font-weight: 700; color: #ffffff;"><input id="input-w" type="number" min="20" max="600" style="width: 60px; background: #20242e; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; color: #fff; padding: 2px 6px; font-size: 12px; text-align: right;" /> mm</span>
      </div>
      <input id="slider-w" type="range" min="20" max="300" step="1" style="width: 100%; accent-color: #00d287;" />
    </div>

    <!-- Cao (H) -->
    <div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
        <span>Chiều cao (H)</span>
        <span style="font-weight: 700; color: #ffffff;"><input id="input-h" type="number" min="20" max="1000" style="width: 60px; background: #20242e; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; color: #fff; padding: 2px 6px; font-size: 12px; text-align: right;" /> mm</span>
      </div>
      <input id="slider-h" type="range" min="30" max="500" step="1" style="width: 100%; accent-color: #00d287;" />
    </div>

    <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 8px; padding: 10px; font-size: 11px; color: #93c5fd; line-height: 1.4;">
      🛡️ <b>Bảo toàn nắp gài & đáy:</b> Chỉ các panel thân chính co giãn theo $L, W, H$. Các nắp tai gài, rãnh khuyết và lưỡi dán giữ nguyên chuẩn cơ khí để đóng hộp vừa khít.
    </div>
  `;
  leftCol.appendChild(resizeSection);

  // 4. Action Buttons (Export & Studio & Save Template)
  const actionSection = document.createElement('div');
  actionSection.id = 'action-section';
  actionSection.style.cssText = 'display: none; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08);';
  actionSection.innerHTML = `
    <button id="btn-save-template" type="button" style="
      width: 100%;
      padding: 9px;
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 8px;
      font-weight: 700;
      font-size: 12.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s ease;
    ">💾 Lưu Vào Thư Viện Mẫu Của Bạn</button>

    <button id="btn-open-studio" style="
      width: 100%;
      padding: 10px;
      background: #00d287;
      color: #000000;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0, 210, 135, 0.3);
      transition: all 0.15s ease;
    ">🚀 Mở Trong Studio</button>

    <div style="display: flex; gap: 6px;">
      <button id="btn-export-dxf" style="flex: 1; padding: 8px; background: #232733; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: #ffffff; font-size: 12px; font-weight: 600; cursor: pointer;">Tải DXF</button>
      <button id="btn-export-svg" style="flex: 1; padding: 8px; background: #232733; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: #ffffff; font-size: 12px; font-weight: 600; cursor: pointer;">Tải SVG</button>
      <button id="btn-export-pdf" style="flex: 1; padding: 8px; background: #232733; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: #ffffff; font-size: 12px; font-weight: 600; cursor: pointer;">Tải PDF</button>
    </div>
  `;
  leftCol.appendChild(actionSection);

  // ===================== RIGHT VIEWPORT UI =====================
  const previewCanvasContainer = document.createElement('div');
  previewCanvasContainer.style.cssText = `
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    box-sizing: border-box;
    position: relative;
    background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 20px 20px;
  `;

  // Status bottom bar on right viewport
  const previewStatusBar = document.createElement('div');
  previewStatusBar.style.cssText = `
    position: absolute;
    bottom: 14px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(22, 25, 34, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 12px;
    color: #94a3b8;
    backdrop-filter: blur(6px);
  `;
  previewStatusBar.innerHTML = `
    <div style="display: flex; gap: 16px; align-items: center;">
      <span style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 12px; height: 2px; background: #2563eb; display: inline-block;"></span> Đường cắt (Cut)
      </span>
      <span style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 12px; height: 2px; border-top: 2px dashed #ef4444; display: inline-block;"></span> Nếp cấn (Crease)
      </span>
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: #38bdf8; font-weight: 600; font-size: 11.5px; margin-left: 6px;">
        <input type="checkbox" id="toggle-dims" checked style="accent-color: #00d287; cursor: pointer;" />
        Kích thước đo (DIM)
      </label>
    </div>
    <div id="envelope-info" style="font-weight: 600; color: #f8fafc;">Khổ trải: — mm</div>
  `;

  rightCol.appendChild(previewCanvasContainer);
  rightCol.appendChild(previewStatusBar);

  // ===================== SAVE TEMPLATE IN-MODAL POPUP =====================
  const saveDialog = document.createElement('div');
  saveDialog.id = 'save-template-dialog';
  saveDialog.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 12, 16, 0.85);
    backdrop-filter: blur(5px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  saveDialog.innerHTML = `
    <div style="
      background: #1c202b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      width: 420px;
      max-width: 90%;
      padding: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      gap: 16px;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
          💾 Lưu Vào Thư Viện Mẫu
        </h3>
        <button id="btn-close-save-dialog" type="button" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px; line-height: 1;">✕</button>
      </div>
      <p style="margin: 0; font-size: 12.5px; color: #94a3b8; line-height: 1.5;">
        Mẫu hộp này sẽ được lưu vào tab <b>⭐ Mẫu của tôi</b>. Lần tới bạn chỉ cần bấm vào mẫu để thay đổi kích thước và tải về ngay lập tức.
      </p>
      <div>
        <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; margin-bottom: 6px;">Tên mẫu hộp</label>
        <input id="input-template-name" type="text" style="width: 100%; box-sizing: border-box; background: #141720; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; color: #fff; padding: 9px 12px; font-size: 13px;" placeholder="Ví dụ: Thùng carton đóng hàng công ty" />
      </div>
      <div>
        <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; margin-bottom: 6px;">Mã khuôn / Ký hiệu</label>
        <input id="input-template-code" type="text" style="width: 100%; box-sizing: border-box; background: #141720; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; color: #fff; padding: 9px 12px; font-size: 13px;" placeholder="Ví dụ: CTY-A1-01" />
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
        <button id="btn-cancel-save" type="button" style="padding: 9px 16px; background: #232733; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: #cbd5e1; font-size: 12.5px; font-weight: 600; cursor: pointer;">Huỷ</button>
        <button id="btn-confirm-save" type="button" style="padding: 9px 20px; background: #00d287; border: none; border-radius: 6px; color: #000; font-size: 12.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 210, 135, 0.3);">Lưu Mẫu Ngay</button>
      </div>
    </div>
  `;
  dialog.appendChild(saveDialog);

  function showToast(message: string) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #00d287;
      color: #052e16;
      padding: 10px 22px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 10px 25px -5px rgba(0, 210, 135, 0.4);
      z-index: 2000;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    toast.textContent = message;
    dialog.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ===================== LOGIC & RENDERING =====================
  function renderLiveDieline() {
    if (!currentImported) return;

    const rescaled = rescaleDieline(currentImported, targetL, targetW, targetH);
    currentRescaledDieline = rescaled;

    // Sinh chuỗi kích thước kỹ thuật CAD tự động theo các panel
    currentDimLines = generateImportedDimensions(
      currentImported.structure,
      targetL,
      targetW,
      targetH,
      rescaled.bbox
    );

    previewCanvasContainer.innerHTML = '';
    let bMinX = rescaled.bbox[0];
    let bMinY = rescaled.bbox[1];
    let bMaxX = rescaled.bbox[0] + rescaled.bbox[2];
    let bMaxY = rescaled.bbox[1] + rescaled.bbox[3];

    if (showDimensions && currentDimLines.length > 0) {
      for (const d of currentDimLines) {
        bMinX = Math.min(bMinX, d.start[0], d.end[0], d.mid[0] - 14);
        bMinY = Math.min(bMinY, d.start[1], d.end[1], d.mid[1] - 10);
        bMaxX = Math.max(bMaxX, d.start[0], d.end[0], d.mid[0] + 14);
        bMaxY = Math.max(bMaxY, d.start[1], d.end[1], d.mid[1] + 10);
      }
    }

    const padding = Math.max(bMaxX - bMinX, bMaxY - bMinY) * 0.05;
    const vbX = bMinX - padding;
    const vbY = bMinY - padding;
    const vbW = bMaxX - bMinX + padding * 2;
    const vbH = bMaxY - bMinY + padding * 2;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    let cutD = '';
    for (const seg of rescaled.cut) {
      cutD += `M ${seg.a[0]} ${seg.a[1]} L ${seg.b[0]} ${seg.b[1]} `;
    }

    let creaseD = '';
    for (const seg of rescaled.crease) {
      creaseD += `M ${seg.a[0]} ${seg.a[1]} L ${seg.b[0]} ${seg.b[1]} `;
    }

    const strokeW = Math.max(0.5, Math.max(vbW, vbH) * 0.003);

    const creasePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    creasePath.setAttribute('d', creaseD);
    creasePath.setAttribute('stroke', '#ef4444');
    creasePath.setAttribute('stroke-width', strokeW.toString());
    creasePath.setAttribute('stroke-dasharray', `${strokeW * 3},${strokeW * 2}`);
    creasePath.setAttribute('fill', 'none');

    const cutPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    cutPath.setAttribute('d', cutD);
    cutPath.setAttribute('stroke', '#2563eb');
    cutPath.setAttribute('stroke-width', strokeW.toString());
    cutPath.setAttribute('fill', 'none');

    svg.appendChild(creasePath);
    svg.appendChild(cutPath);

    // Vẽ Kích thước kỹ thuật (DIM) nếu bật
    if (showDimensions && currentDimLines.length > 0) {
      const dimGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      dimGroup.setAttribute('id', 'dim-layer');
      const dimStrokeW = Math.max(0.4, strokeW * 0.7);
      const fontSize = Math.max(8, Math.min(13, vbW * 0.016));

      for (const line of currentDimLines) {
        const lEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lEl.setAttribute('x1', line.start[0].toString());
        lEl.setAttribute('y1', line.start[1].toString());
        lEl.setAttribute('x2', line.end[0].toString());
        lEl.setAttribute('y2', line.end[1].toString());
        lEl.setAttribute('stroke', '#94a3b8');
        lEl.setAttribute('stroke-width', dimStrokeW.toString());
        dimGroup.appendChild(lEl);

        if (line.label) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', line.mid[0].toString());
          text.setAttribute('y', line.mid[1].toString());
          text.setAttribute('fill', '#f1f5f9');
          text.setAttribute('font-size', fontSize.toString());
          text.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
          text.setAttribute('font-weight', '600');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.textContent = line.label;
          dimGroup.appendChild(text);
        }
      }
      svg.appendChild(dimGroup);
    }

    previewCanvasContainer.appendChild(svg);

    // Update bottom status info
    const envInfo = document.getElementById('envelope-info');
    if (envInfo) {
      envInfo.textContent = `Khổ trải phôi: ${Math.round(rescaled.bbox[2])} × ${Math.round(rescaled.bbox[3])} mm | L×W×H: ${targetL}×${targetW}×${targetH} mm`;
    }
  }

  function handleLoadedFile(name: string, content: string, type: 'dxf' | 'svg') {
    currentRawContent = content;
    let segments;
    let bbox;

    if (type === 'dxf') {
      const parsed = parseDxfString(content);
      segments = parsed.segments;
      bbox = parsed.bbox;
    } else {
      const parsed = parseSvgString(content);
      segments = parsed.segments;
      bbox = parsed.bbox;
    }

    if (segments.length === 0) {
      alert('Không tìm thấy đường cắt hoặc đường cấn nào trong file đã chọn.');
      return;
    }

    const structure = autoDetectStructure(segments, bbox);
    currentImported = {
      name,
      sourceType: type,
      segments,
      bbox,
      structure,
    };

    targetL = structure.l0;
    targetW = structure.w0;
    targetH = structure.h0;

    // Hiển thị info card
    infoCard.style.display = 'block';
    const cutCount = segments.filter((s) => s.type === 'cut').length;
    const creaseCount = segments.filter((s) => s.type === 'crease').length;
    const boxTypeBadge = structure.isRSCFlap
      ? '<span style="background: rgba(0,210,135,0.15); color: #00d287; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 6px;">THÙNG CARTON A1 / RSC</span>'
      : '<span style="background: rgba(37,99,235,0.15); color: #93c5fd; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 6px;">HỘP GÀI / FOLDING CARTON</span>';

    infoCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #00d287; text-transform: uppercase;">✓ Đã lọc layer & Nhận diện chuẩn</span>
        <span style="font-size: 11px; color: #94a3b8;">${name}</span>
      </div>
      <div style="font-size: 12px; color: #e2e8f0; line-height: 1.5;">
        Kích thước gốc: <b>L=${structure.l0} × W=${structure.w0} × H=${structure.h0} mm</b> ${boxTypeBadge}<br/>
        Lưỡi dán: <b>${structure.glueWidth} mm</b> | Cắt: <b>${cutCount}</b> đoạn | Cấn: <b>${creaseCount}</b> nếp<br/>
        Khổ phôi chuẩn: <b>${Math.round(bbox[2])} × ${Math.round(bbox[3])} mm</b>
      </div>
    `;

    // Hiển thị form co giãn
    resizeSection.style.display = 'flex';
    actionSection.style.display = 'flex';

    // Cập nhật giá trị vào inputs & sliders
    syncInputs();

    // Render bản vẽ
    renderLiveDieline();
  }

  function syncInputs() {
    const inputL = document.getElementById('input-l') as HTMLInputElement | null;
    const inputW = document.getElementById('input-w') as HTMLInputElement | null;
    const inputH = document.getElementById('input-h') as HTMLInputElement | null;
    const sliderL = document.getElementById('slider-l') as HTMLInputElement | null;
    const sliderW = document.getElementById('slider-w') as HTMLInputElement | null;
    const sliderH = document.getElementById('slider-h') as HTMLInputElement | null;

    if (inputL) inputL.value = targetL.toString();
    if (sliderL) sliderL.value = targetL.toString();
    if (inputW) inputW.value = targetW.toString();
    if (sliderW) sliderW.value = targetW.toString();
    if (inputH) inputH.value = targetH.toString();
    if (sliderH) sliderH.value = targetH.toString();
  }

  // File Dropzone Event Listeners
  const dropzone = uploadSection.querySelector('#dropzone') as HTMLElement;
  const fileInput = uploadSection.querySelector('#file-input') as HTMLInputElement;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#00d287';
    dropzone.style.background = 'rgba(0, 210, 135, 0.08)';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.16)';
    dropzone.style.background = 'rgba(255, 255, 255, 0.02)';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(255, 255, 255, 0.16)';
    dropzone.style.background = 'rgba(255, 255, 255, 0.02)';

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      processFile(fileInput.files[0]);
    }
  });

  function processFile(file: File) {
    const reader = new FileReader();
    const isSvg = file.name.toLowerCase().endsWith('.svg');
    const isDxf = file.name.toLowerCase().endsWith('.dxf');

    if (!isSvg && !isDxf) {
      alert('Vui lòng chọn file định dạng .DXF hoặc .SVG');
      return;
    }

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        handleLoadedFile(file.name, text, isDxf ? 'dxf' : 'svg');
      }
    };
    reader.readAsText(file);
  }

  // Quick Samples
  uploadSection.querySelector('#btn-sample-dxf')?.addEventListener('click', () => {
    const sample = getSampleDxf();
    handleLoadedFile(sample.name, sample.content, 'dxf');
  });

  uploadSection.querySelector('#btn-sample-fefco')?.addEventListener('click', () => {
    const sample = getSampleFefcoDxf();
    handleLoadedFile(sample.name, sample.content, 'dxf');
  });

  uploadSection.querySelector('#btn-sample-svg')?.addEventListener('click', () => {
    const sample = getSampleSvg();
    handleLoadedFile(sample.name, sample.content, 'svg');
  });

  // Slider & Input Change Listeners
  const bindDimensionEvents = (
    inputId: string,
    sliderId: string,
    setter: (val: number) => void
  ) => {
    const input = resizeSection.querySelector(`#${inputId}`) as HTMLInputElement | null;
    const slider = resizeSection.querySelector(`#${sliderId}`) as HTMLInputElement | null;

    if (input && slider) {
      input.addEventListener('input', () => {
        const val = Number(input.value);
        if (!isNaN(val) && val > 0) {
          setter(val);
          slider.value = val.toString();
          renderLiveDieline();
        }
      });
      slider.addEventListener('input', () => {
        const val = Number(slider.value);
        setter(val);
        input.value = val.toString();
        renderLiveDieline();
      });
    }
  };

  bindDimensionEvents('input-l', 'slider-l', (v) => (targetL = v));
  bindDimensionEvents('input-w', 'slider-w', (v) => (targetW = v));
  bindDimensionEvents('input-h', 'slider-h', (v) => (targetH = v));

  resizeSection.querySelector('#btn-reset-dims')?.addEventListener('click', () => {
    if (currentImported) {
      targetL = currentImported.structure.l0;
      targetW = currentImported.structure.w0;
      targetH = currentImported.structure.h0;
      syncInputs();
      renderLiveDieline();
    }
  });

  // Toggle Hiển thị kích thước (DIM)
  previewStatusBar.querySelector('#toggle-dims')?.addEventListener('change', (e) => {
    showDimensions = (e.target as HTMLInputElement).checked;
    renderLiveDieline();
  });

  // Save Template Dialog Events
  actionSection.querySelector('#btn-save-template')?.addEventListener('click', () => {
    if (!currentImported) return;
    const nameInput = saveDialog.querySelector('#input-template-name') as HTMLInputElement | null;
    const codeInput = saveDialog.querySelector('#input-template-code') as HTMLInputElement | null;

    if (nameInput) {
      nameInput.value = currentImported.name.replace(/\.[^/.]+$/, '');
    }
    if (codeInput) {
      const prefix = currentImported.structure.isRSCFlap ? 'A1' : 'HG';
      codeInput.value = `CTY-${prefix}-${Math.floor(Math.random() * 90 + 10)}`;
    }

    saveDialog.style.display = 'flex';
  });

  saveDialog.querySelector('#btn-close-save-dialog')?.addEventListener('click', () => {
    saveDialog.style.display = 'none';
  });

  saveDialog.querySelector('#btn-cancel-save')?.addEventListener('click', () => {
    saveDialog.style.display = 'none';
  });

  saveDialog.querySelector('#btn-confirm-save')?.addEventListener('click', () => {
    if (!currentImported || !currentRescaledDieline) return;

    const nameInput = saveDialog.querySelector('#input-template-name') as HTMLInputElement | null;
    const codeInput = saveDialog.querySelector('#input-template-code') as HTMLInputElement | null;

    const name = nameInput?.value.trim() || currentImported.name;
    const code = codeInput?.value.trim() || 'CTY-BOX';

    saveCustomTemplate({
      name,
      code,
      sourceType: currentImported.sourceType,
      rawContent: currentRawContent,
      segments: currentImported.segments,
      bbox: currentImported.bbox,
      structure: currentImported.structure,
      defaults: {
        l: targetL,
        w: targetW,
        h: targetH,
      },
    });

    saveDialog.style.display = 'none';
    showToast('✓ Đã lưu mẫu vào "⭐ Mẫu của tôi" thành công!');
  });

  // Export Buttons (Bao gồm đầy đủ các đường đo kích thước kỹ thuật CAD trên layer DIMENSION)
  actionSection.querySelector('#btn-export-dxf')?.addEventListener('click', () => {
    if (!currentRescaledDieline || !currentImported) return;
    const content = generateDxfContent(currentRescaledDieline, 5, currentDimLines);
    const filename = `${currentImported.name.replace(/\.[^/.]+$/, '')}_L${targetL}xW${targetW}xH${targetH}.dxf`;
    downloadBlob(filename, content, 'application/dxf');
  });

  actionSection.querySelector('#btn-export-svg')?.addEventListener('click', () => {
    if (!currentRescaledDieline || !currentImported) return;
    const content = generateSvgContent(currentRescaledDieline, 5, currentDimLines);
    const filename = `${currentImported.name.replace(/\.[^/.]+$/, '')}_L${targetL}xW${targetW}xH${targetH}.svg`;
    downloadBlob(filename, content, 'image/svg+xml');
  });

  actionSection.querySelector('#btn-export-pdf')?.addEventListener('click', () => {
    if (!currentRescaledDieline || !currentImported) return;
    const content = generatePdfContent(currentRescaledDieline, 5, currentDimLines);
    const filename = `${currentImported.name.replace(/\.[^/.]+$/, '')}_L${targetL}xW${targetW}xH${targetH}.pdf`;
    downloadBlob(filename, content, 'application/pdf');
  });

  actionSection.querySelector('#btn-open-studio')?.addEventListener('click', () => {
    if (!currentRescaledDieline || !currentImported) return;

    const importedObj = {
      name: currentImported.name,
      sourceType: currentImported.sourceType,
      segments: currentImported.segments,
      bbox: currentImported.bbox,
      structure: currentImported.structure,
    };

    // Lưu vào sessionStorage để Studio mở ngay lập tức kèm cấu trúc để hiển thị kích thước
    sessionStorage.setItem(
      'boxmaker:imported_dieline',
      JSON.stringify({
        name: currentImported.name,
        dieline: currentRescaledDieline,
        structure: currentImported.structure,
        l: targetL,
        w: targetW,
        h: targetH,
        rawImported: importedObj,
      })
    );

    if (onOpenInStudio) {
      onOpenInStudio(currentRescaledDieline, targetL, targetW, targetH, currentImported.name);
      closeModal();
    } else {
      window.location.href = `/app.html?imported=true`;
    }
  });

  // Khởi tạo: Mở mẫu được truyền vào hoặc mẫu mặc định
  if (preloadedTemplate) {
    handleLoadedFile(preloadedTemplate.name, preloadedTemplate.rawContent, preloadedTemplate.sourceType);
    targetL = preloadedTemplate.defaults.l;
    targetW = preloadedTemplate.defaults.w;
    targetH = preloadedTemplate.defaults.h;
    syncInputs();
    renderLiveDieline();
  } else {
    const defaultSample = getSampleDxf();
    handleLoadedFile(defaultSample.name, defaultSample.content, 'dxf');
  }
}
