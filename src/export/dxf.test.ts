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

    // Chứa các layer
    expect(dxf).toContain('CONTINUOUS');
    expect(dxf).toContain('DASHED');
    expect(dxf).toContain('CUT');
    expect(dxf).toContain('CREASE');
    expect(dxf).toContain('DIMENSION');

    // Có các lệnh thực thể POLYLINE, VERTEX, SEQEND
    expect(dxf).toContain('POLYLINE');
    expect(dxf).toContain('VERTEX');
    expect(dxf).toContain('SEQEND');

    // Hình vuông cắt có flag 70 = 1 (khép kín)
    expect(dxf).toContain('70\n1');
  });

  it('sinh layer DIMENSION và text kích thước khi truyền dimLines', () => {
    const dieline: Dieline = {
      cut: [],
      crease: [],
      polys: [],
      bbox: [0, 0, 100, 50],
    };

    const dxf = generateDxfContent(dieline, 5, [
      {
        start: [0, 25],
        end: [100, 25],
        label: '100 mm',
        mid: [50, 20],
      },
    ]);

    expect(dxf).toContain('LINE\n8\nDIMENSION');
    expect(dxf).toContain('TEXT\n8\nDIMENSION');
    expect(dxf).toContain('100 mm');
  });
});
