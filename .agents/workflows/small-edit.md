---
description: Sửa một chỗ nhỏ (chỉnh giao diện, đổi nhãn, đổi số, chỉnh màu…) mà KHÔNG viết lại cả file. Dùng: /small-edit mô tả thay đổi
---

1. Nhắc lại yêu cầu bằng 1 câu. Nếu mơ hồ (không biết sửa chỗ nào trên màn hình) → hỏi lại 1 câu, không đoán.
2. Tra `docs/MAP.md` tìm đúng file. Chỉ mở file đó (và file CSS tương ứng nếu là giao diện). Dùng tìm kiếm theo từ khoá để định vị đoạn cần sửa.
3. Nói trước: "Sẽ sửa file X, đoạn Y (dòng ~n–m)". Tối đa 3 file.
4. Sửa bằng công cụ thay đoạn. Không đổi các dòng khác, không format lại, không đổi tên.
5. Nếu thay đổi dự kiến >40 dòng → dừng và hỏi.
6. Chạy `npm run check`.
7. Báo cáo 3 mục: file đã đổi + lý do · check xanh/đỏ · cách xem trên trình duyệt.

Nếu thấy lỗi/bất tiện khác trong lúc làm → ghi vào "Ghi chú / Nợ kỹ thuật" trong `PROGRESS.md`, không sửa luôn.
