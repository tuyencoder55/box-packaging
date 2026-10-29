# PROGRESS

Đang ở: Hoàn thành toàn bộ Phase P0 -> P6 (Sẵn sàng nghiệm thu)

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
- [x] P2 Studio 2D
  - [x] P2.1 ui/app/paramPanel.ts (panel trái tự động, bắt lỗi) + dom.ts
  - [x] P2.2 core/thickness.ts + nối vào luồng dữ liệu
  - [x] P2.3 render2d/dimensions.ts + ui/app/legend.ts
  - [x] P2.4 render2d/zoomPan.ts + thanh zoom %
  - [x] P2.5 core/orient.ts + nút Chuẩn/Lật/Xoay
  - [x] P2.6 Lưu localStorage + trạng thái "Đã lưu", stepBar.ts
- [x] P3 Thêm hộp + Thư viện mẫu
  - [x] P3.1 boxes/fefco-0427.ts (hộp mailer cuộn mép) + test
  - [x] P3.2 boxes/tuck-end-straight.ts + test
  - [x] P3.3 boxes/tuck-end-reverse.ts + test
  - [x] P3.4 boxes/auto-lock-bottom.ts + test
  - [x] P3.5 ui/templates/* + pages/templates.ts (lưới thẻ, lọc nhóm)
  - [x] P3.6 Nút "Dùng mẫu này" + bộ chọn loại hộp trong Studio
- [x] P4 Mockup 3D
  - [x] P4.1 render3d/scene.ts (khung 3D, camera, đèn, điều khiển chuột) + test
  - [x] P4.2 render3d/foldModel.ts (cây panel → hộp 3D lồng nhau) + test
  - [x] P4.3 render3d/foldAnim.ts (thanh trượt gấp/mở theo step) + test
  - [x] P4.4 ui/app/mockupCard.ts (thẻ nổi góc phải + phóng to xem 3D)
  - [x] P4.5 Kết nối vào trang app.html qua stepBar và đồng bộ thời gian thực
- [x] P5 Xuất file (PDF, AI, DXF bắt buộc; SVG, PNG)
  - [x] P5.1 core/chain.ts (nối đoạn rời thành polyline liền) + test
  - [x] P5.2 export/download.ts + export/svg.ts + test
  - [x] P5.3 export/dxf.ts (CAD / cắt bế CNC) + test
  - [x] P5.4 export/pdfWriter.ts + export/pdf.ts (layer, màu pha CUT/CREASE) + test
  - [x] P5.5 export/ai.ts (Adobe Illustrator)
  - [x] P5.6 export/png.ts (chụp ảnh 3D)
  - [x] P5.7 ui/app/exportModal.ts (giao diện tải đủ 5 định dạng)
- [x] P6 Trang chủ + hoàn thiện
  - [x] P6.1 index.html + pages/home.ts (Hero section, tính năng, lưới xem nhanh mẫu hộp)
  - [x] P6.2 npm run build ra dist/ tĩnh 100% không lỗi
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
- 2026-10-29 P2.4: render2d/zoomPan.ts zoom cuộn chuột, pan kéo và thanh zoom % (31 tests xanh)
- 2026-10-29 P2.5: core/orient.ts lật/xoay khuôn và bộ chọn hướng hiển thị (36 tests xanh)
- 2026-10-29 P2.6: lưu localStorage, trạng thái Đã lưu và ui/app/stepBar.ts (36 tests xanh) - hoàn thành Phase P2
- 2026-10-29 P3.1: boxes/fefco-0427.ts (hộp mailer cuộn mép) và unit tests (38 tests xanh)
- 2026-10-29 P3.2: boxes/tuck-end-straight.ts (hộp nắp gài thẳng STE) và unit tests (40 tests xanh)
- 2026-10-29 P3.3: boxes/tuck-end-reverse.ts (hộp nắp gài ngược RTE) và unit tests (43 tests xanh)
- 2026-10-29 P3.4: boxes/auto-lock-bottom.ts (hộp đáy khoá tự động ALB) và unit tests (46 tests xanh)
- 2026-10-29 P3.5: ui/templates/filterBar.ts + cardGrid.ts + pages/templates.ts (lưới thẻ, thumbnail vector, lọc nhóm)
- 2026-10-29 P3.6: dropdown bộ chọn loại hộp trên topBar Studio app.html, hoàn thành toàn bộ Phase P3
- 2026-10-29 P4.1: render3d/scene.ts thiết lập khung cảnh 3D, camera, đèn và điều khiển chuột (48 tests xanh)
- 2026-10-29 P4.2: render3d/foldModel.ts dựng cây bản lề THREE.Group lồng nhau cho hộp 3D (49 tests xanh)
- 2026-10-29 P4.3: render3d/foldAnim.ts hoạt hoạ gấp/mở theo step và thanh trượt tiến độ (52 tests xanh)
- 2026-10-29 P4.4 & P4.5: ui/app/mockupCard.ts thẻ nổi 3D, tích hợp stepBar chuyển đổi dieline 2D/3D toàn màn hình, hoàn thành Phase P4 (52 tests xanh)
- 2026-10-29 P5.1: core/chain.ts nối các đoạn rời thành polyline liền mạch và bảo toàn chiều dài (55 tests xanh)
- 2026-10-29 P5.2: export/download.ts + export/svg.ts xuất file SVG kỹ thuật 2 layer CUT/CREASE (56 tests xanh)
- 2026-10-29 P5.3: export/dxf.ts xuất file DXF R12 AC1009 cho máy cắt bế CNC và CAD (57 tests xanh)
- 2026-10-29 P5.4: export/pdfWriter.ts + pdf.ts tự viết bộ ghi PDF, 2 layer OCG, màu pha Separation CMYK và xref chuẩn byte offset (58 tests xanh)
- 2026-10-29 P5.5 & P5.6 & P5.7: export/ai.ts, export/png.ts, ui/app/exportModal.ts và tích hợp tải đủ 5 định dạng (PDF/AI/DXF/SVG/PNG), hoàn thành Phase P5 (58 tests xanh)
- 2026-10-29 P6.1 & P6.2: Hoàn thiện trang chủ index.html, pages/home.ts và kiểm tra build tĩnh dist/ thành công 100%
- 2026-10-29 P3b.Tuck: Nhập 4 mẫu hộp nắp gài mới từ Packfino (snap-lock-bottom, hang-tab-tuck-end, tuck-top-glued-bottom, seal-end-carton) + 4 unit tests (82 tests xanh 100%)
- 2026-10-29 P3b.TuckHangTab: Thêm 2 mẫu tai treo đáy khoá (snap-lock-hang-tab, crash-lock-hang-tab) + 2 unit tests (88 tests xanh 100%)
