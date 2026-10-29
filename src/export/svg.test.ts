import { describe, expect, it } from 'vitest';
import { generateSvgContent } from './svg';
import type { Dieline } from '../core/types';

describe('export/svg', () => {
  it('sinh mã SVG chuẩn kỹ thuật với các layer CUT và CREASE', () => {
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

    const svg = generateSvgContent(dieline, 5);

    // Kích thước có thêm lề 5mm mỗi bên: 100 + 10 = 110mm, 50 + 10 = 60mm
    expect(svg).toContain('width="110mm"');
    expect(svg).toContain('height="60mm"');
    expect(svg).toContain('viewBox="0 0 110 60"');

    // Chứa 2 layer chuẩn
    expect(svg).toContain('id="CUT"');
    expect(svg).toContain('id="CREASE"');
    expect(svg).toContain('stroke-dasharray="3 2"');

    // Đường cắt khép kín có lệnh Z
    expect(svg).toContain('Z');
  });

  it('sinh layer DIMENSION trong SVG khi truyền dimLines', () => {
    const dieline: Dieline = {
      cut: [],
      crease: [],
      polys: [],
      bbox: [0, 0, 100, 50],
    };

    const svg = generateSvgContent(dieline, 5, [
      {
        start: [0, 25],
        end: [100, 25],
        label: '100 mm',
        mid: [50, 20],
      },
    ]);

    expect(svg).toContain('id="DIMENSION"');
    expect(svg).toContain('<line x1="');
    expect(svg).toContain('<text x="55" y="25" text-anchor="middle">100 mm</text>');
  });
});
