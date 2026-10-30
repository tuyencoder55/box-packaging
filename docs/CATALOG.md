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

| Mã nội bộ (id) | Tên hiển thị | Tiêu chuẩn / Mã | Kích thước mặc định L×W×H (mm) | Ghi chú & Lỗ cắt | Trạng thái |
|---|---|---|---|---|---|
| reverse-tuck-end-box | Reverse tuck end box dieline | ECMA A20.20 | 63.5×38.1×127 | Nắp gài đối xứng | ✅ |
| straight-tuck-end-box | Straight tuck end box dieline | ECMA A20.20.03 | 76.2×76.2×101.6 | Nắp gài cùng phía mặt sau | ✅ |
| hang-tab-tuck-end-box | Hang tab tuck end box dieline | ECMA A20 + HANG TAB | 76.2×25.4×127 | Tai treo thẻ header + lỗ Euro slot | ✅ |
| auto-lock-bottom-box | Auto lock bottom box dieline | ECMA A60.20 | 76.2×76.2×127 | Đáy khoá tự động dán sẵn (Crash lock) | ✅ |
| snap-lock-bottom-box | Snap lock bottom box dieline | ECMA A50.20 / FEFCO 0215 | 101.6×76.2×152.4 | Đáy khoá gài 1-2-3 có rãnh & lưỡi | ✅ |
| seal-end-carton | Seal end carton dieline | ECMA A10.20 | 101.6×50.8×152.4 | Nắp và đáy dán keo niêm phong | ✅ |
| tissue-box | Cube tissue box dieline | SEAL END + DISPENSER | 111.8×111.8×132.1 | Hộp khăn giấy vuông, lỗ oval trên nắp | ✅ |
| tuck-top-glued-bottom-box | Tuck top glued bottom box dieline | ECMA A20 / A10 COMBINATION | 88.9×50.8×139.7 | Nắp gài trên, đáy dán keo | ✅ |
| dispenser-box | Dispenser box dieline | ECMA A20.20 + DISPENSER | 152.4×76.2×101.6 | Hộp rút sản phẩm, lỗ oval mặt trước | ✅ |
| tea-box | Tea bag box dieline | TUCK TOP, GLUED BOTTOM | 139.7×69.9×76.2 | Hộp trà 20 gói nắp gài đáy dán | ✅ |
| flat-tissue-box | Rectangular tissue box dieline | SEAL END + TOP DISPENSER | 238×89×119 | Hộp khăn giấy chữ nhật, lỗ oval mặt trước | ✅ |
| snap-lock-hang-tab-box | Hang tab box with snap lock bottom dieline | ECMA A50 + HANG TAB | 76.2×25.4×127 | Tai treo Euro slot + đáy gài 1-2-3 | ✅ |
| crash-lock-hang-tab-box | Hang tab box with auto lock bottom dieline | ECMA A60 + HANG TAB | 76.2×25.4×127 | Tai treo Euro slot + đáy khoá tự động | ✅ |
| fefco-0201 | Thùng carton RSC | FEFCO 0201 | 300×200×150 | Thùng đối khẩu thông dụng | ✅ |
| fefco-0203 | Thùng carton nắp chồng FOL | FEFCO 0203 | 300×200×200 | Nắp chồng phủ kín | ✅ |
| fefco-0301 | Hộp âm dương (nắp đáy rời) | FEFCO 0301 | 200×150×80 | Hộp 2 mảnh nắp đáy rời | ✅ |
| fefco-0427 | Mailer cuộn mép | FEFCO 0427 | 200×150×50 | Hộp ship hàng cuộn mép | ✅ |
| window-tuck-end | Hộp nắp gài có cửa sổ | ECMA A20.20 + Window | 100×50×150 | Cửa sổ kính bóng kính mặt trước | ✅ |

(Thêm dòng mới ở cuối bảng khi người dùng cung cấp mẫu.)

## Nguyên tắc làm mẫu số lượng lớn
- Làm theo LÔ 3–5 mẫu cùng gia đình, mỗi lô xong thì `/checkpoint`.
- Mỗi mẫu có test riêng (số panel, bbox, số đường cấn) — mẫu mới không được làm hỏng test mẫu cũ.
- Mẫu nào sai khác ảnh tham chiếu → ghi vào `PROGRESS.md`, sửa trong file bộ phận hoặc file mẫu đó, không đụng core.
