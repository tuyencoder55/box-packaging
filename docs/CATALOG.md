# CATALOG — danh mục mẫu cần làm (theo pacvina.com/templates)

Nhóm dưới đây lấy từ mô tả công khai của trang Pacvina. **Danh sách mẫu cụ thể trong từng nhóm** do người dùng cung cấp bằng ảnh chụp (xem workflow `/import-templates`) rồi điền vào bảng "Mẫu cụ thể" bên dưới. AI không tự bịa tên mẫu.

## Hai loại động cơ khác nhau

| Động cơ | Dùng cho | Cách dựng |
|---|---|---|
| **A. Khuôn gấp** (PanelNode, đã có trong kit) | Hộp, thùng, túi giấy, phong bì, bìa kẹp, nhãn treo | Cây panel → khuôn 2D + gấp 3D |
| **B. Mockup xoay tròn** (làm RIÊNG, phase P8) | Chai, hũ, lon, tuýp, ly giấy, túi zip | Hình tròn xoay (LatheGeometry) + nhãn dán; không có khuôn gấp |

Không nhét nhóm B vào PanelNode. Làm xong nhóm A rồi mới tính nhóm B.

## Nhóm A — khuôn gấp (theo thứ tự làm)

| # | Nhóm | Gia đình cấu trúc | Độ khó | Ghi chú |
|---|---|---|---|---|
| 1 | Thùng carton (FEFCO) | thân 4 mặt + 4 tai trên/dưới | Dễ | Có công thức trong skill `dieline-geometry`. Phần lớn dạng FEFCO 02xx là biến thể của 0201 |
| 2 | Hộp nắp gài | thân + lưỡi nắp + tai bụi | Vừa | Thẳng / ngược / có tai bụi |
| 3 | Hộp đáy khoá | thân + đáy khoá 1-2-3 (vát chéo) | Vừa–khó | Có ảnh chụp Pacvina tham chiếu |
| 4 | Mailer cuộn mép | tấm đáy + nắp + cuộn mép | Vừa | FEFCO 0427 |
| 5 | Hộp cửa sổ | như hộp nắp gài + lỗ cắt | Vừa | Thêm "lỗ cắt" (đa giác cắt kín) — cần mở rộng types, hỏi trước |
| 6 | Hộp rút khăn giấy | hộp nắp gài + lỗ rút | Vừa | Cùng cần "lỗ cắt" |
| 7 | Hộp quai xách | thân + quai | Khó | Có chi tiết quai, khoá cài |
| 8 | Túi giấy | thân + đáy xếp + gân bên | Khó | Gân xếp bên (gusset) có hai nếp gấp ngược — kiểm tra kỹ 3D |
| 9 | Phong bì | tấm + nắp tam giác | Dễ–vừa | Cạnh chéo, cần panel không chữ nhật (dùng `shape`) |
| 10 | Bìa kẹp (folder) | 2–3 tấm gấp phẳng + túi | Vừa | Gấp 180° (phẳng), không phải 90° |
| 11 | Nhãn treo (hang tag) | 1 tấm + lỗ | Dễ | Chỉ khuôn 2D, 3D là tấm phẳng |

## Dùng lại bộ phận (QUAN TRỌNG để thêm mẫu nhanh, ít sửa code)
Các hộp cùng gia đình dùng chung hàm trong `src/boxes/parts/` (mỗi file một bộ phận), ví dụ:
`tuckLid.ts`, `dustFlap.ts`, `autoLockBottom.ts`, `glueFlap.ts`, `rollEdge.ts`.
Hộp mới thuộc gia đình có sẵn → chỉ ghép bộ phận, không viết lại hình học. Muốn đổi hình một bộ phận → sửa MỘT file `parts/`, mọi hộp dùng nó tự cập nhật.
Quy tắc: bộ phận là hàm thuần `(args) => PanelNode[]`, gắn vào panel cha cho trước.

## Mẫu cụ thể (điền từ ảnh người dùng gửi)

| Mã nội bộ (id) | Tên hiển thị | Nhóm | Kích thước mặc định L×W×H (mm) | Ảnh tham chiếu (docs/ref/…) | Trạng thái |
|---|---|---|---|---|---|
| fefco-0201 | Thùng carton RSC | 1 | 300×200×150 | — | ✅ |
| fefco-0203 | Thùng carton nắp chồng FOL | 1 | 300×200×200 | — | ✅ |
| fefco-0301 | Hộp âm dương (nắp đáy rời) | 1 | 200×150×80 | — | ✅ |
| fefco-0427 | Mailer cuộn mép | 4 | 200×150×50 | — | ✅ |
| tuck-end-straight | Hộp nắp gài thẳng | 2 | 80×50×140 | — | ✅ |
| tuck-end-reverse | Hộp nắp gài ngược | 2 | 80×50×140 | — | ✅ |
| auto-lock-bottom | Hộp đáy khoá tự động | 3 | 80×50×140 | docs/ref/studio-pacvina.png | ✅ |
| snap-lock-bottom | Hộp đáy khoá cài 1-2-3 | 2 | 80×60×140 | Packfino ECMA A50.20 | ✅ |
| hang-tab-tuck-end | Hộp nắp gài có tai treo | 2 | 75×30×120 | Packfino ECMA A20 | ✅ |
| tuck-top-glued-bottom | Hộp nắp gài trên đáy dán keo | 2 | 80×50×140 | Packfino ECMA A20/A10 | ✅ |
| seal-end-carton | Hộp dán keo hai đầu | 2 | 100×50×150 | Packfino ECMA A10.20 | ✅ |

(Thêm dòng mới ở cuối bảng khi người dùng cung cấp mẫu.)

## Nguyên tắc làm mẫu số lượng lớn
- Làm theo LÔ 3–5 mẫu cùng gia đình, mỗi lô xong thì `/checkpoint`.
- Mỗi mẫu có test riêng (số panel, bbox, số đường cấn) — mẫu mới không được làm hỏng test mẫu cũ.
- Mẫu nào sai khác ảnh tham chiếu → ghi vào `PROGRESS.md`, sửa trong file bộ phận hoặc file mẫu đó, không đụng core.
