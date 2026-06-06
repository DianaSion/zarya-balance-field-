// ===== Zarya Balance Field — The Game =====
// Catch light and shadow orbs. Keep the balance. Refuse erasure.

(function () {
  'use strict';

  // --- DOM refs ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const timerEl = document.getElementById('timer');
  const balanceBar = document.getElementById('balance-bar');
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const gameOverScreen = document.getElementById('game-over-screen');
  const restartBtn = document.getElementById('restart-btn');
  const endTitle = document.getElementById('end-title');
  const finalScore = document.getElementById('final-score');
  const finalLevel = document.getElementById('final-level');
  const finalTime = document.getElementById('final-time');

  // --- Game state ---
  let running = false;
  let score = 0;
  let level = 1;
  let balance = 50; // 0-100, 50 = perfect center
  let elapsed = 0;
  let lastTime = 0;
  let spawnTimer = 0;
  let particles = [];
  let orbs = [];
  let stars = [];
  let keeper = { x: 0, y: 0, width: 90, height: 16 };
  let keysDown = {};

  // --- Constants ---
  const BALANCE_DECAY = 0.02; // per second, drift toward center
  const ORB_SHIFT = 8; // balance shift per orb caught
  const BALANCE_DANGER = 15; // below this = danger zone
  const SPEED_BASE = 80; // pixels/second base fall speed
  const SPAWN_BASE = 1.2; // seconds between spawns
  const KEEPER_SPEED = 400; // pixels/second keyboard movement

  // --- Stars background ---
  function initStars() {
    stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.05
      });
    }
  }

  function drawStars(dt) {
    for (const s of stars) {
      s.a += s.speed * dt * (Math.random() > 0.5 ? 1 : -1);
      s.a = Math.max(0.1, Math.min(0.8, s.a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 210, 240, ' + s.a + ')';
      ctx.fill();
    }
  }

  // --- Orb class ---
  function spawnOrb() {
    const isLight = Math.random() > 0.5;
    const radius = 14 + Math.random() * 8;
    const x = radius + Math.random() * (canvas.width - radius * 2);
    const speedMult = 1 + (level - 1) * 0.15;
    orbs.push({
      x: x,
      y: -radius,
      radius: radius,
      speed: (SPEED_BASE + Math.random() * 40) * speedMult,
      isLight: isLight,
      glow: 0,
      alive: true
    });
  }

  function drawOrb(orb) {
    const { x, y, radius, isLight } = orb;
    // Glow
    const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.2);
    if (isLight) {
      grad.addColorStop(0, 'rgba(255, 224, 102, 0.9)');
      grad.addColorStop(0.5, 'rgba(255, 200, 50, 0.3)');
      grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    } else {
      grad.addColorStop(0, 'rgba(130, 100, 180, 0.9)');
      grad.addColorStop(0.5, 'rgba(106, 76, 147, 0.3)');
      grad.addColorStop(1, 'rgba(106, 76, 147, 0)');
    }
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? '#ffe066' : '#6a4c93';
    ctx.fill();
    ctx.strokeStyle = isLight ? '#ffcc00' : '#4a2d73';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Symbol
    ctx.fillStyle = isLight ? '#886600' : '#c8b8e8';
    ctx.font = Math.round(radius * 0.9) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLight ? '☀' : '☽', x, y);
  }

  // --- Keeper (paddle) ---
  function drawKeeper() {
    const { x, y, width, height } = keeper;
    // Glow under keeper
    const grad = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    grad.addColorStop(0, 'rgba(245, 200, 66, 0.1)');
    grad.addColorStop(0.5, 'rgba(245, 200, 66, 0.5)');
    grad.addColorStop(1, 'rgba(192, 200, 224, 0.1)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, 8);
    ctx.fill();

    // Keeper body
    const bodyGrad = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    bodyGrad.addColorStop(0, '#f5c842');
    bodyGrad.addColorStop(1, '#c0c8e0');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, 8);
    ctx.fill();

    // Center spiral symbol
    ctx.fillStyle = '#0a0a1a';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('∞', x, y + 1);
  }

  // --- Particles ---
  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.5 + Math.random() * 0.4,
        color: color,
        r: 2 + Math.random() * 3
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('1)', alpha + ')');
      ctx.fill();
    }
  }

  // --- Balance bar display ---
  function updateBalanceDisplay() {
    const pct = Math.max(0, Math.min(100, balance));
    balanceBar.style.width = pct + '%';
    if (pct < BALANCE_DANGER) {
      balanceBar.classList.add('warning');
    } else {
      balanceBar.classList.remove('warning');
    }
  }

  // --- Collision ---
  function checkCollision(orb) {
    const dx = orb.x - keeper.x;
    const dy = orb.y - keeper.y;
    return Math.abs(dx) < (keeper.width / 2 + orb.radius) &&
           Math.abs(dy) < (keeper.height / 2 + orb.radius);
  }

  // --- Format time ---
  function fmtTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // --- Resize ---
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const headerH = document.querySelector('header').offsetHeight;
    const hudH = document.querySelector('.game-hud').offsetHeight;
    const footerH = document.querySelector('footer').offsetHeight;
    const available = window.innerHeight - headerH - hudH - footerH - 8;
    canvas.width = Math.min(800, rect.width);
    canvas.height = Math.max(300, available);
    keeper.y = canvas.height - 40;
    keeper.x = Math.min(Math.max(keeper.width / 2, keeper.x), canvas.width - keeper.width / 2);
    initStars();
  }

  // --- Game loop ---
  function gameLoop(timestamp) {
    if (!running) return;
    const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
    lastTime = timestamp;

    elapsed += dt;
    spawnTimer += dt;

    // Level up every 20 seconds
    const newLevel = Math.floor(elapsed / 20) + 1;
    if (newLevel !== level) {
      level = newLevel;
      levelEl.textContent = level;
    }

    // Spawn orbs
    const spawnInterval = Math.max(0.3, SPAWN_BASE - level * 0.08);
    if (spawnTimer >= spawnInterval) {
      spawnOrb();
      spawnTimer = 0;
    }

    // Keyboard movement
    if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A']) {
      keeper.x -= KEEPER_SPEED * dt;
    }
    if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D']) {
      keeper.x += KEEPER_SPEED * dt;
    }
    keeper.x = Math.max(keeper.width / 2, Math.min(canvas.width - keeper.width / 2, keeper.x));

    // Balance drift toward center
    if (balance > 50) balance -= BALANCE_DECAY * dt * 10;
    if (balance < 50) balance += BALANCE_DECAY * dt * 10;

    // Update orbs
    for (let i = orbs.length - 1; i >= 0; i--) {
      const orb = orbs[i];
      orb.y += orb.speed * dt;

      if (checkCollision(orb)) {
        // Caught!
        score += 10 * level;
        scoreEl.textContent = score;

        if (orb.isLight) {
          balance += ORB_SHIFT;
          spawnParticles(orb.x, orb.y, 'rgba(255, 224, 100, 1)', 8);
        } else {
          balance -= ORB_SHIFT;
          spawnParticles(orb.x, orb.y, 'rgba(130, 100, 200, 1)', 8);
        }
        balance = Math.max(0, Math.min(100, balance));
        orbs.splice(i, 1);
        continue;
      }

      // Missed — penalty
      if (orb.y > canvas.height + orb.radius) {
        score = Math.max(0, score - 5);
        scoreEl.textContent = score;
        orbs.splice(i, 1);
      }
    }

    // Update particles
    updateParticles(dt);

    // Update HUD
    timerEl.textContent = fmtTime(elapsed);
    updateBalanceDisplay();

    // Check game over
    if (balance <= 0 || balance >= 100) {
      endGame();
      return;
    }

    // --- Draw ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(1, '#111128');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars(dt);

    // Balance zone indicator at bottom
    const zoneAlpha = 0.08;
    const leftZone = ctx.createLinearGradient(0, canvas.height - 60, canvas.width / 2, canvas.height - 60);
    leftZone.addColorStop(0, 'rgba(106, 76, 147, ' + zoneAlpha + ')');
    leftZone.addColorStop(1, 'transparent');
    ctx.fillStyle = leftZone;
    ctx.fillRect(0, canvas.height - 60, canvas.width / 2, 60);

    const rightZone = ctx.createLinearGradient(canvas.width / 2, canvas.height - 60, canvas.width, canvas.height - 60);
    rightZone.addColorStop(0, 'transparent');
    rightZone.addColorStop(1, 'rgba(255, 224, 100, ' + zoneAlpha + ')');
    ctx.fillStyle = rightZone;
    ctx.fillRect(canvas.width / 2, canvas.height - 60, canvas.width / 2, 60);

    // Draw orbs
    for (const orb of orbs) drawOrb(orb);

    // Draw particles
    drawParticles();

    // Draw keeper
    drawKeeper();

    // Balance warning flash
    if (balance < BALANCE_DANGER || balance > 100 - BALANCE_DANGER) {
      const flashAlpha = 0.1 + Math.sin(elapsed * 8) * 0.05;
      ctx.fillStyle = 'rgba(230, 57, 70, ' + flashAlpha + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(gameLoop);
  }

  // --- Start / End ---
  function startGame() {
    score = 0;
    level = 1;
    balance = 50;
    elapsed = 0;
    spawnTimer = 0;
    orbs = [];
    particles = [];
    scoreEl.textContent = '0';
    levelEl.textContent = '1';
    timerEl.textContent = '0:00';
    updateBalanceDisplay();

    keeper.x = canvas.width / 2;
    keeper.y = canvas.height - 40;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    running = true;
    lastTime = performance.now();
    canvas.focus();
    requestAnimationFrame(gameLoop);
  }

  function endGame() {
    running = false;
    finalScore.textContent = score;
    finalLevel.textContent = level;
    finalTime.textContent = fmtTime(elapsed);

    if (balance <= 0) {
      endTitle.textContent = 'Consumed by Shadow';
    } else if (balance >= 100) {
      endTitle.textContent = 'Blinded by Light';
    }

    gameOverScreen.classList.remove('hidden');
  }

  // --- Input handlers ---
  // Mouse
  canvas.addEventListener('mousemove', function (e) {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    keeper.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    keeper.x = Math.max(keeper.width / 2, Math.min(canvas.width - keeper.width / 2, keeper.x));
  });

  // Touch
  canvas.addEventListener('touchmove', function (e) {
    if (!running) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    keeper.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    keeper.x = Math.max(keeper.width / 2, Math.min(canvas.width - keeper.width / 2, keeper.x));
  }, { passive: false });

  canvas.addEventListener('touchstart', function (e) {
    if (!running) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    keeper.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  }, { passive: false });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
      keysDown[e.key] = true;
      if (running) e.preventDefault();
    }
  });

  document.addEventListener('keyup', function (e) {
    delete keysDown[e.key];
  });

  // Buttons
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  // Resize
  window.addEventListener('resize', resize);
  resize();

  // Draw initial idle state
  ctx.fillStyle = '#111128';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
})();
