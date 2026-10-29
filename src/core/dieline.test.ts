// Kiểm thử phân loại đường dieline trong src/core/dieline.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from './dieline';
import { layoutPanels } from './layout';
import type { PanelNode } from './types';

describe('dieline', () => {
  it('panel đơn lẻ: 4 đường cắt, 0 đường cấn, bbox đúng kích thước', () => {
    const nodes: PanelNode[] = [
      { id: 'root', parent: null, len: 100, depth: 50, fold: 0, step: 0 },
    ];
    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    expect(dieline.crease).toHaveLength(0);
    expect(dieline.cut).toHaveLength(4);
    expect(dieline.bbox).toEqual([0, 0, 100, 50]);
  });

  it('cha + con: cạnh gắn chuyển thành crease, không còn là cut', () => {
    const nodes: PanelNode[] = [
      { id: 'root', parent: null, len: 100, depth: 50, fold: 0, step: 0 },
      { id: 'top', parent: 'root', edge: 'top', len: 100, depth: 30, fold: 90, step: 1 },
    ];
    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    // Đúng 1 đường cấn tại y = 0 từ x = 0 đến 100
    expect(dieline.crease).toHaveLength(1);
    expect(dieline.crease[0]).toEqual({ a: [0, 0], b: [100, 0] });

    // Đường cắt bao quanh ngoài: 3 cạnh của cha + 3 cạnh của con = 6 cạnh
    expect(dieline.cut).toHaveLength(6);

    // Không có đường cắt nào nằm trùng đoạn cấn y = 0 từ 0 đến 100
    for (const c of dieline.cut) {
      const isCreaseLine = c.a[1] === 0 && c.b[1] === 0;
      expect(isCreaseLine).toBe(false);
    }

    // Bbox mở rộng từ y = -30 đến 50 (chiều cao 80)
    expect(dieline.bbox).toEqual([0, -30, 100, 80]);
  });

  it('khử trùng lặp đường cắt giữa 2 panel con tiếp giáp nhau', () => {
    const nodes: PanelNode[] = [
      { id: 'root', parent: null, len: 100, depth: 50, fold: 0, step: 0 },
      // Hai tai gắn cạnh top: tai 1 từ u=0..50, tai 2 từ u=50..100
      { id: 'flap1', parent: 'root', edge: 'top', len: 50, depth: 30, fold: 90, step: 1 },
      { id: 'flap2', parent: 'root', edge: 'top', offset: 50, len: 50, depth: 30, fold: 90, step: 1 },
    ];
    const layouts = layoutPanels(nodes);
    const dieline = buildDieline(layouts);

    expect(dieline.crease).toHaveLength(2);

    // Rãnh giữa flap1 và flap2 tại x = 50 từ y = 0 đến -30 chỉ xuất hiện đúng 1 lần
    const slotCuts = dieline.cut.filter(
      (c) => Math.abs(c.a[0] - 50) < 0.01 && Math.abs(c.b[0] - 50) < 0.01
    );
    expect(slotCuts).toHaveLength(1);
  });
});

