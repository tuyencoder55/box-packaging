// Xuất file Adobe Illustrator (.ai) tương thích PDF
import type { Dieline } from '../core/types';
import { generatePdfContent } from './pdf';

/**
 * Sinh file .ai tương thích PDF (Illustrator mở đọc đầy đủ Layer CUT, CREASE và Swatches màu pha)
 */
export function generateAiContent(dieline: Dieline, margin: number = 5): string {
  return generatePdfContent(dieline, margin);
}
