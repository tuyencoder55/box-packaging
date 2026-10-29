// Xuất file Adobe Illustrator (.ai) tương thích PDF
import type { Dieline } from '../core/types';
import type { DimensionLine } from '../render2d/dimensions';
import { generatePdfContent } from './pdf';

/**
 * Sinh file .ai tương thích PDF (Illustrator mở đọc đầy đủ Layer CUT, CREASE, DIMENSION và Swatches màu pha)
 */
export function generateAiContent(
  dieline: Dieline,
  margin: number = 5,
  dimLines: DimensionLine[] = []
): string {
  return generatePdfContent(dieline, margin, dimLines);
}
