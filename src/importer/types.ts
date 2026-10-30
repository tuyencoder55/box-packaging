// Kiểu dữ liệu cho bộ nạp và co giãn thông minh DXF/SVG (Smart Parametric Importer)
import type { Pt } from '../core/types';

export interface RawSegment {
  type: 'cut' | 'crease';
  a: Pt;
  b: Pt;
}

export interface DetectedBoxStructure {
  l0: number; // Chiều dài thân gốc (mm)
  w0: number; // Chiều rộng thân gốc (mm)
  h0: number; // Chiều cao thân gốc (mm)
  glueWidth: number; // Rộng lưỡi dán thân (mm)
  yTop: number; // Toạ độ y đường cấn nắp trên
  yBottom: number; // Toạ độ y đường cấn đáy
  xGlueEnd: number; // Toạ độ x kết thúc lưỡi dán
  xCol1End: number; // Toạ độ x hết cột 1 (L0)
  xCol2End: number; // Toạ độ x hết cột 2 (W0)
  xCol3End: number; // Toạ độ x hết cột 3 (L0)
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  isRSCFlap: boolean; // true nếu nắp trên và nắp đáy có chiều cao ~ W0 / 2 (như thùng carton FEFCO 0201)
}

export interface ImportedDieline {
  name: string;
  sourceType: 'dxf' | 'svg';
  segments: RawSegment[];
  bbox: [number, number, number, number]; // [minX, minY, width, height]
  structure: DetectedBoxStructure;
}
