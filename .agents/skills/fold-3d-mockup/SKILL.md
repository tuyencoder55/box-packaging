---
name: fold-3d-mockup
description: Dùng khi dựng hoặc sửa hộp gấp 3D bằng Three.js từ cây PanelNode — foldModel, thanh trượt gấp/mở, thẻ Mockup 3D, ảnh PNG.
---

# Hộp gấp 3D từ cây panel

## Ý tưởng
Dùng đúng cây `PanelNode[]` đã dùng cho khuôn 2D. Mỗi panel là một mặt phẳng; panel con xoay quanh cạnh gắn với cha. Gấp cha thì con đi theo (cấu trúc lồng nhau).

## Quy ước
- Tờ giấy phẳng nằm trên mặt XY, mặt IN (mặt ngoài hộp) hướng về người xem (+Z). Trục y của khuôn đi xuống → đổi dấu khi sang Three.js: `three.y = −flat.y`.
- `fold: 90` nghĩa là panel con gấp 90° về phía SAU tờ giấy (−Z), tức mặt ngoài quay ra ngoài hộp. Góc cộng dồn theo cha.
- Trục xoay = đường cạnh gắn (`baseSeg`). Hướng xoay phụ thuộc `edge`: top/bottom xoay quanh trục X, left/right xoay quanh trục Y. Dấu xoay lấy sao cho phần con đi về −Z. Phải có test hình học nhỏ (vd đỉnh panel sau gấp có z < 0).

## Dựng (render3d/foldModel.ts)
1. Với mỗi panel tạo `THREE.Group` "bản lề" đặt tại điểm đầu của `baseSeg` (hoặc tại gốc cho panel gốc), tương đối so với group cha.
2. Trong group tạo mesh từ đa giác `poly` (`THREE.Shape` + `ShapeGeometry`), vị trí tương đối so với điểm bản lề. Chất liệu hai mặt: mặt ngoài màu giấy (token `--paper-outer`), mặt trong tối hơn (`--paper-inner`) — dùng `side: DoubleSide` + hai mesh, hoặc vật liệu theo mặt.
3. Gắn group con vào group cha. Group gốc căn giữa hộp ở trạng thái gấp xong để xoay đẹp (tính bbox sau khi gấp).
4. Không tự tính lại kích thước: lấy từ `poly` đã có.

## Hoạt hoạ gấp (render3d/foldAnim.ts)
- Tiến độ `t ∈ [0,1]`, `maxStep` = step lớn nhất. Góc panel = `fold × clamp(t × maxStep − (step − 1), 0, 1)`.
- Thanh trượt chỉ đổi `rotation` của các group; KHÔNG dựng lại hình.
- Nút "Gấp / Mở" chạy `t` bằng `requestAnimationFrame`.

## Texture: màu và ảnh trên mặt hộp (phase P4b)
- **Mẹo chính:** UV của mỗi panel lấy thẳng từ toạ độ khuôn phẳng. Với đỉnh có toạ độ phẳng (x, y): `u = (x − bbox.x0) / bboxW`, `v = 1 − (y − bbox.y0) / bboxH`. Một tấm ảnh phủ cả khuôn sẽ tự cắt đúng lên từng mặt khi gấp. Không tự tính UV kiểu khác.
- Trạng thái thiết kế nằm trong store, không nằm trong model 3D: `design = { faceColor: Record<panelId,string>, innerColor: string, art: { imageId, x, y, scale, rotate } | null, panelArt: Record<panelId, {...}> }`.
- Ảnh phủ cả khuôn dùng một `THREE.CanvasTexture` vẽ từ canvas 2D: vẽ nền màu từng panel (clip theo `poly`), rồi vẽ ảnh. Cùng canvas này cũng dùng để hiện trên khuôn 2D, nên 2D và 3D luôn khớp.
- Đổi màu/ảnh chỉ cập nhật texture (`texture.needsUpdate = true`), KHÔNG dựng lại model.
- Ảnh lớn: thu nhỏ về tối đa 2048 px cạnh dài trước khi tạo texture; lưu bản gốc vào IndexedDB.
- Mặt trong dùng màu riêng (`innerColor`), không dùng ảnh ở v1.

## Hiệu năng và dọn dẹp
- Chỉ dựng lại model khi cây panel đổi (subscribe theo `panels`). Đổi tiến độ gấp chỉ xoay.
- Khi dựng lại: `dispose()` geometry và material cũ.
- Dùng một renderer cho mỗi canvas. Thẻ nổi và bước "Mockup 3D" dùng chung một renderer (chuyển kích thước, không tạo thêm).
- Bật `preserveDrawingBuffer` chỉ khi chụp PNG, hoặc chụp bằng cách render 1 khung rồi `toDataURL` ngay.

## Kiểm tra
- Hộp 0201 gấp kín: 4 thân thẳng đứng, đáy/nắp phẳng ngang, lưỡi dán nằm sát mặt D (khuôn thật dán mặt trong).
- Không có panel xuyên qua nhau ở `t = 1` cho 0201 (hộp có tai gài có thể xuyên nhẹ — ghi vào `PROGRESS.md`, đừng cố sửa ở v1).
