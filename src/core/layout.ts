// Thuật toán bố cục khuôn phẳng: Cây PanelNode → toạ độ 2D phẳng (x, y)
import { rect } from './shapes';
import type { PanelNode, Pt, Seg } from './types';

export interface LayoutPanel {
  node: PanelNode;
  poly: Pt[]; // Đa giác trong toạ độ phẳng (mm)
  rect: [number, number, number, number]; // [x, y, w, h] hình chữ nhật bao trong toạ độ phẳng
  baseSeg: Seg | null; // Đoạn cạnh gắn chung với cha (đường cấn)
}

/**
 * Tính toạ độ phẳng cho toàn bộ cây PanelNode
 */
export function layoutPanels(nodes: PanelNode[]): LayoutPanel[] {
  if (nodes.length === 0) return [];

  const root = nodes.find((n) => n.parent === null);
  if (!root) {
    throw new Error('Không tìm thấy panel gốc (panel có parent = null)');
  }

  // Gom các panel con theo id của cha
  const childrenMap = new Map<string, PanelNode[]>();
  for (const n of nodes) {
    if (n.parent !== null) {
      const list = childrenMap.get(n.parent) ?? [];
      list.push(n);
      childrenMap.set(n.parent, list);
    }
  }

  const result: LayoutPanel[] = [];
  const layoutMap = new Map<string, LayoutPanel>();

  // Xử lý panel gốc: đặt tại (0, 0)
  const rootShape = root.shape ?? rect(root.len, root.depth);
  const rootLayout: LayoutPanel = {
    node: root,
    poly: rootShape.map(([u, v]) => [u, v]),
    rect: [0, 0, root.len, root.depth],
    baseSeg: null,
  };

  result.push(rootLayout);
  layoutMap.set(root.id, rootLayout);

  // Duyệt cây theo chiều sâu
  function processChildren(parentId: string) {
    const parentLayout = layoutMap.get(parentId);
    if (!parentLayout) return;

    const [px, py, pw, ph] = parentLayout.rect;
    const children = childrenMap.get(parentId) ?? [];

    for (const child of children) {
      const o = child.offset ?? 0;
      const edge = child.edge ?? 'top';

      let transform: (u: number, v: number) => Pt;
      let childRect: [number, number, number, number];
      let baseSeg: Seg;

      switch (edge) {
        case 'top': {
          const x0 = px + o;
          const y0 = py;
          transform = (u, v) => [x0 + u, y0 - v];
          baseSeg = { a: [x0, y0], b: [x0 + child.len, y0] };
          childRect = [x0, y0 - child.depth, child.len, child.depth];
          break;
        }
        case 'bottom': {
          const x0 = px + o;
          const y0 = py + ph;
          transform = (u, v) => [x0 + u, y0 + v];
          baseSeg = { a: [x0, y0], b: [x0 + child.len, y0] };
          childRect = [x0, y0, child.len, child.depth];
          break;
        }
        case 'left': {
          const x0 = px;
          const y0 = py + o;
          transform = (u, v) => [x0 - v, y0 + u];
          baseSeg = { a: [x0, y0], b: [x0, y0 + child.len] };
          childRect = [x0 - child.depth, y0, child.depth, child.len];
          break;
        }
        case 'right': {
          const x0 = px + pw;
          const y0 = py + o;
          transform = (u, v) => [x0 + v, y0 + u];
          baseSeg = { a: [x0, y0], b: [x0, y0 + child.len] };
          childRect = [x0, y0, child.depth, child.len];
          break;
        }
      }

      const localShape = child.shape ?? rect(child.len, child.depth);
      const childLayout: LayoutPanel = {
        node: child,
        poly: localShape.map(([u, v]) => transform(u, v)),
        rect: childRect,
        baseSeg,
      };

      result.push(childLayout);
      layoutMap.set(child.id, childLayout);

      // Đệ quy cho con của child
      processChildren(child.id);
    }
  }

  processChildren(root.id);
  return result;
}

