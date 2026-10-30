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
import { buildDimensionLines } from '../render2d/dimensions';
import { generateImportedDimensions } from './dimensionGenerator';
import {
  deleteCustomTemplate,
  getCustomTemplateById,
  getCustomTemplates,
  saveCustomTemplate,
} from './customTemplateStore';

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

  it('nhận diện chính xác file DXF thùng carton FEFCO-0201 có chứa đường kích thước DIMENSION từ AutoCAD', () => {
    const fefco = getBoxDef('fefco-0201')!;
    const fPanels = fefco.build({ l: 300, w: 200, h: 150, t: 4, opts: {} });
    const fLayout = layoutPanels(fPanels);
    const fDieline = buildDieline(fLayout);
    const fDims = buildDimensionLines(fefco.dims, fLayout, { l: 300, w: 200, h: 150, t: 4 }, 'mm', fefco.id);

    // Xuất DXF kèm layer DIMENSION (như file AutoCAD người dùng xuất ra)
    const dxfString = generateDxfContent(fDieline, 5, fDims);

    const parsed = parseDxfString(dxfString);
    // Các đường kích thước phải được tự động lọc bỏ (giảm từ 95 xuống chính xác 54 đoạn dao cắt + cấn)
    expect(parsed.segments.length).toBe(54);

    const structure = autoDetectStructure(parsed.segments, parsed.bbox);
    expect(structure.l0).toBe(300);
    expect(structure.w0).toBe(200);
    expect(structure.h0).toBe(150);
    expect(structure.glueWidth).toBeCloseTo(35, 1);
    expect(structure.isRSCFlap).toBe(true); // Nhận diện đúng thùng đối khẩu RSC

    // Khổ phôi gốc phải chuẩn xác: 35 + 2*300 + 2*200 = 1035mm (không bị phình lên 1092mm)
    expect(parsed.bbox[2]).toBeCloseTo(1035, 1);
    expect(parsed.bbox[3]).toBeCloseTo(350, 1);

    const imported: ImportedDieline = {
      name: 'FEFCO-0201',
      sourceType: 'dxf',
      segments: parsed.segments,
      bbox: parsed.bbox,
      structure,
    };

    // Co dãn thông minh sang L=400, W=250, H=200
    const rescaled = rescaleDieline(imported, 400, 250, 200);
    const [, , newW, newH] = rescaled.bbox;

    // Chiều rộng mới: 35 + 2*400 + 2*250 = 1335mm
    expect(newW).toBeCloseTo(1335, 1);
    // Chiều cao mới: nắp trên (125) + thân (200) + nắp đáy (125) = 450mm
    expect(newH).toBeCloseTo(450, 1);
  });

  it('tự động tạo chuỗi đường kích thước kỹ thuật (DIM) chuẩn CAD cho bản vẽ nhập ngoài', () => {
    const fefco = getBoxDef('fefco-0201')!;
    const fPanels = fefco.build({ l: 300, w: 200, h: 150, t: 4, opts: {} });
    const fLayout = layoutPanels(fPanels);
    const fDieline = buildDieline(fLayout);
    const dxfString = generateDxfContent(fDieline);
    const parsed = parseDxfString(dxfString);
    const structure = autoDetectStructure(parsed.segments, parsed.bbox);

    const dims = generateImportedDimensions(structure, 300, 200, 150, parsed.bbox);
    expect(dims.length).toBeGreaterThan(10);

    // Kiểm tra có đầy đủ nhãn kích thước của các panel: lưỡi dán (35), dài (300), rộng (200), cao (150), tổng ngang (1035), tổng dọc (350)
    const labels = dims.map((d) => d.label).filter(Boolean);
    expect(labels).toContain('35');
    expect(labels).toContain('300');
    expect(labels).toContain('200');
    expect(labels).toContain('150');
    expect(labels).toContain('1035');
    expect(labels).toContain('350');
  });

  it('lưu, đọc, tìm kiếm và xoá mẫu hộp tự tạo trong customTemplateStore', () => {
    // Giả lập lưu mẫu hộp công ty
    const fefco = getBoxDef('fefco-0201')!;
    const fPanels = fefco.build({ l: 300, w: 200, h: 150, t: 4, opts: {} });
    const fLayout = layoutPanels(fPanels);
    const fDieline = buildDieline(fLayout);
    const dxfString = generateDxfContent(fDieline);
    const parsed = parseDxfString(dxfString);
    const structure = autoDetectStructure(parsed.segments, parsed.bbox);

    const saved = saveCustomTemplate({
      name: 'Thùng đóng hàng xuất khẩu A1',
      code: 'CTY-EXP-01',
      sourceType: 'dxf',
      rawContent: dxfString,
      segments: parsed.segments,
      bbox: parsed.bbox,
      structure,
      defaults: { l: 300, w: 200, h: 150 },
    });

    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('Thùng đóng hàng xuất khẩu A1');

    const list = getCustomTemplates();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((t) => t.id === saved.id)).toBe(true);

    const found = getCustomTemplateById(saved.id);
    expect(found).not.toBeNull();
    expect(found?.code).toBe('CTY-EXP-01');

    // Xoá mẫu
    deleteCustomTemplate(saved.id);
    const afterDelete = getCustomTemplates();
    expect(afterDelete.some((t) => t.id === saved.id)).toBe(false);
  });
});

