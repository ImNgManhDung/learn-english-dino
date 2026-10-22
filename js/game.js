// Vòng lặp chính & điều khiển trò chơi JURASSIC.AI // Cyber-Dino Vocab Defense
import { VOCAB_TOPICS, getWordsByTopic, formatMaskedWord, generateHintIndices } from './vocab.js?v=2.5';
import { SoundManager } from './sound.js?v=2.5';
import { Turret, Dinosaur, LaserBeam, Shockwave, Bullet, Particle, FloatingText } from './entities.js?v=2.5';

class DinoVocabGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundManager();

    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.wave = 1;
    this.killsInWave = 0;
    this.killsNeededForNextWave = 6;
    this.hp = 5;
    this.maxHp = 5;

    // Thống kê độ chính xác (Accuracy)
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;

    this.selectedTopic = 'all';
    this.hintMode = 'medium';

    this.turret = new Turret(105, this.canvas.height / 2 + 25);
    this.dinos = [];
    this.beams = [];
    this.shockwaves = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lockedDino = null;

    this.spawnTimer = 0;
    this.spawnInterval = 3.1;
    this.gridOffset = 0;
    this.screenShake = 0;

    this.learnedWords = new Map();
    this.loadCodexFromStorage();

    // Hạt bụi năng lượng lơ lửng trong không gian
    this.stars = Array.from({ length: 55 }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * (this.canvas.height * 0.62),
      r: 0.8 + Math.random() * 1.8,
      alpha: 0.2 + Math.random() * 0.75,
      speed: 4 + Math.random() * 10
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
      opt.textContent = t.name;
      topicSelect.appendChild(opt);
    });

    topicSelect.addEventListener('change', e => {
      this.selectedTopic = e.target.value;
      e.target.blur();
    });

    // Segmented Pills cho Hint Mode (EASY / MEDIUM / HARD)
    const hintGroup = document.getElementById('hintModeGroup');
    const hintSelect = document.getElementById('hintModeSelect');

    const applyHintMode = mode => {
      this.hintMode = mode;
      if (hintSelect) hintSelect.value = mode;
      if (hintGroup) {
        hintGroup.querySelectorAll('.seg-pill').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.hint === mode);
        });
      }
      this.dinos.forEach(d => {
        d.hintMode = this.hintMode;
        d.revealedIndices = generateHintIndices(d.word, this.hintMode, this.wave);
      });
      this.updateActiveTargetBanner();
    };

    if (hintGroup) {
      hintGroup.querySelectorAll('.seg-pill').forEach(btn => {
        btn.addEventListener('click', e => {
          applyHintMode(btn.dataset.hint);
          e.currentTarget.blur();
        });
      });
    }

    if (hintSelect) {
      hintSelect.addEventListener('change', e => {
        applyHintMode(e.target.value);
      });
    }

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
      e.currentTarget.style.opacity = this.sound.sfxEnabled ? '1' : '0.45';
      e.currentTarget.blur();
    });

    const learnedEl = document.getElementById('learnedCount');
    if (learnedEl) {
      learnedEl.textContent = this.learnedWords.size;
    }
  }

  bindEvents() {
    window.addEventListener('keydown', e => {
      if (document.getElementById('notebookModal').classList.contains('active')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closeNotebook();
        }
        return;
      }

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

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        let letter = null;
        if (e.code && /^Key([A-Z])$/.test(e.code)) {
          letter = e.code.slice(3);
        } else if (e.key && e.key.length === 1) {
          const normalized = e.key
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/gi, 'd');
          if (/^[a-zA-Z]$/.test(normalized)) {
            letter = normalized.toUpperCase();
          }
        }

        if (letter) {
          e.preventDefault();
          this.handleLetterInput(letter);
        }
      }
    });

    this.canvas.addEventListener('click', e => {
      if (this.state !== 'PLAYING') return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      for (const dino of this.dinos) {
        if (Math.hypot(dino.x - mx, dino.y - my) <= dino.radius + 40) {
          this.setLockedDino(dino);
          break;
        }
      }
    });
  }

  loadCodexFromStorage() {
    try {
      const raw = localStorage.getItem('jurassic_codex_v2');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item && item.word) {
            this.learnedWords.set(item.word, item);
          }
        });
      }
    } catch (e) {
      // Bỏ qua nếu localStorage bị chặn
    }
  }

  saveCodexToStorage() {
    try {
      const data = Array.from(this.learnedWords.values());
      localStorage.setItem('jurassic_codex_v2', JSON.stringify(data));
    } catch (e) {
      // Bỏ qua nếu localStorage bị chặn
    }
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
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;

    this.dinos = [];
    this.beams = [];
    this.shockwaves = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lockedDino = null;
    this.spawnTimer = 0.5;
    this.spawnInterval = 3.1;

    document.getElementById('startOverlay').classList.remove('active');
    document.getElementById('notebookModal').classList.remove('active');

    this.spawnDinosaur();
    setTimeout(() => {
      if (this.state === 'PLAYING') this.spawnDinosaur();
    }, 850);

    this.updateHUD();
    this.updateActiveTargetBanner();
  }

  spawnDinosaur(forceBoss = false) {
    const activeWords = new Set(this.dinos.map(d => d.word));
    const minLen = forceBoss ? 8 : 3;
    const maxLen = forceBoss ? 14 : Math.min(12, 6 + this.wave);
    let pool = getWordsByTopic(this.selectedTopic, minLen, maxLen);
    if (pool.length === 0) {
      pool = getWordsByTopic(this.selectedTopic, 3, maxLen);
    }
    if (pool.length === 0) {
      pool = getWordsByTopic('all');
    }

    const available = pool.filter(item => !activeWords.has(item.word));
    const candidates = available.length > 0 ? available : pool;

    const usedFirstChars = new Set(this.dinos.map(d => d.word[0]));
    const distinctStart = candidates.filter(item => !usedFirstChars.has(item.word[0]));
    const finalPool = distinctStart.length > 0 ? distinctStart : candidates;

    const vocabItem = finalPool[Math.floor(Math.random() * finalPool.length)];

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

    const minY = type === 'ptero' ? 115 : 210;
    const maxY = type === 'ptero' ? 265 : this.canvas.height - 95;
    const spawnY = minY + Math.random() * (maxY - minY);

    const baseSpeed = 35 + this.wave * 4.5;
    const speedMultiplier =
      type === 'trex' ? 0.68 : type === 'triceratops' ? 0.85 : type === 'ptero' ? 1.08 : 1.0;

    const dino = new Dinosaur(vocabItem, {
      type,
      x: this.canvas.width + 65,
      y: spawnY,
      targetX: this.turret.x + 34,
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
    if (!this.lockedDino) {
      const closest = [...this.dinos].sort((a, b) => a.x - b.x)[0];
      this.setLockedDino(closest);
    }
    if (this.lockedDino) {
      const revealedChar = this.lockedDino.revealNextHint();
      if (revealedChar) {
        const hintPenalty = 15;
        this.score = Math.max(0, this.score - hintPenalty);
        this.combo = Math.max(1, this.combo - 1);
        this.sound.playHint();
        this.shockwaves.push(new Shockwave(this.lockedDino.x, this.lockedDino.y, '#38bdf8'));
        this.floatingTexts.push(
          new FloatingText(
            this.lockedDino.x,
            this.lockedDino.y - 95,
            `SCAN // +${revealedChar}`,
            `-${hintPenalty} PTS`,
            '#22d3ee'
          )
        );
        this.updateHUD();
        this.updateActiveTargetBanner();
      }
    }
  }

  handleLetterInput(char) {
    if (this.dinos.length === 0) return;
    this.totalKeystrokes++;

    // Quy tắc thống nhất: Gõ tuần tự từng ký tự từ đầu đến cuối (0 -> word.length - 1).
    // Khi chưa khóa mục tiêu, ưu tiên khủng long gần tháp pháo nhất có chữ cái đầu khớp phím gõ.
    if (!this.lockedDino) {
      const sortedByDistance = [...this.dinos].sort((a, b) => a.x - b.x);
      const match = sortedByDistance.find(d => d.getNextExpectedChar() === char);
      if (match) {
        this.correctKeystrokes++;
        this.setLockedDino(match);
        this.fireAtLockedDino(char);
        return;
      }

      this.sound.playError();
      this.combo = 1;
      this.updateHUD();
      return;
    }

    const expected = this.lockedDino.getNextExpectedChar();
    if (expected === char) {
      this.correctKeystrokes++;
      this.fireAtLockedDino(char);
    } else {
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

    const muzzleX = this.turret.x + Math.cos(this.turret.angle) * 44;
    const muzzleY = this.turret.y + Math.sin(this.turret.angle) * 44;

    // Tia Railgun Beam tức thời + Hạt Plasma
    this.beams.push(new LaserBeam(muzzleX, muzzleY, dino.x, dino.y, dino.neonColor));
    this.bullets.push(new Bullet(muzzleX, muzzleY, dino, char));

    for (let i = 0; i < 6; i++) {
      this.particles.push(new Particle(dino.x, dino.y, '#22d3ee'));
    }

    dino.onHitSuccess();
    this.sound.playLaser(dino.typedIndex);

    this.score += 10 * this.combo;

    if (dino.dead) {
      this.onDinoKilled(dino);
    } else {
      this.updateHUD();
      this.updateActiveTargetBanner();
    }
  }

  onDinoKilled(dino) {
    this.screenShake = 8;
    this.shockwaves.push(new Shockwave(dino.x, dino.y, dino.neonColor));

    for (let i = 0; i < 28; i++) {
      this.particles.push(new Particle(dino.x, dino.y, dino.neonColor));
      this.particles.push(new Particle(dino.x, dino.y, '#22d3ee'));
    }

    const wordBonus = dino.word.length * 25 * this.combo;
    this.score += wordBonus;
    this.combo = Math.min(12, this.combo + 1);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.killsInWave++;

    this.floatingTexts.push(
      new FloatingText(
        dino.x,
        dino.y - 30,
        `${dino.word} +${wordBonus}`,
        `${dino.meaning} ${dino.phonetic}`,
        '#4ade80'
      )
    );

    this.sound.playExplosion();
    this.sound.speakWord(dino.word);

    this.learnedWords.set(dino.word, dino.vocab);
    this.saveCodexToStorage();
    document.getElementById('learnedCount').textContent = this.learnedWords.size;

    this.dinos = this.dinos.filter(d => d !== dino);
    this.lockedDino = null;

    if (this.killsInWave >= this.killsNeededForNextWave) {
      this.wave++;
      this.killsInWave = 0;
      this.killsNeededForNextWave = 6 + (this.wave - 1) * 2;
      this.spawnInterval = Math.max(1.35, 3.1 - this.wave * 0.2);

      this.floatingTexts.push(
        new FloatingText(
          this.canvas.width / 2,
          this.canvas.height / 2 - 40,
          `WAVE 0${this.wave} INITIALIZED`,
          'Tốc độ cơ giới tăng cao & mã khóa phức tạp hơn',
          '#22d3ee'
        )
      );

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
    document.getElementById('waveValue').textContent = String(this.wave).padStart(2, '0');

    // Cập nhật Accuracy
    const accEl = document.getElementById('accuracyValue');
    if (accEl) {
      const acc =
        this.totalKeystrokes === 0
          ? 100
          : Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100);
      accEl.textContent = `${acc}%`;
    }

    // Cập nhật thanh Plasma Shield Cells
    const hpContainer = document.getElementById('hpValue');
    const hpText = document.getElementById('hpText');
    if (hpText) {
      hpText.textContent = `${Math.max(0, Math.round((this.hp / this.maxHp) * 100))}%`;
    }
    if (hpContainer) {
      hpContainer.innerHTML = '';
      for (let i = 0; i < this.maxHp; i++) {
        const cell = document.createElement('span');
        const isActive = i < this.hp;
        const isDanger = this.hp <= 2 && isActive;
        cell.className = `shield-cell ${isActive ? (isDanger ? 'danger' : 'active') : ''}`;
        hpContainer.appendChild(cell);
      }
    }
  }

  updateActiveTargetBanner() {
    const meaningEl = document.getElementById('targetMeaning');
    const slotsEl = document.getElementById('targetWordSlots');
    const statusBadge = document.getElementById('lockStatusBadge');
    const statusText = document.getElementById('lockStatusText');
    slotsEl.innerHTML = '';

    if (!this.lockedDino) {
      if (statusBadge) statusBadge.classList.remove('locked');
      if (statusText) statusText.textContent = 'STANDBY // AWAITING KEYSTROKE';
      meaningEl.innerHTML =
        'Nhấn phím chữ cái đầu tiên (VD: <span class="hl-key">B</span>, <span class="hl-key">X</span>...) để khóa mục tiêu & khai hỏa tia Plasma';
      return;
    }

    const d = this.lockedDino;
    if (statusBadge) statusBadge.classList.add('locked');
    if (statusText) statusText.textContent = `TARGET LOCKED // ${d.classTag}`;

    meaningEl.innerHTML = `
      <strong>${d.meaning}</strong>
      <span class="pos-badge">${d.pos.toUpperCase()}</span>
      <span class="phonetic">${d.phonetic}</span>
    `;

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
      listEl.innerHTML =
        '<p style="color:#64748b;grid-column:1/-1;">Chưa có dữ liệu từ vựng nào được giải mã. Hãy bắn hạ khủng long để thu thập từ vựng vào kho lưu trữ!</p>';
    } else {
      this.learnedWords.forEach(vocab => {
        const card = document.createElement('div');
        card.className = 'vocab-item-card';
        card.innerHTML = `
          <div>
            <div class="word">${vocab.word} <span class="phonetic">${vocab.phonetic}</span></div>
            <div class="meaning">${vocab.meaning} (${vocab.pos})</div>
          </div>
          <button class="cyber-btn btn-icon-only" title="Nghe phát âm AI">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </button>
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
    document.getElementById('overlayTitle').textContent = 'SYSTEM BREACHED // GAME OVER';
    document.getElementById('overlayDesc').innerHTML = `
      Tổng điểm: <strong>${this.score.toLocaleString('vi-VN')} PTS</strong> // Đợt phòng thủ: <strong>WAVE 0${this.wave}</strong> // Đã giải mã: <strong>${this.learnedWords.size} từ vựng</strong>.<br/>
      Bạn có thể mở <strong>CODEX</strong> trên thanh điều khiển để nghe lại phát âm các từ vừa học hoặc tái khởi động hệ thống ngay.
    `;
    document.getElementById('btnStartGame').innerHTML = `
      <span>REBOOT DEFENSE MATRIX</span>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    `;
    overlay.classList.add('active');
  }

  update(dt) {
    this.gridOffset = (this.gridOffset + dt * 38) % 60;
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 28);
    }

    if (this.state !== 'PLAYING') return;

    this.turret.update(dt);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.dinos.length < 4 + Math.floor(this.wave / 2)) {
      this.spawnDinosaur();
      this.spawnTimer = this.spawnInterval;
    }

    for (let i = this.dinos.length - 1; i >= 0; i--) {
      const dino = this.dinos[i];
      dino.update(dt);

      if (dino.x <= this.turret.x + 60) {
        this.sound.playDamage();
        this.screenShake = 12;
        this.hp -= dino.type === 'trex' ? 2 : 1;
        this.combo = 1;

        this.shockwaves.push(new Shockwave(dino.x, dino.y, '#f43f5e'));
        for (let p = 0; p < 22; p++) {
          this.particles.push(new Particle(dino.x, dino.y, '#f43f5e'));
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

    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].update(dt);
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      this.shockwaves[i].update(dt);
      if (this.shockwaves[i].life <= 0) this.shockwaves.splice(i, 1);
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update(dt);
      if (this.bullets[i].done) this.bullets.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].update(dt);
      if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  drawCyberArena(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const horizonY = h * 0.54;

    // 1. Bầu trời Không Gian Số (Deep Cyber Nebula)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.65, '#091534');
    skyGrad.addColorStop(1, '#0e2954');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Các hạt dữ liệu không gian
    this.stars.forEach(s => {
      ctx.fillStyle = `rgba(56, 189, 248, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dãy núi Wireframe Hologram ở đường chân trời
    ctx.save();
    ctx.fillStyle = 'rgba(7, 16, 38, 0.9)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.32)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(140, horizonY - 75);
    ctx.lineTo(290, horizonY - 20);
    ctx.lineTo(480, horizonY - 110);
    ctx.lineTo(690, horizonY - 30);
    ctx.lineTo(910, horizonY - 95);
    ctx.lineTo(1120, horizonY - 40);
    ctx.lineTo(w, horizonY - 70);
    ctx.lineTo(w, horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Mặt đất Lưới Không Gian 3D (Perspective Cyber Grid)
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, '#061229');
    groundGrad.addColorStop(1, '#020617');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Đường chân trời phát sáng
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.stroke();
    ctx.restore();

    // Các đường lưới dọc hội tụ (Perspective Vertical Lines)
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.11)';
    ctx.lineWidth = 1;
    const vanishX = w * 0.45;
    for (let x = -w * 0.4; x <= w * 1.4; x += 65) {
      ctx.beginPath();
      ctx.moveTo(vanishX + (x - vanishX) * 0.25, horizonY);
      ctx.lineTo(x - this.gridOffset, h);
      ctx.stroke();
    }

    // Các đường lưới ngang mặt đất
    for (let i = 1; i <= 7; i++) {
      const ratio = Math.pow(i / 7, 1.5);
      const gy = horizonY + (h - horizonY) * ratio;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Tường Chắn Năng Lượng Bảo Vệ Căn Cứ (Plasma Defense Barrier)
    const barrierX = 165;
    const shieldGrad = ctx.createLinearGradient(barrierX - 24, 0, barrierX + 8, 0);
    shieldGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
    shieldGrad.addColorStop(1, 'rgba(34, 211, 238, 0.14)');
    ctx.fillStyle = shieldGrad;
    ctx.fillRect(barrierX - 24, 60, 26, h - 80);

    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(barrierX, 60);
    ctx.lineTo(barrierX, h - 20);
    ctx.stroke();
    ctx.restore();
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCyberArena(ctx);

    // Tia Laser ngắm khóa mục tiêu (Target Lock Sight)
    if (this.lockedDino) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.32)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(this.turret.x, this.turret.y);
      ctx.lineTo(this.lockedDino.x, this.lockedDino.y);
      ctx.stroke();
      ctx.restore();
    }

    // Vẽ tia Railgun Beam
    this.beams.forEach(b => b.draw(ctx));

    // Vẽ sóng xung kích Shockwave
    this.shockwaves.forEach(sw => sw.draw(ctx));

    // Vẽ tháp pháo Mecha-Turret
    this.turret.draw(ctx);

    // Vẽ các Khủng Long Cơ Giới theo thứ tự chiều sâu Y
    const sortedDinos = [...this.dinos].sort((a, b) => a.y - b.y);
    sortedDinos.forEach(d => d.draw(ctx));

    // Vẽ đạn, hạt nổ, chữ bay
    this.bullets.forEach(b => b.draw(ctx));
    this.particles.forEach(p => p.draw(ctx));
    this.floatingTexts.forEach(ft => ft.draw(ctx));

    ctx.restore();
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
