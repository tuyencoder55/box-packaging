// Định nghĩa loại hộp: Hộp mailer cuộn mép FEFCO 0427 (Roll End Tuck Front)
import { chamfer, trapezoid } from '../core/shapes';
import type { BoxDef, BoxParams, PanelNode } from '../core/types';

export const fefco0427: BoxDef = {
  id: 'fefco-0427',
  name: 'Hộp mailer cuộn mép',
  code: 'FEFCO 0427',
  category: 'mailer',
  defaults: {
    l: 250,
    w: 200,
    h: 80,
    t: 2,
  },
  options: [
    {
      key: 'tuckDepth',
      label: 'Chiều sâu lưỡi gài (mm)',
      type: 'number',
      default: 35,
      min: 25,
      max: 60,
    },
  ],
  dims: [
    { panelId: 'base', axis: 'u', param: 'l' },
    { panelId: 'base', axis: 'v', param: 'w' },
    { panelId: 'back', axis: 'v', param: 'h' },
  ],

  build(p: BoxParams): PanelNode[] {
    const { l, w, h } = p;
    const tuckH = Number(p.opts?.tuckDepth ?? 35);
    const innerH = Math.max(15, h - 2);
    const dustDepth = Math.max(15, h - 3);

    const nodes: PanelNode[] = [];

    // 1. Panel gốc: Đáy hộp (Base)
    nodes.push({
      id: 'base',
      parent: null,
      len: l,
      depth: w,
      fold: 0,
      step: 0,
      label: 'Đáy',
    });

    // 2. Thành sau (Back) gắn cạnh top của đáy
    nodes.push({
      id: 'back',
      parent: 'base',
      edge: 'top',
      len: l,
      depth: h,
      fold: 90,
      step: 1,
      label: 'Thành sau',
    });

    // 3. Nắp hộp (Lid) gắn cạnh top của thành sau
    nodes.push({
      id: 'lid',
      parent: 'back',
      edge: 'top',
      len: l,
      depth: w,
      fold: 90,
      step: 4,
      label: 'Nắp hộp',
    });

    // 4. Lưỡi gài trước (Tuck flap) gắn cạnh top của nắp
    nodes.push({
      id: 'tuck-flap',
      parent: 'lid',
      edge: 'top',
      len: l,
      depth: tuckH,
      shape: chamfer(l, tuckH, 8, 8),
      fold: 90,
      step: 5,
      label: 'Lưỡi gài trước',
    });

    // 5. Hai tai bụi bên hông nắp (Lid dust flaps)
    nodes.push({
      id: 'lid-dust-left',
      parent: 'lid',
      edge: 'left',
      len: w,
      depth: dustDepth,
      shape: trapezoid(w, dustDepth, 6, 6),
      fold: 90,
      step: 4,
      label: 'Tai bụi nắp trái',
    });

    nodes.push({
      id: 'lid-dust-right',
      parent: 'lid',
      edge: 'right',
      len: w,
      depth: dustDepth,
      shape: trapezoid(w, dustDepth, 6, 6),
      fold: 90,
      step: 4,
      label: 'Tai bụi nắp phải',
    });

    // 6. Thành trước (Front) gắn cạnh bottom của đáy
    nodes.push({
      id: 'front',
      parent: 'base',
      edge: 'bottom',
      len: l,
      depth: h,
      fold: 90,
      step: 1,
      label: 'Thành trước',
    });

    // 7. Thành trước trong cuộn mép (Front inner roll-over)
    nodes.push({
      id: 'front-inner',
      parent: 'front',
      edge: 'bottom',
      len: l,
      depth: innerH,
      shape: chamfer(l, innerH, 4, 4),
      fold: 180,
      step: 3,
      label: 'Thành trước trong',
    });

    // 8. Hông trái ngoài (Side left outer)
    nodes.push({
      id: 'side-left-outer',
      parent: 'base',
      edge: 'left',
      len: w,
      depth: h,
      fold: 90,
      step: 2,
      label: 'Hông trái ngoài',
    });

    // 9. Hông trái trong cuộn mép (Side left inner)
    nodes.push({
      id: 'side-left-inner',
      parent: 'side-left-outer',
      edge: 'left',
      len: w,
      depth: innerH,
      shape: chamfer(w, innerH, 4, 4),
      fold: 180,
      step: 3,
      label: 'Hông trái trong',
    });

    // 10. Tai góc sau & trước của hông trái
    nodes.push({
      id: 'corner-back-left',
      parent: 'side-left-outer',
      edge: 'top',
      len: h,
      depth: h,
      shape: trapezoid(h, h, 0, 6),
      fold: 90,
      step: 1,
      label: 'Tai góc sau trái',
    });

    nodes.push({
      id: 'corner-front-left',
      parent: 'side-left-outer',
      edge: 'bottom',
      len: h,
      depth: h,
      shape: trapezoid(h, h, 0, 6),
      fold: 90,
      step: 1,
      label: 'Tai góc trước trái',
    });

    // 11. Hông phải ngoài (Side right outer)
    nodes.push({
      id: 'side-right-outer',
      parent: 'base',
      edge: 'right',
      len: w,
      depth: h,
      fold: 90,
      step: 2,
      label: 'Hông phải ngoài',
    });

    // 12. Hông phải trong cuộn mép (Side right inner)
    nodes.push({
      id: 'side-right-inner',
      parent: 'side-right-outer',
      edge: 'right',
      len: w,
      depth: innerH,
      shape: chamfer(w, innerH, 4, 4),
      fold: 180,
      step: 3,
      label: 'Hông phải trong',
    });

    // 13. Tai góc sau & trước của hông phải
    nodes.push({
      id: 'corner-back-right',
      parent: 'side-right-outer',
      edge: 'top',
      len: h,
      depth: h,
      shape: trapezoid(h, h, 6, 0),
      fold: 90,
      step: 1,
      label: 'Tai góc sau phải',
    });

    nodes.push({
      id: 'corner-front-right',
      parent: 'side-right-outer',
      edge: 'bottom',
      len: h,
      depth: h,
      shape: trapezoid(h, h, 6, 0),
      fold: 90,
      step: 1,
      label: 'Tai góc trước phải',
    });

    return nodes;
  },
};
