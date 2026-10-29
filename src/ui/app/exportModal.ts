// Hộp thoại xuất file kỹ thuật (Export Modal)
import type { Dieline } from '../../core/types';
import type { DimensionLine } from '../../render2d/dimensions';
import { generateAiContent } from '../../export/ai';
import { downloadText } from '../../export/download';
import { generateDxfContent } from '../../export/dxf';
import { generatePdfContent } from '../../export/pdf';
import { captureCanvasToPng } from '../../export/png';
import { generateSvgContent } from '../../export/svg';
import { el } from '../dom';
import type { AppDocState } from './paramPanel';

export function openExportModal(
  state: AppDocState,
  dieline: Dieline,
  dimLines: DimensionLine[] = [],
  get3dCanvas?: () => HTMLCanvasElement | null,
) {
  // Xoá modal cũ nếu đang mở
  const existing = document.getElementById('export-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = el('div', {
    id: 'export-modal-backdrop',
    style: `
      position: fixed;
      inset: 0;
      background: rgba(15, 17, 23, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    `,
  });

  const modal = el('div', {
    class: 'export-modal',
    style: `
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      width: 520px;
      max-width: 90vw;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `,
  });

  // Header modal
  const header = el('div', {
    style: `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-subtle);
    `,
  });

  const title = el('h2', {
    text: 'Xuất file sản xuất & Thiết kế',
    style: 'margin: 0; font-size: var(--font-size-lg); font-weight: 700; color: var(--text-primary);',
  });

  const closeBtn = el('button', {
    text: '✕',
    style: `
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: var(--font-size-lg);
      cursor: pointer;
      padding: 4px 8px;
    `,
  });
  closeBtn.addEventListener('click', () => backdrop.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  // Body: Thông tin tóm tắt khuôn bế
  const body = el('div', { style: 'padding: 20px;' });

  const [, , width, height] = dieline.bbox;
  const margin = 5;
  const sheetW = Math.round((width + margin * 2) * 10) / 10;
  const sheetH = Math.round((height + margin * 2) * 10) / 10;

  const summaryBox = el('div', {
    style: `
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: var(--font-size-sm);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    `,
  });

  summaryBox.innerHTML = `
    <div><span style="color:var(--text-muted)">Kích thước hộp:</span> <strong>${state.l} × ${state.w} × ${state.h} mm</strong></div>
    <div><span style="color:var(--text-muted)">Khổ khuôn phẳng:</span> <strong>${sheetW} × ${sheetH} mm</strong></div>
    <div><span style="color:var(--text-muted)">Độ dày giấy:</span> <strong>${state.t} mm</strong></div>
    <div><span style="color:var(--text-muted)">Quy chuẩn:</span> <strong>Lề 5mm, Layer CUT/CREASE/DIMENSION</strong></div>
  `;
  body.appendChild(summaryBox);

  // Danh sách các định dạng xuất
  const formatsList = el('div', {
    style: 'display: flex; flex-direction: column; gap: 10px;',
  });

  const baseFileName = `${state.boxId}_${state.l}x${state.w}x${state.h}mm`;

  const formats = [
    {
      ext: 'pdf',
      name: 'PDF Bế in ấn (Khuyên dùng)',
      desc: 'Layer OCG CUT/CREASE/DIMENSION, màu pha Separation CMYK, Overprint',
      action: () => {
        const content = generatePdfContent(dieline, margin, dimLines);
        downloadText(content, `${baseFileName}.pdf`, 'application/pdf');
      },
    },
    {
      ext: 'ai',
      name: 'Adobe Illustrator (.ai)',
      desc: 'Mở trực tiếp trong Illustrator, giữ nguyên layer và ghi chú kích thước',
      action: () => {
        const content = generateAiContent(dieline, margin, dimLines);
        downloadText(content, `${baseFileName}.ai`, 'application/illustrator');
      },
    },
    {
      ext: 'dxf',
      name: 'AutoCAD DXF R12 (.dxf)',
      desc: 'Bản vẽ CAD polyline liền kèm layer DIMENSION cho máy cắt bế CNC, laser',
      action: () => {
        const content = generateDxfContent(dieline, margin, dimLines);
        downloadText(content, `${baseFileName}.dxf`, 'application/dxf');
      },
    },
    {
      ext: 'svg',
      name: 'Vector SVG (.svg)',
      desc: 'File đồ họa vector chuẩn web kèm layer DIMENSION, đơn vị mm',
      action: () => {
        const content = generateSvgContent(dieline, margin, dimLines);
        downloadText(content, `${baseFileName}.svg`, 'image/svg+xml');
      },
    },
    {
      ext: 'png',
      name: 'Ảnh Mockup 3D (.png)',
      desc: 'Chụp hình ảnh hộp 3D hiện tại độ phân giải cao',
      action: () => {
        const canvas = get3dCanvas ? get3dCanvas() : null;
        if (canvas) {
          captureCanvasToPng(canvas, `${baseFileName}_mockup.png`);
        } else {
          alert('Chưa sẵn sàng trích xuất ảnh 3D.');
        }
      },
    },
  ];

  formats.forEach((fmt) => {
    const row = el('div', {
      style: `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        transition: border-color 0.15s ease;
      `,
    });

    const info = el('div');
    const nameEl = el('div', {
      text: fmt.name,
      style: 'font-weight: 600; font-size: var(--font-size-sm); color: var(--text-primary); margin-bottom: 2px;',
    });
    const descEl = el('div', {
      text: fmt.desc,
      style: 'font-size: var(--font-size-xs); color: var(--text-muted);',
    });
    info.appendChild(nameEl);
    info.appendChild(descEl);

    const btn = el('button', {
      text: 'Tải về',
      style: `
        background: var(--color-primary);
        color: var(--color-primary-fg);
        border: none;
        border-radius: var(--radius-sm);
        padding: 6px 14px;
        font-size: var(--font-size-xs);
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      `,
    });
    btn.addEventListener('click', fmt.action);

    row.appendChild(info);
    row.appendChild(btn);
    formatsList.appendChild(row);
  });

  body.appendChild(formatsList);
  modal.appendChild(body);
  backdrop.appendChild(modal);

  // Đóng khi click ra ngoài backdrop
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });

  document.body.appendChild(backdrop);
}

