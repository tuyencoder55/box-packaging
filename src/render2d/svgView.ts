// Vẽ khuôn bế 2D dạng vector SVG: Dao cắt nét liền, dao cấn nét đứt đỏ, đường kích thước, tự căn vừa khung
import type { Dieline, Seg } from '../core/types';
import type { DimensionLine } from './dimensions';
import { createLegend } from '../ui/app/legend';

export interface SvgViewData {
  cutPath: string;
  creasePath: string;
  viewBox: string;
}

export interface SvgStyleOptions {
  cutColor?: string;
  creaseColor?: string;
  dimColor?: string;
  dimFont?: string;
  dimFontSize?: number;
}

/**
 * Ghép danh sách đoạn thẳng thành chuỗi path SVG "M x y L x y ..."
 */
export function segsToPathData(segs: Seg[]): string {
  if (segs.length === 0) return '';
  return segs
    .map((s) => `M ${s.a[0]} ${s.a[1]} L ${s.b[0]} ${s.b[1]}`)
    .join(' ');
}

/**
 * Tính toán dữ liệu SVG (viewBox có lề padding tự động chứa cả các chuỗi kích thước CAD)
 */
export function dielineToSvgData(dieline: Dieline, pad = 25, dimLines: DimensionLine[] = []): SvgViewData {
  let minX = dieline.bbox[0];
  let minY = dieline.bbox[1];
  let maxX = dieline.bbox[0] + dieline.bbox[2];
  let maxY = dieline.bbox[1] + dieline.bbox[3];

  if (dimLines.length === 0) {
    const vx = minX - pad;
    const vy = minY - pad;
    const vw = Math.max(1, dieline.bbox[2] + pad * 2);
    const vh = Math.max(1, dieline.bbox[3] + pad * 2);

    return {
      cutPath: segsToPathData(dieline.cut),
      creasePath: segsToPathData(dieline.crease),
      viewBox: `${vx} ${vy} ${vw} ${vh}`,
    };
  }

  for (const d of dimLines) {
    if (d.start[0] < minX) minX = d.start[0];
    if (d.start[1] < minY) minY = d.start[1];
    if (d.start[0] > maxX) maxX = d.start[0];
    if (d.start[1] > maxY) maxY = d.start[1];

    if (d.end[0] < minX) minX = d.end[0];
    if (d.end[1] < minY) minY = d.end[1];
    if (d.end[0] > maxX) maxX = d.end[0];
    if (d.end[1] > maxY) maxY = d.end[1];
  }

  const padLeft = Math.max(pad, 20);
  const padRight = Math.max(pad, 30);
  const padTop = Math.max(pad, 30);
  const padBottom = Math.max(pad, 20);

  const vx = minX - padLeft;
  const vy = minY - padTop;
  const vw = Math.max(1, maxX - minX + padLeft + padRight);
  const vh = Math.max(1, maxY - minY + padTop + padBottom);

  return {
    cutPath: segsToPathData(dieline.cut),
    creasePath: segsToPathData(dieline.crease),
    viewBox: `${vx} ${vy} ${vw} ${vh}`,
  };
}

/**
 * Hiển thị hoặc cập nhật khuôn SVG trong phần tử container
 */
export function renderSvgView(
  container: HTMLElement,
  dieline: Dieline,
  dimLines: DimensionLine[] = [],
  styles: SvgStyleOptions = {}
): SVGSVGElement {
  const cutColor = styles.cutColor || '#3b82f6';
  const creaseColor = styles.creaseColor || '#ef4444';
  const dimColor = styles.dimColor || '#9da5b4';
  const dimFont = styles.dimFont || 'Inter, sans-serif';
  const dimFontSize = styles.dimFontSize || 11;

  const { cutPath, creasePath, viewBox } = dielineToSvgData(dieline, 25, dimLines);

  let svg = container.querySelector<SVGSVGElement>('svg.dieline-svg');

  if (!svg) {
    container.innerHTML = '';
    container.style.position = 'relative';

    const svgNs = 'http://www.w3.org/2000/svg';
    svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('class', 'dieline-svg');
    svg.setAttribute('style', 'width: 100%; height: 100%; max-height: 85vh; display: block;');

    const gCrease = document.createElementNS(svgNs, 'g');
    gCrease.setAttribute('id', 'layer-crease');
    const pathCrease = document.createElementNS(svgNs, 'path');
    pathCrease.setAttribute('stroke', creaseColor);
    pathCrease.setAttribute('stroke-width', '1.2');
    pathCrease.setAttribute('stroke-dasharray', '4 3');
    pathCrease.setAttribute('fill', 'none');
    pathCrease.setAttribute('stroke-linecap', 'round');
    pathCrease.setAttribute('class', 'crease-path');
    gCrease.appendChild(pathCrease);

    const gCut = document.createElementNS(svgNs, 'g');
    gCut.setAttribute('id', 'layer-cut');
    const pathCut = document.createElementNS(svgNs, 'path');
    pathCut.setAttribute('stroke', cutColor);
    pathCut.setAttribute('stroke-width', '1.2');
    pathCut.setAttribute('fill', 'none');
    pathCut.setAttribute('stroke-linecap', 'round');
    pathCut.setAttribute('class', 'cut-path');
    gCut.appendChild(pathCut);

    const gDims = document.createElementNS(svgNs, 'g');
    gDims.setAttribute('id', 'layer-dimensions');
    gDims.setAttribute('class', 'dims-layer');

    const gContent = document.createElementNS(svgNs, 'g');
    gContent.setAttribute('class', 'viewport-content');

    gContent.appendChild(gCrease);
    gContent.appendChild(gCut);
    gContent.appendChild(gDims);
    svg.appendChild(gContent);
    container.appendChild(svg);
    container.appendChild(createLegend(cutColor, creaseColor, dimColor));
  } else {
    // Cập nhật chú giải nếu đã có sẵn
    const oldLegend = container.querySelector('.dieline-legend');
    if (oldLegend) {
      oldLegend.replaceWith(createLegend(cutColor, creaseColor, dimColor));
    }
  }

  svg.setAttribute('viewBox', viewBox);

  const cutEl = svg.querySelector<SVGPathElement>('.cut-path');
  if (cutEl) {
    cutEl.setAttribute('d', cutPath);
    cutEl.setAttribute('stroke', cutColor);
  }

  const creaseEl = svg.querySelector<SVGPathElement>('.crease-path');
  if (creaseEl) {
    creaseEl.setAttribute('d', creasePath);
    creaseEl.setAttribute('stroke', creaseColor);
  }

  // Cập nhật các đường kích thước
  const dimsLayer = svg.querySelector<SVGGElement>('.dims-layer');
  if (dimsLayer) {
    const svgNs = 'http://www.w3.org/2000/svg';
    dimsLayer.innerHTML = '';
    for (const d of dimLines) {
      const line = document.createElementNS(svgNs, 'line');
      line.setAttribute('x1', String(d.start[0]));
      line.setAttribute('y1', String(d.start[1]));
      line.setAttribute('x2', String(d.end[0]));
      line.setAttribute('y2', String(d.end[1]));
      line.setAttribute('stroke', dimColor);
      line.setAttribute('stroke-width', '0.8');

      dimsLayer.appendChild(line);

      if (d.label && d.label.trim()) {
        const text = document.createElementNS(svgNs, 'text');
        text.setAttribute('x', String(d.mid[0]));
        text.setAttribute('y', String(d.mid[1]));
        text.setAttribute('fill', dimColor);
        text.setAttribute('font-family', dimFont);
        text.setAttribute('font-size', String(dimFontSize));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('paint-order', 'stroke');
        text.setAttribute('stroke', '#181b22');
        text.setAttribute('stroke-width', '3px');
        text.setAttribute('stroke-linejoin', 'round');
        text.setAttribute('font-weight', '700');
        text.textContent = d.label;
        dimsLayer.appendChild(text);
      }
    }
  }

  return svg;
}
