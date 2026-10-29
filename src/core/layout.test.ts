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
});

