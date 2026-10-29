---
name: surgical-edit
description: Dùng mỗi khi sửa hoặc mở rộng code ĐÃ CÓ trong dự án BoxMaker. Hướng dẫn sửa đúng chỗ, giữ nguyên phần còn lại, tránh viết lại cả file.
---

# Sửa phẫu thuật (surgical edit)

Mục tiêu: người dùng nhờ sửa một chỗ → chỉ chỗ đó thay đổi. Diff (phần khác biệt) phải nhỏ và đọc hiểu được trong 1 phút.

## Quy trình 5 bước
1. **Định vị**: tra `docs/MAP.md` → mở đúng file → tìm đoạn cần sửa bằng từ khoá. Không đọc cả thư mục.
2. **Khai báo**: viết 1–3 dòng "sửa file nào, hàm nào, vì sao".
3. **Sửa theo khối**: thay đúng đoạn cần đổi (từ vài dòng tới một hàm). Giữ nguyên thụt lề, dấu chấm phẩy, thứ tự import, tên biến của phần còn lại.
4. **Tự soát diff**: nhìn lại các dòng đã đổi. Có dòng nào không liên quan đến yêu cầu không? Có thì hoàn lại dòng đó.
5. **Kiểm tra**: `npm run check`, rồi nói cách xem bằng mắt.

## Làm / Không làm

| Tình huống | ĐÚNG | SAI |
|---|---|---|
| Đổi nhãn nút "Xuất" thành "Tải file" | Sửa đúng chuỗi trong 1 file | Viết lại cả `stepBar.ts` |
| Thêm tuỳ chọn "tai bụi" cho một hộp | Thêm 1 mục vào `options` + dùng trong `build()` của file hộp đó | Sửa `paramPanel.ts`, `layout.ts` |
| Chỉnh màu nền panel | Đổi biến trong `tokens.css` HOẶC 1 dòng trong `app.css` | Viết lại cả CSS |
| Lỗi tính sai chiều dài panel | Sửa công thức trong hàm sinh panel đó | Đổi cả kiểu `PanelNode` |

## Dấu hiệu đang đi sai → DỪNG và hỏi
- Định ghi đè cả file bằng nội dung mới.
- Định sửa quá 3 file, hoặc 1 file quá ~40 dòng.
- Định đổi `core/types.ts` hay file đóng băng.
- Định đổi tên/di chuyển hàm để "gọn hơn".
- Định cài thư viện mới.

## Khi việc thực sự lớn
Chia thành các việc nhỏ, mỗi việc ≤ 3 file, làm lần lượt, mỗi việc xong chạy `/checkpoint`. Đề xuất danh sách việc cho người dùng duyệt trước khi bắt đầu.

## Với giao diện
Cập nhật phần tử đã có (đổi `textContent`, thuộc tính, class), dùng `subscribe` theo slice. Không dựng lại cả khối DOM cho một thay đổi nhỏ.
