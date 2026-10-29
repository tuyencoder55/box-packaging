# LUẬT SỬA CODE TỐI THIỂU (ưu tiên cao nhất, luôn bật)

Vấn đề cần tránh: AI viết lại cả file hoặc cả dự án khi chỉ được nhờ sửa một chỗ nhỏ.

## Khi sửa code đã có
1. Chỉ sửa đúng chỗ được nhờ. Dùng công cụ sửa theo đoạn (thay một khối), **KHÔNG ghi đè cả file bằng nội dung mới**.
2. Mở đúng file liên quan (tra `docs/MAP.md`). Không quét/đọc cả dự án.
3. Trước khi sửa, nói trước: "Tôi sẽ sửa: file A (hàm x), file B (khoảng dòng n)". Một yêu cầu ≤ 3 file. Cần nhiều hơn → dừng, đề xuất chia nhỏ.
4. KHÔNG: đổi tên, di chuyển code, định dạng lại, đổi thứ tự import, "dọn dẹp", đổi style ở những dòng không liên quan.
5. KHÔNG refactor, nâng cấp thư viện, thêm thư viện khi chưa được yêu cầu.
6. File đóng băng (🧊 trong MAP.md): `core/types.ts`, `styles/tokens.css`, `package.json`, `vite.config.ts`, `tsconfig.json`, `docs/*`. Không sửa trừ khi người dùng yêu cầu rõ.
7. Nếu một file sắp đổi hơn ~40 dòng hoặc hơn ~30% nội dung → DỪNG, báo lý do, hỏi người dùng.
8. Phát hiện vấn đề khác ngoài yêu cầu → ghi vào mục "Ghi chú / Nợ kỹ thuật" trong `PROGRESS.md`, KHÔNG tự sửa.
9. Không xoá tính năng đang chạy để "làm lại cho gọn".

## Khi viết code mới
10. Mỗi file ≤ 200 dòng, mỗi hàm ≤ 40 dòng. Quá thì tách file/hàm.
11. Làm một việc nhỏ → dừng → để người dùng xem → mới làm việc tiếp theo. Không tự chạy sang việc kế tiếp.
12. Tạo file mới thì thêm 1 dòng vào `docs/MAP.md`.

## Với giao diện
13. Cập nhật từng phần tử theo thay đổi (subscribe theo slice trong store). KHÔNG xoá cả container rồi dựng lại (`innerHTML = ''`) cho một thay đổi nhỏ.

## Báo cáo sau mỗi việc (đúng 3 mục, ngắn)
- File đã đổi + 1 dòng lý do mỗi file
- Đã chạy `npm run check`: xanh/đỏ
- Cách tự kiểm tra bằng mắt trên trình duyệt

Khi nghi ngờ nên sửa nhiều hay ít → luôn chọn sửa ít hơn và hỏi.
