// Thực thể Đồ họa Cyber-Jurassic Hologram: Mecha-Turret, Cyber-Dinosaur, Railgun Beam, Shockwave, Particle
import { generateHintIndices, formatMaskedWord } from './vocab.js?v=2.5';

export class Turret {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.targetAngle = 0;
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.ringAngle = 0;
  }

  aimAt(targetX, targetY) {
    this.targetAngle = Math.atan2(targetY - this.y, targetX - this.x);
    this.angle = this.targetAngle;
  }

  triggerShot() {
    this.recoil = 12;
    this.muzzleFlash = 1.0;
  }

  update(dt) {
    this.ringAngle += dt * 1.4;
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 55);
    if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 9);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Hào quang năng lượng dưới chân tháp pháo
    const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, 62);
    aura.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
    aura.addColorStop(0.55, 'rgba(59, 130, 246, 0.12)');
    aura.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();

    // Vòng Radar xoay ngoài
    ctx.save();
    ctx.rotate(this.ringAngle);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([12, 8, 4, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Đế Lục Giác Cơ Giới
    ctx.fillStyle = '#091024';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const px = Math.cos(a) * 30;
      const py = Math.sin(a) * 30;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Xoay cụm nòng Railgun Plasma
    ctx.rotate(this.angle);
    const rx = -this.recoil;

    // 2 Thanh dẫn hướng Railgun
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;

    // Nòng trên
    ctx.beginPath();
    ctx.roundRect(rx + 6, -13, 42, 7, 2);
    ctx.fill();
    ctx.stroke();

    // Nòng dưới
    ctx.beginPath();
    ctx.roundRect(rx + 6, 6, 42, 7, 2);
    ctx.fill();
    ctx.stroke();

    // Lõi khe năng lượng giữa 2 nòng
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 12;
    ctx.fillRect(rx + 12, -3, 30, 6);
    ctx.shadowBlur = 0;

    // Thân chụp trung tâm
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rx * 0.4, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lõi Reactor phát sáng
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(rx * 0.4, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Chớp lửa Plasma ở đầu nòng
    if (this.muzzleFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(34, 211, 238, ${this.muzzleFlash})`;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(rx + 50, 0, 16 * this.muzzleFlash, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

    this.typedIndex = 0;
    this.revealedIndices = generateHintIndices(this.word, this.hintMode, this.wave);

    this.animTime = Math.random() * 10;
    this.reticleAngle = 0;
    this.hitFlash = 0;
    this.errorShake = 0;
    this.knockback = 0;
    this.isLocked = false;
    this.dead = false;

    if (this.type === 'trex') {
      this.scale = 1.32;
      this.radius = 48;
      this.neonColor = '#f43f5e';
      this.armorColor = '#1e1b4b';
      this.labelOffsetY = -88;
      this.classTag = 'APEX T-REX';
    } else if (this.type === 'triceratops') {
      this.scale = 1.08;
      this.radius = 38;
      this.neonColor = '#f59e0b';
      this.armorColor = '#172554';
      this.labelOffsetY = -74;
      this.classTag = 'MECHA-TRICERA';
    } else if (this.type === 'ptero') {
      this.scale = 0.98;
      this.radius = 34;
      this.neonColor = '#c084fc';
      this.armorColor = '#1e1b4b';
      this.labelOffsetY = -70;
      this.classTag = 'AERO-PTERO';
    } else {
      this.scale = 0.95;
      this.radius = 32;
      this.neonColor = '#10b981';
      this.armorColor = '#0f172a';
      this.labelOffsetY = -68;
      this.classTag = 'CYBER-RAPTOR';
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
    this.knockback = 16;
    if (this.typedIndex >= this.word.length) {
      this.dead = true;
    }
  }

  onHitError() {
    this.errorShake = 1.0;
  }

  update(dt) {
    this.animTime += dt * 7;
    this.reticleAngle += dt * 2.5;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt * 5.5);
    if (this.errorShake > 0) this.errorShake = Math.max(0, this.errorShake - dt * 4.5);

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    const currentSpeed = this.speed - this.knockback * 13;
    if (this.knockback > 0) {
      this.knockback = Math.max(0, this.knockback - dt * 38);
    }

    this.x += (dx / dist) * currentSpeed * dt;
    this.baseY += (dy / dist) * currentSpeed * dt;

    if (this.type === 'ptero') {
      this.y = this.baseY + Math.sin(this.animTime * 1.1) * 14;
    } else {
      this.y = this.baseY + Math.abs(Math.sin(this.animTime * 1.6)) * -5;
    }
  }

  draw(ctx) {
    ctx.save();
    const shakeX = this.errorShake > 0 ? Math.sin(this.animTime * 20) * 7 * this.errorShake : 0;
    ctx.translate(this.x + shakeX, this.y);

    // Tâm ngắm xoay tròn Hologram khi bị khóa (Target Lock Reticle)
    if (this.isLocked) {
      ctx.save();
      ctx.rotate(this.reticleAngle);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 18, 0, Math.PI * 2);
      ctx.stroke();

      // 4 góc khóa mục tiêu
      ctx.setLineDash([]);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(this.radius + 10, 0);
        ctx.lineTo(this.radius + 22, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Bóng năng lượng dưới mặt đất
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, this.radius + 6, this.radius * 0.9, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ thân Khủng Long Cơ Giới (Mecha-Dino)
    ctx.save();
    ctx.scale(this.scale, this.scale);
    this.drawMechaDino(ctx);
    ctx.restore();

    // Vẽ bảng Hologram Từ vựng & Hint trên đầu
    this.drawHologramPlate(ctx);

    ctx.restore();
  }

  drawMechaDino(ctx) {
    const strokeCol = this.hitFlash > 0.25 ? '#ffffff' : this.neonColor;
    const fillCol = this.hitFlash > 0.25 ? '#38bdf8' : this.armorColor;
    const stride = Math.sin(this.animTime * 1.8) * 8;
    const jawAngle = Math.abs(Math.sin(this.animTime * 1.5)) * 0.22;

    ctx.lineWidth = 2.2;
    ctx.strokeStyle = strokeCol;
    ctx.fillStyle = fillCol;

    // 1. Đuôi cơ giới phân đốt (Segmented Cyber Tail)
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(44, -12 + stride * 0.3);
    ctx.lineTo(36, 6 + stride * 0.2);
    ctx.lineTo(12, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Chân sau (Back Leg)
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(14 - stride, 24);
    ctx.lineTo(6 - stride, 32);
    ctx.lineTo(-4 - stride, 32);
    ctx.lineTo(0, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Thân giáp chính (Angular Mecha Torso)
    ctx.beginPath();
    ctx.moveTo(-18, -14);
    ctx.lineTo(16, -10);
    ctx.lineTo(22, 6);
    ctx.lineTo(4, 16);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gai năng lượng phát sáng dọc sống lưng (Dorsal Neon Spines)
    ctx.fillStyle = strokeCol;
    for (let i = 0; i < 3; i++) {
      const sx = -8 + i * 10;
      const sy = -13 + i * 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 5, sy - 9);
      ctx.lineTo(sx + 8, sy + 1);
      ctx.closePath();
      ctx.fill();
    }

    // Nếu là Pteranodon: vẽ đôi cánh Plasma sải rộng
    if (this.type === 'ptero') {
      const wingFlap = Math.sin(this.animTime * 2.6) * 20;
      ctx.fillStyle = 'rgba(192, 132, 252, 0.32)';
      ctx.strokeStyle = '#e879f9';
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(16, -34 + wingFlap);
      ctx.lineTo(30, -6 + wingFlap * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Chân trước (Front Leg)
    ctx.fillStyle = fillCol;
    ctx.strokeStyle = strokeCol;
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(-4 + stride, 25);
    ctx.lineTo(-12 + stride, 32);
    ctx.lineTo(-20 + stride, 32);
    ctx.lineTo(-14, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lõi Reactor ngực khủng long
    ctx.fillStyle = strokeCol;
    ctx.beginPath();
    ctx.arc(-4, 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Đầu & Hàm Cơ Giới (Mecha Skull & Articulated Jaw)
    ctx.save();
    ctx.translate(-18, -12);

    // Sừng nếu là Triceratops
    if (this.type === 'triceratops') {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(-32, -14);
      ctx.lineTo(-16, 2);
      ctx.closePath();
      ctx.fill();
    }

    // Hộp sọ trên
    ctx.fillStyle = fillCol;
    ctx.strokeStyle = strokeCol;
    ctx.beginPath();
    ctx.moveTo(4, -10);
    ctx.lineTo(-18, -8);
    ctx.lineTo(-26, 0);
    ctx.lineTo(-18, 4);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hàm dưới cử động
    ctx.save();
    ctx.rotate(-jawAngle);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-22, 4);
    ctx.lineTo(-18, 10);
    ctx.lineTo(2, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Mắt Laser phát sáng
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-8, -1);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawHologramPlate(ctx) {
    const maskedChars = formatMaskedWord(this.word, this.typedIndex, this.revealedIndices);
    const slotW = 20;
    const slotGap = 3;
    const totalWordW = maskedChars.length * (slotW + slotGap) - slotGap;

    const meaningStr = `${this.meaning.toUpperCase()} [${this.pos.toUpperCase()}]`;
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    const meaningW = ctx.measureText(meaningStr).width;

    const plateW = Math.max(totalWordW + 28, meaningW + 34, 136);
    const plateH = 58;
    const px = -plateW / 2;
    const py = this.labelOffsetY - plateH / 2;

    // Nền kính Hologram vát góc
    ctx.save();
    ctx.fillStyle = this.isLocked ? 'rgba(6, 12, 30, 0.94)' : 'rgba(9, 15, 32, 0.86)';
    ctx.strokeStyle = this.errorShake > 0
      ? '#f43f5e'
      : this.isLocked
      ? '#facc15'
      : this.neonColor;
    ctx.lineWidth = this.isLocked ? 2.2 : 1.4;

    if (this.isLocked) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.35)';
      ctx.shadowBlur = 14;
    }

    ctx.beginPath();
    ctx.roundRect(px, py, plateW, plateH, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Thanh tiến độ giải mã từ vựng ở đáy thẻ
    const progress = this.typedIndex / this.word.length;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.fillRect(px + 8, py + plateH - 5, plateW - 16, 2.5);
    if (progress > 0) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px + 8, py + plateH - 5, (plateW - 16) * progress, 2.5);
    }

    // Dòng 1: Nghĩa tiếng Việt
    ctx.fillStyle = this.isLocked ? '#fef08a' : '#e2e8f0';
    ctx.font = '700 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(meaningStr, 0, py + 15);

    // Dòng 2: Các ô phím ký tự (B _ _ _ _ A)
    const startX = -totalWordW / 2;
    const slotY = py + 26;

    ctx.font = '800 14px "JetBrains Mono", monospace';
    maskedChars.forEach((item, idx) => {
      const sx = startX + idx * (slotW + slotGap);

      // Nền từng ô ký tự
      if (item.state === 'typed') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.strokeStyle = '#4ade80';
      } else if (item.isNext && this.isLocked) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.strokeStyle = '#facc15';
      } else if (item.state === 'hint') {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
      } else {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      }

      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(sx, slotY, slotW, 22, 4);
      ctx.fill();
      ctx.stroke();

      // Chữ cái bên trong ô
      if (item.state === 'typed') {
        ctx.fillStyle = '#4ade80';
      } else if (item.isNext && this.isLocked) {
        ctx.fillStyle = '#fde047';
      } else if (item.state === 'hint') {
        ctx.fillStyle = '#22d3ee';
      } else {
        ctx.fillStyle = '#64748b';
      }

      ctx.fillText(item.display, sx + slotW / 2, slotY + 11.5);
    });

    ctx.restore();
  }
}

export class LaserBeam {
  constructor(x1, y1, x2, y2, color = '#22d3ee') {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.life = 1.0;
  }

  update(dt) {
    this.life -= dt * 7.5;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);

    // Tia sáng rộng bên ngoài
    ctx.strokeStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 6 * this.life;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();

    // Lõi trắng cường độ cao
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * this.life;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();

    ctx.restore();
  }
}

export class Shockwave {
  constructor(x, y, color = '#22d3ee') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 10;
    this.maxRadius = 78;
    this.life = 1.0;
  }

  update(dt) {
    this.radius += (this.maxRadius - this.radius) * dt * 8;
    this.life -= dt * 2.6;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3 * this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export class Bullet {
  constructor(startX, startY, targetDino, charHit) {
    this.x = startX;
    this.y = startY;
    this.target = targetDino;
    this.charHit = charHit;
    this.speed = 1150;
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

    if (dist < 28) {
      this.done = true;
      return;
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 220;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = 1.5 + Math.random() * 1.4;
    this.size = 2.5 + Math.random() * 4.5;
    this.color = color;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 90 * dt;
    this.life -= this.decay * dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
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
    this.y -= 42 * dt;
    this.life -= dt * 0.82;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.textAlign = 'center';

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.font = '800 17px "Orbitron", sans-serif';
    ctx.fillText(this.text, this.x, this.y);
    ctx.shadowBlur = 0;

    if (this.subtext) {
      ctx.fillStyle = '#fef08a';
      ctx.font = '600 12.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(this.subtext, this.x, this.y + 18);
    }
    ctx.restore();
  }
}
