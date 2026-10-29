import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { applyFoldProgress } from './foldAnim';
import type { PanelHingeInfo } from './foldModel';

describe('render3d/foldAnim', () => {
  function createMockHinge(id: string, step: number, axis: 'x' | 'y', sign: number, maxAngleRad: number): PanelHingeInfo {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh();
    return {
      id,
      group,
      mesh,
      node: { id, parent: null, len: 100, depth: 100, fold: 90, step },
      axis,
      sign,
      maxAngleRad,
      step,
    };
  }

  it('ở progress = 0, toàn bộ góc xoay của các bản lề đều bằng 0', () => {
    const hinges = new Map<string, PanelHingeInfo>();
    hinges.set('p1', createMockHinge('p1', 1, 'y', 1, Math.PI / 2));
    hinges.set('p2', createMockHinge('p2', 2, 'x', -1, Math.PI / 2));
    hinges.set('p3', createMockHinge('p3', 3, 'x', 1, Math.PI / 2));

    applyFoldProgress(hinges, 0);

    expect(hinges.get('p1')!.group.rotation.y).toBe(0);
    expect(hinges.get('p2')!.group.rotation.x).toBe(0);
    expect(hinges.get('p3')!.group.rotation.x).toBe(0);
  });

  it('ở progress = 1, toàn bộ góc xoay đều đạt góc gập tối đa', () => {
    const hinges = new Map<string, PanelHingeInfo>();
    hinges.set('p1', createMockHinge('p1', 1, 'y', 1, Math.PI / 2));
    hinges.set('p2', createMockHinge('p2', 2, 'x', -1, Math.PI / 2));

    applyFoldProgress(hinges, 1);

    expect(hinges.get('p1')!.group.rotation.y).toBeCloseTo(Math.PI / 2, 4);
    expect(hinges.get('p2')!.group.rotation.x).toBeCloseTo(-Math.PI / 2, 4);
  });

  it('tuân thủ đúng thứ tự step: step 3 chỉ bắt đầu gập khi các step trước đã hoàn tất', () => {
    const hinges = new Map<string, PanelHingeInfo>();
    hinges.set('p1', createMockHinge('p1', 1, 'y', 1, Math.PI / 2));
    hinges.set('p2', createMockHinge('p2', 2, 'x', 1, Math.PI / 2));
    hinges.set('p3', createMockHinge('p3', 3, 'x', 1, Math.PI / 2));

    // Với 3 step, khi progress = 0.33, step 1 đã đạt gần 100%, step 3 hoàn toàn chưa gập
    applyFoldProgress(hinges, 0.33);

    expect(hinges.get('p1')!.group.rotation.y).toBeGreaterThan(0.9 * (Math.PI / 2));
    expect(hinges.get('p3')!.group.rotation.x).toBe(0);
  });
});
