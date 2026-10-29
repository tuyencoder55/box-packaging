// Tiện ích chụp ảnh mockup 3D định dạng PNG
import { downloadBlob } from './download';

/**
 * Chụp khung hình hiện tại từ canvas WebGL và tải về máy
 */
export function captureCanvasToPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, filename);
    } else {
      console.error('Không thể trích xuất ảnh PNG từ canvas');
    }
  }, 'image/png');
}

