// Các thực thể trong game: Xạ thủ (Turret), Khủng long (Dinosaur), Đạn (Bullet), Hạt nổ (Particle)
import { generateHintIndices, formatMaskedWord } from './vocab.js';

export class Turret {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.recoil = 0;
    this.muzzleFlash = 0;
  }

  aimAt(targetX, targetY) {
    this.angle = Math.atan2(targetY - this.y, targetX - this.x);
  }

  triggerShot() {
    this.recoil = 10;
    this.muzzleFlash = 1.0;
  }

  update(dt) {
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 45);
    if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 8);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Đế pháo đài năng lượng
    const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, 44);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#0284c7');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();

    // Thân tháp pháo
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Xoay nòng súng theo hướng khủng long đang khóa
    ctx.rotate(this.angle);
    const rx = -this.recoil;

    // Nòng súng đôi Plasma
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rx + 6, -11, 34, 8, 3);
    ctx.roundRect(rx + 6, 3, 34, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Lõi năng lượng trung tâm
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(rx, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Tia chớp đầu nòng khi bắn
    if (this.muzzleFlash > 0) {
      ctx.fillStyle = `rgba(250, 204, 21, ${this.muzzleFlash})`;
      ctx.beginPath();
      ctx.arc(rx + 44, 0, 14 * this.muzzleFlash, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export class Dinosaur {
  constructor(vocabItem, config) {
    this.vocab = vocabItem;
    this.word = vocabItem.word.toUpperCase();
    this.meaning = vocabItem.meaning;
    this.pos = vocabItem.pos || 'n';
    this.phonetic = vocabItem.phonetic || '';

    this.type = config.type || 'raptor'; // 'raptor' | 'triceratops' | 'ptero' | 'trex'
    this.x = config.x;
    this.y = config.y;
    this.baseY = config.y;
    this.targetX = config.targetX;
    this.targetY = config.targetY;

    this.speed = config.speed || 42;
    this.wave = config.wave || 1;
    this.hintMode = config.hintMode || 'medium';

    // Tiến độ gõ từ
    this.typedIndex = 0;
    this.revealedIndices = generateHintIndices(this.word, this.hintMode, this.wave);

    // Hiệu ứng hoạt ảnh
    this.animTime = Math.random() * 10;
    this.hitFlash = 0;
    this.errorShake = 0;
    this.knockback = 0;
    this.isLocked = false;
    this.dead = false;

    // Màu sắc và kích thước theo chủng loại khủng long
    if (this.type === 'trex') {
      this.radius = 44;
      this.primaryColor = '#ef4444';
      this.secondaryColor = '#991b1b';
      this.labelOffsetY = -74;
    } else if (this.type === 'triceratops') {
      this.radius = 34;
      this.primaryColor = '#f59e0b';
      this.secondaryColor = '#b45309';
      this.labelOffsetY = -62;
    } else if (this.type === 'ptero') {
      this.radius = 30;
      this.primaryColor = '#a855f7';
      this.secondaryColor = '#6b21a8';
      this.labelOffsetY = -58;
    } else {
      // raptor
      this.radius = 28;
      this.primaryColor = '#10b981';
      this.secondaryColor = '#047857';
      this.labelOffsetY = -56;
    }
  }

  getNextExpectedChar() {
    if (this.typedIndex >= this.word.length) return null;
    return this.word[this.typedIndex];
  }

  revealNextHint() {
    for (let i = this.typedIndex; i < this.word.length; i++) {
      if (!this.revealedIndices.has(i)) {
        this.revealedIndices.add(i);
        return this.word[i];
      }
    }
    return null;
  }

  onHitSuccess() {
    this.typedIndex++;
    this.hitFlash = 1.0;
    this.knockback = 14;
    if (this.typedIndex >= this.word.length) {
      this.dead = true;
    }
  }

  onHitError() {
    this.errorShake = 1.0;
  }

  update(dt) {
    this.animTime += dt * 6;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt * 5);
    if (this.errorShake > 0) this.errorShake = Math.max(0, this.errorShake - dt * 4);

    // Di chuyển về phía pháo đài
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    const currentSpeed = this.speed - this.knockback * 12;
    if (this.knockback > 0) {
      this.knockback = Math.max(0, this.knockback - dt * 35);
    }

    this.x += (dx / dist) * currentSpeed * dt;
    this.baseY += (dy / dist) * currentSpeed * dt;

    // Dao động bước đi hoặc bay lượn
    if (this.type === 'ptero') {
      this.y = this.baseY + Math.sin(this.animTime * 1.2) * 12;
    } else {
      this.y = this.baseY + Math.abs(Math.sin(this.animTime * 1.8)) * -6;
    }
  }

  draw(ctx) {
    ctx.save();
    const shakeX = this.errorShake > 0 ? Math.sin(this.animTime * 18) * 6 * this.errorShake : 0;
    ctx.translate(this.x + shakeX, this.y);

    // Vòng tròn khóa mục tiêu (Target Lock) dưới chân khủng long
    if (this.isLocked) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 6, this.radius + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Bóng đổ dưới đất
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, this.radius - 2, this.radius * 0.85, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ hình khủng long hướng sang trái (về phía căn cứ)
    this.drawDinoBody(ctx);

    // Vẽ khung Từ vựng & Hint (Nghĩa tiếng Việt + B _ _ _ _ A)
    this.drawWordPlate(ctx);

    ctx.restore();
  }

  drawDinoBody(ctx) {
    ctx.save();
    const bodyColor = this.hitFlash > 0.3 ? '#ffffff' : this.primaryColor;
    const darkColor = this.hitFlash > 0.3 ? '#bae6fd' : this.secondaryColor;
    const legSwing = Math.sin(this.animTime * 2) * 6;

    // Đuôi khủng long
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.5, 4);
    ctx.lineTo(this.radius * 1.35, -8 + legSwing * 0.5);
    ctx.lineTo(this.radius * 0.6, 14);
    ctx.closePath();
    ctx.fill();

    // Chân sau & chân trước
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.roundRect(-10 + legSwing, this.radius * 0.35, 9, 16, 4);
    ctx.roundRect(6 - legSwing, this.radius * 0.35, 9, 16, 4);
    ctx.fill();

    // Thân chính
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(4, 2, this.radius * 0.78, this.radius * 0.58, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gai lưng hoặc cánh (tùy loại khủng long)
    if (this.type === 'ptero') {
      const wingY = Math.sin(this.animTime * 3) * 16;
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(18, -26 + wingY);
      ctx.lineTo(24, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#fde047';
      for (let i = -1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 9, -this.radius * 0.45);
        ctx.lineTo(i * 9 + 5, -this.radius * 0.72);
        ctx.lineTo(i * 9 + 10, -this.radius * 0.4);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Đầu khủng long (hướng sang trái)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(-this.radius * 1.05, -this.radius * 0.68, this.radius * 0.85, this.radius * 0.62, 10);
    ctx.fill();
    ctx.stroke();

    // Sừng nếu là Triceratops hoặc Vương miện nếu là T-Rex Boss
    if (this.type === 'triceratops') {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.95, -this.radius * 0.45);
      ctx.lineTo(-this.radius * 1.35, -this.radius * 0.75);
      ctx.lineTo(-this.radius * 0.8, -this.radius * 0.3);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'trex') {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', -this.radius * 0.6, -this.radius * 0.78);
    }

    // Mắt khủng long
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.68, -this.radius * 0.42, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.72, -this.radius * 0.42, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Răng nanh
    ctx.fillStyle = '#ffffff';
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.95 + t * 6, -this.radius * 0.08);
      ctx.lineTo(-this.radius * 0.92 + t * 6, -this.radius * 0.08 + 5);
      ctx.lineTo(-this.radius * 0.89 + t * 6, -this.radius * 0.08);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawWordPlate(ctx) {
    const maskedChars = formatMaskedWord(this.word, this.typedIndex, this.revealedIndices);
    const charSlotWidth = 18;
    const wordWidth = maskedChars.length * charSlotWidth;
    const meaningText = `${this.meaning} (${this.pos})`;

    ctx.font = '600 13px "Inter", system-ui, sans-serif';
    const meaningWidth = ctx.measureText(meaningText).width;

    const plateWidth = Math.max(wordWidth + 26, meaningWidth + 24, 120);
    const plateHeight = 54;
    const plateX = -plateWidth / 2;
    const plateY = this.labelOffsetY - plateHeight / 2;

    // Khung nền hiển thị Nghĩa tiếng Việt + Hint
    ctx.fillStyle = this.isLocked ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.86)';
    ctx.strokeStyle = this.errorShake > 0
      ? '#ef4444'
      : this.isLocked
      ? '#facc15'
      : '#38bdf8';
    ctx.lineWidth = this.isLocked ? 2.5 : 1.5;

    ctx.beginPath();
    ctx.roundRect(plateX, plateY, plateWidth, plateHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Dòng 1: Nghĩa tiếng Việt (VD: "Quả chuối (n)")
    ctx.fillStyle = this.isLocked ? '#fef08a' : '#e2e8f0';
    ctx.font = '600 13px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meaningText, 0, plateY + 16);

    // Dòng 2: Từ tiếng Anh dạng Hint (VD: B _ _ _ _ A)
    const startX = -((maskedChars.length - 1) * charSlotWidth) / 2;
    const charY = plateY + 38;

    ctx.font = '800 16px "JetBrains Mono", "Courier New", monospace';
    maskedChars.forEach((item, idx) => {
      const cx = startX + idx * charSlotWidth;

      // Đánh dấu vị trí ký tự tiếp theo cần gõ
      if (item.isNext && this.isLocked) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.beginPath();
        ctx.roundRect(cx - 7, charY - 11, 14, 20, 3);
        ctx.fill();
      }

      if (item.state === 'typed') {
        ctx.fillStyle = '#4ade80'; // Xanh lá sáng cho chữ đã bắn trúng
      } else if (item.state === 'hint') {
        ctx.fillStyle = item.isNext ? '#facc15' : '#38bdf8'; // Vàng/Xanh dương cho chữ gợi ý sẵn (X..., B...)
      } else {
        ctx.fillStyle = item.isNext ? '#fde047' : '#94a3b8'; // Dấu gạch dưới _
      }

      ctx.fillText(item.display, cx, charY);
    });
  }
}

export class Bullet {
  constructor(startX, startY, targetDino, charHit) {
    this.x = startX;
    this.y = startY;
    this.target = targetDino;
    this.charHit = charHit;
    this.speed = 920;
    this.done = false;
  }

  update(dt) {
    if (!this.target) {
      this.done = true;
      return;
    }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 24) {
      this.done = true;
      return;
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill();

    if (this.charHit) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.charHit, this.x, this.y - 10);
    }
    ctx.restore();
  }
}

export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 180;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = 1.4 + Math.random() * 1.2;
    this.size = 3 + Math.random() * 5;
    this.color = color;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 120 * dt; // Trọng lực nhẹ
    this.life -= this.decay * dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class FloatingText {
  constructor(x, y, text, subtext = '', color = '#4ade80') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.subtext = subtext;
    this.color = color;
    this.life = 1.0;
  }

  update(dt) {
    this.y -= 38 * dt;
    this.life -= dt * 0.85;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.textAlign = 'center';

    ctx.fillStyle = this.color;
    ctx.font = '800 18px "Inter", sans-serif';
    ctx.fillText(this.text, this.x, this.y);

    if (this.subtext) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.fillText(this.subtext, this.x, this.y + 18);
    }
    ctx.restore();
  }
}
