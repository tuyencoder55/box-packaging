// Component lưới thẻ mẫu hộp (Card Grid)
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

  const strokeW = Math.max(0.5, Math.max(vbW, vbH) * 0.005);

  const cutPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  cutPath.setAttribute('d', cutD);
  cutPath.setAttribute('stroke', '#00d287');
  cutPath.setAttribute('stroke-width', strokeW.toString());
  cutPath.setAttribute('fill', 'none');

  const creasePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  creasePath.setAttribute('d', creaseD);
  creasePath.setAttribute('stroke', '#ff4d4f');
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
    'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;';

  if (boxes.length === 0) {
    const empty = el('div', {
      text: 'Không tìm thấy loại hộp nào trong danh mục này.',
      style: 'color: var(--text-muted); grid-column: 1 / -1; padding: 40px 0; text-align: center;',
    });
    container.appendChild(empty);
    return;
  }

  boxes.forEach((box) => {
    const card = el('div', {
      class: 'box-card',
      style: `
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease, border-color 0.2s ease;
      `,
    });

    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--color-primary)';
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--border-subtle)';
      card.style.transform = 'translateY(0)';
    });

    // Preview container
    const previewWrap = el('div', {
      style: `
        height: 180px;
        background: var(--bg-card);
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid var(--border-subtle);
      `,
    });
    try {
      const svg = generateThumbnailSvg(box);
      previewWrap.appendChild(svg);
    } catch (e) {
      console.error('Lỗi sinh thumbnail cho hộp:', box.id, e);
    }
    card.appendChild(previewWrap);

    // Body container
    const body = el('div', {
      style: 'padding: 16px; display: flex; flex-direction: column; flex: 1;',
    });

    const headerRow = el('div', {
      style: 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;',
    });

    const title = el('h3', {
      text: box.name,
      style: 'font-size: var(--font-size-md); font-weight: 600; color: var(--text-primary); margin: 0;',
    });

    const badge = el('span', {
      text: box.code,
      style: `
        font-size: var(--font-size-xs);
        font-weight: 600;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        background: var(--bg-base);
        color: var(--color-primary);
        border: 1px solid var(--border-subtle);
      `,
    });

    headerRow.appendChild(title);
    headerRow.appendChild(badge);
    body.appendChild(headerRow);

    const dimsText = el('div', {
      text: `Mặc định: ${box.defaults.l} × ${box.defaults.w} × ${box.defaults.h} mm`,
      style: 'font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 16px; flex: 1;',
    });
    body.appendChild(dimsText);

    const btn = el('a', {
      href: `/app.html?type=${box.id}`,
      text: 'Dùng mẫu này →',
      style: `
        display: inline-block;
        text-align: center;
        padding: 10px 16px;
        background: var(--color-primary);
        color: var(--color-primary-fg);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        font-weight: 600;
        text-decoration: none;
        transition: opacity 0.15s ease;
      `,
    });
    btn.addEventListener('mouseenter', () => (btn.style.opacity = '0.9'));
    btn.addEventListener('mouseleave', () => (btn.style.opacity = '1'));

    body.appendChild(btn);
    card.appendChild(body);
    container.appendChild(card);
  });
}
