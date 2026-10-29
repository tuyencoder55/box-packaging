# Quy ước code

- TypeScript strict. Không dùng `any`; cần thì dùng `unknown` rồi thu hẹp kiểu.
- `export` có tên, không `export default`.
- Mỗi file có 1–2 dòng comment đầu file: file này làm gì.
- Hàm trong `src/core/` và `src/boxes/` là hàm THUẦN (cùng đầu vào → cùng đầu ra, không đụng DOM, không đọc biến toàn cục). Có test ngay cạnh: `xxx.test.ts`.
- Tên: file `kebab-case.ts`, hàm `camelCase`, kiểu `PascalCase`, hằng `UPPER_SNAKE`.
- Toạ độ khuôn 2D: gốc (0,0) ở góc trên-trái panel gốc, x sang phải, y xuống dưới (như SVG). Đơn vị mm.
- Số thực: làm tròn 3 chữ số thập phân khi xuất file (`round3`), không làm tròn trong tính toán.
- DOM: tạo phần tử bằng hàm nhỏ `el(tag, props, children)` trong `src/ui/dom.ts` (tạo khi cần), không nối chuỗi HTML dài.
- Bắt lỗi nhập liệu ở `paramPanel` (số ≤ 0, rỗng) — hiện thông báo tiếng Việt, không để app vỡ.
- Trước khi báo xong: `npm run check` phải xanh (tsc + vitest + build).
- Commit: dùng workflow `/checkpoint`, không tự commit lung tung.
