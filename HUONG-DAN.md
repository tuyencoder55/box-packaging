# HƯỚNG DẪN DÙNG BỘ KIT VỚI ANTIGRAVITY

## 1. Chuẩn bị (làm 1 lần)
1. Cài Node.js 20+ và Git.
2. Tạo thư mục dự án mới (vd `boxmaker`), chép vào đó TOÀN BỘ nội dung bộ kit: thư mục `.agents/`, thư mục `docs/`, file `PROGRESS.md` (thư mục `.agents` bắt đầu bằng dấu chấm nên có thể bị ẩn — bật "hiện file ẩn").
3. Mở thư mục này bằng Antigravity.
4. Vào phần Rules của Antigravity và kiểm tra 3 rule `00-project`, `01-minimal-edit`, `02-code-style` đang ở chế độ **Always On** (luôn bật). Workflows và Skills tự được nhận từ thư mục.
5. Chép 2 thứ sau vào thư mục `docs/ref/` để AI có ảnh tham chiếu: ảnh chụp Studio Pacvina bạn đã gửi, và ảnh khuôn của từng hộp bạn muốn làm.

> Nếu Antigravity bản của bạn không thấy thư mục `.agents`, đổi tên thành `.agent` (bản cũ dùng tên này).

## 2. Cách chạy mỗi phase
Trong khung chat của Antigravity gõ `/` để gọi workflow:

```
/build-phase P0
```
AI sẽ đọc tài liệu, đưa kế hoạch ngắn, làm ĐÚNG MỘT việc nhỏ rồi dừng. Bạn:
1. Chạy `npm run dev`, mở trình duyệt xem theo hướng dẫn AI báo.
2. Ổn → gõ `/checkpoint` (lưu mốc git).
3. Rồi gõ `/build-phase P0` tiếp để làm việc nhỏ kế tiếp. Làm xong phase thì sang `P1`…

Thứ tự gợi ý: P0 → P1 → P2 → P3 → P4 → P5 → P6 (xem `docs/ROADMAP.md`).

## 3. Các lệnh hay dùng

| Gõ | Khi nào |
|---|---|
| `/build-phase P1.2` | Làm đúng một việc nhỏ trong roadmap |
| `/small-edit đổi màu nút Xuất file sang xanh đậm hơn` | Chỉnh nhỏ giao diện/chữ/số |
| `/fix-bug khi đổi sang inch thì khuôn bị méo` | Có lỗi |
| `/add-box-type mailer FEFCO 0427` | Thêm loại hộp (nhớ kèm ảnh khuôn) |
| `/checkpoint` | Mỗi khi một việc chạy tốt |

## 4. Cách viết yêu cầu để AI không viết lại cả code
Quy tắc vàng: **một yêu cầu = một việc, nói rõ ở đâu.**

Tệ: "Làm lại giao diện cho đẹp hơn."
Tốt: `/small-edit Ở panel trái, ô nhập Dài/Rộng/Cao cho to hơn 1 chút và cách nhau 12px`

Tệ: "Thêm nhiều loại hộp nữa."
Tốt: `/add-box-type hộp nắp gài thẳng` + đính kèm ảnh khuôn.

Mẹo:
- Chụp màn hình khoanh đỏ chỗ cần sửa, dán vào chat.
- Nói bằng thứ bạn nhìn thấy ("nút Xuất file ở góc phải trên") thay vì tên kỹ thuật.
- Nếu AI định sửa hơn 3 file hay hơn ~40 dòng một file, luật sẽ bắt nó dừng và hỏi. Bạn trả lời "chia nhỏ ra làm từng bước".

## 5. Khi AI vẫn lỡ viết lại nhiều
1. Đừng sửa tiếp trên bản hỏng. Chạy `git checkout .` để bỏ thay đổi chưa lưu (về mốc `/checkpoint` gần nhất).
2. Gõ lại yêu cầu và thêm câu: `Chỉ sửa đúng chỗ này, tuân thủ rule 01-minimal-edit, nói trước file nào sẽ sửa.`
3. Lỗi lặp lại → kiểm tra file nào đang quá dài (>200 dòng) và nhờ `/small-edit tách file X thành 2 file, giữ nguyên chức năng`. Đây là cách phòng ngừa tốt nhất: file càng nhỏ, AI càng ít chạm.

## 6. Khi cần thêm hộp mới (Pacvina có rất nhiều)
Cần: ảnh khuôn phẳng (nét cắt/nét cấn rõ), kích thước mẫu (vd 80×50×140 mm), và ghi chú các kích thước cố định (lưỡi dán, tai gài…). Đưa vào `docs/ref/` rồi gõ `/add-box-type`. AI sẽ viết bảng mô tả panel cho bạn duyệt trước khi code.

## 6b. Làm đủ thư viện như trang templates của Pacvina
Làm xong P3 (5 hộp đầu) rồi mới tới P3b. Chụp màn hình lưới mẫu trên pacvina.com/templates (cuộn từng nhóm), chụp thêm ảnh khuôn phẳng của từng mẫu nếu bấm vào xem được, bỏ vào `docs/ref/`, rồi gõ `/import-templates thùng carton` (đổi tên nhóm). AI lập danh mục cho bạn duyệt, rồi làm từng lô 3–5 mẫu. Mẫu nào thiếu ảnh khuôn sẽ bị đánh dấu "cần ảnh", không đoán.
Chai, hũ, lon, ly giấy làm riêng ở P8 vì cách dựng khác hộp gấp.

## 6c. Kiểm tra file xuất (bạn làm bằng Illustrator và CAD)
Sau P5, tải thử một hộp 80×50×140 mm rồi:
1. Mở file **.pdf** và **.ai** trong Illustrator. Bảng Layers phải có `CUT` và `CREASE`; bảng Swatches phải có 2 màu pha tên `CUT`, `CREASE`.
2. Dùng Measure đo một cạnh đã biết (vd cạnh cao 140 mm). Phải khớp.
3. Mở file **.dxf** trong phần mềm CAD của bạn: 2 layer, nét cấn hiện đứt, đường cắt là một đường liền.
4. Có lỗi gì (mất layer, sai kích thước, Illustrator báo lỗi file .ai) thì chụp màn hình rồi gõ `/fix-bug`. Mình đã chủ ý đánh dấu file `.ai` là chưa kiểm chứng; nếu Illustrator mở không được, dùng file PDF thay thế.

## 7. Cấu trúc bộ kit
```
.agents/rules/      3 luật luôn bật (dự án, sửa tối thiểu, quy ước code)
.agents/workflows/  /build-phase /add-box-type /import-templates /small-edit /fix-bug /checkpoint
.agents/skills/     dieline-geometry, fold-3d-mockup, export-formats, surgical-edit
docs/               SPEC, ARCHITECTURE, ROADMAP, MAP, CATALOG
PROGRESS.md         tiến độ + việc ghi chú
```
