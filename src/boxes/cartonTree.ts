// Trình tạo cây PanelNode cho các loại hộp carton gập chuẩn ECMA / Packfino
import { capsule, chamfer, oval, rounded, trapezoid } from '../core/shapes';
import type { BoxParams, PanelNode } from '../core/types';

export interface CartonConfig {
  top: 'back' | 'front' | 'seal';
  bottom?: 'back' | 'front';
  base?: 'tuck' | 'crash' | 'snap' | 'seal';
  header?: number;
  topDispenser?: boolean; // Lỗ oval trên nắp dán (Cube tissue box)
  frontDispenser?: 'dispenser' | 'flat-tissue'; // Lỗ oval ở mặt trước
}

/**
 * Xây dựng cây PanelNode chuẩn ECMA cho 13 mẫu hộp gấp (Tuck End Boxes & Biến thể)
 * Trục thân: [Lưỡi dán] -> [Mặt sau (Back)] -> [Mặt hông trái (Left)] -> [Mặt trước (Front)] -> [Mặt hông phải (Right)]
 */
export function buildFoldingCarton(p: BoxParams, config: CartonConfig): PanelNode[] {
  const { l, w, h, t } = p;
  const g = Number(p.opts?.glueWidth ?? 15);
  const tuckH = Number(p.opts?.tuckDepth ?? 16);
  const dustH = Math.min(22, Math.max(12, w * 0.5));
  const baseType = config.base ?? 'tuck';

  const nodes: PanelNode[] = [];

  // =========================================================================
  // 1. Thân hộp chuỗi ngang: Back (gốc) -> Left -> Front -> Right
  // =========================================================================

  // Mặt sau (Back) - Panel gốc đặt tại (0, 0)
  nodes.push({
    id: 'panel-back',
    parent: null,
    len: l,
    depth: h,
    fold: 0,
    step: 0,
    label: 'Mặt sau',
  });

  // Lưỡi dán thân hộp gắn cạnh trái Mặt sau
  nodes.push({
    id: 'glue',
    parent: 'panel-back',
    edge: 'left',
    len: h,
    depth: g,
    shape: chamfer(h, g, 3, 3),
    glue: true,
    fold: 90,
    step: 1,
    label: 'Lưỡi dán',
  });

  // Mặt hông trái (Left)
  nodes.push({
    id: 'panel-left',
    parent: 'panel-back',
    edge: 'right',
    len: h,
    depth: w,
    fold: 90,
    step: 1,
    label: 'Mặt hông trái',
  });

  // Mặt trước (Front)
  let frontHoles: [number, number][][] | undefined;
  if (config.frontDispenser === 'dispenser') {
    // Lỗ oval lấy sản phẩm (Dispenser box)
    const rx = l * 0.32;
    const ry = Math.min(h * 0.15, 28);
    frontHoles = [oval(l / 2, h * 0.3, rx, ry)];
  } else if (config.frontDispenser === 'flat-tissue') {
    // Lỗ oval hộp khăn giấy chữ nhật (Rectangular tissue box)
    const rx = l * 0.3;
    const ry = Math.min(h * 0.18, 22);
    frontHoles = [oval(l / 2, h / 2, rx, ry)];
  }

  nodes.push({
    id: 'panel-front',
    parent: 'panel-left',
    edge: 'right',
    len: h,
    depth: l,
    holes: frontHoles,
    fold: 90,
    step: 1,
    label: 'Mặt trước',
  });

  // Mặt hông phải (Right)
  nodes.push({
    id: 'panel-right',
    parent: 'panel-front',
    edge: 'right',
    len: h,
    depth: w,
    fold: 90,
    step: 1,
    label: 'Mặt hông phải',
  });

  // =========================================================================
  // 2. Hệ thống Nắp trên & Thẻ treo (Top / Header)
  // =========================================================================

  // Thẻ treo (Hang tab header) trên Mặt sau
  if (config.header && config.header > 0) {
    const headerH = config.header;
    const slotW = Math.min(l * 0.5, 32);
    const slotH = 8;
    const slotX = (l - slotW) / 2;
    const slotY = (headerH - slotH) / 2;

    nodes.push({
      id: 'header',
      parent: 'panel-back',
      edge: 'top',
      len: l,
      depth: headerH,
      holes: [capsule(slotX, slotY, slotW, slotH)],
      fold: 0,
      step: 0,
      label: 'Thẻ treo',
    });

    nodes.push({
      id: 'header-inner',
      parent: 'header',
      edge: 'top',
      len: l,
      depth: headerH,
      holes: [capsule(slotX, slotY, slotW, slotH)],
      fold: 180,
      step: 1,
      label: 'Gập đôi thẻ treo',
    });
  }

  // Nắp trên gài (Tuck lid) gắn Mặt sau
  if (config.top === 'back') {
    nodes.push({
      id: 'top-lid',
      parent: 'panel-back',
      edge: 'top',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp trên',
    });

    nodes.push({
      id: 'top-tuck',
      parent: 'top-lid',
      edge: 'top',
      len: l,
      depth: tuckH,
      shape: rounded(l, tuckH, 4, 4),
      fold: 90,
      step: 4,
      label: 'Lưỡi gài trên',
    });
  } else if (config.top === 'front') {
    // Nắp trên gài (Tuck lid) gắn Mặt trước (dành cho hộp thẻ treo hoặc reverse)
    nodes.push({
      id: 'top-lid',
      parent: 'panel-front',
      edge: 'top',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp trên',
    });

    nodes.push({
      id: 'top-tuck',
      parent: 'top-lid',
      edge: 'top',
      len: l,
      depth: tuckH,
      shape: rounded(l, tuckH, 4, 4),
      fold: 90,
      step: 4,
      label: 'Lưỡi gài trên',
    });
  } else if (config.top === 'seal') {
    // Nắp dán keo niêm phong (Seal end)
    const sealDepthInner = Math.max(10, w - 2 * t);
    const sealDepthOuter = Math.max(12, w - t);

    let sealHolesInner: [number, number][][] | undefined;
    let sealHolesOuter: [number, number][][] | undefined;
    if (config.topDispenser) {
      const rx = l * 0.3;
      const ry = Math.min(w * 0.2, 22);
      sealHolesInner = [oval(l / 2, sealDepthInner / 2, rx, ry)];
      sealHolesOuter = [oval(l / 2, sealDepthOuter / 2, rx, ry)];
    }

    nodes.push({
      id: 'top-seal-inner',
      parent: 'panel-back',
      edge: 'top',
      len: l,
      depth: sealDepthInner,
      shape: chamfer(l, sealDepthInner, 2, 2),
      holes: sealHolesInner,
      fold: 90,
      step: 3,
      label: 'Nắp dán trong trên',
    });

    nodes.push({
      id: 'top-seal-outer',
      parent: 'panel-front',
      edge: 'top',
      len: l,
      depth: sealDepthOuter,
      shape: chamfer(l, sealDepthOuter, 2, 2),
      holes: sealHolesOuter,
      fold: 90,
      step: 4,
      label: 'Nắp dán ngoài trên',
    });
  }

  // Tai bụi nắp trên (Left & Right)
  nodes.push({
    id: 'dust-top-left',
    parent: 'panel-left',
    edge: 'top',
    len: w,
    depth: dustH,
    shape: trapezoid(w, dustH, 2, 2),
    fold: 90,
    step: 2,
    label: 'Tai bụi trên trái',
  });

  nodes.push({
    id: 'dust-top-right',
    parent: 'panel-right',
    edge: 'top',
    len: w,
    depth: dustH,
    shape: trapezoid(w, dustH, 2, 2),
    fold: 90,
    step: 2,
    label: 'Tai bụi trên phải',
  });

  // =========================================================================
  // 3. Hệ thống Nắp đáy / Đáy khoá / Đáy dán (Base / Bottom)
  // =========================================================================

  if (baseType === 'tuck') {
    // Đáy gài nắp (Tuck bottom)
    const bottomTarget = config.bottom ?? 'front';
    const bottomParent = bottomTarget === 'back' ? 'panel-back' : 'panel-front';

    nodes.push({
      id: 'bot-lid',
      parent: bottomParent,
      edge: 'bottom',
      len: l,
      depth: w,
      fold: 90,
      step: 3,
      label: 'Nắp đáy',
    });

    nodes.push({
      id: 'bot-tuck',
      parent: 'bot-lid',
      edge: 'bottom',
      len: l,
      depth: tuckH,
      shape: rounded(l, tuckH, 4, 4),
      fold: 90,
      step: 4,
      label: 'Lưỡi gài đáy',
    });

    // Tai bụi đáy
    nodes.push({
      id: 'dust-bot-left',
      parent: 'panel-left',
      edge: 'bottom',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Tai bụi đáy trái',
    });

    nodes.push({
      id: 'dust-bot-right',
      parent: 'panel-right',
      edge: 'bottom',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Tai bụi đáy phải',
    });
  } else if (baseType === 'seal') {
    // Đáy dán keo (Seal bottom)
    const sealDepthInner = Math.max(10, w - 2 * t);
    const sealDepthOuter = Math.max(12, w - t);

    nodes.push({
      id: 'bot-seal-inner',
      parent: 'panel-back',
      edge: 'bottom',
      len: l,
      depth: sealDepthInner,
      shape: chamfer(l, sealDepthInner, 2, 2),
      fold: 90,
      step: 3,
      label: 'Nắp dán trong đáy',
    });

    nodes.push({
      id: 'bot-seal-outer',
      parent: 'panel-front',
      edge: 'bottom',
      len: l,
      depth: sealDepthOuter,
      shape: chamfer(l, sealDepthOuter, 2, 2),
      fold: 90,
      step: 4,
      label: 'Nắp dán ngoài đáy',
    });

    nodes.push({
      id: 'dust-bot-left',
      parent: 'panel-left',
      edge: 'bottom',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Tai bụi đáy trái',
    });

    nodes.push({
      id: 'dust-bot-right',
      parent: 'panel-right',
      edge: 'bottom',
      len: w,
      depth: dustH,
      shape: trapezoid(w, dustH, 2, 2),
      fold: 90,
      step: 2,
      label: 'Tai bụi đáy phải',
    });
  } else if (baseType === 'snap') {
    // Đáy khoá gài 1-2-3 (Snap lock bottom)
    const v = w / 2;
    const y = l * 0.34;
    const b = Math.min(w * 0.2, 14);
    const r = (l - y) / 2;

    // Cánh khoá sau (Lock flap với rãnh gài)
    nodes.push({
      id: 'bot-back-lock',
      parent: 'panel-back',
      edge: 'bottom',
      len: l,
      depth: v,
      holes: [capsule((l - y) / 2, v - 2, y, 2)],
      fold: 90,
      step: 2,
      label: 'Cánh đáy sau có rãnh',
    });

    // Cánh khoá trước (Tongue flap lưỡi cài)
    const tongueShape: [number, number][] = [
      [0, 0],
      [l, 0],
      [l, v],
      [r + y, v],
      [r + y - 2, v + b],
      [r + 2, v + b],
      [r, v],
      [0, v],
    ];

    nodes.push({
      id: 'bot-front-tongue',
      parent: 'panel-front',
      edge: 'bottom',
      len: l,
      depth: v + b,
      shape: tongueShape,
      fold: 90,
      step: 2,
      label: 'Lưỡi khoá đáy trước',
    });

    // 2 cánh hông trợ lực (Side lock flaps)
    const sf = Math.min(l * 0.45, v);
    const sideShape: [number, number][] = [
      [0, 0],
      [w, 0],
      [w - sf * 0.6, sf],
      [sf * 0.6, sf],
    ];

    nodes.push({
      id: 'bot-left-lock',
      parent: 'panel-left',
      edge: 'bottom',
      len: w,
      depth: sf,
      shape: sideShape,
      fold: 90,
      step: 2,
      label: 'Cánh đáy hông trái',
    });

    nodes.push({
      id: 'bot-right-lock',
      parent: 'panel-right',
      edge: 'bottom',
      len: w,
      depth: sf,
      shape: sideShape,
      fold: 90,
      step: 2,
      label: 'Cánh đáy hông phải',
    });
  } else if (baseType === 'crash') {
    // Đáy khoá tự động dán sẵn (Auto crash lock bottom)
    const botDepth = Math.round(w * 0.55);

    // Cánh móc sau
    const shapeBotBack: [number, number][] = [
      [0, 0],
      [l, 0],
      [l - 6, botDepth],
      [l * 0.5 + 4, botDepth],
      [l * 0.5, botDepth - 4],
      [6, botDepth - 4],
      [0, botDepth - 10],
    ];

    nodes.push({
      id: 'bot-crash-back',
      parent: 'panel-back',
      edge: 'bottom',
      len: l,
      depth: botDepth,
      shape: shapeBotBack,
      fold: 90,
      step: 2,
      label: 'Cánh khoá móc sau',
    });

    // Cánh móc trước
    const shapeBotFront: [number, number][] = [
      [0, 0],
      [l, 0],
      [l, botDepth - 10],
      [l - 6, botDepth - 4],
      [l * 0.5, botDepth - 4],
      [l * 0.5 - 4, botDepth],
      [6, botDepth],
      [0, 0],
    ];

    nodes.push({
      id: 'bot-crash-front',
      parent: 'panel-front',
      edge: 'bottom',
      len: l,
      depth: botDepth,
      shape: shapeBotFront,
      fold: 90,
      step: 2,
      label: 'Cánh khoá móc trước',
    });

    // Hai cánh dán trợ lực hông
    const shapeBotSide: [number, number][] = [
      [0, 0],
      [w, 0],
      [w - 6, botDepth],
      [6, botDepth],
    ];

    nodes.push({
      id: 'bot-crash-left',
      parent: 'panel-left',
      edge: 'bottom',
      len: w,
      depth: botDepth,
      shape: shapeBotSide,
      fold: 90,
      step: 2,
      label: 'Cánh trợ lực hông trái',
    });

    nodes.push({
      id: 'bot-crash-right',
      parent: 'panel-right',
      edge: 'bottom',
      len: w,
      depth: botDepth,
      shape: shapeBotSide,
      fold: 90,
      step: 2,
      label: 'Cánh trợ lực hông phải',
    });
  }

  return nodes;
}
