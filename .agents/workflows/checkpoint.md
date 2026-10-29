---
description: Lưu mốc an toàn sau khi một việc chạy tốt (kiểm tra, commit git, cập nhật MAP và PROGRESS). Dùng: /checkpoint
---

1. Chạy `npm run check`. Đỏ → không commit, báo lỗi.
2. Cập nhật `docs/MAP.md`: file mới thì thêm dòng, file đổi vai trò thì sửa dòng, đổi ⬜ thành ✅ cho file đã có. Không sửa phần khác.
3. Cập nhật `PROGRESS.md`: tích việc đã xong, sửa dòng "Đang ở", thêm 1 dòng vào "Nhật ký checkpoint" (ngày + việc).
4. `git add -A` rồi `git commit -m "<mã việc>: <mô tả ngắn tiếng Việt>"` (vd `P1.3: phân loại đường cắt/cấn`). Nếu chưa có git repo thì chạy `git init` trước.
5. Báo: "Đã lưu mốc <mã việc>. Muốn quay lại mốc này: `git checkout .` (bỏ thay đổi chưa lưu) hoặc `git reset --hard HEAD`."
