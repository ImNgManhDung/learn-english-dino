// Vòng lặp chính & điều khiển trò chơi Dino Vocab Shooter
import { VOCAB_TOPICS, getWordsByTopic, formatMaskedWord, generateHintIndices } from './vocab.js';
import { SoundManager } from './sound.js';
import { Turret, Dinosaur, Bullet, Particle, FloatingText } from './entities.js';

class DinoVocabGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundManager();

    // Trạng thái game
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.wave = 1;
    this.killsInWave = 0;
    this.killsNeededForNextWave = 6;
    this.hp = 5;
    this.maxHp = 5;

    // Cấu hình người dùng chọn
    this.selectedTopic = 'all';
    this.hintMode = 'medium';

    // Thực thể trong màn chơi
    this.turret = new Turret(95, this.canvas.height / 2 + 25);
    this.dinos = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lockedDino = null;

    // Bộ đếm sinh khủng long
    this.spawnTimer = 0;
    this.spawnInterval = 3.2;

    // Sổ tay từ vựng đã bắn hạ
    this.learnedWords = new Map();

    // Ngôi sao nền
    this.stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * (this.canvas.height * 0.55),
      r: 1 + Math.random() * 1.8,
      alpha: 0.3 + Math.random() * 0.7
    }));

    this.lastTime = performance.now();
    this.initUI();
    this.bindEvents();
    requestAnimationFrame(ts => this.loop(ts));
  }

  initUI() {
    const topicSelect = document.getElementById('topicSelect');
    VOCAB_TOPICS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.icon} ${t.name}`;
      topicSelect.appendChild(opt);
    });

    topicSelect.addEventListener('change', e => {
      this.selectedTopic = e.target.value;
      e.target.blur();
    });

    const hintSelect = document.getElementById('hintModeSelect');
    hintSelect.addEventListener('change', e => {
      this.hintMode = e.target.value;
      // Cập nhật lại hint cho các khủng long đang trên màn hình
      this.dinos.forEach(d => {
        d.hintMode = this.hintMode;
        d.revealedIndices = generateHintIndices(d.word, this.hintMode, this.wave);
      });
      this.updateActiveTargetBanner();
      e.target.blur();
    });

    document.getElementById('btnStartGame').addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btnHint').addEventListener('click', e => {
      e.currentTarget.blur();
      this.useHint();
    });

    document.getElementById('btnUnlock').addEventListener('click', e => {
      e.currentTarget.blur();
      this.unlockTarget();
    });

    document.getElementById('btnNotebook').addEventListener('click', e => {
      e.currentTarget.blur();
      this.openNotebook();
    });

    document.getElementById('btnCloseNotebook').addEventListener('click', () => {
      this.closeNotebook();
    });

    document.getElementById('btnSound').addEventListener('click', e => {
      this.sound.sfxEnabled = !this.sound.sfxEnabled;
      this.sound.voiceEnabled = this.sound.sfxEnabled;
      e.currentTarget.textContent = this.sound.sfxEnabled ? '🔊' : '🔇';
      e.currentTarget.blur();
    });
  }

  bindEvents() {
    window.addEventListener('keydown', e => {
      // Nếu đang ở màn hình chờ và nhấn Enter/Space thì bắt đầu chơi
      if (this.state === 'MENU' || this.state === 'GAMEOVER') {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.startNewGame();
        }
        return;
      }

      if (this.state !== 'PLAYING') return;

      if (e.key === 'Tab') {
        e.preventDefault();
        this.useHint();
        return;
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        this.unlockTarget();
        return;
      }

      // Kiểm tra phím chữ cái A-Z
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.handleLetterInput(e.key.toUpperCase());
      }
    });

    // Cho phép click chuột trực tiếp vào con khủng long để khóa mục tiêu
    this.canvas.addEventListener('click', e => {
      if (this.state !== 'PLAYING') return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      for (const dino of this.dinos) {
        if (Math.hypot(dino.x - mx, dino.y - my) <= dino.radius + 35) {
          this.setLockedDino(dino);
          break;
        }
      }
    });
  }

  startNewGame() {
    this.sound.ensureContext();
    this.state = 'PLAYING';
    this.score = 0;
    this.combo = 1;
    this.wave = 1;
    this.killsInWave = 0;
    this.killsNeededForNextWave = 6;
    this.hp = this.maxHp;

    this.dinos = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lockedDino = null;
    this.spawnTimer = 0.5;
    this.spawnInterval = 3.2;

    document.getElementById('startOverlay').classList.remove('active');
    document.getElementById('notebookModal').classList.remove('active');

    // Sinh ngay 2 con khủng long đầu tiên để người chơi bắn ngay
    this.spawnDinosaur();
    setTimeout(() => {
      if (this.state === 'PLAYING') this.spawnDinosaur();
    }, 900);

    this.updateHUD();
    this.updateActiveTargetBanner();
  }

  spawnDinosaur(forceBoss = false) {
    const activeWords = new Set(this.dinos.map(d => d.word));
    let pool = getWordsByTopic(this.selectedTopic, 3, forceBoss ? 14 : Math.min(12, 6 + this.wave));
    if (pool.length === 0) {
      pool = getWordsByTopic('all');
    }

    // Ưu tiên từ chưa xuất hiện trên màn hình
    const available = pool.filter(item => !activeWords.has(item.word));
    const candidates = available.length > 0 ? available : pool;

    // Ưu tiên chữ cái bắt đầu khác với các con đang có trên màn hình
    const usedFirstChars = new Set(this.dinos.map(d => d.word[0]));
    const distinctStart = candidates.filter(item => !usedFirstChars.has(item.word[0]));
    const finalPool = distinctStart.length > 0 ? distinctStart : candidates;

    const vocabItem = finalPool[Math.floor(Math.random() * finalPool.length)];

    // Chọn chủng loại khủng long
    let type = 'raptor';
    if (forceBoss) {
      type = 'trex';
    } else if (vocabItem.word.length >= 8) {
      type = Math.random() < 0.5 ? 'triceratops' : 'ptero';
    } else if (Math.random() < 0.28) {
      type = 'ptero';
    } else if (Math.random() < 0.35) {
      type = 'triceratops';
    }

    const minY = type === 'ptero' ? 110 : 195;
    const maxY = type === 'ptero' ? 270 : this.canvas.height - 95;
    const spawnY = minY + Math.random() * (maxY - minY);

    const baseSpeed = 34 + this.wave * 4.5;
    const speedMultiplier =
      type === 'trex' ? 0.68 : type === 'triceratops' ? 0.85 : type === 'ptero' ? 1.08 : 1.0;

    const dino = new Dinosaur(vocabItem, {
      type,
      x: this.canvas.width + 60,
      y: spawnY,
      targetX: this.turret.x + 28,
      targetY: this.turret.y,
      speed: baseSpeed * speedMultiplier,
      wave: this.wave,
      hintMode: this.hintMode
    });

    this.dinos.push(dino);
  }

  setLockedDino(dino) {
    this.dinos.forEach(d => {
      d.isLocked = d === dino;
    });
    this.lockedDino = dino;
    if (dino) {
      this.turret.aimAt(dino.x, dino.y);
    }
    this.updateActiveTargetBanner();
  }

  unlockTarget() {
    this.setLockedDino(null);
  }

  useHint() {
    if (this.dinos.length === 0) return;
    // Nếu chưa khóa con nào, tự khóa con khủng long gần căn cứ nhất
    if (!this.lockedDino) {
      const closest = [...this.dinos].sort((a, b) => a.x - b.x)[0];
      this.setLockedDino(closest);
    }
    if (this.lockedDino) {
      const revealedChar = this.lockedDino.revealNextHint();
      if (revealedChar) {
        this.sound.playHint();
        this.floatingTexts.push(
          new FloatingText(this.lockedDino.x, this.lockedDino.y - 85, `💡 Hint: ${revealedChar}`, '', '#38bdf8')
        );
        this.updateActiveTargetBanner();
      }
    }
  }

  handleLetterInput(char) {
    if (this.dinos.length === 0) return;

    // Trường hợp chưa khóa mục tiêu: tìm khủng long khớp ký tự đầu (hoặc ký tự thứ 2 vì ký tự đầu đã lộ sẵn ở Hint)
    if (!this.lockedDino) {
      const sortedByDistance = [...this.dinos].sort((a, b) => a.x - b.x);

      // 1. Tìm con có ký tự cần gõ tiếp theo (thường là word[0]) trùng với phím vừa bấm
      let match = sortedByDistance.find(d => d.getNextExpectedChar() === char);

      if (match) {
        this.setLockedDino(match);
        this.fireAtLockedDino(char);
        return;
      }

      // 2. Hỗ trợ thông minh: Vì chữ cái đầu (VD: B _ _ _ _ A) đã hiện sẵn làm Hint,
      // nếu người chơi bấm luôn chữ cái thứ 2 (word[1]), tự động tính cả word[0] + word[1]
      let secondCharMatch = sortedByDistance.find(
        d => d.typedIndex === 0 && d.word.length > 1 && d.word[1] === char
      );

      if (secondCharMatch) {
        this.setLockedDino(secondCharMatch);
        secondCharMatch.onHitSuccess(); // Tự động hoàn thành chữ đầu tiên
        this.fireAtLockedDino(char);    // Và bắn luôn chữ thứ 2
        return;
      }

      // Không khớp con nào
      this.sound.playError();
      this.combo = 1;
      this.updateHUD();
      return;
    }

    // Trường hợp đã khóa mục tiêu
    const expected = this.lockedDino.getNextExpectedChar();
    if (expected === char) {
      this.fireAtLockedDino(char);
    } else if (
      this.lockedDino.typedIndex === 0 &&
      this.lockedDino.word.length > 1 &&
      this.lockedDino.word[1] === char
    ) {
      // Nếu vừa click chọn khủng long và gõ luôn chữ cái thứ 2 sau chữ cái gợi ý đầu
      this.lockedDino.onHitSuccess();
      this.fireAtLockedDino(char);
    } else {
      // Gõ sai chữ cái
      this.sound.playError();
      this.lockedDino.onHitError();
      this.combo = 1;
      this.updateHUD();
      this.updateActiveTargetBanner();
    }
  }

  fireAtLockedDino(char) {
    const dino = this.lockedDino;
    if (!dino) return;

    this.turret.aimAt(dino.x, dino.y);
    this.turret.triggerShot();

    // Tạo đạn bay tới khủng long
    this.bullets.push(new Bullet(this.turret.x + 25, this.turret.y, dino, char));

    dino.onHitSuccess();
    this.sound.playLaser(dino.typedIndex);

    // Cộng điểm mỗi chữ cái bắn trúng
    this.score += 10 * this.combo;

    if (dino.dead) {
      this.onDinoKilled(dino);
    } else {
      this.updateHUD();
      this.updateActiveTargetBanner();
    }
  }

  onDinoKilled(dino) {
    // Hiệu ứng nổ hạt
    for (let i = 0; i < 24; i++) {
      this.particles.push(new Particle(dino.x, dino.y, dino.primaryColor));
      this.particles.push(new Particle(dino.x, dino.y, '#facc15'));
    }

    const wordBonus = dino.word.length * 25 * this.combo;
    this.score += wordBonus;
    this.combo = Math.min(10, this.combo + 1);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.killsInWave++;

    // Hiển thị từ hoàn chỉnh + nghĩa tiếng Việt bay lên
    this.floatingTexts.push(
      new FloatingText(
        dino.x,
        dino.y - 25,
        `${dino.word} (+${wordBonus})`,
        `${dino.meaning} ${dino.phonetic}`,
        '#4ade80'
      )
    );

    // Phát âm thanh nổ & đọc phát âm tiếng Anh của từ vừa hoàn thành
    this.sound.playExplosion();
    this.sound.speakWord(dino.word);

    // Lưu vào Sổ tay từ đã học
    this.learnedWords.set(dino.word, dino.vocab);
    document.getElementById('learnedCount').textContent = this.learnedWords.size;

    // Xóa khủng long khỏi danh sách
    this.dinos = this.dinos.filter(d => d !== dino);
    this.lockedDino = null;

    // Kiểm tra lên cấp Wave
    if (this.killsInWave >= this.killsNeededForNextWave) {
      this.wave++;
      this.killsInWave = 0;
      this.killsNeededForNextWave = 6 + this.wave * 2;
      this.spawnInterval = Math.max(1.4, 3.2 - this.wave * 0.2);

      this.floatingTexts.push(
        new FloatingText(
          this.canvas.width / 2,
          this.canvas.height / 2 - 40,
          `🔥 WAVE ${this.wave} BẮT ĐẦU!`,
          'Khủng long nhanh hơn & từ vựng thử thách hơn!',
          '#38bdf8'
        )
      );

      // Xuất hiện T-Rex Boss đầu mỗi Wave từ Wave 2
      this.spawnDinosaur(true);
    } else if (this.dinos.length === 0) {
      this.spawnDinosaur();
    }

    this.updateHUD();
    this.updateActiveTargetBanner();
  }

  updateHUD() {
    document.getElementById('scoreValue').textContent = this.score.toLocaleString('vi-VN');
    document.getElementById('comboValue').textContent = `x${this.combo}`;
    document.getElementById('waveValue').textContent = this.wave;
    document.getElementById('hpValue').textContent =
      '❤️'.repeat(Math.max(0, this.hp)) + '🖤'.repeat(Math.max(0, this.maxHp - this.hp));
  }

  updateActiveTargetBanner() {
    const meaningEl = document.getElementById('targetMeaning');
    const slotsEl = document.getElementById('targetWordSlots');
    slotsEl.innerHTML = '';

    if (!this.lockedDino) {
      meaningEl.innerHTML =
        '⌨️ Hãy gõ <strong>chữ cái đầu tiên</strong> (hoặc chữ tiếp theo) trên bất kỳ con khủng long nào để khóa mục tiêu!';
      return;
    }

    const d = this.lockedDino;
    meaningEl.innerHTML = `🎯 Đang khóa: <strong>${d.meaning} (${d.pos})</strong> <span class="phonetic">${d.phonetic}</span>`;

    const masked = formatMaskedWord(d.word, d.typedIndex, d.revealedIndices);
    masked.forEach(item => {
      const box = document.createElement('div');
      box.className = `letter-slot ${item.state} ${item.isNext ? 'next' : ''}`;
      box.textContent = item.display;
      slotsEl.appendChild(box);
    });
  }

  openNotebook() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    }
    const listEl = document.getElementById('notebookList');
    listEl.innerHTML = '';

    if (this.learnedWords.size === 0) {
      listEl.innerHTML = '<p style="color:#94a3b8;grid-column:1/-1;">Chưa có từ nào được bắn hạ. Hãy bắn khủng long để thu thập từ vựng nhé!</p>';
    } else {
      this.learnedWords.forEach(vocab => {
        const card = document.createElement('div');
        card.className = 'vocab-item-card';
        card.innerHTML = `
          <div>
            <div class="word">${vocab.word} <span class="phonetic">${vocab.phonetic}</span></div>
            <div class="meaning">${vocab.meaning} (${vocab.pos})</div>
          </div>
          <button class="btn btn-icon" title="Nghe phát âm">🔊</button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          this.sound.speakWord(vocab.word);
        });
        listEl.appendChild(card);
      });
    }

    document.getElementById('notebookModal').classList.add('active');
  }

  closeNotebook() {
    document.getElementById('notebookModal').classList.remove('active');
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    const overlay = document.getElementById('startOverlay');
    document.getElementById('overlayTitle').textContent = '💥 Căn Cứ Thất Thủ!';
    document.getElementById('overlayDesc').innerHTML = `
      Bạn đã đạt <strong>${this.score.toLocaleString('vi-VN')} điểm</strong> tại <strong>Wave ${this.wave}</strong> và chinh phục <strong>${this.learnedWords.size} từ vựng</strong>!<br/>
      Hãy bấm vào nút <strong>📖 Từ đã học</strong> trên thanh công cụ để nghe lại phát âm hoặc chơi lại ngay.
    `;
    document.getElementById('btnStartGame').textContent = '🔄 CHƠI LẠI NGAY';
    overlay.classList.add('active');
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    this.turret.update(dt);

    // Sinh thêm khủng long theo thời gian
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.dinos.length < 4 + Math.floor(this.wave / 2)) {
      this.spawnDinosaur();
      this.spawnTimer = this.spawnInterval;
    }

    // Cập nhật khủng long
    for (let i = this.dinos.length - 1; i >= 0; i--) {
      const dino = this.dinos[i];
      dino.update(dt);

      // Kiểm tra khủng long chạm vào hàng rào căn cứ
      if (dino.x <= this.turret.x + 55) {
        this.sound.playDamage();
        this.hp -= dino.type === 'trex' ? 2 : 1;
        this.combo = 1;

        for (let p = 0; p < 18; p++) {
          this.particles.push(new Particle(dino.x, dino.y, '#ef4444'));
        }

        if (this.lockedDino === dino) {
          this.lockedDino = null;
        }
        this.dinos.splice(i, 1);
        this.updateHUD();
        this.updateActiveTargetBanner();

        if (this.hp <= 0) {
          this.triggerGameOver();
          return;
        }
      }
    }

    // Cập nhật đạn
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update(dt);
      if (this.bullets[i].done) {
        this.bullets.splice(i, 1);
      }
    }

    // Cập nhật hạt nổ
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Cập nhật chữ bay
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(dt);
      if (this.floatingTexts[i].life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  drawBackground(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Bầu trời đêm tiền sử
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.55, '#1e1b4b');
    skyGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Các vì sao
    this.stars.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dãy núi lửa phía xa
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.lineTo(220, h * 0.42);
    ctx.lineTo(440, h * 0.68);
    ctx.lineTo(720, h * 0.36);
    ctx.lineTo(980, h * 0.68);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Mặt đất chiến trường
    const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    groundGrad.addColorStop(0, '#065f46');
    groundGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.66, w, h * 0.34);

    // Vạch lá chắn năng lượng bảo vệ căn cứ
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(150, 90);
    ctx.lineTo(150, h - 20);
    ctx.stroke();
    ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground(ctx);

    // Vẽ đường tia ngắm tới khủng long đang khóa
    if (this.lockedDino) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(this.turret.x, this.turret.y);
      ctx.lineTo(this.lockedDino.x, this.lockedDino.y);
      ctx.stroke();
      ctx.restore();
    }

    // Vẽ xạ thủ
    this.turret.draw(ctx);

    // Sắp xếp khủng long theo trục Y để con đứng dưới đè lên con đứng trên tự nhiên
    const sortedDinos = [...this.dinos].sort((a, b) => a.y - b.y);
    sortedDinos.forEach(d => d.draw(ctx));

    // Vẽ đạn, hạt nổ, chữ bay
    this.bullets.forEach(b => b.draw(ctx));
    this.particles.forEach(p => p.draw(ctx));
    this.floatingTexts.forEach(ft => ft.draw(ctx));
  }

  loop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(ts => this.loop(ts));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.dinoGame = new DinoVocabGame();
});
