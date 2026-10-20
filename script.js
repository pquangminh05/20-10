/**
 * 20/10 Interactive Love Letter & Dynamic Dodging Button
 * Modern Web Audio API, Canvas Petals, Fireworks, and Physics
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const envelopeScene = document.getElementById('envelope-scene');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelopeFlap = document.getElementById('envelope-flap');
  const waxSeal = document.getElementById('wax-seal');
  const tapHint = document.getElementById('tap-hint');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const teaseBubble = document.getElementById('tease-bubble');
  const celebrationOverlay = document.getElementById('celebration-overlay');
  const btnReplay = document.getElementById('btn-replay');
  const btnMoreHearts = document.getElementById('btn-more-hearts');
  const musicBtn = document.getElementById('music-btn');
  const musicText = document.getElementById('music-text');
  const musicIcon = document.getElementById('music-icon');
  const ambientCanvas = document.getElementById('ambient-canvas');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const letterDate = document.getElementById('letter-date');

  let isEnvelopeOpen = false;
  let isMusicPlaying = false;
  let audioCtx = null;
  let synthMusicInterval = null;
  let dodgeCount = 0;

  // Set modern Vietnamese date if available
  const now = new Date();
  if (letterDate) {
    letterDate.textContent = `20 Tháng 10, ${now.getFullYear() || 2026}`;
  }

  // Teasing messages for the runaway "Không" button
  const teaseMessages = [
    'Bắt hụt rồi nè lêu lêu 😜',
    'Chỉ được bấm "Có" thuii! 🥰',
    'Đố em bấm được luôn á! 🏃‍♂️💨',
    'Đừng chối mà, anh buồn á 🥺',
    'Em là của anh rồi, k thoát được đâu! 💖',
    'Hông bấm được đâu nàooo 😝',
    'Thương anh thì bấm Có đii! 💕',

  ];

  /* ==========================================================================
     1. Web Audio API Engine (Sound Effects & Music Box Synthesis)
     ========================================================================== */

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play gentle pop / paper sound
  function playPopSound() {
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio not supported or blocked', e);
    }
  }

  // Play playful whoosh / boing when "Không" button dodges
  function playDodgeSound() {
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      const baseFreq = 300 + Math.random() * 200;
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // ignore
    }
  }

  // Play celebration romantic harp / chords
  function playCelebrationSound() {
    try {
      initAudioContext();
      // Romantic Chord: Cmaj9 -> Fmaj7
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 1.2);
      });
    } catch (e) {
      // ignore
    }
  }

  // Sweet gentle Music Box Synth melody (Canon in D / Romantic Ballad loop)
  const melodyNotes = [
    { note: 659.25, dur: 0.4 }, // E5
    { note: 587.33, dur: 0.4 }, // D5
    { note: 523.25, dur: 0.4 }, // C5
    { note: 587.33, dur: 0.4 }, // D5
    { note: 659.25, dur: 0.4 }, // E5
    { note: 659.25, dur: 0.4 }, // E5
    { note: 659.25, dur: 0.8 }, // E5
    { note: 587.33, dur: 0.4 }, // D5
    { note: 587.33, dur: 0.4 }, // D5
    { note: 587.33, dur: 0.8 }, // D5
    { note: 659.25, dur: 0.4 }, // E5
    { note: 783.99, dur: 0.4 }, // G5
    { note: 783.99, dur: 0.8 }, // G5
    { note: 659.25, dur: 0.4 }, // E5
    { note: 587.33, dur: 0.4 }, // D5
    { note: 523.25, dur: 0.4 }, // C5
    { note: 440.00, dur: 0.4 }, // A4
    { note: 523.25, dur: 0.8 }, // C5
  ];
  let noteIndex = 0;

  function playNextMusicNote() {
    if (!isMusicPlaying) return;
    try {
      initAudioContext();
      const current = melodyNotes[noteIndex];
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(current.note, audioCtx.currentTime);

      // Sweet music-box bell envelope
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + current.dur * 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + current.dur * 1.5);

      noteIndex = (noteIndex + 1) % melodyNotes.length;
      synthMusicInterval = setTimeout(playNextMusicNote, current.dur * 900);
    } catch (e) {
      console.warn(e);
    }
  }

  function toggleMusic() {
    initAudioContext();
    isMusicPlaying = !isMusicPlaying;
    if (isMusicPlaying) {
      musicBtn.classList.add('playing');
      musicText.textContent = 'Đang Phát';
      musicIcon.textContent = '💖';
      playNextMusicNote();
    } else {
      musicBtn.classList.remove('playing');
      musicText.textContent = 'Bật Nhạc';
      musicIcon.textContent = '🎵';
      clearTimeout(synthMusicInterval);
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  /* ==========================================================================
     2. Envelope Opening Logic
     ========================================================================== */

  function openEnvelope() {
    if (isEnvelopeOpen) return;
    isEnvelopeOpen = true;

    playPopSound();

    // Auto-start music if not yet playing
    if (!isMusicPlaying) {
      toggleMusic();
    }

    envelopeScene.classList.add('opened');

    // Confetti celebration when opening
    spawnConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.45, 60);

    // Smooth scroll if needed on mobile
    setTimeout(() => {
      const letter = document.getElementById('letter');
      if (letter) {
        letter.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 650);
  }

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', openEnvelope);
  }
  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }
  if (tapHint) {
    tapHint.addEventListener('click', openEnvelope);
  }

  /* ==========================================================================
     3. The Evasive "Không" Button (Smart Dodging Engine)
     ========================================================================== */

  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    dodgeCount++;
    playDodgeSound();

    // Get viewport boundaries with safe margin
    const padding = 25;
    const btnRect = btnNo.getBoundingClientRect();
    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 48;

    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    const minX = padding;
    const minY = padding;

    // Get "Có" button coordinates to prevent any accidental overlap
    const yesRect = btnYes.getBoundingClientRect();
    const forbiddenZone = {
      left: yesRect.left - 50,
      right: yesRect.right + 50,
      top: yesRect.top - 50,
      bottom: yesRect.bottom + 50,
    };

    let randomX = minX;
    let randomY = minY;
    let attempts = 0;

    // Generate random positions until it's far from cursor and away from "Có" button
    do {
      randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
      attempts++;
    } while (
      attempts < 15 &&
      randomX > forbiddenZone.left &&
      randomX < forbiddenZone.right &&
      randomY > forbiddenZone.top &&
      randomY < forbiddenZone.bottom
    );

    // Switch to fixed runaway mode
    btnNo.classList.add('running-away');
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;

    // Add playful rotation/shake
    const angle = (Math.random() - 0.5) * 24;
    btnNo.style.transform = `rotate(${angle}deg) scale(1.05)`;

    // Show teasing speech bubble near the new button position
    showTeaseBubble(randomX, randomY);

    // Spawn mini fleeing hearts/sparkles
    spawnMiniBurst(randomX + btnWidth / 2, randomY + btnHeight / 2);
  }

  function showTeaseBubble(x, y) {
    if (!teaseBubble) return;
    const msg = teaseMessages[Math.floor(Math.random() * teaseMessages.length)];
    teaseBubble.textContent = msg;

    // Position above the button, bounded on screen
    let bubbleX = Math.max(10, Math.min(window.innerWidth - 220, x - 20));
    let bubbleY = y > 70 ? y - 48 : y + 54;

    teaseBubble.style.left = `${bubbleX}px`;
    teaseBubble.style.top = `${bubbleY}px`;
    teaseBubble.classList.add('visible');

    clearTimeout(teaseBubble._timeout);
    teaseBubble._timeout = setTimeout(() => {
      teaseBubble.classList.remove('visible');
    }, 1800);
  }

  // Bind mouse, pointer, and touch events so it can NEVER be clicked
  btnNo.addEventListener('mouseenter', dodgeNoButton);
  btnNo.addEventListener('mouseover', dodgeNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNoButton(e);
  }, { passive: false });
  btnNo.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dodgeNoButton(e);
  });
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeNoButton(e);
  });

  // Proximity detection: if cursor approaches within 65px radius, dodge away before touching!
  window.addEventListener('pointermove', (e) => {
    if (!isEnvelopeOpen) return;
    const rect = btnNo.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    if (dist < 65) {
      dodgeNoButton(e);
    }
  });

  /* ==========================================================================
     4. Clicking "Có" -> Grand Celebration Screen!
     ========================================================================== */

  function triggerCelebration() {
    playCelebrationSound();

    // Reset "Không" button position
    if (btnNo) {
      btnNo.classList.remove('running-away');
      btnNo.style.position = '';
      btnNo.style.left = '';
      btnNo.style.top = '';
      btnNo.style.transform = '';
    }
    if (teaseBubble) teaseBubble.classList.remove('visible');

    // Show celebration modal
    if (celebrationOverlay) {
      celebrationOverlay.classList.add('active');
    }

    // Massive Confetti & Heart Fireworks
    startCelebrationFireworks();
  }

  // Expose to window for inline onclick fallback
  window.triggerCelebration = triggerCelebration;
  window.openEnvelope = openEnvelope;
  window.dodgeNoButton = dodgeNoButton;

  if (btnYes) {
    btnYes.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerCelebration();
    });
    btnYes.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      triggerCelebration();
    });
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      celebrationOverlay.classList.remove('active');
      const letter = document.getElementById('letter');
      if (letter) {
        letter.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (btnMoreHearts) {
    btnMoreHearts.addEventListener('click', () => {
      playPopSound();
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const x = window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6;
          const y = window.innerHeight * 0.7 + Math.random() * 80;
          createFloatingClickHeart(x, y);
        }, i * 60);
      }
    });
  }

  /* ==========================================================================
     5. Click-to-spawn Floating Hearts Anywhere
     ========================================================================= */

  const loveSymbols = ['❤️', '💖', '💕', '🌸', '✨', '🌹', '🥰', '💌'];

  function createFloatingClickHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-click-heart';
    heart.textContent = loveSymbols[Math.floor(Math.random() * loveSymbols.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
      if (heart && heart.parentNode) {
        heart.parentNode.removeChild(heart);
      }
    }, 1400);
  }

  document.addEventListener('pointerdown', (e) => {
    // Avoid double spawning when tapping buttons
    if (e.target.closest('button') || e.target.closest('.wax-seal')) return;
    createFloatingClickHeart(e.clientX, e.clientY);
  });

  /* ==========================================================================
     6. Ambient Background Canvas (Sakura Petals, Floating Hearts & Stars)
     ========================================================================== */

  const ambientCtx = ambientCanvas.getContext('2d');
  let ambientWidth, ambientHeight;

  function resizeAmbientCanvas() {
    ambientWidth = ambientCanvas.width = window.innerWidth;
    ambientHeight = ambientCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeAmbientCanvas);
  resizeAmbientCanvas();

  const particles = [];
  const TOTAL_PARTICLES = 36;

  class AmbientParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * ambientWidth;
      this.y = initial ? Math.random() * ambientHeight : -20;
      this.type = Math.random() > 0.4 ? 'petal' : (Math.random() > 0.5 ? 'heart' : 'sparkle');
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 0.9 + 0.5;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.03;
      this.opacity = Math.random() * 0.6 + 0.25;
      this.color = `hsl(${340 + Math.random() * 30}, 85%, ${70 + Math.random() * 20}%)`;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.8;
      this.angle += this.spinSpeed;

      if (this.y > ambientHeight + 30 || this.x < -30 || this.x > ambientWidth + 30) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'petal') {
        // Draw delicate sakura petal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'heart') {
        // Draw tiny romantic heart
        ctx.fillStyle = this.color;
        const s = this.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.3);
        ctx.bezierCurveTo(-s, -s * 1.2, -s * 1.4, s * 0.3, 0, s * 1.2);
        ctx.bezierCurveTo(s * 1.4, s * 0.3, s, -s * 1.2, 0, -s * 0.3);
        ctx.fill();
      } else {
        // Draw twinkling star
        ctx.fillStyle = '#fff9d6';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < TOTAL_PARTICLES; i++) {
    particles.push(new AmbientParticle());
  }

  function animateAmbient() {
    ambientCtx.clearRect(0, 0, ambientWidth, ambientHeight);
    particles.forEach(p => {
      p.update();
      p.draw(ambientCtx);
    });
    requestAnimationFrame(animateAmbient);
  }
  animateAmbient();

  /* ==========================================================================
     7. Confetti & Fireworks Physics Canvas
     ========================================================================== */

  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiWidth, confettiHeight;

  function resizeConfettiCanvas() {
    confettiWidth = confettiCanvas.width = window.innerWidth;
    confettiHeight = confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  const confettiPieces = [];
  const CONFETTI_COLORS = ['#ff3366', '#ff6b8b', '#ffd166', '#ff85a2', '#f72585', '#b5179e', '#7209b7', '#4cc9f0', '#ffffff'];

  class ConfettiPiece {
    constructor(x, y, isHeart = false) {
      this.x = x;
      this.y = y;
      this.isHeart = isHeart || Math.random() > 0.6;
      this.size = Math.random() * 10 + 6;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 16 + 8;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - 6;
      this.gravity = 0.45;
      this.drag = 0.94;
      this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.opacity = 1;
      this.decay = Math.random() * 0.012 + 0.008;
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.isHeart) {
        const s = this.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.3);
        ctx.bezierCurveTo(-s, -s * 1.2, -s * 1.4, s * 0.3, 0, s * 1.2);
        ctx.bezierCurveTo(s * 1.4, s * 0.3, s, -s * 1.2, 0, -s * 0.3);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      }
      ctx.restore();
    }
  }

  function spawnConfettiBurst(x, y, count = 50) {
    for (let i = 0; i < count; i++) {
      confettiPieces.push(new ConfettiPiece(x, y));
    }
  }

  function spawnMiniBurst(x, y) {
    for (let i = 0; i < 12; i++) {
      confettiPieces.push(new ConfettiPiece(x, y, true));
    }
  }

  function startCelebrationFireworks() {
    let waves = 0;
    const interval = setInterval(() => {
      const x = Math.random() * confettiWidth * 0.8 + confettiWidth * 0.1;
      const y = Math.random() * confettiHeight * 0.5 + confettiHeight * 0.2;
      spawnConfettiBurst(x, y, 65);
      waves++;
      if (waves >= 6) {
        clearInterval(interval);
      }
    }, 380);
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);
    for (let i = confettiPieces.length - 1; i >= 0; i--) {
      const piece = confettiPieces[i];
      piece.update();
      piece.draw(confettiCtx);
      if (piece.opacity <= 0) {
        confettiPieces.splice(i, 1);
      }
    }
    requestAnimationFrame(animateConfetti);
  }
  animateConfetti();
});
