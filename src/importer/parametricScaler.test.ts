import { describe, expect, it } from 'vitest';
import { getBoxDef } from '../boxes';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { generateDxfContent } from '../export/dxf';
import { generateSvgContent } from '../export/svg';
import { parseDxfString } from './dxfParser';
import { autoDetectStructure, rescaleDieline } from './parametricScaler';
import { parseSvgString } from './svgParser';
import type { ImportedDieline } from './types';

describe('Smart DXF & SVG Importer + Parametric Resizer', () => {
  // Chuẩn bị dieline mẫu chuẩn (Reverse Tuck End: L=80, W=50, H=140, g=15)
  const box = getBoxDef('reverse-tuck-end-box')!;
  const panels = box.build({ l: 80, w: 50, h: 140, t: 0.5, opts: { glueWidth: 15, tuckDepth: 16 } });
  const layout = layoutPanels(panels);
  const dieline = buildDieline(layout);

  it('phân tích file DXF và nhận diện đúng các đường cắt / cấn', () => {
    const dxfString = generateDxfContent(dieline);
    expect(dxfString.length).toBeGreaterThan(100);

    const parsed = parseDxfString(dxfString);
    expect(parsed.segments.length).toBeGreaterThan(0);

    const cuts = parsed.segments.filter((s) => s.type === 'cut');
    const creases = parsed.segments.filter((s) => s.type === 'crease');

    expect(cuts.length).toBeGreaterThan(20);
    expect(creases.length).toBe(12); // 12 nếp cấn
  });

  it('tự động nhận diện cấu trúc hộp L0=80, W0=50, H0=140 từ file DXF', () => {
    const dxfString = generateDxfContent(dieline);
    const parsed = parseDxfString(dxfString);
    const structure = autoDetectStructure(parsed.segments, parsed.bbox);

    expect(structure.l0).toBe(80);
    expect(structure.w0).toBe(50);
    expect(structure.h0).toBe(140);
    expect(structure.glueWidth).toBe(15);
  });

  it('co giãn thông minh theo kích thước mới (L=120, W=70, H=180)', () => {
    const dxfString = generateDxfContent(dieline);
    const parsed = parseDxfString(dxfString);
    const structure = autoDetectStructure(parsed.segments, parsed.bbox);

    const imported: ImportedDieline = {
      name: 'Sample RTE',
      sourceType: 'dxf',
      segments: parsed.segments,
      bbox: parsed.bbox,
      structure,
    };

    // Co dãn từ (80, 50, 140) lên (120, 70, 180)
    const targetL = 120;
    const targetW = 70;
    const targetH = 180;

    const rescaled = rescaleDieline(imported, targetL, targetW, targetH);

    const [, , newWidth, newHeight] = rescaled.bbox;

    // Chiều rộng mới = glue(15) + 2*L(120) + 2*W(70) = 15 + 240 + 140 = 395
    expect(newWidth).toBeCloseTo(395, 1);

    // Chiều cao gốc = 272. Khi tăng H từ 140 lên 180 (+40), chiều cao mới phải là 272 + 40 = 312
    // Vì tai nắp trên và nắp đáy GIỮ NGUYÊN KÍCH THƯỚC (không bị kéo dãn méo mó)!
    expect(newHeight).toBeCloseTo(272 + (targetH - 140), 1);
  });

  it('phân tích file SVG và co dãn chính xác', () => {
    const svgString = generateSvgContent(dieline);
    expect(svgString.length).toBeGreaterThan(100);

    const parsed = parseSvgString(svgString);
    expect(parsed.segments.length).toBeGreaterThan(0);

    const structure = autoDetectStructure(parsed.segments, parsed.bbox);
    expect(structure.l0).toBe(80);
    expect(structure.w0).toBe(50);
    expect(structure.h0).toBe(140);

    const imported: ImportedDieline = {
      name: 'SVG Sample',
      sourceType: 'svg',
      segments: parsed.segments,
      bbox: parsed.bbox,
      structure,
    };

    const rescaled = rescaleDieline(imported, 100, 60, 160);
    const [, , newWidth, newHeight] = rescaled.bbox;

    // Chiều rộng mới = 15 + 2*100 + 2*60 = 335
    expect(newWidth).toBeCloseTo(335, 1);
    // Chiều cao mới = 272 + (160 - 140) = 292
    expect(newHeight).toBeCloseTo(292, 1);
  });
});
