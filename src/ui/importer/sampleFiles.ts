// Các file mẫu DXF và SVG thực tế phục vụ kiểm thử nhanh bộ nạp thông minh
import { getBoxDef } from '../../boxes';
import { buildDieline } from '../../core/dieline';
import { layoutPanels } from '../../core/layout';
import { generateDxfContent } from '../../export/dxf';
import { generateSvgContent } from '../../export/svg';

/**
 * Sinh chuỗi DXF chuẩn của hộp Reverse Tuck End (L=80, W=50, H=140)
 */
export function getSampleDxf(): { name: string; content: string; l: number; w: number; h: number } {
  const box = getBoxDef('reverse-tuck-end-box')!;
  const panels = box.build({
    l: 80,
    w: 50,
    h: 140,
    t: 0.5,
    opts: { glueWidth: 15, tuckDepth: 16 },
  });
  const dieline = buildDieline(layoutPanels(panels));
  const content = generateDxfContent(dieline);
  return {
    name: 'sample_reverse_tuck.dxf',
    content,
    l: 80,
    w: 50,
    h: 140,
  };
}

/**
 * Sinh chuỗi SVG chuẩn của hộp Snap Lock Bottom (L=90, W=60, H=150)
 */
export function getSampleSvg(): { name: string; content: string; l: number; w: number; h: number } {
  const box = getBoxDef('snap-lock-bottom-box')!;
  const panels = box.build({
    l: 90,
    w: 60,
    h: 150,
    t: 0.5,
    opts: { glueWidth: 15, tuckDepth: 16 },
  });
  const dieline = buildDieline(layoutPanels(panels));
  const content = generateSvgContent(dieline);
  return {
    name: 'sample_snap_lock.svg',
    content,
    l: 90,
    w: 60,
    h: 150,
  };
}
