---
description: Thêm một loại hộp mới vào thư viện (chỉ thêm 1 file + 1 dòng đăng ký). Dùng: /add-box-type tên-hộp
---

1. Đọc `docs/SPEC.md` mục 5, skill `dieline-geometry`, và xem một hộp đã có trong `src/boxes/` làm mẫu (ưu tiên `fefco-0201.ts`). Không đọc cả thư mục.
2. Kiểm tra người dùng đã cung cấp ảnh/bản vẽ khuôn tham chiếu chưa. Nếu CHƯA → dừng và hỏi:
   - Ảnh khuôn phẳng (có ghi rõ nét cắt/nét cấn) hoặc mã chuẩn (FEFCO/ECMA).
   - Các kích thước cố định (chiều sâu tai gài, độ rộng lưỡi dán…) hoặc công thức.
   - Các tuỳ chọn người dùng được đổi (kiểu khoá, có tai bụi không…).
3. Viết bảng mô tả bằng chữ trước khi code (≤ 15 dòng): các panel, panel nào gắn vào cạnh nào của panel nào, len × depth theo L/W/H, góc gấp, thứ tự gấp. Đưa người dùng xem nếu hộp phức tạp.
4. Tạo `src/boxes/<id>.ts` xuất một `BoxDef` (đủ `defaults`, `options`, `dims`, `build`). Không sửa file khác ngoài bước 5–6.
5. Thêm đúng 1 dòng vào `src/boxes/index.ts`.
6. Tạo `src/boxes/<id>.test.ts`: số panel, số đường cấn, bbox đúng với (l, w, h) mẫu, không hai panel chồng nhau.
7. Chạy `npm run check`.
8. Báo người dùng mở `app.html?type=<id>` và so khuôn với ảnh tham chiếu. Ghi dòng mới vào `docs/MAP.md`.

Không sửa UI, trang thư viện, hay core để "chiều" một hộp. Nếu hộp cần khả năng core chưa có → dừng, báo, đề xuất thay đổi nhỏ nhất.
