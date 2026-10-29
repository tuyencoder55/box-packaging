// Dựng mô hình hộp 3D Three.js từ cây PanelNode (foldModel)
import * as THREE from 'three';
import type { LayoutPanel } from '../core/layout';
import type { PanelNode, Pt } from '../core/types';

export interface PanelHingeInfo {
  id: string;
  group: THREE.Group;
  mesh: THREE.Mesh;
  node: PanelNode;
  axis: 'x' | 'y';
  sign: number;
  maxAngleRad: number;
  step: number;
}

export interface FoldModelResult {
  rootGroup: THREE.Group;
  hinges: Map<string, PanelHingeInfo>;
  dispose: () => void;
}

/**
 * Chuyển đổi đa giác phẳng 2D (tọa độ khuôn) thành THREE.Shape
 * Lưu ý: hệ tọa độ 3D có Y hướng lên trên nên Three.Y = -Flat.Y
 */
function createPanelShape(poly: Pt[], originX: number, originY: number): THREE.Shape {
  const shape = new THREE.Shape();
  if (poly.length === 0) return shape;

  // Điểm đầu tiên (tọa độ tương đối so với bản lề)
  const startX = poly[0][0] - originX;
  const startY = -(poly[0][1] - originY);
  shape.moveTo(startX, startY);

  for (let i = 1; i < poly.length; i++) {
    const px = poly[i][0] - originX;
    const py = -(poly[i][1] - originY);
    shape.lineTo(px, py);
  }

  shape.closePath();
  return shape;
}

export function buildFoldModel(panels: LayoutPanel[]): FoldModelResult {
  const rootGroup = new THREE.Group();
  const hinges = new Map<string, PanelHingeInfo>();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Tạo vật liệu mặt giấy carton tự nhiên
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0xdfd3c3, // Giấy kraft sáng
    roughness: 0.8,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  materials.push(outerMat);

  // 1. Tính toán điểm gốc bản lề (hinge position) trong tọa độ phẳng cho từng panel
  const hingeOrigins = new Map<string, [number, number]>();

  panels.forEach((p) => {
    if (!p.node.parent || !p.baseSeg) {
      // Panel gốc: lấy điểm đầu tiên của poly làm gốc
      const minX = Math.min(...p.poly.map((pt: Pt) => pt[0]));
      const minY = Math.min(...p.poly.map((pt: Pt) => pt[1]));
      hingeOrigins.set(p.node.id, [minX, minY]);
    } else {
      // Panel con: bản lề chính là điểm bắt đầu của baseSeg
      hingeOrigins.set(p.node.id, [p.baseSeg.a[0], p.baseSeg.a[1]]);
    }
  });

  // 2. Tạo THREE.Group cho từng panel
  const groupMap = new Map<string, THREE.Group>();
  panels.forEach((p) => {
    const g = new THREE.Group();
    g.name = `hinge-${p.node.id}`;
    groupMap.set(p.node.id, g);
  });

  // 3. Dựng hình học và gắn cây phân cấp
  panels.forEach((p) => {
    const origin = hingeOrigins.get(p.node.id) ?? [0, 0];
    const shape = createPanelShape(p.poly, origin[0], origin[1]);
    const geo = new THREE.ShapeGeometry(shape);
    geometries.push(geo);

    const mesh = new THREE.Mesh(geo, outerMat);
    mesh.name = `mesh-${p.node.id}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const group = groupMap.get(p.node.id)!;
    group.add(mesh);

    // 1. Đường viền dao cắt bao quanh panel (cạnh giấy carton đậm rõ nét)
    const edgeGeo = new THREE.EdgesGeometry(geo);
    geometries.push(edgeGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x3d352b, // Viền cạnh cắt sắc nét
      linewidth: 1.5,
    });
    materials.push(edgeMat);
    const edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLine.position.z = 0.15; // Nổi nhẹ trên bề mặt để tránh z-fighting
    group.add(edgeLine);

    // 2. Đường nếp cấn (đường gấp bản lề) nét đứt màu đỏ nổi bật
    if (p.baseSeg) {
      const dx = p.baseSeg.b[0] - p.baseSeg.a[0];
      const dy = -(p.baseSeg.b[1] - p.baseSeg.a[1]);
      const creaseGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0.3),
        new THREE.Vector3(dx, dy, 0.3),
      ]);
      geometries.push(creaseGeo);
      const creaseMat = new THREE.LineDashedMaterial({
        color: 0xef4444, // Màu đỏ nếp cấn rõ nét
        dashSize: 4,
        gapSize: 2.5,
        linewidth: 2,
      });
      materials.push(creaseMat);
      const creaseLine = new THREE.Line(creaseGeo, creaseMat);
      creaseLine.computeLineDistances();
      group.add(creaseLine);
    }

    // Xác định trục xoay và hướng xoay (sign)
    // fold 90° nghĩa là gập về phía sau (-Z)
    let axis: 'x' | 'y' = 'y';
    let sign = 1;

    if (p.node.edge === 'top') {
      axis = 'x';
      sign = 1; // Xoay quanh trục X
    } else if (p.node.edge === 'bottom') {
      axis = 'x';
      sign = -1;
    } else if (p.node.edge === 'left') {
      axis = 'y';
      sign = -1;
    } else if (p.node.edge === 'right') {
      axis = 'y';
      sign = 1;
    }

    const maxAngleRad = ((p.node.fold ?? 90) * Math.PI) / 180;

    hinges.set(p.node.id, {
      id: p.node.id,
      group,
      mesh,
      node: p.node,
      axis,
      sign,
      maxAngleRad,
      step: p.node.step ?? 1,
    });

    if (!p.node.parent) {
      // Panel gốc: gắn trực tiếp vào rootGroup
      // Chuyển tọa độ tương đối vào giữa Scene
      group.position.set(0, 0, 0);
      rootGroup.add(group);
    } else {
      // Panel con: gắn vào group của cha
      const parentGroup = groupMap.get(p.node.parent);
      const parentOrigin = hingeOrigins.get(p.node.parent) ?? [0, 0];

      if (parentGroup) {
        // Tọa độ tương đối so với gốc bản lề của cha
        const relX = origin[0] - parentOrigin[0];
        const relY = -(origin[1] - parentOrigin[1]);
        group.position.set(relX, relY, 0);
        parentGroup.add(group);
      } else {
        rootGroup.add(group);
      }
    }
  });

  // 4. Căn giữa toàn bộ mô hình hộp tại gốc tọa độ (0, 0, 0)
  const rootBox = new THREE.Box3().setFromObject(rootGroup);
  const center = new THREE.Vector3();
  rootBox.getCenter(center);
  rootGroup.position.sub(center);

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return {
    rootGroup,
    hinges,
    dispose,
  };
}
