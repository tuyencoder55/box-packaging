import { describe, expect, it } from 'vitest';
import { fefco0201 } from '../boxes/fefco-0201';
import { layoutPanels } from '../core/layout';
import { buildFoldModel } from './foldModel';

describe('render3d/foldModel', () => {
  it('dựng đúng 13 bản lề và cấu trúc nhóm lồng nhau cho thùng fefco-0201', () => {
    const panels = fefco0201.build({
      l: 200,
      w: 150,
      h: 120,
      t: 3,
      opts: {},
    });

    const positioned = layoutPanels(panels);
    const model = buildFoldModel(positioned);

    expect(model.rootGroup).toBeDefined();
    expect(model.hinges.size).toBe(13);

    // Kiểm tra cấu trúc bản lề mặt B (con của A)
    const hingeA = model.hinges.get('panel-a');
    const hingeB = model.hinges.get('panel-b');
    expect(hingeA).toBeDefined();
    expect(hingeB).toBeDefined();

    // Group B phải nằm trong children của Group A
    expect(hingeA!.group.children).toContain(hingeB!.group);

    // Kiểm tra trục xoay
    // Panel B gắn cạnh 'right' của A -> xoay quanh trục Y
    expect(hingeB!.axis).toBe('y');

    // Nắp trên gắn cạnh 'top' của B -> xoay quanh trục X
    const topFlapB = model.hinges.get('top-flap-b');
    expect(topFlapB).toBeDefined();
    expect(topFlapB!.axis).toBe('x');

    // Dọn dẹp tài nguyên
    expect(() => model.dispose()).not.toThrow();
  });
});
