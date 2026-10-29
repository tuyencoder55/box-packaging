---
name: export-formats
description: Dùng khi viết hoặc sửa xuất file PDF, AI, DXF (CAD), SVG, PNG từ Dieline (src/export). Quy ước layer, màu pha (spot), đơn vị, polyline liền, và cách tự viết bộ ghi PDF.
---

# Xuất file (tự viết, không dùng thư viện)

Nguồn duy nhất: `Dieline` (`cut`, `crease`, `bbox`) sau khi đã lật/xoay (`orient.ts`). Mọi định dạng đều lấy từ đây, không tính lại hình.

## Quy ước chung
- Đơn vị file: **mm**. Làm tròn 3 chữ số (`round3`) chỉ lúc ghi.
- Lề 5 mm quanh `bbox`. Gốc file = góc trên-trái của (bbox − lề). Trục y của khuôn đi xuống; PDF và DXF có y đi LÊN nên đổi `y' = H − y`.
- Hai layer: `CUT` (dao dứt, nét liền) và `CREASE` (dao cấn, nét đứt 3 mm nét, 2 mm hở). Nét dày 0.25 mm.
- **Trước khi ghi, nối đoạn rời thành polyline liền** bằng `core/chain.ts`. Máy bế/máy cắt cần đường liền; file cũng gọn và dễ chỉnh trong Illustrator.
- Tên file: `<id-hộp>_<L>x<W>x<H>mm.<đuôi>` (L/W/H làm tròn 1 chữ số thập phân). Tải bằng `export/download.ts: downloadBlob`.

## core/chain.ts — nối đoạn
- Khoá điểm = toạ độ làm tròn 0.001 mm. Dựng bảng điểm → các đoạn chạm điểm đó.
- Đi từ một đoạn chưa dùng, kéo dài hai đầu chừng nào điểm cuối chỉ chạm đúng 1 đoạn khác chưa dùng. Điểm có ≥3 đoạn chạm → dừng đường, đường mới bắt đầu từ đó.
- Trả về `{ pts: Pt[]; closed: boolean }[]`. Đóng khi điểm đầu trùng điểm cuối (bỏ điểm lặp).
- Test: hình vuông 4 đoạn → 1 đường đóng 4 điểm; hình chữ T → 2–3 đường; không mất đoạn nào (tổng độ dài bằng nhau trước/sau).

## PDF (export/pdfWriter.ts + pdf.ts) — tự viết
Bộ ghi PDF tối thiểu, ASCII, không nén, chỉ vẽ đường. Đủ 3 thứ mà Illustrator và nhà in cần: **layer**, **màu pha**, **nét đứt**.
- Header `%PDF-1.5`. Đổi mm → điểm: `pt = mm × 72 / 25.4`.
- Đối tượng: Catalog, Pages, Page, ba thứ tài nguyên, một content stream, bảng xref đúng offset byte (tính từ độ dài chuỗi đã ghi; toàn bộ là ASCII nên 1 ký tự = 1 byte).
- `MediaBox [0 0 W H]` = bbox + lề. `TrimBox` = bbox (không lề).
- **Layer**: hai Optional Content Group tên `CUT`, `CREASE`. Catalog có `/OCProperties << /OCGs [a b] /D << /Order [a b] /ON [a b] >> >>`. Page có `/Resources << /Properties << /OC_CUT a 0 R /OC_CREASE b 0 R >> >>`. Trong stream bọc `/OC /OC_CUT BDC … EMC`.
- **Màu pha** (Separation) khai báo trong `/ColorSpace`:
  `/CS_CUT [/Separation /CUT /DeviceCMYK << /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [0 1 0 0] /N 1 >>]` (CUT = magenta 100%)
  `/CS_CREASE [/Separation /CREASE /DeviceCMYK << … /C1 [1 0 0 0] … >>]` (CREASE = cyan 100%).
  Dùng: `/CS_CUT CS 1 SCN` (stroke 100% màu pha). Không dùng RGB cho đường khuôn.
- **Overprint**: ExtGState `/GS_OP << /OP true /op true /OPM 1 >>`, gọi `/GS_OP gs` đầu stream.
- Nét: `0.709 w` (0.25 mm), `[8.504 5.669] 0 d` cho cấn (3 mm / 2 mm), `[] 0 d` cho cắt. Vẽ `m`, `l`, đóng `h`, rồi `S`.
- Không dùng ảnh raster cho đường khuôn.

## AI (export/ai.ts)
- File `.ai` = chính nội dung PDF ở trên (PDF-compatible), đặt đuôi `.ai`, MIME `application/illustrator`. Dùng chung `pdfWriter`, không viết bộ ghi thứ hai.
- Không giả mạo thông tin Adobe (không đặt Creator là Adobe Illustrator). Đặt `/Producer (BoxMaker)`.
- **Chưa được kiểm chứng tự động**: phải mở bằng Illustrator thật. Nếu Illustrator báo lỗi hay mất layer, ghi vào `PROGRESS.md` và để giao diện hiện gợi ý "nếu không mở được file .ai, dùng file PDF (Illustrator mở PDF được và vẫn giữ layer)".

## DXF (export/dxf.ts) — cho CAD / máy cắt
- ASCII, bản AC1009 (R12) để tương thích rộng. Đơn vị mm.
- Bảng `LTYPE`: `CONTINUOUS` và `DASHED` (`73 2`, `40 5.0`, `49 3.0`, `49 -2.0`). Bảng `LAYER`: `CUT` (màu ACI 6 magenta, CONTINUOUS), `CREASE` (màu ACI 5 xanh, DASHED).
- Mỗi polyline: `0 POLYLINE / 8 <layer> / 66 1 / 70 <1 nếu đóng, 0 nếu hở>`, rồi mỗi điểm `0 VERTEX / 8 <layer> / 10 x / 20 y / 30 0`, kết thúc `0 SEQEND / 8 <layer>`. Không dùng `LWPOLYLINE` (không có trong R12).
- Cuối file `0 EOF`. y đảo (đi lên).

## SVG (export/svg.ts)
- `<svg width="{w}mm" height="{h}mm" viewBox="0 0 {w} {h}">`.
- `<g id="CUT" fill="none" stroke="#ff00ff" stroke-width="0.25">` và `<g id="CREASE" … stroke="#00aeef" stroke-dasharray="3 2">`, mỗi polyline là một `<path>`.
- Illustrator đọc `id` thành tên layer.

## PNG mockup (export/png.ts)
- Render 1 khung từ renderer 3D rồi `canvas.toDataURL('image/png')`, tải bằng `downloadBlob`.

## Kiểm tra bắt buộc
- Test tự động: `pdf` chứa `/OCProperties`, `/Separation`, đúng 2 cặp `BDC…EMC`, mọi offset trong xref trỏ đúng tới dòng `N 0 obj`; `dxf` có `SECTION`/`EOF`, số `POLYLINE` bằng số đường đã nối; tổng độ dài đường trong mọi định dạng khớp `Dieline`.
- Kiểm tra bằng mắt (người dùng làm, AI hướng dẫn từng bước sau mỗi lần xuất xong):
  1. Mở PDF/AI trong Illustrator: bảng Layers có `CUT`, `CREASE`; bảng Swatches có 2 màu pha tên `CUT`, `CREASE`.
  2. Đo một cạnh đã biết: kích thước mm khớp với hộp.
  3. Mở DXF trong phần mềm CAD hoặc trình xem DXF: hai layer, cạnh đo đúng mm, nét cấn hiện đứt.
- Có `qpdf` trên máy thì chạy `qpdf --check file.pdf` để soát cấu trúc PDF.
