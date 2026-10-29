---
description: Sửa lỗi theo cách ít đụng chạm nhất (tìm nguyên nhân → sửa tối thiểu → thêm test). Dùng: /fix-bug mô tả lỗi
---

1. Hỏi/ghi lại: làm gì thì lỗi, mong đợi thấy gì, thấy gì. Có lỗi trong Console thì lấy nguyên văn.
2. Tái hiện lỗi bằng test nhỏ nếu là logic (`core/`, `boxes/`): viết test ĐỎ trước.
3. Tìm nguyên nhân gốc: theo luồng dữ liệu trong `docs/ARCHITECTURE.md` (tham số → build → layout → dieline → render). Xác định chính xác tầng nào sai trước khi sửa.
4. Nói trước: "Nguyên nhân: …; sẽ sửa file X hàm Y". Không sửa khi chưa rõ nguyên nhân.
5. Sửa tối thiểu đúng chỗ đó (rule `01-minimal-edit`). Không "tiện tay" sửa chỗ khác.
6. Test đỏ thành xanh. Chạy `npm run check`.
7. Báo cáo 3 mục + 1 dòng "vì sao lỗi xảy ra" bằng lời đơn giản.

Nếu sửa lần 2 vẫn chưa hết lỗi: DỪNG, đừng viết lại nhiều hơn. Báo những gì đã thử và hỏi người dùng.
