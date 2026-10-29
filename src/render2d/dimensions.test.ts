// Kiểm thử thuật toán tạo chuỗi kích thước CAD chi tiết và tổng thể trong src/render2d/dimensions.ts
import { describe, expect, it } from 'vitest';
import { fefco0201 } from '../boxes/fefco-0201';
import { layoutPanels } from '../core/layout';
import { buildDimensionLines } from './dimensions';

describe('buildDimensionLines CAD Packaging', () => {
  it('sinh đầy đủ chuỗi kích thước ngang, kích thước dọc và kích thước phủ bì tổng thể chuẩn CAD', () => {
    const rawDims = { l: 600, w: 400, h: 350, t: 3, opts: { glueWidth: 35, slotWidth: 6 } };
    const nodes = fefco0201.build(rawDims);
    const layouts = layoutPanels(nodes);

    const dimLines = buildDimensionLines(fefco0201.dims, layouts, rawDims, 'mm', 'fefco-0201');

    // Phải sinh các đường đo kích thước
    expect(dimLines.length).toBeGreaterThan(10);

    const labels = dimLines.map((d) => d.label).filter(Boolean);

    // Kích thước các khoang theo đúng hình 2 của user:
    // Tai dán: 35
    expect(labels).toContain('35');
    // Mặt A và C: 600
    expect(labels).toContain('600');
    // Mặt B và D: 400
    expect(labels).toContain('400');
    // Tổng chiều dài phủ bì: 35 + 600 + 400 + 600 + 400 = 2,035
    expect(labels).toContain('2,035');

    // Chiều cao thân: 350
    expect(labels).toContain('350');
    // Nắp trên & nắp dưới: 200 (hoặc 202)
    expect(labels).toContain('200');
    // Tổng chiều cao phủ bì: 200 + 350 + 200 = 750
    expect(labels).toContain('750');

    // Khe rãnh xẻ: 6
    expect(labels).toContain('6');
  });
});

