// Kiểm thử hàm tạo hình học trong src/core/shapes.ts
import { describe, expect, it } from 'vitest';
import { capsule, chamfer, oval, rect, rounded, trapezoid } from './shapes';

describe('shapes', () => {
  it('rect tạo đúng 4 điểm chữ nhật len × depth', () => {
    const poly = rect(100, 50);
    expect(poly).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ]);
  });

  it('trapezoid tạo hình thang đúng độ thụt hai bên', () => {
    const poly = trapezoid(100, 50, 10, 15);
    expect(poly).toEqual([
      [0, 0],
      [100, 0],
      [85, 50],
      [10, 50],
    ]);
  });

  it('chamfer vát 2 góc ngoài', () => {
    const poly = chamfer(100, 50, 5, 8);
    expect(poly).toEqual([
      [0, 0],
      [100, 0],
      [100, 42],
      [92, 50],
      [5, 50],
      [0, 45],
    ]);
  });

  it('chamfer khi vát = 0 quay về hình chữ nhật 4 điểm', () => {
    const poly = chamfer(100, 50, 0, 0);
    expect(poly).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ]);
  });

  it('rounded bo góc có điểm đầu và điểm cuối cung tròn khớp kích thước', () => {
    const poly = rounded(100, 50, 10, 10, 4);
    expect(poly[0]).toEqual([0, 0]);
    expect(poly[1]).toEqual([100, 0]);
    // Cung phải bắt đầu tại [100, 40]
    expect(Math.round(poly[2][0])).toBe(100);
    expect(Math.round(poly[2][1])).toBe(40);
  });

  it('oval tạo đa giác elip kín với bán kính chính xác', () => {
    const pts = oval(50, 50, 20, 10, 16);
    expect(pts.length).toBe(16);
    expect(pts[0][0]).toBe(70);
    expect(pts[0][1]).toBe(50);
  });

  it('capsule tạo rãnh nhộng / Euro slot chuẩn', () => {
    const pts = capsule(10, 20, 40, 10, 4);
    expect(pts.length).toBeGreaterThan(10);
    // Bắt đầu tại [x + r, y] = [15, 20]
    expect(pts[0]).toEqual([15, 20]);
  });
});


