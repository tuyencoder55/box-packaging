# ROADMAP — làm theo phase, mỗi phase nhỏ, kiểm tra xong mới sang phase sau

Cách dùng: trong Antigravity gõ `/build-phase P1` (đổi số phase). Mỗi phase kết thúc bằng `/checkpoint`.
**Đường tối thiểu (MVP công khai):** P0 → P1 → P2 → P3 → P4 → P5 → P5b. Có đủ: thư viện mẫu, khuôn dieline, hộp 3D, tải PDF/AI/DXF. Các phase P3b (đủ thư viện), P4b (màu/ảnh), P6, P8 làm sau khi MVP đã chạy ổn.
Một phase có nhiều "việc nhỏ" (P1.1, P1.2…). Mỗi lần chỉ làm MỘT việc nhỏ rồi dừng cho người dùng xem.

---

## P0 — Dựng khung dự án
Mục tiêu: chạy được 3 trang trống, có theme tối, có test chạy xanh.
- P0.1 `npm create vite` (vanilla-ts), cài `three`, `vitest`, kèm `@types/three`. Thêm script `check`.
- P0.2 Tạo 3 file HTML (`index/templates/app`), cấu hình multi-page trong `vite.config.ts`.
- P0.3 `styles/tokens.css` + `base.css`: nền #1d2027, xanh bạc hà làm màu nhấn, font Inter.
- P0.4 `core/types.ts` (chép đúng từ ARCHITECTURE.md), `core/units.ts`, `core/store.ts` + test.
- P0.5 Tạo `docs/MAP.md` thật theo file đã có.
Xong khi: `npm run check` xanh; mở 3 trang thấy nền tối + tiêu đề.

## P1 — Lõi khuôn: nhập kích thước ra khuôn thùng carton
Mục tiêu: `app.html?type=fefco-0201&l=300&w=200&h=150` hiện đúng khuôn thùng, chưa có UI.
- P1.1 `core/shapes.ts` (rect, chamfer, rounded) + test.
- P1.2 `core/layout.ts` (cây panel → toạ độ phẳng) + test.
- P1.3 `core/dieline.ts` (phân loại đường cắt/cấn) + test.
- P1.4 `boxes/fefco-0201.ts` + `boxes/index.ts` + test.
- P1.5 `render2d/svgView.ts`: vẽ khuôn vào `app.html` (cắt nét liền, cấn nét đứt đỏ), tự fit khung.
Xong khi: 3 bộ kích thước khác nhau ra khuôn đúng tỉ lệ; test xanh.

## P2 — Studio 2D hoàn chỉnh
- P2.1 `ui/app/paramPanel.ts`: panel trái sinh tự động từ `BoxDef.options` (đơn vị, lòng/phủ bì, L/W/H, độ dày).
- P2.2 `core/thickness.ts` + nối vào luồng dữ liệu.
- P2.3 `render2d/dimensions.ts` + `ui/app/legend.ts`.
- P2.4 `render2d/zoomPan.ts` + thanh zoom %.
- P2.5 `core/orient.ts` + nút Chuẩn/Lật ngang/Lật dọc/Xoay.
- P2.6 Lưu localStorage + trạng thái "Đã lưu". `ui/app/stepBar.ts` (3 bước, chưa nối 3D/Xuất).
Xong khi: đổi mọi ô nhập → khuôn đổi ngay, F5 vẫn còn, đổi đơn vị không làm sai kích thước.

## P3 — Thêm các loại hộp + trang Thư viện mẫu
- P3.1 `boxes/fefco-0427.ts` (cần ảnh tham chiếu — dùng `/add-box-type`).
- P3.2 `boxes/tuck-end-straight.ts`.
- P3.3 `boxes/tuck-end-reverse.ts`.
- P3.4 `boxes/auto-lock-bottom.ts` (theo ảnh chụp Pacvina).
- P3.5 `ui/templates/*` + `pages/templates.ts`: lưới thẻ, lọc nhóm (ảnh thẻ vẽ bằng `svgView`).
- P3.6 Nút "Dùng mẫu này" → mở `app.html?type=…`. Bộ chọn loại hộp trong Studio.
Xong khi: thêm hộp thứ 7 chỉ cần 1 file + 1 dòng đăng ký.

## P3b — Mở rộng thư viện cho đủ như trang templates của Pacvina
Làm theo `docs/CATALOG.md` và workflow `/import-templates`, từng LÔ 3–5 mẫu cùng gia đình.
- P3b.1 Tách bộ phận dùng chung ra `src/boxes/parts/` (tuckLid, dustFlap, autoLockBottom, glueFlap…), sửa các hộp P3 dùng lại chúng. Làm bước này TRƯỚC khi thêm mẫu mới.
- P3b.2 Lô thùng carton (các biến thể FEFCO 02xx).
- P3b.3 Lô hộp nắp gài + hộp cửa sổ + hộp rút khăn giấy (cần "lỗ cắt": hỏi người dùng trước khi mở rộng `types.ts`).
- P3b.4 Lô hộp quai xách, túi giấy, phong bì, bìa kẹp, nhãn treo.
Xong khi: mỗi mẫu trong bảng CATALOG đều ✅, mở được ở `templates.html` và `app.html`, test xanh.

## P4 — Mockup 3D
- P4.1 `render3d/scene.ts`: khung 3D, xoay chuột, đèn nhẹ.
- P4.2 `render3d/foldModel.ts`: cây panel → hộp 3D (panel màu giấy nâu/trắng, mặt trong tối hơn).
- P4.3 `render3d/foldAnim.ts`: thanh trượt gấp/mở theo `step`.
- P4.4 `ui/app/mockupCard.ts`: thẻ nổi góc phải + nút phóng to/đóng; bước "Mockup 3D" mở lớn.
- P4.5 Dùng lại trong chi tiết mẫu ở trang Thư viện.
Xong khi: hộp gấp kín đúng, không panel nào xuyên qua nhau ở trạng thái gấp xong (ít nhất cho 0201, tuck-end).

## P4b — Màu và ảnh lên mặt hộp 3D
Ý tưởng: thiết kế TRÊN khuôn phẳng, hộp 3D tự thấy. Dùng skill `fold-3d-mockup` mục "Texture".
- P4b.1 Bấm vào một panel trên khuôn 2D để chọn (viền sáng). Bảng nhỏ "Mặt đang chọn": màu nền mặt ngoài, màu mặt trong. Hộp 3D đổi màu ngay.
- P4b.2 Nút "Màu cả hộp" (áp một màu cho mọi mặt ngoài) và "Màu mặt trong".
- P4b.3 Tải một ảnh phủ cả tấm khuôn (kéo/zoom/xoay ảnh trên khuôn). Ảnh hiện trên khuôn 2D và hộp 3D theo cùng toạ độ.
- P4b.4 Tải ảnh riêng cho từng mặt đang chọn (logo, hoạ tiết), chỉnh vị trí/cỡ.
- P4b.5 Lưu ảnh vào IndexedDB (không vào localStorage), tự khôi phục khi mở lại.
- P4b.6 Xuất PNG mockup có ảnh; xuất PDF kèm ảnh khuôn phẳng (tuỳ chọn).
Xong khi: kéo ảnh trên khuôn 2D thì ảnh trên hộp 3D đổi theo; F5 không mất ảnh.

## P5 — Xuất file (BẮT BUỘC: PDF, AI, DXF)
Dùng skill `export-formats`. Làm theo thứ tự này.
- P5.1 `core/chain.ts` + test (nối đoạn rời thành polyline liền).
- P5.2 `export/download.ts` + `export/svg.ts`.
- P5.3 `export/dxf.ts` (R12, layer CUT/CREASE, polyline liền, nét cấn đứt).
- P5.4 `export/pdfWriter.ts` + `export/pdf.ts` (layer, màu pha, overprint, nét đứt) + test cấu trúc PDF.
- P5.5 `export/ai.ts` (dùng lại pdfWriter, đuôi `.ai`).
- P5.6 `export/png.ts` (chụp canvas 3D).
- P5.7 `ui/app/exportModal.ts` + bước "Xuất": nút tải PDF / AI / DXF / SVG / PNG, hiện tên file và kích thước khuôn.
Xong khi: mở PDF và AI trong Illustrator thấy 2 layer + 2 swatch màu pha, đo cạnh ra đúng mm; mở DXF trong trình CAD thấy 2 layer, đường cắt là polyline liền.

## P5b — Đưa lên mạng (công khai, không đăng nhập)
- P5b.1 `npm run build` ra thư mục `dist/` chạy được như web tĩnh (3 trang, đường dẫn tương đối).
- P5b.2 Chọn nơi lưu trữ miễn phí cho web tĩnh (Cloudflare Pages, Netlify, Vercel hoặc GitHub Pages), AI hướng dẫn từng bước đưa `dist/` lên.
- P5b.3 Thêm thẻ `<title>`, mô tả, ảnh chia sẻ, `lang="vi"` cho 3 trang; trang 404 đơn giản.
- P5b.4 Soát: tải đủ 5 loại file ngay trên bản đã đưa lên mạng, không có yêu cầu mạng nào cần khoá hay tài khoản.
Xong khi: người lạ mở link, chọn mẫu, nhập kích thước, tải được PDF/AI/DXF mà không cần đăng ký.

## P6 — Trang chủ + hoàn thiện
- P6.1 `index.html` + `pages/home.ts`.
- P6.2 Soát lỗi bố cục ở 1280px và 1920px, phím tắt, thông báo lỗi nhập sai.

## P7 (tuỳ chọn)
Bleed (offset đường bao), chia sẻ link tham số.

## P8 (làm riêng, sau khi nhóm A xong) — Mockup chai, hũ, lon, tuýp, ly giấy, túi zip
Động cơ khác với hộp gấp: hình tròn xoay + nhãn dán (xem CATALOG, "Động cơ B"). Cần viết spec riêng trước khi code; không dùng PanelNode.
