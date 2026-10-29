# PROGRESS

Đang ở: P2 (xong P2.3, chuẩn bị P2.4)

## Phase
- [x] P0 Khung dự án
  - [x] P0.1 Khởi tạo dự án, cài three, vitest, @types/three, script check
  - [x] P0.2 Tạo 3 file HTML (index/templates/app), cấu hình multi-page trong vite.config.ts
  - [x] P0.3 styles/tokens.css + base.css (nền #1d2027, xanh bạc hà, font Inter)
  - [x] P0.4 core/types.ts, core/units.ts, core/store.ts + test
  - [x] P0.5 Đồng bộ docs/MAP.md
- [x] P1 Lõi khuôn (fefco-0201)
  - [x] P1.1 core/shapes.ts (rect, chamfer, rounded) + test
  - [x] P1.2 core/layout.ts (cây panel → toạ độ phẳng) + test
  - [x] P1.3 core/dieline.ts (phân loại đường cắt/cấn) + test
  - [x] P1.4 boxes/fefco-0201.ts + boxes/index.ts + test
  - [x] P1.5 render2d/svgView.ts vẽ khuôn vào app.html + fit khung
- [ ] P2 Studio 2D
  - [x] P2.1 ui/app/paramPanel.ts (panel trái tự động, bắt lỗi) + dom.ts
  - [x] P2.2 core/thickness.ts + nối vào luồng dữ liệu
  - [x] P2.3 render2d/dimensions.ts + ui/app/legend.ts
  - [ ] P2.4 render2d/zoomPan.ts + thanh zoom %
  - [ ] P2.5 core/orient.ts + nút Chuẩn/Lật/Xoay
  - [ ] P2.6 Lưu localStorage + trạng thái "Đã lưu", stepBar.ts
- [ ] P3 Thêm hộp + Thư viện mẫu
- [ ] P3b Mở rộng đủ thư viện mẫu (xem docs/CATALOG.md)
- [ ] P4 Mockup 3D
- [ ] P4b Màu và ảnh lên mặt hộp 3D
- [ ] P5 Xuất file (PDF, AI, DXF bắt buộc; SVG, PNG)
- [ ] P5b Đưa lên mạng, công khai, không đăng nhập
- [ ] P6 Trang chủ + hoàn thiện
- [ ] P8 Mockup chai/lon/ly (làm riêng, sau cùng)

## Quyết định đã chốt
- Stack: Vite + TypeScript + vanilla DOM + Three.js + Vitest, không backend, không đăng nhập (web công khai). PDF/AI/DXF/SVG tự viết.
- Đơn vị nội bộ: mm.

## Ghi chú / Nợ kỹ thuật (AI ghi vào đây thay vì tự sửa)
- (trống)

## Nhật ký checkpoint
- 2026-10-29 P0.1: khởi tạo dự án, cài three, vitest, script check
- 2026-10-29 P0.2: 3 trang HTML index/templates/app và cấu hình multi-page vite.config.ts
- 2026-10-29 P0.3: styles/tokens.css và base.css (nền tối, xanh bạc hà, font Inter)
- 2026-10-29 P0.4: core/types.ts, units.ts, store.ts và unit tests (11 tests xanh)
- 2026-10-29 P0.5: kiểm tra docs/MAP.md và hoàn thành toàn bộ Phase P0
- 2026-10-29 P1.1: core/shapes.ts (rect, chamfer, trapezoid, rounded) và unit tests (16 tests xanh)
- 2026-10-29 P1.2: core/layout.ts (bố cục cây panel phẳng 2D) và unit tests (19 tests xanh)
- 2026-10-29 P1.3: core/dieline.ts (phân loại đường cắt/cấn, khử trùng lặp, tính bbox) và unit tests (22 tests xanh)
- 2026-10-29 P1.4: boxes/fefco-0201.ts và boxes/index.ts registry + unit tests (25 tests xanh)
- 2026-10-29 P1.5: render2d/svgView.ts vẽ khuôn SVG vào app.html (27 tests xanh) và hoàn thành toàn bộ Phase P1
- 2026-10-29 P2.1: ui/app/paramPanel.ts panel tham số và dom.ts helper (27 tests xanh)
- 2026-10-29 P2.2: core/thickness.ts tính lòng/phủ bì và nối vào luồng dữ liệu (31 tests xanh)
- 2026-10-29 P2.3: render2d/dimensions.ts và ui/app/legend.ts (31 tests xanh)
