import '../styles/base.css';
import { getAllBoxes } from '../boxes';
import {
  deleteCustomTemplate,
  getCustomTemplates,
  type CustomTemplate,
} from '../importer/customTemplateStore';
import { rescaleDieline } from '../importer/parametricScaler';
import type { ImportedDieline } from '../importer/types';
import { openImporterModal } from '../ui/importer/importerModal';
import { renderCardGrid } from '../ui/templates/cardGrid';
import { createFilterBar } from '../ui/templates/filterBar';

function generateCustomThumbnailSvg(tmpl: CustomTemplate): SVGSVGElement {
  const importedObj: ImportedDieline = {
    name: tmpl.name,
    sourceType: tmpl.sourceType,
    segments: tmpl.segments,
    bbox: tmpl.bbox,
    structure: tmpl.structure,
  };
  const rescaled = rescaleDieline(importedObj, tmpl.defaults.l, tmpl.defaults.w, tmpl.defaults.h);
  const [minX, minY, width, height] = rescaled.bbox;
  const padding = Math.max(width, height) * 0.08;
  const vbX = minX - padding;
  const vbY = minY - padding;
  const vbW = width + padding * 2;
  const vbH = height + padding * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.display = 'block';

  let cutD = '';
  let creaseD = '';
  for (const seg of rescaled.cut) {
    cutD += `M ${seg.a[0]} ${seg.a[1]} L ${seg.b[0]} ${seg.b[1]} `;
  }
  for (const seg of rescaled.crease) {
    creaseD += `M ${seg.a[0]} ${seg.a[1]} L ${seg.b[0]} ${seg.b[1]} `;
  }

  const strokeW = Math.max(0.6, Math.max(vbW, vbH) * 0.005);

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
  return svg;
}

function renderCustomGrid(container: HTMLElement, onReload: () => void) {
  container.innerHTML = '';
  container.style.cssText =
    'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;';

  const customTemplates = getCustomTemplates();
  if (customTemplates.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = `
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 24px;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    `;
    empty.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 12px;">📁</div>
      <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Chưa có mẫu hộp tự lưu nào</h3>
      <p style="font-size: 14px; color: #64748b; max-width: 520px; margin: 0 auto 20px; line-height: 1.5;">
        Bạn có thể tải file khuôn .DXF từ AutoCAD hoặc .SVG từ Illustrator của công ty bạn lên. Hệ thống sẽ nhận diện cấu trúc và lưu vào thư viện riêng này để bạn co giãn theo kích thước tiêu chuẩn và tải về bất kỳ lúc nào.
      </p>
      <button id="btn-empty-import" type="button" style="
        background: #00d287;
        color: #000;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0, 210, 135, 0.25);
      ">📥 Tải file mẫu DXF / SVG đầu tiên lên</button>
    `;
    empty.querySelector('#btn-empty-import')?.addEventListener('click', () => {
      openImporterModal();
    });
    container.appendChild(empty);
    return;
  }

  customTemplates.forEach((tmpl) => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    `;

    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#6ee7b7';
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 10px 20px -5px rgba(0, 210, 135, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.03)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '#e2e8f0';
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
    });

    // Thumbnail Preview container
    const thumbWrap = document.createElement('div');
    thumbWrap.style.cssText = `
      height: 185px;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      position: relative;
    `;
    const svgEl = generateCustomThumbnailSvg(tmpl);
    thumbWrap.appendChild(svgEl);

    // Source badge (DXF or SVG)
    const srcBadge = document.createElement('span');
    srcBadge.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      background: #1e293b;
      color: #38bdf8;
      padding: 2px 6px;
      border-radius: 4px;
    `;
    srcBadge.textContent = tmpl.sourceType.toUpperCase();
    thumbWrap.appendChild(srcBadge);

    // Delete Button
    const delBtn = document.createElement('button');
    delBtn.title = 'Xoá mẫu này';
    delBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 6px;
      color: #ef4444;
      font-size: 13px;
      cursor: pointer;
      padding: 3px 6px;
      line-height: 1;
      transition: all 0.15s ease;
    `;
    delBtn.innerHTML = '🗑️';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Bạn có chắc chắn muốn xoá mẫu "${tmpl.name}" khỏi thư viện không?`)) {
        deleteCustomTemplate(tmpl.id);
        onReload();
      }
    });
    thumbWrap.appendChild(delBtn);

    // Body
    const body = document.createElement('div');
    body.style.cssText = 'padding: 16px; display: flex; flex-direction: column; flex: 1;';

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;';
    headerRow.innerHTML = `
      <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3;">${tmpl.name}</h3>
      <span style="font-size: 11px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 7px; border-radius: 4px; font-weight: 700; white-space: nowrap;">${tmpl.code || 'MẪU TỰ TẠO'}</span>
    `;

    const specs = document.createElement('div');
    specs.style.cssText = 'font-size: 12.5px; color: #64748b; line-height: 1.5; margin-bottom: 16px;';
    const boxTypeStr = tmpl.structure.isRSCFlap ? 'Thùng carton A1 / RSC' : 'Hộp gài folding carton';
    const isCustomized =
      tmpl.defaults.l !== tmpl.structure.l0 ||
      tmpl.defaults.w !== tmpl.structure.w0 ||
      tmpl.defaults.h !== tmpl.structure.h0;

    const blankW = Math.round(tmpl.structure.glueWidth + 2 * tmpl.defaults.l + 2 * tmpl.defaults.w);
    const flapH = tmpl.structure.isRSCFlap
      ? tmpl.defaults.w / 2
      : (tmpl.structure.yTop - tmpl.structure.minY);
    const botFlapH = tmpl.structure.isRSCFlap
      ? tmpl.defaults.w / 2
      : (tmpl.structure.maxY - tmpl.structure.yBottom);
    const blankH = Math.round(flapH + tmpl.defaults.h + botFlapH);

    specs.innerHTML = `
      <div>Loại: <b>${boxTypeStr}</b></div>
      <div>Kích thước gốc: <b>${tmpl.structure.l0} × ${tmpl.structure.w0} × ${tmpl.structure.h0} mm</b></div>
      ${isCustomized ? `<div style="color: #059669; font-weight: 600;">Đã co giãn: <b>${tmpl.defaults.l} × ${tmpl.defaults.w} × ${tmpl.defaults.h} mm</b></div>` : ''}
      <div>Khổ phôi: <b>${blankW} × ${blankH} mm</b> | Lưỡi: <b>${tmpl.structure.glueWidth}mm</b></div>
    `;

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 8px; margin-top: auto;';
    actions.innerHTML = `
      <button class="btn-rescale" type="button" style="
        flex: 1;
        padding: 8px 12px;
        background: #00d287;
        color: #000;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 1px 4px rgba(0, 210, 135, 0.3);
      ">✂ Co giãn & Tải về</button>
      <button class="btn-studio" type="button" style="
        padding: 8px 12px;
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      ">Studio</button>
    `;

    actions.querySelector('.btn-rescale')?.addEventListener('click', () => {
      openImporterModal(undefined, tmpl);
    });

    actions.querySelector('.btn-studio')?.addEventListener('click', () => {
      const importedObj: ImportedDieline = {
        name: tmpl.name,
        sourceType: tmpl.sourceType,
        segments: tmpl.segments,
        bbox: tmpl.bbox,
        structure: tmpl.structure,
      };
      // Co giãn dieline về chính xác kích thước đã lưu để dieline khớp 100% với DIM
      const rescaled = rescaleDieline(importedObj, tmpl.defaults.l, tmpl.defaults.w, tmpl.defaults.h);

      sessionStorage.setItem(
        'boxmaker:imported_dieline',
        JSON.stringify({
          name: tmpl.name,
          dieline: rescaled,
          structure: tmpl.structure,
          l: tmpl.defaults.l,
          w: tmpl.defaults.w,
          h: tmpl.defaults.h,
          rawImported: importedObj,
        })
      );
      window.location.href = '/app.html?imported=true';
    });

    body.appendChild(headerRow);
    body.appendChild(specs);
    body.appendChild(actions);

    card.appendChild(thumbWrap);
    card.appendChild(body);
    container.appendChild(card);
  });
}

// Điểm vào trang thư viện mẫu: hiển thị lưới mẫu hộp và bộ lọc
function initTemplatesPage() {
  const allBoxes = getAllBoxes();
  let currentCategory = 'all';

  const filterContainer = document.getElementById('filter-bar');
  const gridContainer = document.getElementById('card-grid');

  // Header & Container styling
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 32px 24px; min-height: 100vh;';
  }

  const header = document.querySelector('header');
  if (header) {
    header.style.cssText = 'margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px;';
    const backLink = header.querySelector('a');
    if (backLink) {
      backLink.style.cssText =
        'display: inline-block; margin-bottom: 12px; color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none;';
    }
    const h1 = header.querySelector('h1');
    if (h1) {
      h1.style.cssText = 'font-size: var(--font-size-2xl); font-weight: 700; color: var(--text-primary); margin: 0;';
    }
  }

  // Banner Nhập file DXF/SVG thông minh (No-Code Importer)
  const main = document.querySelector('main');
  if (main && !document.getElementById('importer-hero-banner')) {
    const banner = document.createElement('div');
    banner.id = 'importer-hero-banner';
    banner.style.cssText = `
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(0, 210, 135, 0.08) 100%);
      border: 1px solid rgba(0, 210, 135, 0.25);
      border-radius: 14px;
      padding: 18px 24px;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    `;
    banner.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; background: #00d287; color: #000; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">Mới: No-Code Importer</span>
          <span style="font-size: 14px; font-weight: 700; color: #0f172a;">Tự do thêm mẫu thùng & co giãn không cần viết code</span>
        </div>
        <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; max-width: 720px;">
          Bạn có sẵn file khuôn từ khách hàng hoặc phần mềm CAD? Tải lên trực tiếp (.DXF từ AutoCAD hoặc .SVG từ Illustrator), hệ thống sẽ tự động phát hiện $L_0, W_0, H_0$ và co dãn thông minh bảo toàn 100% lưỡi dán, tai gài, đáy khoá.
        </p>
      </div>
      <button id="btn-banner-import" type="button" style="
        background: #00d287;
        color: #000;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0, 210, 135, 0.25);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      ">📥 Nhập file DXF / SVG ngay</button>
    `;

    const btn = banner.querySelector('#btn-banner-import') as HTMLButtonElement | null;
    if (btn) {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 4px 12px rgba(0, 210, 135, 0.35)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 2px 8px rgba(0, 210, 135, 0.25)';
      });
      btn.addEventListener('click', () => {
        openImporterModal(() => updateView());
      });
    }

    main.insertBefore(banner, main.firstChild);
  }

  function updateView() {
    if (filterContainer) {
      createFilterBar(filterContainer, currentCategory, (newCat) => {
        currentCategory = newCat;
        updateView();
      });
    }

    if (!gridContainer) return;

    if (currentCategory === 'custom') {
      renderCustomGrid(gridContainer, () => updateView());
    } else {
      const filtered =
        currentCategory === 'all'
          ? allBoxes
          : allBoxes.filter((b) => b.category === currentCategory);
      renderCardGrid(gridContainer, filtered);
    }
  }

  updateView();
}

document.addEventListener('DOMContentLoaded', initTemplatesPage);

