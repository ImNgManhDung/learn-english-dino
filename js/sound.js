// Hệ thống âm thanh Web Audio API (không cần file mp3 ngoài) & đọc phát âm từ vựng tiếng Anh

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.preferredVoice = null;
    this.initSpeech();
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initSpeech() {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Ưu tiên giọng tiếng Anh chuẩn (US/UK)
      this.preferredVoice =
        voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en')) ||
        null;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Đọc phát âm từ vựng tiếng Anh khi tiêu diệt khủng long hoặc bấm nghe lại
  speakWord(word) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word.toLowerCase());
      utter.lang = 'en-US';
      utter.rate = 0.95;
      utter.pitch = 1.0;
      if (this.preferredVoice) {
        utter.voice = this.preferredVoice;
      }
      window.speechSynthesis.speak(utter);
    } catch (e) {
      // Bỏ qua nếu trình duyệt chặn tự động phát âm
    }
  }

  // Tiếng bắn tia laser khi gõ đúng chữ cái
  playLaser(pitchOffset = 0) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = Math.min(1200, 520 + pitchOffset * 45);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.11);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Tiếng khủng long nổ tung khi hoàn thành từ vựng
  playExplosion() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Giai điệu chiến thắng ngắn + tiếng nổ trầm
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gain.gain.setValueAtTime(0.14, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.17);
    });
  }

  // Tiếng báo lỗi khi gõ sai chữ cái
  playError() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(115, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Tiếng mở gợi ý (Hint)
  playHint() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Tiếng căn cứ bị khủng long tấn công
  playDamage() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.3);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.33);
  }
}
