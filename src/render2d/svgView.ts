// Vẽ khuôn bế 2D dạng vector SVG: Dao cắt nét liền, dao cấn nét đứt đỏ, tự căn vừa khung
import type { Dieline, Seg } from '../core/types';

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
export function dielineToSvgData(dieline: Dieline, pad = 20): SvgViewData {
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
 * Hiển thị hoặc cập nhật khuôn SVG trong phần tử container (tránh innerHTML khi đã có SVG)
 */
export function renderSvgView(container: HTMLElement, dieline: Dieline): SVGSVGElement {
  const { cutPath, creasePath, viewBox } = dielineToSvgData(dieline);

  let svg = container.querySelector<SVGSVGElement>('svg.dieline-svg');

  if (!svg) {
    container.innerHTML = '';

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

    svg.appendChild(gCrease);
    svg.appendChild(gCut);
    container.appendChild(svg);
  }

  svg.setAttribute('viewBox', viewBox);

  const cutEl = svg.querySelector<SVGPathElement>('.cut-path');
  if (cutEl) cutEl.setAttribute('d', cutPath);

  const creaseEl = svg.querySelector<SVGPathElement>('.crease-path');
  if (creaseEl) creaseEl.setAttribute('d', creasePath);

  return svg;
}
