# Thiệp mời tốt nghiệp

Thiệp mời tốt nghiệp online (React + Vite), deploy trên Netlify.

## Các trang

| Đường dẫn | Dành cho | Nội dung |
|---|---|---|
| `/` | Khách | Nhập tên ở phong bì → mở thiệp, trả lời "sẽ đến". Link `/?to=Tên` điền sẵn tên |
| `/taothiep` | Chủ thiệp | Nhập tên khách → copy link mời hoặc tải thiệp dạng ảnh PNG |
| `/thongke` | Chủ thiệp | Danh sách khách đã mở thiệp / đồng ý (cần mật khẩu) |

## Chỉnh nội dung

Tên, ngày giờ, địa điểm, lời nhắn nằm trong `src/data/defaultInfo.js`.
Lời nhắn dùng `{you}` / `{me}` để tự đổi xưng hô theo tên khách (anh, chị, em, thầy, cô...) — xem `src/utils/pronouns.js`.

## Chạy trên máy

```bash
npm install
npm run dev          # chỉ giao diện
npx netlify-cli dev  # giao diện + thống kê (http://localhost:8888)
```

Mật khẩu `/thongke` khi chạy trên máy đặt trong file `.env` (`STATS_PASSWORD=...`, không commit).

## Deploy (Netlify)

- Kết nối repo với Netlify — cấu hình build có sẵn trong `netlify.toml`.
- Thêm biến môi trường `STATS_PASSWORD` (mật khẩu trang thống kê).
- Dữ liệu thống kê lưu bằng Netlify Blobs, có giới hạn chống spam trong `netlify/functions`.
