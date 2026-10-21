# Dino Vocab Shooter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hoàn chỉnh web game bắn khủng long học từ vựng tiếng Anh với gợi ý ký tự (`X...`, `B...`) và triển khai trực tiếp lên GitHub Pages.

**Architecture:** Ứng dụng tĩnh (Static Web App) sử dụng HTML5 Canvas, CSS3 và Vanilla JavaScript (ES6 Modules) tại thư mục gốc để tương thích trực tiếp với GitHub Pages. Tách biệt rõ 4 module: dữ liệu từ vựng & thuật toán tạo hint (`js/vocab.js`), âm thanh & giọng đọc (`js/sound.js`), thực thể đồ họa canvas (`js/entities.js`), và vòng lặp điều khiển chính (`js/game.js`).

**Tech Stack:** HTML5 Canvas, CSS3, Vanilla JS (ES6 Modules), Web Audio API, Web Speech API (`speechSynthesis`), GitHub Pages (`gh` CLI).

**Spec:** `docs/superpowers/specs/2026-10-21-dino-vocab-shooter-design.md`

## Global Constraints

- Triển khai dạng Static Web App tại gốc `/Users/keith/Documents/LEANR_ENGLISH` kèm `.nojekyll` cho GitHub Pages.
- Mọi từ tiếng Anh đều hiển thị nghĩa tiếng Việt + Hint ẩn chữ cái kiểu `B _ _ _ _ A` hoặc `X _ _ _ _ _ _ _ _`.
- Tự động đọc phát âm từ vựng khi tiêu diệt khủng long và hỗ trợ nghe lại trong bảng ôn tập.
- Kiểm tra trực tiếp trên trình duyệt qua MCP (`chrome-devtools`).

---

### Task 1: Module Từ vựng & Thuật toán tạo Hint (`js/vocab.js`)

**Files:**
- Create: `js/vocab.js`

**Interfaces:**
- Consumes: none
- Produces:
  - `VOCAB_TOPICS`: danh sách các chủ đề (`all`, `animals`, `food`, `actions`, `school`, `tech`, `adjectives`)
  - `VOCAB_LIST`: mảng các object `{ word, meaning, pos, phonetic, topic }`
  - `getWordsByTopic(topic, minLen, maxLen)`
  - `generateHintIndices(word, hintMode, wave)` -> `Set<number>` các vị trí được hiển thị sẵn (luôn bao gồm index `0`)
  - `formatMaskedWord(word, typedIndex, revealedIndices)` -> mảng trạng thái từng ký tự để render lên khủng long và HUD

- [x] **Step 1: Tạo `js/vocab.js` với kho từ vựng tiếng Anh thông dụng và hàm tạo Hint**
- [x] **Step 2: Commit `js/vocab.js`**

---

### Task 2: Module Âm thanh & Phát âm Từ vựng (`js/sound.js`)

**Files:**
- Create: `js/sound.js`

**Interfaces:**
- Consumes: Browser `AudioContext` và `window.speechSynthesis`
- Produces:
  - `SoundManager` class với các phương thức: `playLaser()`, `playHit()`, `playExplosion()`, `playError()`, `playHint()`, `playLevelUp()`, `speakWord(word)`

- [x] **Step 1: Tạo `js/sound.js` tổng hợp âm thanh bằng Web Audio API và đọc từ bằng Web Speech API**
- [x] **Step 2: Commit `js/sound.js`**

---

### Task 3: Module Thực thể Game & Đồ họa Canvas (`js/entities.js`)

**Files:**
- Create: `js/entities.js`

**Interfaces:**
- Consumes: `generateHintIndices`, `formatMaskedWord` từ `./vocab.js`
- Produces:
  - `Turret` class (xạ thủ/pháo đài bắn tia năng lượng)
  - `Dinosaur` class (4 chủng loại: `raptor`, `triceratops`, `ptero`, `trex` vẽ bằng Canvas 2D kèm khung hiển thị Nghĩa tiếng Việt + Hint `B _ _ _ _ A` rõ nét)
  - `Bullet` class, `Particle` class, `FloatingText` class

- [x] **Step 1: Tạo `js/entities.js` cài đặt đầy đủ vẽ khủng long, hiệu ứng đạn, nổ và bảng từ vựng trên đầu khủng long**
- [x] **Step 2: Commit `js/entities.js`**

---

### Task 4: Giao diện HTML/CSS & Vòng lặp Game Chính (`index.html`, `css/style.css`, `js/game.js`)

**Files:**
- Create: `.nojekyll`
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/game.js`

**Interfaces:**
- Consumes: `./vocab.js`, `./sound.js`, `./entities.js`
- Produces: Trang web hoàn chỉnh có HUD, chọn chủ đề, chọn độ khó Hint, bàn phím ảo hỗ trợ mobile/click, nút Hint (`Tab`), hủy mục tiêu (`Esc`), và sổ tay ôn tập từ vựng.

- [x] **Step 1: Tạo `.nojekyll`, `index.html`, `css/style.css` và `js/game.js`**
- [x] **Step 2: Kiểm tra trực tiếp trên trình duyệt qua `chrome-devtools` MCP**
- [x] **Step 3: Commit toàn bộ mã nguồn**

---

### Task 5: Tạo GitHub Repository & Kích hoạt GitHub Pages

**Files:**
- Modify: Git remote `origin` & GitHub Pages configuration

- [x] **Step 1: Tạo repo GitHub mới qua `gh repo create` và push nhánh `main`**
- [x] **Step 2: Kích hoạt GitHub Pages từ nhánh `main` (`/`) và kiểm tra URL hoạt động**
