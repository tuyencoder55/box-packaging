// Kiểu dữ liệu dùng chung cho toàn bộ dự án BoxMaker (ĐÓNG BĂNG)

export type Edge = 'top' | 'right' | 'bottom' | 'left';
export type Pt = [number, number]; // [u, v] hoặc [x, y], mm

export interface PanelNode {
  id: string;
  parent: string | null; // null = panel gốc (đặt tại 0,0)
  edge?: Edge; // cạnh CỦA PANEL CHA mà panel này gắn vào
  len: number; // chiều dài dọc theo cạnh gắn (mm)
  depth: number; // chiều sâu đi ra xa cạnh gắn (mm)
  offset?: number; // dịch dọc cạnh gắn, tính từ đầu cạnh (mặc định 0)
  shape?: Pt[]; // đa giác trong toạ độ cục bộ (u dọc cạnh gắn, v đi ra); mặc định hình chữ nhật len×depth
  fold: number; // góc gấp so với cha, độ (+90 = gấp vào trong, ra sau tờ giấy)
  step: number; // thứ tự gấp để chạy animation (1,2,3…)
  label?: string; // "TRƯỚC", "SAU", "NẮP"…
  glue?: boolean; // panel dán keo (tô sọc)
}

export interface OptionDef {
  key: string;
  label: string;
  type: 'select' | 'toggle' | 'number';
  choices?: { value: string; label: string }[]; // cho select
  default: string | boolean | number;
  min?: number;
  max?: number; // cho number
}

export interface BoxParams {
  l: number;
  w: number;
  h: number; // kích thước LÒNG, mm
  t: number; // độ dày giấy, mm
  opts: Record<string, string | boolean | number>;
}

export interface DimMark {
  panelId: string;
  axis: 'u' | 'v';
  param: 'l' | 'w' | 'h';
}

export interface BoxDef {
  id: string;
  name: string;
  code?: string;
  category: 'carton' | 'tuck' | 'auto-lock' | 'mailer' | 'other';
  defaults: { l: number; w: number; h: number; t: number };
  options: OptionDef[];
  dims: DimMark[]; // chỗ vẽ đường kích thước
  build(p: BoxParams): PanelNode[];
}

export interface Seg {
  a: Pt;
  b: Pt;
}

export interface Dieline {
  cut: Seg[];
  crease: Seg[];
  polys: Pt[][];
  bbox: [number, number, number, number];
}
