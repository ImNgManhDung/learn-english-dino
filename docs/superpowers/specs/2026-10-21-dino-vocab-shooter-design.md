# Thiết Kế Hệ Thống: Dino Vocab Shooter (Bắn Khủng Long Học Từ Vựng Tiếng Anh)

**Ngày tạo:** 2026-10-21  
**Nền tảng triển khai:** GitHub Pages (Static Web App - HTML5 Canvas + Vanilla JS ES6 + CSS3)  
**Thư mục dự án:** `/Users/keith/Documents/LEANR_ENGLISH`

---

## 1. Mục tiêu dự án

Xây dựng một trò chơi web dạng Arcade "Bắn khủng long học từ vựng tiếng Anh" chạy trực tiếp trên trình duyệt và xuất bản qua **GitHub Pages**. Người chơi nhìn nghĩa tiếng Việt và gợi ý từ tiếng Anh bị ẩn ký tự (ví dụ: `B _ _ _ _ A`, `X _ _ _ _ _ _ _ _`) trên mỗi con khủng long đang tiến lại gần, gõ đúng các chữ cái trên bàn phím để bắn hạ khủng long và ghi nhớ từ vựng cùng cách phát âm.

---

## 2. Kiến trúc & Cấu trúc thư mục

Dự án sử dụng **Pure HTML5 + CSS3 + Vanilla JavaScript (ES6 Modules)** không phụ thuộc bundler để tương thích 100% với **GitHub Pages** ngay từ thư mục gốc (`/` trên nhánh `main`).

```text
/Users/keith/Documents/LEANR_ENGLISH/
├── .nojekyll                  # Báo cho GitHub Pages phục vụ trực tiếp file tĩnh không qua Jekyll
├── index.html                 # Trang chính của game (Menu, HUD, Canvas, Modal tổng kết)
├── css/
│   └── style.css              # Giao diện phong cách Arcade Prehistoric/Neon, responsive, hiệu ứng động
├── js/
│   ├── vocab.js               # Bộ từ vựng tiếng Anh thông dụng theo chủ đề & hàm tạo Hint (X..., B...)
│   ├── sound.js               # Hiệu ứng âm thanh Web Audio API (bắn, nổ, trúng, sai) + Web Speech API (đọc từ)
│   ├── entities.js            # Các đối tượng: Turret/Hunter (Xạ thủ), Dinosaur, Bullet, Particle, FloatingText
│   └── game.js                # Game Loop (requestAnimationFrame), quản lý trạng thái, xử lý gõ phím & khóa mục tiêu
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-10-21-dino-vocab-shooter-design.md
```

---

## 3. Thiết kế chi tiết các thành phần (Components)

### 3.1. Bộ từ vựng & Cơ chế tạo Hint (`js/vocab.js`)
- **Kho từ vựng có sẵn (~160 từ thông dụng):** Chia thành 6 chủ đề quen thuộc + chế độ "Tất cả chủ đề" (All Topics):
  1. `Animals & Nature` (Động vật & Tự nhiên)
  2. `Food & Drink` (Đồ ăn & Thức uống)
  3. `Daily Actions` (Hành động hàng ngày)
  4. `School & Work` (Trường học & Công việc)
  5. `Technology & Life` (Công nghệ & Đời sống)
  6. `Adjectives & Feelings` (Tính từ & Cảm xúc)
- **Mỗi mục từ vựng gồm:**
  - `word`: Từ tiếng Anh viết hoa chuẩn (VD: `"BANANA"`, `"XYLOPHONE"`, `"DINOSAUR"`).
  - `meaning`: Nghĩa tiếng Việt ngắn gọn, rõ ràng (VD: `"Quả chuối"`, `"Đàn mộc cầm"`, `"Khủng long"`).
  - `pos`: Từ loại (`n`, `v`, `adj`).
  - `phonetic`: Phiên âm quốc tế IPA (VD: `"/bəˈnɑː.nə/"`).
- **Thuật toán tạo Hint (`generateHintMask(word, wave)`):**
  - Luôn hiển thị **ký tự đầu tiên** (đúng kiểu gợi ý `X...`, `B...`) để người chơi biết chữ cái mở đầu cần nhắm bắn.
  - Tùy theo **Chế độ gợi ý (Hint Level)** hoặc **Wave**:
    - **Dễ (Wave 1-2):** Lộ chữ cái đầu, chữ cái cuối và ~30% chữ cái ở giữa (VD: `B _ N _ _ A`).
    - **Trung bình (Wave 3-5):** Lộ chữ cái đầu và 1 chữ cái ngẫu nhiên nếu từ dài ≥ 6 ký tự (VD: `B _ _ _ N _`).
    - **Khó (Wave 6+):** Chỉ lộ duy nhất chữ cái đầu tiên (VD: `B _ _ _ _ _`, `X _ _ _ _ _ _ _ _`).
  - Khi người chơi gõ đến vị trí thứ `i` (`typedIndex = i`), tất cả các vị trí `< i` đều hiển thị chữ cái thật màu xanh lá/vàng sáng; các vị trí `>= i` nếu nằm trong `revealedIndices` (ký tự gợi ý sẵn) sẽ hiển thị màu mờ để người chơi biết trước và gõ xuyên qua.

### 3.2. Cơ chế Gõ phím & Khóa mục tiêu (`js/game.js`)
- **Khóa mục tiêu (Target Lock-on):**
  - Khi chưa khóa con khủng long nào (`lockedDino = null`):
    - Người chơi nhấn một phím chữ cái `A-Z`.
    - Hệ thống tìm con khủng long đang trên màn hình có chữ cái đầu tiên (`word[0]`) khớp với phím vừa bấm (ưu tiên con khủng long **gần người chơi nhất** nếu có nhiều con trùng chữ cái đầu).
    - Nếu khớp: Khóa mục tiêu vào con khủng long đó (`lockedDino`), tiến độ gõ `typedIndex = 1`, bắn viên đạn đầu tiên.
    - Nếu người chơi nhấn phím chữ cái thứ 2 (`word[1]`) vì thấy chữ cái đầu đã hiện sẵn trong hint (`B _ _ _`): Hệ thống hỗ trợ thông minh — nếu không có con khủng long nào bắt đầu bằng phím đó, kiểm tra xem có con khủng long nào có `word[1]` khớp không và tự động điền luôn `word[0] + word[1]` để trải nghiệm gõ tự nhiên nhất.
  - Khi đã khóa mục tiêu (`lockedDino !== null`):
    - Người chơi gõ đúng `lockedDino.word[lockedDino.typedIndex]`:
      - Tăng `typedIndex++`.
      - Xạ thủ xoay nòng súng và bắn 1 viên đạn laser/plasma về phía `lockedDino`.
      - Đẩy lùi nhẹ khủng long (knockback) và tăng `combo++`.
      - Nếu `typedIndex === lockedDino.word.length`: Từ hoàn thành! Bắn đạn kết liễu, khủng long phát nổ, cộng điểm thưởng, đọc phát âm từ vựng qua `Web Speech API`, lưu từ vào danh sách "Từ đã học trong màn", và giải phóng `lockedDino = null`.
    - Người chơi gõ sai ký tự:
      - Phát âm thanh báo lỗi nhẹ, reset `combo = 0`, nháy đỏ khung chữ của `lockedDino` và tăng bộ đếm lỗi trên từ đó.
- **Phím trợ giúp nhanh:**
  - `Tab` hoặc `Space`: Bắn tia sáng gợi ý (Hint Pulse) mở thêm 1 chữ cái đang ẩn của con khủng long đang khóa (hoặc con gần nhất) nếu người chơi quên từ.
  - `Escape` hoặc `Backspace`: Hủy khóa mục tiêu hiện tại để chuyển sang bắn con khủng long khác.

### 3.3. Hệ thống Khủng long & Độ khó (`js/entities.js`)
- **4 loại khủng long (vẽ bằng Canvas Vector/Sprite sống động có hoạt ảnh bước chân/vỗ cánh):**
  1. **Raptor (Nhỏ, nhanh):** Mang từ ngắn (3–5 chữ cái).
  2. **Triceratops (Vừa, tốc độ trung bình):** Mang từ trung bình (5–7 chữ cái).
  3. **Pteranodon (Khủng long bay):** Bay lượn hình sin trên không, mang từ 5–8 chữ cái.
  4. **T-Rex Boss (Xuất hiện cuối mỗi Wave):** Kích thước lớn, mang từ vựng dài (8–12 chữ cái) hoặc cần bắn 2 từ liên tiếp để hạ gục.
- **Chỉ số người chơi:**
  - Máu căn cứ (HP): 5 tim (mỗi con khủng long chạm vào căn cứ trừ 1 tim, Boss trừ 2 tim).
  - Điểm số (Score), Chuỗi thắng (Combo Multiplier), Cấp độ đợt tấn công (Wave), và danh sách từ vựng đã chinh phục (Learned Words).

### 3.4. Giao diện & Trải nghiệm học tập (`index.html`, `css/style.css`)
- **HUD trên cùng:** Điểm số, Combo, Wave hiện tại, Thanh máu (HP), Nút chọn Chủ đề từ vựng, Nút chọn Mức độ Hint (Dễ / Vừa / Khó), Nút Bật/Tắt âm thanh & Giọng đọc.
- **Khung hiển thị Từ đang gõ (Active Word Banner):** Nằm ngay dưới/trên pháo đài để người chơi nhìn rõ từ đang gõ cùng nghĩa tiếng Việt và phiên âm.
- **Bảng Ôn tập từ vựng (Vocab Review Drawer / End Screen):**
  - Sau mỗi màn chơi (hoặc khi bấm Tạm dừng / Sổ tay từ vựng), hiển thị danh sách các từ vừa xuất hiện kèm nút 🔊 để nghe lại phát âm và xem nghĩa tiếng Việt.

---

## 4. Quy trình kết nối GitHub & Bật GitHub Pages

1. Khởi tạo Git repository tại `/Users/keith/Documents/LEANR_ENGLISH`.
2. Sử dụng GitHub CLI (`gh repo create`) để tạo repository Public mới trên tài khoản GitHub của người dùng và push nhánh `main`.
3. Kích hoạt **GitHub Pages** tự động qua GitHub API (`gh api repos/{owner}/{repo}/pages -X POST -f source[branch]=main -f source[path]=/`) để lấy đường dẫn URL công khai (`https://<username>.github.io/<repo>/`).

---

## 5. Kiểm thử & Xác minh (Testing & Verification)

- Kiểm tra logic tạo Hint (`B _ _ _ _ A`, `X _ _ _ _ _ _ _ _`) đảm bảo luôn hiển thị chữ cái đầu và khớp độ dài từ.
- Kiểm tra trên trình duyệt bằng công cụ MCP (`chrome-devtools` theo quy tắc):
  - Mở trang game, bắt đầu màn chơi, gõ phím để khóa mục tiêu và bắn hạ khủng long.
  - Kiểm tra hiển thị Hint, cộng điểm, âm thanh và bảng ôn tập từ vựng.
  - Kiểm tra đường dẫn GitHub Pages sau khi triển khai.
