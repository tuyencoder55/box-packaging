# SPEC — BoxMaker (bản rút gọn kiểu Pacvina)

Tham chiếu: pacvina.com (trang chủ), pacvina.com/templates (thư viện mẫu), pacvina.com/app (editor).
Chỉ làm phần LÕI. Không cần đăng nhập, thanh toán, duyệt với khách, ép kim/UV, moodboard.

## 1. Ba trang (mỗi trang một file HTML, Vite multi-page)

| Trang | File | Việc chính |
|---|---|---|
| Trang chủ | `index.html` | Giới thiệu ngắn + nút "Xem mẫu" + nút "Mở Studio". Làm đơn giản, cuối cùng mới làm. |
| Thư viện mẫu | `templates.html` | Lưới mẫu hộp, lọc theo nhóm, bấm vào mẫu → xem 3D + nhập kích thước → "Dùng mẫu này". |
| Studio | `app.html` | Nhập kích thước → khuôn 2D chuẩn + hộp gấp 3D + xuất file. |

Chuyển trang bằng URL: `app.html?type=fefco-0201&l=300&w=200&h=150` (đơn vị mm). Không dùng router.

## 2. Thư viện mẫu (templates.html)

- Lưới thẻ. Mỗi thẻ: ảnh khuôn 2D (tự vẽ từ kích thước mặc định của mẫu, KHÔNG dùng ảnh tĩnh), tên, mã (vd FEFCO 0201), kích thước mặc định.
- Thanh lọc theo nhóm: Tất cả / Thùng carton / Hộp nắp gài / Đáy khoá / Mailer.
- Bấm thẻ → khung chi tiết: hộp 3D xoay được, thanh trượt gấp/mở, ô nhập Dài × Rộng × Cao (đơn vị mm/cm/inch), nút "Dùng mẫu này trong Studio".
- Thêm mẫu mới = thêm 1 file trong `src/boxes/` + 1 dòng đăng ký. Trang này tự cập nhật, KHÔNG sửa code trang.

## 3. Studio (app.html)

Bố cục (xem ảnh chụp Pacvina đính kèm khi làm):
- Thanh trên: tên tài liệu, trạng thái "Đã lưu", 3 bước **Dieline · Mockup 3D · Xuất**, nút Xuất file.
- Cột trái (panel tham số), do `BoxDef` tự sinh:
  - Đơn vị: mm / cm / inch.
  - Kiểu nhập: "Kích thước lòng" | "Kích thước phủ bì".
  - Dài (L), Rộng (W), Cao (H).
  - Độ dày giấy (mm) + công tắc "Bù độ dày giấy".
  - Các tuỳ chọn riêng của từng loại hộp (kiểu khoá lưỡi gài, khoá tai bụi…): select / toggle / number.
  - Hướng dán: Dạng 1–4 (nếu loại hộp hỗ trợ).
  - Hướng hiển thị: Chuẩn / Lật ngang / Lật dọc / Xoay 180°.
- Giữa: khung SVG khuôn 2D.
  - Chú giải: Dao dứt (nét liền), Dao cấn (nét đứt đỏ), Bleed (nét xanh, có thể ẩn).
  - Đường kích thước có nhãn (vd "8 cm", "5 cm", "14 cm") đặt trên đúng các panel.
  - Phóng to/thu nhỏ (cuộn chuột), kéo để dời, nút "vừa khung", hiển thị % zoom.
- Góc dưới phải: thẻ "Mockup 3D" nổi, có nút phóng to / đóng. Bước "Mockup 3D" mở lớn.
- Mọi thay đổi tham số → khuôn 2D và hộp 3D cập nhật ngay (không bấm nút).
- Tự lưu vào localStorage, F5 không mất.

## 4. Xuất file (bước "Xuất")

Bắt buộc có (không đăng nhập, bấm là tải):
- **PDF vector**: khổ đúng kích thước khuôn (mm), có LAYER `CUT` và `CREASE`, đường dao là màu pha (spot) tên `CUT` và `CREASE`, đặt overprint, nét cấn là nét đứt.
- **AI** (Adobe Illustrator): cùng nội dung và layer như PDF, lưu dạng PDF-compatible với đuôi `.ai`. Mở bằng Illustrator thấy đúng layer và swatch màu pha.
- **DXF** (CAD / máy bế / máy cắt mẫu): đơn vị mm, layer `CUT` và `CREASE`, đường cắt là polyline liền (không phải hàng loạt đoạn rời).
- **SVG**: layer `CUT` / `CREASE`, mở được trong Illustrator, Inkscape, trình duyệt.
- **PNG** ảnh mockup 3D.
Tên file: `<id-hộp>_<L>x<W>x<H>mm.<đuôi>`. Kích thước đo trong file phải khớp khuôn trên màn hình.

## 5. Danh mục hộp v1 (6 loại, tăng dần độ khó)

1. `fefco-0201` — Thùng carton RSC (thùng carton thông dụng) ← làm đầu tiên, dễ nhất
2. `fefco-0427` — Hộp mailer cuộn mép
3. `tuck-end-straight` — Hộp nắp gài thẳng
4. `tuck-end-reverse` — Hộp nắp gài ngược
5. `auto-lock-bottom` — Hộp đáy khoá tự động (như ảnh chụp)
6. `tray-sleeve` — Khay + vỏ trượt (tuỳ chọn, làm sau cùng)

Với mỗi loại hộp mới: PHẢI có ảnh/bản vẽ khuôn tham chiếu do người dùng cấp. Không đoán hình học.

## 6. Ngoài phạm vi v1

Đăng nhập, lưu cloud, thiết kế/layer/pen tool, ép kim/UV, link duyệt khách, thanh toán, nhập file AI/PDF khuôn, tự dựng cấu trúc, mobile editor.
Màu và ảnh lên mặt hộp 3D: CÓ làm (phase P4b). Danh sách mẫu đầy đủ như trang templates: xem `docs/CATALOG.md` (phase P3b). Mockup chai/lon/ly: phase P8, làm riêng.
(Để dành nếu muốn: bleed offset.)

## 7. Giao diện

Nền tối giống Pacvina, màu nhấn xanh bạc hà, chữ Inter. Mọi màu/cỡ chữ/bo góc khai báo trong `src/styles/tokens.css`. Màn hình tối thiểu 1280px.
