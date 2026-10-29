// Kiểm thử thuật toán layout cây PanelNode trong src/core/layout.ts
import { describe, expect, it } from 'vitest';
import { layoutPanels } from './layout';
import type { PanelNode } from './types';

describe('layout', () => {
  it('tính đúng toạ độ cho panel gốc', () => {
    const nodes: PanelNode[] = [
      { id: 'root', parent: null, len: 100, depth: 50, fold: 0, step: 0 },
    ];
    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(1);
    expect(layouts[0].rect).toEqual([0, 0, 100, 50]);
    expect(layouts[0].baseSeg).toBeNull();
    expect(layouts[0].poly).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ]);
  });

  it('gắn panel con vào 4 hướng của cha', () => {
    const nodes: PanelNode[] = [
      { id: 'root', parent: null, len: 100, depth: 50, fold: 0, step: 0 },
      // Top flap: len 100, depth 30
      { id: 'top-flap', parent: 'root', edge: 'top', len: 100, depth: 30, fold: 90, step: 1 },
      // Bottom flap: len 100, depth 30
      { id: 'bot-flap', parent: 'root', edge: 'bottom', len: 100, depth: 30, fold: 90, step: 1 },
      // Right side: len 50, depth 40
      { id: 'right-side', parent: 'root', edge: 'right', len: 50, depth: 40, fold: 90, step: 1 },
      // Left side: len 50, depth 20
      { id: 'left-side', parent: 'root', edge: 'left', len: 50, depth: 20, fold: 90, step: 1 },
    ];

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(5);

    const topLayout = layouts.find((l) => l.node.id === 'top-flap')!;
    expect(topLayout.rect).toEqual([0, -30, 100, 30]);
    expect(topLayout.baseSeg).toEqual({ a: [0, 0], b: [100, 0] });

    const botLayout = layouts.find((l) => l.node.id === 'bot-flap')!;
    expect(botLayout.rect).toEqual([0, 50, 100, 30]);
    expect(botLayout.baseSeg).toEqual({ a: [0, 50], b: [100, 50] });

    const rightLayout = layouts.find((l) => l.node.id === 'right-side')!;
    expect(rightLayout.rect).toEqual([100, 0, 40, 50]);
    expect(rightLayout.baseSeg).toEqual({ a: [100, 0], b: [100, 50] });

    const leftLayout = layouts.find((l) => l.node.id === 'left-side')!;
    expect(leftLayout.rect).toEqual([-20, 0, 20, 50]);
    expect(leftLayout.baseSeg).toEqual({ a: [0, 0], b: [0, 50] });
  });

  it('bố cục chính xác cho cây phân cấp nhiều tầng', () => {
    const nodes: PanelNode[] = [
      { id: 'root', parent: null, len: 100, depth: 50, fold: 0, step: 0 },
      { id: 'child', parent: 'root', edge: 'bottom', len: 100, depth: 40, fold: 90, step: 1 },
      { id: 'grandchild', parent: 'child', edge: 'bottom', len: 100, depth: 20, fold: 90, step: 2 },
    ];

    const layouts = layoutPanels(nodes);
    const grandchild = layouts.find((l) => l.node.id === 'grandchild')!;
    expect(grandchild.rect).toEqual([0, 90, 100, 20]);
    expect(grandchild.baseSeg).toEqual({ a: [0, 90], b: [100, 90] });
  });

  it('hỗ trợ nhiều panel gốc độc lập (bộ nắp & đáy rời) xếp thẳng hàng có khoảng đệm', () => {
    const nodes: PanelNode[] = [
      { id: 'root-lid', parent: null, len: 200, depth: 100, fold: 0, step: 0 },
      { id: 'lid-top', parent: 'root-lid', edge: 'top', len: 200, depth: 50, fold: 90, step: 1 },
      { id: 'root-base', parent: null, len: 180, depth: 90, fold: 0, step: 0 },
      { id: 'base-top', parent: 'root-base', edge: 'top', len: 180, depth: 50, fold: 90, step: 1 },
    ];

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(4);

    const lidTop = layouts.find((l) => l.node.id === 'lid-top')!;
    const rootLid = layouts.find((l) => l.node.id === 'root-lid')!;
    const baseTop = layouts.find((l) => l.node.id === 'base-top')!;
    const rootBase = layouts.find((l) => l.node.id === 'root-base')!;

    // Nắp ở trên
    expect(lidTop.rect[1]).toBe(-50);
    expect(rootLid.rect[1]).toBe(0);
    const lidMaxY = rootLid.rect[1] + rootLid.rect[3]; // 0 + 100 = 100
    expect(lidMaxY).toBe(100);

    // Đáy ở dưới với khoảng đệm 40mm
    // Tấm đáy vươn lên trên 50mm (baseTop), nên baseTop.minY = lidMaxY + 40 = 140
    expect(baseTop.rect[1]).toBe(140);
    expect(rootBase.rect[1]).toBe(190);
  });
});

