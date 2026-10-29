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

/**
 * Định dạng số kích thước chuẩn CAD bản vẽ kỹ thuật (ví dụ: "2,035", "600", "35")
 */
export function formatDimValue(valMm: number, unit: Unit): string {
  const converted = mmToUnit(valMm, unit);
  if (unit === 'mm') {
    const rounded = Math.round(converted);
    if (Math.abs(converted - rounded) < 0.05) {
      return rounded.toLocaleString('en-US');
    }
    return converted.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  } else if (unit === 'cm') {
    const rounded = Math.round(converted * 10) / 10;
    return `${rounded}`;
  } else {
    const rounded = Math.round(converted * 100) / 100;
    return `${rounded}"`;
  }
}

