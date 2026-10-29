import { describe, expect, it } from 'vitest';
import { snapLockHangTab } from './snap-lock-hang-tab';
import { buildDieline } from '../core/dieline';
import { layoutPanels } from '../core/layout';

describe('snapLockHangTab (ECMA A50 + Hang Tab)', () => {
  it('định nghĩa đúng thông tin cơ bản của hộp tai treo đáy khoá cài 1-2-3', () => {
    expect(snapLockHangTab.id).toBe('snap-lock-hang-tab');
    expect(snapLockHangTab.code).toBe('ECMA A50 + Hang Tab');
    expect(snapLockHangTab.category).toBe('tuck');
    expect(snapLockHangTab.defaults).toEqual({
      l: 75,
      w: 40,
      h: 120,
      t: 0.5,
    });
  });

  it('tạo đúng 14 panels bao gồm thân, tai treo header, nắp gài trên và 4 cánh đáy khoá cài', () => {
    const panels = snapLockHangTab.build({
      l: 75,
      w: 40,
      h: 120,
      t: 0.5,
      opts: { headerHeight: 35 },
    });

    expect(panels.length).toBe(14);

    const ids = panels.map((p) => p.id);
    expect(ids).toContain('panel-a');
    expect(ids).toContain('glue');
    expect(ids).toContain('panel-b');
    expect(ids).toContain('panel-c');
    expect(ids).toContain('panel-d');
    expect(ids).toContain('hang-header');
    expect(ids).toContain('top-lid');
    expect(ids).toContain('top-tuck');
    expect(ids).toContain('dust-top-b');
    expect(ids).toContain('dust-top-d');
    expect(ids).toContain('bot-a');
    expect(ids).toContain('bot-b');
    expect(ids).toContain('bot-c');
    expect(ids).toContain('bot-d');

    expect(panels.find((p) => p.id === 'hang-header')?.parent).toBe('panel-c');
    expect(panels.find((p) => p.id === 'top-lid')?.parent).toBe('panel-a');
    expect(panels.find((p) => p.id === 'bot-a')?.parent).toBe('panel-a');
  });

  it('layout và dieline tính toán bbox chuẩn xác', () => {
    const panels = snapLockHangTab.build({
      l: 75,
      w: 40,
      h: 120,
      t: 0.5,
      opts: { headerHeight: 35, glueWidth: 15, tuckDepth: 16 },
    });

    const positioned = layoutPanels(panels);
    const dieline = buildDieline(positioned);

    expect(dieline.cut.length).toBeGreaterThan(0);
    expect(dieline.crease.length).toBe(13);

    const [, , width, height] = dieline.bbox;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);

    // Bề rộng = glue(15) + A(75) + B(40) + C(75) + D(40) = 245
    expect(width).toBeCloseTo(245, 1);
    // Bề cao = top-tuck(16) + top-lid(40) + body(120) + bot-a(20 + 10 = 30) = 206
    expect(height).toBeCloseTo(206, 1);
  });
});
