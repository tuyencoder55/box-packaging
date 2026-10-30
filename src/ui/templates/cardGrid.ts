// Component lưới thẻ mẫu hộp (Card Grid) - Thiết kế chuẩn Packfino
import { buildDieline } from '../../core/dieline';
import { layoutPanels } from '../../core/layout';
import type { BoxDef } from '../../core/types';
import { el } from '../dom';

function generateThumbnailSvg(box: BoxDef): SVGSVGElement {
  const panels = box.build({
    l: box.defaults.l,
    w: box.defaults.w,
    h: box.defaults.h,
    t: box.defaults.t,
    opts: {},
  });
  const positioned = layoutPanels(panels);
  const dieline = buildDieline(positioned);

  const [minX, minY, width, height] = dieline.bbox;
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
  for (const seg of dieline.cut) {
    cutD += `M ${seg.a[0]} ${seg.a[1]} L ${seg.b[0]} ${seg.b[1]} `;
  }

  let creaseD = '';
  for (const seg of dieline.crease) {
    creaseD += `M ${seg.a[0]} ${seg.a[1]} L ${seg.b[0]} ${seg.b[1]} `;
  }

  const strokeW = Math.max(0.6, Math.max(vbW, vbH) * 0.005);

  const cutPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  cutPath.setAttribute('d', cutD);
  cutPath.setAttribute('stroke', '#2563eb'); // Đường cắt màu xanh lam chuẩn Packfino
  cutPath.setAttribute('stroke-width', strokeW.toString());
  cutPath.setAttribute('fill', 'none');

  const creasePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  creasePath.setAttribute('d', creaseD);
  creasePath.setAttribute('stroke', '#ef4444'); // Đường cấn màu đỏ nét đứt
  creasePath.setAttribute('stroke-width', strokeW.toString());
  creasePath.setAttribute('stroke-dasharray', `${strokeW * 3},${strokeW * 2}`);
  creasePath.setAttribute('fill', 'none');

  svg.appendChild(creasePath);
  svg.appendChild(cutPath);
  return svg;
}

export function renderCardGrid(container: HTMLElement, boxes: BoxDef[]) {
  container.innerHTML = '';
  container.style.cssText =
    'display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 24px;';

  if (boxes.length === 0) {
    const empty = el('div', {
      text: 'Không tìm thấy loại hộp nào trong danh mục này.',
      style: 'color: #94a3b8; grid-column: 1 / -1; padding: 48px 0; text-align: center; font-size: 15px;',
    });
    container.appendChild(empty);
    return;
  }

  boxes.forEach((box) => {
    const card = el('div', {
      class: 'box-card',
      style: `
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      `,
    });

    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#93c5fd';
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 10px 20px -5px rgba(37, 99, 235, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '#e2e8f0';
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
    });

    // 1. Preview Container với badges chuẩn Packfino
    const previewWrap = el('div', {
      style: `
        position: relative;
        height: 200px;
        background: #f8fafc;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #f1f5f9;
      `,
    });

    // Top badges (Printable, PDF • SVG • DXF)
    const topBadges = el('div', {
      style: 'position: absolute; top: 10px; right: 10px; display: flex; gap: 6px; z-index: 2;',
    });

    const printableBadge = el('span', {
      text: 'Printable',
      style: `
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 2px 7px;
        font-size: 11px;
        font-weight: 500;
        color: #475569;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      `,
    });

    const formatBadge = el('span', {
      text: 'PDF · SVG · DXF',
      style: `
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 2px 7px;
        font-size: 11px;
        font-weight: 500;
        color: #475569;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      `,
    });

    topBadges.appendChild(printableBadge);
    topBadges.appendChild(formatBadge);
    previewWrap.appendChild(topBadges);

    // 3D badge ở góc dưới trái của preview
    const badge3d = el('div', {
      style: `
        position: absolute;
        bottom: 10px;
        left: 10px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        color: #334155;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        z-index: 2;
      `,
    });
    badge3d.innerHTML = '⟲ 3D';
    previewWrap.appendChild(badge3d);

    // Dieline SVG
    try {
      const svg = generateThumbnailSvg(box);
      previewWrap.appendChild(svg);
    } catch (e) {
      console.error('Lỗi sinh thumbnail cho hộp:', box.id, e);
    }
    card.appendChild(previewWrap);

    // 2. Body Container
    const body = el('div', {
      style: 'padding: 18px; display: flex; flex-direction: column; flex: 1;',
    });

    // Standard code (ECMA code in teal)
    if (box.code) {
      const codeLabel = el('div', {
        text: box.code,
        style: `
          font-size: 11.5px;
          font-weight: 700;
          color: #0e7490;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        `,
      });
      body.appendChild(codeLabel);
    }

    // Title (English dieline name)
    const title = el('h3', {
      text: box.name,
      style: `
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px 0;
        line-height: 1.3;
      `,
    });
    body.appendChild(title);

    // Vietnamese name subtitle (if provided and different)
    if (box.nameVi && box.nameVi !== box.name) {
      const subTitle = el('div', {
        text: box.nameVi,
        style: 'font-size: 12.5px; color: #64748b; margin-bottom: 8px; font-weight: 500;',
      });
      body.appendChild(subTitle);
    }

    // Summary description
    if (box.summary || box.description) {
      const summaryText = el('p', {
        text: box.summary || box.description || '',
        style: `
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 36px;
        `,
      });
      body.appendChild(summaryText);
    }

    // Size range / Dimensions text
    const rangeDisplay = box.rangeText || `From ${box.defaults.l} × ${box.defaults.w} × ${box.defaults.h} mm`;
    const dimsText = el('div', {
      text: rangeDisplay,
      style: 'font-size: 12px; color: #64748b; margin-bottom: 16px; margin-top: auto;',
    });
    body.appendChild(dimsText);

    // 3. Action Buttons Row (✂ Dieline  |  🎲 3D mockup)
    const actionsRow = el('div', {
      style: 'display: flex; gap: 8px;',
    });

    const dielineBtn = el('a', {
      href: `/app.html?type=${box.id}`,
      text: '✂ Dieline',
      style: `
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.15s ease;
      `,
    });
    dielineBtn.addEventListener('mouseenter', () => {
      dielineBtn.style.background = '#f8fafc';
      dielineBtn.style.borderColor = '#cbd5e1';
    });
    dielineBtn.addEventListener('mouseleave', () => {
      dielineBtn.style.background = '#ffffff';
      dielineBtn.style.borderColor = '#e2e8f0';
    });

    const mockupBtn = el('a', {
      href: `/app.html?type=${box.id}&step=3d`,
      text: '🎲 3D mockup',
      style: `
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.15s ease;
      `,
    });
    mockupBtn.addEventListener('mouseenter', () => {
      mockupBtn.style.background = '#f8fafc';
      mockupBtn.style.borderColor = '#cbd5e1';
    });
    mockupBtn.addEventListener('mouseleave', () => {
      mockupBtn.style.background = '#ffffff';
      mockupBtn.style.borderColor = '#e2e8f0';
    });

    actionsRow.appendChild(dielineBtn);
    actionsRow.appendChild(mockupBtn);
    body.appendChild(actionsRow);

    card.appendChild(body);
    container.appendChild(card);
  });
}
