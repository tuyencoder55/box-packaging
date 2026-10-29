import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { calcCameraDistance, setupSceneLights } from './scene';

describe('render3d/scene', () => {
  it('calcCameraDistance tính toán khoảng cách camera hợp lý dựa trên kích thước hộp', () => {
    // maxDim = 200, fov = 45 -> khoảng 362 mm
    const dist1 = calcCameraDistance(200, 45);
    expect(dist1).toBeGreaterThanOrEqual(300);

    // Hộp lớn maxDim = 800 -> khoảng cách lớn hơn tương ứng
    const dist2 = calcCameraDistance(800, 45);
    expect(dist2).toBeGreaterThan(dist1);
  });

  it('setupSceneLights thêm đèn Ambient và Directional vào Scene', () => {
    const scene = new THREE.Scene();
    const lights = setupSceneLights(scene);

    expect(lights.ambient).toBeInstanceOf(THREE.AmbientLight);
    expect(lights.dir1).toBeInstanceOf(THREE.DirectionalLight);
    expect(lights.dir2).toBeInstanceOf(THREE.DirectionalLight);

    expect(scene.children).toContain(lights.ambient);
    expect(scene.children).toContain(lights.dir1);
    expect(scene.children).toContain(lights.dir2);
  });
});
