# MAP — bản đồ file (AI đọc file này TRƯỚC để biết cần mở file nào)

Quy ước: mỗi file một dòng. Cập nhật bằng `/checkpoint` mỗi khi thêm/xoá/đổi vai trò file.
Trạng thái: ⬜ chưa tạo · ✅ đã có · 🧊 đóng băng (không sửa nếu không được yêu cầu rõ)

## Gốc
- ✅ index.html — trang chủ (khung mỏng)
- ✅ templates.html — trang thư viện mẫu (khung mỏng)
- ✅ app.html — Studio (khung mỏng)
- ✅ 🧊 package.json / tsconfig.json — cấu hình
- ✅ 🧊 vite.config.ts — cấu hình multi-page

## src/core (logic thuần, có test)
- ⬜ 🧊 types.ts — kiểu dữ liệu dùng chung
- ⬜ units.ts — đổi mm/cm/inch
- ⬜ store.ts — kho trạng thái + subscribe theo slice
- ⬜ shapes.ts — hàm tạo đa giác (rect, vát, bo, hình thang)
- ⬜ layout.ts — cây panel → toạ độ phẳng
- ⬜ dieline.ts — toạ độ phẳng → đường cắt/cấn
- ⬜ orient.ts — lật/xoay khuôn
- ⬜ thickness.ts — lòng↔phủ bì, bù độ dày giấy
- ⬜ chain.ts — nối đoạn rời thành polyline liền

## src/boxes (mỗi loại hộp một file)
- ⬜ index.ts — danh sách đăng ký BoxDef
- ⬜ fefco-0201.ts — thùng carton RSC
- ⬜ fefco-0427.ts — mailer cuộn mép
- ⬜ tuck-end-straight.ts — hộp nắp gài thẳng
- ⬜ tuck-end-reverse.ts — hộp nắp gài ngược
- ⬜ auto-lock-bottom.ts — hộp đáy khoá tự động

- ⬜ parts/*.ts — bộ phận dùng chung giữa các hộp (tuckLid, dustFlap, autoLockBottom, glueFlap…), mỗi file một bộ phận

## src/render2d
- ⬜ svgView.ts — vẽ khuôn SVG
- ⬜ dimensions.ts — đường kích thước + nhãn
- ⬜ zoomPan.ts — zoom, kéo

## src/render3d
- ⬜ scene.ts — scene/camera/đèn
- ⬜ foldModel.ts — cây panel → hộp 3D
- ⬜ foldAnim.ts — gấp/mở theo bước

## src/export
- ⬜ pdfWriter.ts — bộ ghi PDF tối thiểu tự viết (layer, màu pha, nét đứt)
- ⬜ pdf.ts · ai.ts — PDF và AI (cùng pdfWriter)
- ⬜ dxf.ts · svg.ts · png.ts · download.ts — mỗi định dạng một file

## src/ui
- ⬜ app/paramPanel.ts · stepBar.ts · legend.ts · mockupCard.ts · exportModal.ts
- ⬜ templates/cardGrid.ts · filterBar.ts · detailModal.ts

## src/pages
- ✅ home.ts · templates.ts · app.ts — chỉ ghép module, không chứa logic

## src/styles
- ✅ 🧊 tokens.css — màu, cỡ chữ, bo góc
- ✅ base.css — kiểu nền và font dùng chung
- ⬜ app.css · templates.css
