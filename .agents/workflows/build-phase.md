---
description: Làm một phase (hoặc một việc nhỏ P1.2…) trong ROADMAP. Dùng: /build-phase P1 hoặc /build-phase P1.2
---

Nhận đối số: mã phase hoặc việc nhỏ (vd `P1` hoặc `P1.2`).

1. Đọc `PROGRESS.md`, `docs/MAP.md`, rồi đúng mục phase tương ứng trong `docs/ROADMAP.md`. Đọc `docs/ARCHITECTURE.md` nếu việc đụng đến cấu trúc.
2. Nếu đối số là cả phase: chọn việc nhỏ ĐẦU TIÊN chưa xong. Nếu là việc nhỏ: làm đúng việc đó.
3. Viết kế hoạch ngắn (không quá 10 dòng): liệt kê file sẽ TẠO và file sẽ SỬA (kèm hàm/khoảng dòng), dự kiến số dòng mỗi file. Quá 3 file hoặc quá 200 dòng/file → chia nhỏ việc ngay trong kế hoạch.
4. Làm theo kế hoạch, tuân thủ rule `01-minimal-edit`. Khi đụng hình học khuôn → dùng skill `dieline-geometry`; khi đụng 3D → skill `fold-3d-mockup`; khi đụng xuất file → skill `export-formats`.
5. Viết test cho phần logic thuần (`core/`, `boxes/`).
6. Chạy `npm run check`. Đỏ thì sửa đúng chỗ lỗi (không viết lại).
7. Cập nhật `docs/MAP.md` (file mới) và tích việc đã xong trong `PROGRESS.md`.
8. DỪNG. Báo cáo theo mẫu 3 mục và nói "Mở trình duyệt xem: …". Chờ người dùng xác nhận rồi mới làm việc nhỏ kế tiếp. Không tự chạy tiếp.
