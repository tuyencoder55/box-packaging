import { describe, expect, it } from 'vitest';
import { generateDxfContent } from './dxf';
import type { Dieline } from '../core/types';

describe('export/dxf', () => {
  it('sinh mã DXF R12 hoàn chỉnh với các bảng và thực thể hợp lệ', () => {
    const dieline: Dieline = {
      cut: [
        { a: [0, 0], b: [100, 0] },
        { a: [100, 0], b: [100, 50] },
        { a: [100, 50], b: [0, 50] },
        { a: [0, 50], b: [0, 0] },
      ],
      crease: [{ a: [50, 0], b: [50, 50] }],
      polys: [],
      bbox: [0, 0, 100, 50],
    };

    const dxf = generateDxfContent(dieline, 5);

    // Kiểm tra cấu trúc phần đầu và phần kết
    expect(dxf.startsWith('0\nSECTION')).toBe(true);
    expect(dxf.endsWith('0\nEOF\n')).toBe(true);

    // Phiên bản R12
    expect(dxf).toContain('AC1009');

    // Chứa 2 kiểu nét và 2 layer
    expect(dxf).toContain('CONTINUOUS');
    expect(dxf).toContain('DASHED');
    expect(dxf).toContain('CUT');
    expect(dxf).toContain('CREASE');

    // Có các lệnh thực thể POLYLINE, VERTEX, SEQEND
    expect(dxf).toContain('POLYLINE');
    expect(dxf).toContain('VERTEX');
    expect(dxf).toContain('SEQEND');

    // Hình vuông cắt có flag 70 = 1 (khép kín)
    expect(dxf).toContain('70\n1');
  });
});
