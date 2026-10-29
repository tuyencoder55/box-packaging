// Vẽ khuôn bế 2D dạng vector SVG: Dao cắt nét liền, dao cấn nét đứt đỏ, đường kích thước, tự căn vừa khung
import type { Dieline, Seg } from '../core/types';
import type { DimensionLine } from './dimensions';
import { createLegend } from '../ui/app/legend';

export interface SvgViewData {
  cutPath: string;
  creasePath: string;
  viewBox: string;
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
 * Tính toán dữ liệu SVG (viewBox có lề padding, path cắt, path cấn)
 */
export function dielineToSvgData(dieline: Dieline, pad = 25): SvgViewData {
  const [minX, minY, w, h] = dieline.bbox;
  const vx = minX - pad;
  const vy = minY - pad;
  const vw = Math.max(1, w + pad * 2);
  const vh = Math.max(1, h + pad * 2);

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
  dimLines: DimensionLine[] = []
): SVGSVGElement {
  const { cutPath, creasePath, viewBox } = dielineToSvgData(dieline);

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
    pathCrease.setAttribute('stroke', '#ef4444');
    pathCrease.setAttribute('stroke-width', '1.2');
    pathCrease.setAttribute('stroke-dasharray', '4 3');
    pathCrease.setAttribute('fill', 'none');
    pathCrease.setAttribute('stroke-linecap', 'round');
    pathCrease.setAttribute('class', 'crease-path');
    gCrease.appendChild(pathCrease);

    const gCut = document.createElementNS(svgNs, 'g');
    gCut.setAttribute('id', 'layer-cut');
    const pathCut = document.createElementNS(svgNs, 'path');
    pathCut.setAttribute('stroke', '#3b82f6');
    pathCut.setAttribute('stroke-width', '1.2');
    pathCut.setAttribute('fill', 'none');
    pathCut.setAttribute('stroke-linecap', 'round');
    pathCut.setAttribute('class', 'cut-path');
    gCut.appendChild(pathCut);

    const gDims = document.createElementNS(svgNs, 'g');
    gDims.setAttribute('id', 'layer-dimensions');
    gDims.setAttribute('class', 'dims-layer');

    svg.appendChild(gCrease);
    svg.appendChild(gCut);
    svg.appendChild(gDims);
    container.appendChild(svg);
    container.appendChild(createLegend());
  }

  svg.setAttribute('viewBox', viewBox);

  const cutEl = svg.querySelector<SVGPathElement>('.cut-path');
  if (cutEl) cutEl.setAttribute('d', cutPath);

  const creaseEl = svg.querySelector<SVGPathElement>('.crease-path');
  if (creaseEl) creaseEl.setAttribute('d', creasePath);

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
      line.setAttribute('stroke', '#9da5b4');
      line.setAttribute('stroke-width', '0.8');

      const text = document.createElementNS(svgNs, 'text');
      text.setAttribute('x', String(d.mid[0]));
      text.setAttribute('y', String(d.mid[1]));
      text.setAttribute('fill', '#9da5b4');
      text.setAttribute('font-size', '10');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = d.label;

      dimsLayer.appendChild(line);
      dimsLayer.appendChild(text);
    }
  }

  return svg;
}

