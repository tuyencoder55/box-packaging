# ARCHITECTURE — chia nhỏ để AI chỉ sửa đúng chỗ

Nguyên tắc: **mỗi file một việc, ≤ 200 dòng.** Muốn thêm/sửa tính năng nào thì chỉ động vào file của tính năng đó.

## 1. Cây thư mục

```
/
├─ index.html  templates.html  app.html      ← 3 trang (mỏng, chỉ chứa khung + <script type=module>)
├─ package.json  vite.config.ts  tsconfig.json
├─ PROGRESS.md                               ← tiến độ
├─ docs/  (SPEC, ARCHITECTURE, ROADMAP, MAP)
└─ src/
   ├─ core/            ← LOGIC THUẦN, không đụng DOM, có test
   │   ├─ types.ts          kiểu dữ liệu dùng chung (ĐÓNG BĂNG)
   │   ├─ units.ts          mm ↔ cm ↔ inch
   │   ├─ store.ts          kho trạng thái nhỏ (get/set/subscribe theo slice)
   │   ├─ shapes.ts         hàm tạo hình: rect, vát góc, bo góc, hình thang
   │   ├─ layout.ts         cây panel → toạ độ phẳng 2D
   │   ├─ dieline.ts        toạ độ phẳng → đường CẮT / CẤN
   │   ├─ orient.ts         Chuẩn / lật ngang / lật dọc / xoay 180
   │   ├─ thickness.ts      đổi lòng↔phủ bì, bù độ dày giấy
   │   └─ chain.ts          nối các đoạn rời thành polyline liền (cho file xuất, máy cắt)
   ├─ boxes/           ← MỖI LOẠI HỘP MỘT FILE
   │   ├─ index.ts          registry: danh sách tất cả BoxDef
   │   ├─ fefco-0201.ts  fefco-0427.ts  tuck-end-straight.ts …
   ├─ render2d/        ← vẽ SVG
   │   ├─ svgView.ts        vẽ đường cắt/cấn từ Dieline
   │   ├─ dimensions.ts     vẽ đường kích thước + nhãn
   │   └─ zoomPan.ts        zoom/kéo
   ├─ render3d/        ← Three.js
   │   ├─ scene.ts          scene, camera, đèn, orbit
   │   ├─ foldModel.ts      cây panel → Group xoay quanh cạnh gấp
   │   └─ foldAnim.ts       thanh trượt gấp/mở theo bước
   ├─ export/
   │   ├─ pdfWriter.ts  pdf.ts  ai.ts  dxf.ts  svg.ts  png.ts  download.ts
   ├─ ui/              ← mỗi panel/thành phần một file
   │   ├─ app/  paramPanel.ts  stepBar.ts  legend.ts  mockupCard.ts  exportModal.ts
   │   └─ templates/  cardGrid.ts  filterBar.ts  detailModal.ts
   ├─ pages/           ← điểm vào mỗi trang: chỉ ghép các module lại
   │   ├─ home.ts  templates.ts  app.ts
   └─ styles/  tokens.css  base.css  app.css  templates.css
```

## 2. Luồng dữ liệu (một chiều)

```
Tham số người dùng (BoxParams)
   │  thickness.ts (đổi sang kích thước lòng, mm)
   ▼
BoxDef.build(params)  →  PanelNode[]        ← NGUỒN DỮ LIỆU DUY NHẤT
   ├─ layout.ts → dieline.ts → orient.ts → render2d / export
   └─ foldModel.ts → render3d / ảnh PNG
```

Không có chỗ nào khác được tự tính kích thước hộp.

## 3. Kiểu dữ liệu lõi (`core/types.ts` — đóng băng)

```ts
export type Edge = 'top' | 'right' | 'bottom' | 'left';
export type Pt = [number, number];                    // [u, v] hoặc [x, y], mm

export interface PanelNode {
  id: string;
  parent: string | null;      // null = panel gốc (đặt tại 0,0)
  edge?: Edge;                // cạnh CỦA PANEL CHA mà panel này gắn vào
  len: number;                // chiều dài dọc theo cạnh gắn (mm)
  depth: number;              // chiều sâu đi ra xa cạnh gắn (mm)
  offset?: number;            // dịch dọc cạnh gắn, tính từ đầu cạnh (mặc định 0)
  shape?: Pt[];               // đa giác trong toạ độ cục bộ (u dọc cạnh gắn, v đi ra); mặc định hình chữ nhật len×depth
  fold: number;               // góc gấp so với cha, độ (+90 = gấp vào trong, ra sau tờ giấy)
  step: number;               // thứ tự gấp để chạy animation (1,2,3…)
  label?: string;             // "TRƯỚC", "SAU", "NẮP"…
  glue?: boolean;             // panel dán keo (tô sọc)
}

export interface OptionDef {
  key: string; label: string;
  type: 'select' | 'toggle' | 'number';
  choices?: { value: string; label: string }[];   // cho select
  default: string | boolean | number;
  min?: number; max?: number;                     // cho number
}

export interface BoxParams {
  l: number; w: number; h: number;   // kích thước LÒNG, mm
  t: number;                         // độ dày giấy, mm
  opts: Record<string, string | boolean | number>;
}

export interface DimMark { panelId: string; axis: 'u' | 'v'; param: 'l' | 'w' | 'h'; }

export interface BoxDef {
  id: string; name: string; code?: string;
  category: 'carton' | 'tuck' | 'auto-lock' | 'mailer' | 'other';
  defaults: { l: number; w: number; h: number; t: number };
  options: OptionDef[];
  dims: DimMark[];                   // chỗ vẽ đường kích thước
  build(p: BoxParams): PanelNode[];
}

export interface Seg { a: Pt; b: Pt; }
export interface Dieline { cut: Seg[]; crease: Seg[]; polys: Pt[][]; bbox: [number, number, number, number]; }
```

Thay đổi `types.ts` = thay đổi lớn → phải hỏi người dùng trước.

## 4. Store và cập nhật giao diện (tránh vẽ lại cả trang)

`store.ts`: `createStore(initial)` trả về `{ get(), set(patch), subscribe(selector, cb) }`.
`subscribe` chỉ gọi `cb` khi giá trị chọn ra bởi `selector` đổi. Mỗi module UI tự subscribe phần mình cần:
- `paramPanel` chỉ ghi vào store, không vẽ khuôn.
- `svgView` subscribe `dieline` → chỉ cập nhật thuộc tính `d` của các `<path>` đã có.
- `foldModel` subscribe `panels` → chỉ dựng lại hình khi cây panel đổi; đổi tiến độ gấp chỉ xoay.
- Cấm `container.innerHTML = ''` rồi dựng lại cả khối cho một thay đổi nhỏ.

## 5. Lưu trữ

`localStorage['boxmaker:doc']` = `{ type, params, orient, unit }`. Đọc khi mở app, ghi (debounce 300ms) khi store đổi. URL query ghi đè khi có.

## 6. Kiểm thử và kiểm tra

- `npm run dev` — chạy thử.
- `npm run test` — Vitest cho `core/` và `boxes/` (mỗi hộp: số panel, bbox, không panel nào chồng nhau, số đường cấn).
- `npm run check` = `tsc --noEmit && vitest run && vite build`. AI phải chạy và xanh trước khi báo xong.
