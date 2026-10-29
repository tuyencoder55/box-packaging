// Kiểm thử hình học hộp âm dương FEFCO 0301 trong src/boxes/fefco-0301.ts
import { describe, expect, it } from 'vitest';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';
import { fefco0301 } from './fefco-0301';

describe('fefco-0301', () => {
  it('sinh đúng 9 panel khi chọn chỉ khay đáy (base)', () => {
    const nodes = fefco0301.build({
      l: 250,
      w: 180,
      h: 80,
      t: 2,
      opts: { part: 'base' },
    });

    // 1 mặt đáy + 4 thành + 4 tai dán = 9 panels
    expect(nodes).toHaveLength(9);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(9);

    const dieline = buildDieline(layouts);
    // 9 panels -> 1 gốc + 8 con -> 8 đường cấn
    expect(dieline.crease).toHaveLength(8);
  });

  it('sinh đầy đủ 19 panel khi chọn cả nắp và đáy (both)', () => {
    const nodes = fefco0301.build({
      l: 250,
      w: 180,
      h: 80,
      t: 2,
      opts: { part: 'both', lidHeight: 40, clearance: 2 },
    });

    // 9 (đáy) + 1 (bridge) + 9 (nắp) = 19 panels
    expect(nodes).toHaveLength(19);

    const layouts = layoutPanels(nodes);
    expect(layouts).toHaveLength(19);

    const dieline = buildDieline(layouts);
    expect(dieline.crease.length).toBeGreaterThanOrEqual(16);
  });

  it('kích thước nắp tự động tính bù độ dày giấy và độ hở lồng', () => {
    const l = 200;
    const w = 150;
    const t = 2;
    const clearance = 2;

    const nodes = fefco0301.build({
      l,
      w,
      h: 60,
      t,
      opts: { part: 'both', clearance },
    });

    const lidFace = nodes.find((n) => n.id === 'lid-face');
    expect(lidFace).toBeDefined();
    // lLid = l + 2*t + clearance = 200 + 4 + 2 = 206
    expect(lidFace?.len).toBe(206);
    // wLid = w + 2*t + clearance = 150 + 4 + 2 = 156
    expect(lidFace?.depth).toBe(156);
  });
});
