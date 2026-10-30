// Dựng mô hình hộp 3D Three.js từ cây PanelNode (foldModel)
import * as THREE from 'three';
import type { LayoutPanel } from '../core/layout';
import type { PanelNode, Pt } from '../core/types';
import { FLUTE_ATLAS_PNG, FLUTE_SPECS, type FluteType } from './fluteAssets';

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

export interface FoldModelOptions {
  paperColor?: string | number;
  paperTexture?: FluteType | 'ivory';
  thickness?: number;
}

export interface FoldModelResult {
  rootGroup: THREE.Group;
  hinges: Map<string, PanelHingeInfo>;
  outerMaterial: THREE.MeshStandardMaterial;
  edgeMaterial: THREE.MeshStandardMaterial;
  setPaperColor: (color: string | number) => void;
  setPaperTexture: (type: FluteType | 'ivory') => void;
  dispose: () => void;
}

/**
 * Trình quản lý họa tiết lát cắt sóng carton (Corrugated Flute Edge Texture)
 */
function createEdgeTextureManager() {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const ctx = canvas?.getContext('2d');
  if (canvas) {
    canvas.width = 256;
    canvas.height = 128;
  }
  let atlasImg: HTMLImageElement | null = null;
  if (typeof Image !== 'undefined') {
    atlasImg = new Image();
    atlasImg.src = FLUTE_ATLAS_PNG;
  }

  const texture = canvas ? new THREE.CanvasTexture(canvas) : new THREE.Texture();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const update = (flute: FluteType | 'ivory') => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (flute === 'ivory') {
      ctx.fillStyle = '#f4f0ea';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
      return;
    }
    const spec = FLUTE_SPECS[flute] || FLUTE_SPECS.flute_b;
    const draw = () => {
      if (atlasImg && atlasImg.naturalWidth > 0) {
        ctx.drawImage(
          atlasImg,
          0,
          spec.start,
          atlasImg.naturalWidth,
          spec.end - spec.start,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        ctx.fillStyle = '#c29b6f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      texture.needsUpdate = true;
    };

    if (atlasImg?.complete && atlasImg.naturalWidth > 0) {
      draw();
    } else if (atlasImg) {
      atlasImg.onload = draw;
    }
  };

  return { texture, update };
}

/**
 * Chuyển đổi đa giác phẳng 2D (tọa độ khuôn) thành THREE.Shape
 * Lưu ý: hệ tọa độ 3D có Y hướng lên trên nên Three.Y = -Flat.Y
 */
function createPanelShape(poly: Pt[], originX: number, originY: number, holes?: Pt[][]): THREE.Shape {
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

  // Đục các lỗ cắt kín
  if (holes && holes.length > 0) {
    for (const hole of holes) {
      if (hole.length < 3) continue;
      const holePath = new THREE.Path();
      const h0x = hole[0][0] - originX;
      const h0y = -(hole[0][1] - originY);
      holePath.moveTo(h0x, h0y);
      for (let j = 1; j < hole.length; j++) {
        const hx = hole[j][0] - originX;
        const hy = -(hole[j][1] - originY);
        holePath.lineTo(hx, hy);
      }
      holePath.closePath();
      shape.holes.push(holePath);
    }
  }

  return shape;
}

export function buildFoldModel(panels: LayoutPanel[], options?: FoldModelOptions): FoldModelResult {
  const rootGroup = new THREE.Group();
  const hinges = new Map<string, PanelHingeInfo>();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // Tạo vật liệu mặt giấy carton tự nhiên
  const initialColor = options?.paperColor ?? 0xc8a882;
  const outerMat = new THREE.MeshStandardMaterial({
    color: initialColor, // Giấy kraft chuẩn bao bì
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  materials.push(outerMat);

  // Tạo vật liệu lát cắt sóng carton cho các cạnh viền cắt
  const edgeManager = createEdgeTextureManager();
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: edgeManager.texture,
    roughness: 0.9,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  materials.push(edgeMat);

  const setPaperColor = (color: string | number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outerMat.color.set(color as any);
  };

  const setPaperTexture = (type: FluteType | 'ivory') => {
    edgeManager.update(type);
    edgeMat.needsUpdate = true;

    switch (type) {
      case 'ivory':
        outerMat.roughness = 0.35;
        outerMat.metalness = 0.02;
        break;
      case 'flute_e':
        outerMat.roughness = 0.78;
        outerMat.metalness = 0.05;
        break;
      case 'flute_b':
        outerMat.roughness = 0.88;
        outerMat.metalness = 0.05;
        break;
      case 'flute_bc':
        outerMat.roughness = 0.96;
        outerMat.metalness = 0.08;
        break;
      case 'flute_feng':
        outerMat.roughness = 0.98;
        outerMat.metalness = 0.1;
        break;
    }
  };

  const currentFlute = options?.paperTexture ?? 'flute_b';
  setPaperTexture(currentFlute);

  const spec = FLUTE_SPECS[currentFlute === 'ivory' ? 'flute_e' : currentFlute] || FLUTE_SPECS.flute_b;
  const panelThickness = options?.thickness ?? spec.thickness;
  const flutePitch = spec.pitch;

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

  // 3. Dựng hình học 3D có độ dày & vân sóng carton trên các cạnh
  panels.forEach((p) => {
    const origin = hingeOrigins.get(p.node.id) ?? [0, 0];
    const shape = createPanelShape(p.poly, origin[0], origin[1], p.holes);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: panelThickness,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -panelThickness / 2);

    // Chuẩn hoá tọa độ UV các mặt bên (Extrude side faces) để hiển thị lượn sóng sin liên tục theo chu vi
    const uv = geo.attributes.uv;
    const sideGroup = geo.groups[1];
    if (sideGroup && uv) {
      for (let i = sideGroup.start; i < sideGroup.start + sideGroup.count; i++) {
        const u = uv.getX(i) / flutePitch;
        const rawV = uv.getY(i);
        const v = (1 - rawV) / panelThickness;
        uv.setXY(i, u, v);
      }
      uv.needsUpdate = true;
    }
    geometries.push(geo);

    // Mặt trước/sau dùng outerMat (mặt giấy), mặt cạnh cắt dùng edgeMat (sóng carton)
    const mesh = new THREE.Mesh(geo, [outerMat, edgeMat]);
    mesh.name = `mesh-${p.node.id}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const group = groupMap.get(p.node.id)!;
    group.add(mesh);

    // 1. Đường viền dao cắt mờ sắc nét định hình mép phôi
    const edgeGeo = new THREE.EdgesGeometry(geo, 35);
    geometries.push(edgeGeo);
    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x3d352b,
      transparent: true,
      opacity: 0.35,
    });
    materials.push(edgeLineMat);
    const edgeLine = new THREE.LineSegments(edgeGeo, edgeLineMat);
    group.add(edgeLine);

    // 2. Đường nếp cấn (đường gấp bản lề) nét đứt màu đỏ nổi bật
    if (p.baseSeg) {
      const dx = p.baseSeg.b[0] - p.baseSeg.a[0];
      const dy = -(p.baseSeg.b[1] - p.baseSeg.a[1]);
      const zOffset = panelThickness / 2 + 0.15;
      const creaseGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, zOffset),
        new THREE.Vector3(dx, dy, zOffset),
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
    // Quy ước chuẩn: fold > 0 gập vào trong (về phía sau -Z của mặt giấy)
    let axis: 'x' | 'y' = 'y';
    let sign = 1;

    if (p.node.edge === 'top') {
      axis = 'x';
      sign = -1; // Cạnh trên: xoay quanh X gập vào trong (-Z)
    } else if (p.node.edge === 'bottom') {
      axis = 'x';
      sign = 1; // Cạnh dưới: xoay quanh X gập vào trong (-Z)
    } else if (p.node.edge === 'left') {
      axis = 'y';
      sign = -1; // Cạnh trái: xoay quanh Y gập vào trong (-Z)
    } else if (p.node.edge === 'right') {
      axis = 'y';
      sign = 1; // Cạnh phải: xoay quanh Y gập vào trong (-Z)
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
      // Đặt toạ độ theo điểm gốc ban đầu (hỗ trợ mô hình có nhiều panel gốc độc lập như bộ Nắp & Đáy)
      const origin = hingeOrigins.get(p.node.id) ?? [0, 0];
      group.position.set(origin[0], -origin[1], 0);
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
    outerMaterial: outerMat,
    edgeMaterial: edgeMat,
    setPaperColor,
    setPaperTexture,
    dispose,
  };
}
