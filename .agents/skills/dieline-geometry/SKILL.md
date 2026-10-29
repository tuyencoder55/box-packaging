---
name: dieline-geometry
description: Dùng khi viết hoặc sửa hình học khuôn bế (dieline) — layout panel, phân loại đường cắt/cấn, bù độ dày giấy, viết file hộp mới trong src/boxes. Chứa thuật toán chuẩn của dự án.
---

# Hình học khuôn (dieline)

Một hộp = cây `PanelNode` (xem `core/types.ts`). Từ cây này mới sinh ra khuôn 2D, hộp 3D, file xuất.

## 1. Quy ước toạ độ
- Hệ toạ độ như SVG: x sang phải, y xuống dưới, mm. Panel gốc có góc trên-trái ở (0,0).
- Mỗi panel con có toạ độ cục bộ (u, v): `u` chạy DỌC theo cạnh gắn với cha, `v` đi RA XA cạnh gắn (v=0 là cạnh gắn).
- Mặc định hình panel là hình chữ nhật `len × depth`, tức đa giác `[[0,0],[len,0],[len,depth],[0,depth]]`. Muốn vát/bo góc thì truyền `shape` (dùng `core/shapes.ts`).

## 2. Thuật toán layout (core/layout.ts)
Với panel con gắn vào cạnh `edge` của cha, cha có hình chữ nhật (px, py, pw, ph) trong khuôn phẳng, `o = offset ?? 0`:

| edge của cha | gốc cục bộ (x0,y0) | (u,v) → (x,y) |
|---|---|---|
| top | (px + o, py) | x = x0 + u, y = y0 − v |
| bottom | (px + o, py + ph) | x = x0 + u, y = y0 + v |
| left | (px, py + o) | x = x0 − v, y = y0 + u |
| right | (px + pw, py + o) | x = x0 + v, y = y0 + u |

Panel con có hình chữ nhật bao: rộng/cao theo bảng trên. Dùng chính hình chữ nhật bao đó làm "cha" cho cháu. Duyệt cây theo chiều sâu.
Sau layout mỗi panel có: `poly` (đa giác trong toạ độ phẳng), `rect` (hình chữ nhật bao khi coi là cha), `baseSeg` (đoạn chung với cha).

## 3. Phân loại đường (core/dieline.ts)
- **Cấn (crease)** = đoạn chung giữa panel con và cạnh cha, tức `baseSeg` của mỗi panel có cha.
- **Cắt (cut)** = mọi cạnh của đa giác còn lại, TRỪ phần nằm trùng baseSeg.
- Cạnh của cha có gắn con: chỉ phần KHÔNG được con phủ mới là đường cắt. Tính bằng cách trừ các khoảng [o, o+len] của các con khỏi khoảng [0, độ dài cạnh].
- Hai panel con khác nhau cùng nằm sát nhau nhưng KHÔNG cha–con (vd hai tai mở cạnh nhau) → đoạn trùng được tính là cắt, không phải cấn. Có thể bỏ đoạn cắt trùng nhau (khử trùng lặp) để file sạch.
- Gom `bbox` = hộp bao toàn bộ đa giác.

## 4. Độ dày giấy (core/thickness.ts)
- Người dùng chọn "lòng" hoặc "phủ bì". Luôn đổi về **lòng** trước khi gọi `build`: `lòng = phủ bì − 2·t` cho mỗi chiều.
- Bù độ dày v1 (xấp xỉ, ghi chú trong giao diện "ước lượng"): mỗi panel thân nằm giữa hai nếp cấn song song thì cộng thêm `t` vào chiều rộng của nó (bù bán kính gấp). Mỗi file hộp tự gọi `thick(p, base)` trong `thickness.ts` nơi cần. Không tự bù rải rác.
- Công tắc "Bù độ dày giấy" tắt → `thick()` trả về `base` nguyên.

## 5. Cách viết một file hộp (src/boxes/*.ts)
1. Khai báo `BoxDef` với `defaults`, `options`, `dims`.
2. `build(p)` trả về `PanelNode[]`. Đặt panel gốc là panel thân đầu tiên (thường là mặt trước hoặc mặt sau).
3. Thân hộp = chuỗi panel nối nhau theo cạnh `right`: [lưỡi dán][mặt 1][mặt 2][mặt 3][mặt 4] (độ dài lần lượt theo L, W, L, W). Nắp/đáy/tai gắn vào cạnh `top`/`bottom` của từng mặt.
4. Mỗi panel có `fold` (thường 90) và `step` (thứ tự gấp: thân 1, tai bụi 2, nắp/đáy 3…).
5. `dims`: chọn panel và trục để vẽ đường kích thước L, W, H (cạnh có chiều dài đúng bằng L, W, H).

## 6. Mẫu hoàn chỉnh: thùng carton FEFCO 0201 (RSC)
Biến: `L`, `W`, `H` (lòng), `g` = độ rộng lưỡi dán = 30 mm (mặc định, đổi được), nắp cao `W/2`.
- Thân: ở chuỗi ngang, mỗi mặt có **rộng (theo x)** = L hoặc W và **cao (theo y)** = H.
  Panel gốc không có cha nên quy ước riêng: `len` = chiều ngang (theo x), `depth` = chiều dọc (theo y), đặt tại (0,0).
- Thứ tự từ trái sang phải: `glue` (rộng g, cao H, `glue:true`, vát 2 góc xa cạnh gấp 5 mm) — `A` (rộng L) — `B` (rộng W) — `C` (rộng L) — `D` (rộng W).
  Cách dựng cây: gốc = `A`; `glue` gắn cạnh `left` của A; `B` gắn `right` của A; `C` gắn `right` của B; `D` gắn `right` của C.
- Nắp trên: mỗi mặt A, B, C, D có 1 tai gắn cạnh `top`, `len` = rộng mặt đó, `depth` = W/2.
- Nắp dưới: tương tự gắn cạnh `bottom`, `depth` = W/2.
- Góc gấp: thân 90, nắp trên/dưới 90. Thứ tự: thân step 1, tai nhỏ (trên B, D) step 2, tai lớn (trên A, C) step 3.
- `dims`: L trên mặt A (trục u), W trên mặt B (trục u), H trên mặt A (trục v).
- Khe giữa các tai (slot): v1 để 0; thêm tuỳ chọn `slot` (mm) về sau.

Nếu mô tả trên mâu thuẫn với ảnh tham chiếu người dùng đưa → ảnh tham chiếu thắng; ghi lại chênh lệch trong `PROGRESS.md`.

## 7. Kiểm tra bắt buộc (test)
- Mọi `shape` là đa giác kín, không tự cắt.
- Không có hai panel chồng lên nhau trong khuôn phẳng (kiểm tra giao hai hình chữ nhật bao, trừ cha–con chỉ chạm cạnh).
- Số đường cấn = số panel có cha (đã trừ phần khử trùng).
- Tổng bbox của hộp mẫu khớp tính tay (ghi con số tính tay vào test).
- Đổi L, W, H → bbox đổi đúng tỉ lệ.

## 8. Hộp khác
- Hộp nắp gài, đáy khoá, mailer: KHÔNG đoán. Cần ảnh khuôn tham chiếu (workflow `/add-box-type`). Với góc vát/bo dùng `shapes.ts` (chamfer, rounded, trapezoid), không tự viết toạ độ tay ở nhiều nơi.
