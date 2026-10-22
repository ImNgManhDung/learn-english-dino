# 🦖 Dino Vocab Shooter — Bắn Khủng Long Học Từ Vựng Tiếng Anh

Trò chơi luyện từ vựng tiếng Anh thông qua phản xạ gõ phím kết hợp bắn khủng long trên nền tảng HTML5 Canvas.

## ✨ Tính năng nổi bật
- **Gợi ý ký tự thông minh (`Hint: X..., B...`)**: Mỗi con khủng long hiển thị **Nghĩa tiếng Việt** kèm từ tiếng Anh ẩn ký tự (ví dụ: `Quả chuối (n) — B _ _ A _ A` hoặc `Đàn mộc cầm (n) — X _ _ _ _ _ _ _ E`).
- **3 cấp độ gợi ý**:
  - **Dễ (`easy`)**: Lộ chữ đầu, chữ cuối và ~35% số chữ ở giữa (`B _ _ A _ A`)
  - **Vừa (`medium`)**: Lộ chữ đầu, chữ giữa (với từ >= 6 chữ) và chữ cuối ở Wave 1-2 (`B _ _ A _ A` ở Wave 1-2, `B _ _ A _ _` từ Wave 3)
  - **Khó (`hard`)**: Chỉ lộ chữ cái đầu tiên (`B _ _ _ _ _`), nếu từ rất dài (>= 9 chữ) lộ thêm chữ cuối (`X _ _ _ _ _ _ _ E`)
- **6 chủ đề từ vựng thông dụng**: Động vật & Tự nhiên, Ẩm thực & Trái cây, Hành động hàng ngày, Học tập & Công việc, Công nghệ & Đời sống, Tính từ & Cảm xúc.
- **Đọc phát âm chuẩn (Web Speech API)**: Tự động phát âm từ tiếng Anh ngay khi bắn hạ khủng long và cho phép nghe lại trong **📖 Sổ tay từ đã học**.

## 🚀 Chơi trực tiếp trên GitHub Pages
Dự án là Static Web App chuẩn (`.nojekyll` + `.github/workflows/deploy.yml`), tương thích trực tiếp với **GitHub Pages**.
