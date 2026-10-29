// Kiểm thử hàm chuyển đổi đơn vị trong src/core/units.ts
import { describe, expect, it } from 'vitest';
import { formatUnit, mmToUnit, round3, unitToMm } from './units';

describe('units', () => {
  it('giữ nguyên giá trị khi là mm', () => {
    expect(mmToUnit(100, 'mm')).toBe(100);
    expect(unitToMm(100, 'mm')).toBe(100);
  });

  it('chuyển đổi chính xác mm ↔ cm', () => {
    expect(mmToUnit(250, 'cm')).toBe(25);
    expect(unitToMm(25, 'cm')).toBe(250);
  });

  it('chuyển đổi chính xác mm ↔ inch', () => {
    expect(mmToUnit(25.4, 'inch')).toBe(1);
    expect(unitToMm(1, 'inch')).toBe(25.4);
    expect(unitToMm(2, 'inch')).toBe(50.8);
  });

  it('đảo nghịch 2 chiều không mất mát độ chính xác đáng kể', () => {
    const val = 123.456;
    expect(round3(unitToMm(mmToUnit(val, 'cm'), 'cm'))).toBe(val);
    expect(round3(unitToMm(mmToUnit(val, 'inch'), 'inch'))).toBe(val);
  });

  it('round3 làm tròn đúng 3 chữ số thập phân', () => {
    expect(round3(1.23456)).toBe(1.235);
    expect(round3(10.1231)).toBe(10.123);
    expect(round3(5)).toBe(5);
  });

  it('formatUnit hiển thị đúng chuỗi và đơn vị', () => {
    expect(formatUnit(100, 'mm', 0)).toBe('100 mm');
    expect(formatUnit(12.34, 'cm', 1)).toBe('12.3 cm');
    expect(formatUnit(2.5, 'inch', 1)).toBe('2.5 inch');
  });
});

