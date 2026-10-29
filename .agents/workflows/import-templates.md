---
description: Nạp hàng loạt mẫu hộp từ ảnh chụp thư viện mẫu (lập danh mục rồi làm theo lô). Dùng: /import-templates tên-nhóm
---

Dùng khi người dùng gửi ảnh chụp trang thư viện mẫu (lưới mẫu, hoặc ảnh khuôn từng mẫu) để thêm nhiều hộp cùng nhóm.

1. Đọc `docs/CATALOG.md` và `docs/MAP.md`. Xác định nhóm đang làm (đối số).
2. **Lập danh mục trước, chưa code.** Nhìn ảnh người dùng gửi, liệt kê từng mẫu thấy được: tên hiển thị, nhóm, ước đoán gia đình cấu trúc, kích thước mặc định nếu có trong ảnh. Điền thêm dòng vào bảng "Mẫu cụ thể" trong `CATALOG.md` (chỉ sửa bảng này). Mẫu không đọc rõ từ ảnh → ghi "cần ảnh khuôn", không đoán.
3. Gom thành LÔ 3–5 mẫu cùng gia đình. Nói với người dùng: "Lô 1 gồm …". Chờ đồng ý.
4. Với mỗi lô, tìm bộ phận dùng chung (`src/boxes/parts/`). Cần bộ phận mới → tạo MỘT file bộ phận trước, có test, rồi mới tạo các mẫu.
5. Mỗi mẫu trong lô: làm đúng theo `/add-box-type` (bảng mô tả panel → file mẫu → 1 dòng đăng ký → test). Không sửa core/UI.
6. Cuối lô: `npm run check`, mở `templates.html` kiểm tra thẻ mới hiện đúng, cập nhật trạng thái ✅ trong `CATALOG.md`, rồi `/checkpoint`.
7. DỪNG và báo: lô nào xong, mẫu nào còn thiếu ảnh khuôn. Chờ người dùng gửi tiếp.

Nếu mẫu cần khả năng core chưa có (lỗ cắt, gấp 180°, cạnh cong…): dừng, mô tả đúng khả năng thiếu, đề xuất thay đổi nhỏ nhất ở `core/types.ts` và hỏi người dùng (file này đóng băng).
