// Chuyển đổi và định dạng đơn vị đo: mm (nội bộ) ↔ cm ↔ inch

export type Unit = 'mm' | 'cm' | 'inch';

const MM_PER_INCH = 25.4;

/**
 * Đổi từ mm sang đơn vị đích (cm hoặc inch)
 */
export function mmToUnit(mm: number, unit: Unit): number {
  switch (unit) {
    case 'mm':
      return mm;
    case 'cm':
      return mm / 10;
    case 'inch':
      return mm / MM_PER_INCH;
  }
}

/**
 * Đổi từ đơn vị người dùng sang mm (đơn vị chuẩn nội bộ)
 */
export function unitToMm(val: number, unit: Unit): number {
  switch (unit) {
    case 'mm':
      return val;
    case 'cm':
      return val * 10;
    case 'inch':
      return val * MM_PER_INCH;
  }
}

/**
 * Làm tròn 3 chữ số thập phân (dùng khi xuất file hoặc hiển thị)
 */
export function round3(val: number): number {
  return Math.round((val + Number.EPSILON) * 1000) / 1000;
}

/**
 * Định dạng số kèm ký hiệu đơn vị
 */
export function formatUnit(val: number, unit: Unit, decimals = 1): string {
  const rounded = Number(val.toFixed(decimals));
  return `${rounded} ${unit}`;
}
