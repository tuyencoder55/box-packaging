# Dự án BoxMaker — web tạo khuôn hộp / thùng carton kiểu Pacvina

LUÔN đọc trước mỗi việc: `docs/MAP.md` (file nào làm gì) và `PROGRESS.md` (đang làm tới đâu).
Chi tiết khi cần: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`.

## Sản phẩm
Nhập Dài × Rộng × Cao → ra khuôn dieline chuẩn (SVG) + hộp gấp 3D + xuất SVG/DXF/PDF/PNG. Có thư viện mẫu hộp.

## Stack (cố định — không tự đổi, không tự thêm thư viện)
Vite + TypeScript, vanilla DOM (không React/Vue), Three.js, Vitest. Không backend, lưu localStorage.
Web CÔNG KHAI, không đăng nhập, không tài khoản, mọi thứ chạy trong trình duyệt (file tải về cũng tạo ngay trong trình duyệt).
File PDF / AI / DXF / SVG do dự án TỰ VIẾT (không dùng jsPDF hay thư viện xuất khác) — xem skill `export-formats`.
Muốn thêm thư viện → hỏi người dùng trước.

## Nguyên tắc cốt lõi
1. Đơn vị nội bộ luôn là **mm**. Đổi cm/inch chỉ ở lớp hiển thị (`core/units.ts`).
2. **Một nguồn dữ liệu duy nhất**: danh sách `PanelNode[]` do `src/boxes/*.ts` sinh ra. Từ đó mới vẽ 2D, dựng 3D, xuất file. Cấm tính kích thước hộp ở chỗ khác.
3. Thêm loại hộp = thêm 1 file trong `src/boxes/` + 1 dòng ở `boxes/index.ts`. Không sửa UI để thêm hộp.
4. Màu, cỡ chữ, bo góc lấy từ `src/styles/tokens.css`. Không gõ cứng màu trong code.
5. Giao diện tiếng Việt, nền tối, màu nhấn xanh bạc hà (giống Pacvina).

## Về người dùng
Người dùng là designer, không chuyên code. Giải thích ngắn, tiếng Việt đơn giản, tránh thuật ngữ khi không cần.
Comment trong code viết tiếng Việt, nói "để làm gì" chứ không lặp lại code.
Khi báo xong, luôn nói rõ: đã đổi file nào, và cách tự kiểm tra bằng mắt trên trình duyệt.

## Hộp mới
Không đoán hình học. Với loại hộp chưa có, hỏi người dùng ảnh/bản vẽ khuôn tham chiếu (xem workflow `/add-box-type`).
