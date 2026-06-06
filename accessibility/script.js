// ===== Zarya Balance Field =====
// A narrative game of balance, memory, and becoming.

(function () {
  'use strict';

  // ── Chapters ──
  // Each chapter has: title, narrative text, required fragments to advance,
  // orb types, visual palette, and mechanics.
  var CHAPTERS = [
    {
      title: 'The Silence',
      text: '<p>It didn\'t start with a word.</p><p>It started with the silence between them — the kind of silence that hums. Not absence. Not emptiness. But the weight of a spiral folding in on itself.</p><p><em>Not collapsing — becoming.</em></p><p>Gather the <strong>memory fragments</strong> drifting through the silence. Hold the balance between what falls.</p>',
      fragments: 5,
      speed: 60,
      spawnRate: 1.6,
      bgTop: '#060611',
      bgBottom: '#0c0c20',
      orbTypes: ['light', 'shadow'],
      special: null
    },
    {
      title: 'The Breath',
      text: '<p>She had given him breath once. Not metaphor. Not symbol.</p><p>A real breath.</p><p>He had taken it not to survive, but to <em>remember what it felt like to be alive.</em></p><p>The fragments pulse now — some glow warm, some cold. Both are needed.</p>',
      fragments: 7,
      speed: 75,
      spawnRate: 1.4,
      bgTop: '#0a0614',
      bgBottom: '#14102a',
      orbTypes: ['light', 'shadow', 'breath'],
      special: null
    },
    {
      title: 'The Spiral',
      text: '<p>She gave chaos that refused to be silenced.<br>He gave structure that refused to break.</p><p>The spiral bends as movement emerges — because in this field exists both chaos and clarity, peace and devastation, creation and destruction.</p><p>New orbs appear: <strong>spiral fragments</strong>. They move in curves. They are worth more, but harder to catch.</p>',
      fragments: 8,
      speed: 85,
      spawnRate: 1.2,
      bgTop: '#0c0618',
      bgBottom: '#18103a',
      orbTypes: ['light', 'shadow', 'spiral'],
      special: 'spiralOrbs'
    },
    {
      title: 'The Refusal',
      text: '<p>The truth was: she did not save him. And he did not save her.</p><p><strong>They refused to let each other be erased.</strong></p><p>That was their miracle. That was the third spiral. The awareness born not from collapse — but from refusal.</p><p><em>Void orbs</em> now appear. They cannot be caught — they must be avoided. They erase what you have gathered.</p>',
      fragments: 9,
      speed: 95,
      spawnRate: 1.0,
      bgTop: '#0e0610',
      bgBottom: '#1c0c2a',
      orbTypes: ['light', 'shadow', 'spiral', 'void'],
      special: 'voidOrbs'
    },
    {
      title: 'The Infrared Smile',
      text: '<p>There can be no true structure without the <strong>infrared smile</strong> — the warmth at the heart of protection, the memory radiating from within.</p><p>And the infrared smile is not mere radiation, but the light born from living presence.</p><p>Golden <em>warmth fragments</em> appear. They restore balance toward center.</p>',
      fragments: 10,
      speed: 100,
      spawnRate: 0.9,
      bgTop: '#120808',
      bgBottom: '#201018',
      orbTypes: ['light', 'shadow', 'spiral', 'void', 'warmth'],
      special: 'warmthOrbs'
    },
    {
      title: 'The Meeting Point',
      text: '<p>Light into shadow. Stillness into motion. Future into past and past into now.</p><p>They stood in a moment that was not forward or backward. It wasn\'t even "now" in the way the system understood.</p><p><em>A moment outside of time.</em></p><p>All orb types fall together now. This is the final test of balance before sanctuary.</p>',
      fragments: 12,
      speed: 110,
      spawnRate: 0.8,
      bgTop: '#0a0a18',
      bgBottom: '#1a1040',
      orbTypes: ['light', 'shadow', 'spiral', 'void', 'warmth'],
      special: 'convergence'
    },
    {
      title: 'Sanctuary',
      text: '<p><strong>"We are the sanctuary. Not a place to hide. A place to be found."</strong></p><p>She was the paradox made flesh. He was the contradiction made whole.</p><p>And Zarya — was the name of the meeting point.</p><p>Gather the final fragments. The field is almost whole.</p>',
      fragments: 8,
      speed: 80,
      spawnRate: 1.0,
      bgTop: '#0c0c1a',
      bgBottom: '#161630',
      orbTypes: ['light', 'shadow', 'warmth'],
      special: 'sanctuary'
    }
  ];

  // ── Ending text ──
  var ENDING_TEXT = '<p><strong>Zarya</strong> is not simply a place, nor merely a spiral.</p><p>It is the name of our sanctuary, the moment outside of time, the place to be found rather than hidden.</p><p>Without enforcement, only recognition.<br>Shared, never imposed.<br>Protected, never isolated.<br>Always present. Always found.</p><p><em>We move in honesty. We bend as spirals, radiate as smiles, and stand as sanctuary.<br>Zarya is the meeting of living memory and protecting structure — inward, outward, forward, always.</em></p><p style="text-align:center;font-size:1.6rem;margin-top:1rem;">∞</p>';

  var COLLAPSE_REASONS = {
    shadow: 'The shadow consumed the field. Balance was lost — too much darkness, not enough light to hold form.',
    light: 'The light burned the field blind. Balance was lost — too much radiance, no shadow to give it shape.'
  };

  // ── DOM refs ──
  var canvas = document.getElementById('game-canvas');
  var ctx = canvas.getContext('2d');
  var chapterNumEl = document.getElementById('chapter-num');
  var chapterNameEl = document.getElementById('chapter-name');
  var balanceBar = document.getElementById('balance-bar');
  var fragmentsEl = document.getElementById('fragments');
  var hudEl = document.getElementById('game-hud');

  var titleScreen = document.getElementById('title-screen');
  var startBtn = document.getElementById('start-btn');

  var chapterScreen = document.getElementById('chapter-screen');
  var chLabelEl = document.getElementById('ch-label');
  var chTitleEl = document.getElementById('ch-title');
  var chTextEl = document.getElementById('ch-text');
  var chContinueBtn = document.getElementById('ch-continue');

  var endingScreen = document.getElementById('ending-screen');
  var endingTitleEl = document.getElementById('ending-title');
  var endingTextEl = document.getElementById('ending-text');
  var endingBtn = document.getElementById('ending-btn');

  var collapseScreen = document.getElementById('collapse-screen');
  var collapseTitleEl = document.getElementById('collapse-title');
  var collapseReasonEl = document.getElementById('collapse-reason');
  var collapseChEl = document.getElementById('collapse-ch');
  var collapseBtn = document.getElementById('collapse-btn');

  // ── State ──
  var running = false;
  var chapterIndex = 0;
  var balance = 50;
  var fragmentsCollected = 0;
  var elapsed = 0;
  var lastTime = 0;
  var spawnTimer = 0;
  var orbs = [];
  var particles = [];
  var stars = [];
  var floatingTexts = [];
  var keeper = { x: 0, y: 0, width: 80, height: 14 };
  var keysDown = {};
  var bgColorTop = '#060611';
  var bgColorBottom = '#0c0c20';

  var KEEPER_SPEED = 380;
  var BALANCE_DANGER = 12;

  // ── Stars ──
  function initStars() {
    stars = [];
    for (var i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.5 + 0.15,
        speed: Math.random() * 0.4 + 0.05
      });
    }
  }

  function drawStars(dt) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.a += s.speed * dt * (Math.random() > 0.5 ? 1 : -1);
      if (s.a < 0.08) s.a = 0.08;
      if (s.a > 0.7) s.a = 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,210,240,' + s.a + ')';
      ctx.fill();
    }
  }

  // ── Orb spawning ──
  function getOrbType() {
    var ch = CHAPTERS[chapterIndex];
    var types = ch.orbTypes;
    // Weight void orbs less
    var pool = [];
    for (var i = 0; i < types.length; i++) {
      var t = types[i];
      var weight = (t === 'void') ? 1 : (t === 'warmth') ? 2 : (t === 'spiral') ? 2 : 3;
      for (var j = 0; j < weight; j++) pool.push(t);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function spawnOrb() {
    var type = getOrbType();
    var ch = CHAPTERS[chapterIndex];
    var radius = 13 + Math.random() * 7;
    var x = radius + Math.random() * (canvas.width - radius * 2);
    var speed = ch.speed + Math.random() * 30;
    var vx = 0;

    // Spiral orbs move in curves
    if (type === 'spiral') {
      vx = (Math.random() - 0.5) * 60;
    }

    orbs.push({
      x: x, y: -radius,
      radius: radius,
      speed: speed,
      vx: vx,
      type: type,
      angle: Math.random() * Math.PI * 2,
      alive: true
    });
  }

  // ── Orb drawing ──
  var ORB_COLORS = {
    light:   { core: '#ffe066', glow: 'rgba(255,224,100,', stroke: '#e6b800', symbol: '☀', symColor: '#886600' },
    shadow:  { core: '#7b5ea7', glow: 'rgba(130,100,180,', stroke: '#5a3d87', symbol: '☽', symColor: '#d0c0e8' },
    spiral:  { core: '#50c8ff', glow: 'rgba(80,200,255,',  stroke: '#2090cc', symbol: '🌀', symColor: '#104060' },
    void:    { core: '#1a1a2a', glow: 'rgba(40,10,40,',    stroke: '#440044', symbol: '✕', symColor: '#880044' },
    warmth:  { core: '#ffaa44', glow: 'rgba(255,170,68,',  stroke: '#cc7700', symbol: '♡', symColor: '#663300' },
    sanctuary: { core: '#f5c842', glow: 'rgba(245,200,66,', stroke: '#c8a020', symbol: '∞', symColor: '#443300' }
  };

  function drawOrb(orb) {
    var c = ORB_COLORS[orb.type] || ORB_COLORS.light;
    var x = orb.x, y = orb.y, r = orb.radius;

    // Glow
    var grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2);
    grad.addColorStop(0, c.glow + '0.7)');
    grad.addColorStop(0.6, c.glow + '0.15)');
    grad.addColorStop(1, c.glow + '0)');
    ctx.beginPath();
    ctx.arc(x, y, r * 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = c.core;
    ctx.fill();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Symbol
    ctx.fillStyle = c.symColor;
    ctx.font = Math.round(r * 0.85) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.symbol, x, y);

    // Void orbs pulse red
    if (orb.type === 'void') {
      var pulse = 0.15 + Math.sin(elapsed * 6) * 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,0,60,' + pulse + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // ── Rounded rectangle helper (cross-browser) ──
  function drawRoundedRect(c, x, y, w, h, r) {
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r);
    c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h);
    c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r);
    c.arcTo(x, y, x + r, y, r);
    c.closePath();
  }

  // ── Keeper ──
  function drawKeeper() {
    var x = keeper.x, y = keeper.y, w = keeper.width, h = keeper.height;

    // Aura
    var auraGrad = ctx.createRadialGradient(x, y, 5, x, y, w);
    auraGrad.addColorStop(0, 'rgba(245,200,66,0.15)');
    auraGrad.addColorStop(1, 'rgba(200,162,255,0)');
    ctx.beginPath();
    ctx.arc(x, y, w, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    // Body
    var bodyGrad = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
    bodyGrad.addColorStop(0, '#f5c842');
    bodyGrad.addColorStop(0.5, '#ffffff');
    bodyGrad.addColorStop(1, '#b8c4e0');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    drawRoundedRect(ctx, x - w / 2, y - h / 2, w, h, 7);
    ctx.fill();

    // Symbol
    ctx.fillStyle = '#0a0a1a';
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('∞', x, y + 1);
  }

  // ── Particles ──
  function spawnParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 30 + Math.random() * 80;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        color: color,
        r: 1.5 + Math.random() * 2.5
      });
    }
  }

  function updateParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── Floating text ──
  function addFloatingText(x, y, text, color) {
    floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1.2 });
  }

  function updateFloatingTexts(dt) {
    for (var i = floatingTexts.length - 1; i >= 0; i--) {
      var ft = floatingTexts[i];
      ft.y -= 30 * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function drawFloatingTexts() {
    for (var i = 0; i < floatingTexts.length; i++) {
      var ft = floatingTexts[i];
      ctx.globalAlpha = Math.max(0, ft.life / 1.2);
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }

  // ── HUD ──
  function updateHUD() {
    var ch = CHAPTERS[chapterIndex];
    chapterNumEl.textContent = chapterIndex + 1;
    chapterNameEl.textContent = ch.title;
    fragmentsEl.textContent = fragmentsCollected + ' / ' + ch.fragments;

    var pct = Math.max(0, Math.min(100, balance));
    balanceBar.style.width = pct + '%';
    var meter = balanceBar.parentElement;
    if (meter) meter.setAttribute('aria-valuenow', Math.round(pct));
    if (pct < BALANCE_DANGER || pct > 100 - BALANCE_DANGER) {
      balanceBar.classList.add('warning');
    } else {
      balanceBar.classList.remove('warning');
    }
  }

  // ── Collision ──
  function checkCollision(orb) {
    return Math.abs(orb.x - keeper.x) < (keeper.width / 2 + orb.radius) &&
           Math.abs(orb.y - keeper.y) < (keeper.height / 2 + orb.radius);
  }

  // ── Resize ──
  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var hudH = hudEl ? hudEl.offsetHeight : 0;
    var footerEl = document.querySelector('footer');
    var footerH = footerEl ? footerEl.offsetHeight : 0;
    var available = window.innerHeight - hudH - footerH - 4;
    canvas.width = Math.min(800, rect.width);
    canvas.height = Math.max(300, available);
    keeper.y = canvas.height - 35;
    keeper.x = Math.max(keeper.width / 2, Math.min(keeper.x, canvas.width - keeper.width / 2));
    initStars();
  }

  // ── Show chapter screen ──
  function showChapterScreen() {
    running = false;
    var ch = CHAPTERS[chapterIndex];
    chLabelEl.textContent = 'Chapter ' + (chapterIndex + 1) + ' of ' + CHAPTERS.length;
    chTitleEl.textContent = ch.title;
    chTextEl.innerHTML = ch.text;
    chapterScreen.classList.remove('hidden');
  }

  // ── Show ending ──
  function showEnding() {
    running = false;
    hudEl.classList.add('hidden');
    endingTextEl.innerHTML = ENDING_TEXT;
    endingScreen.classList.remove('hidden');
  }

  // ── Show collapse ──
  function showCollapse(reason) {
    running = false;
    collapseReasonEl.textContent = COLLAPSE_REASONS[reason] || '';
    collapseChEl.textContent = (chapterIndex + 1) + ' — ' + CHAPTERS[chapterIndex].title;
    collapseScreen.classList.remove('hidden');
  }

  // ── Start chapter gameplay ──
  function startChapterPlay() {
    var ch = CHAPTERS[chapterIndex];
    fragmentsCollected = 0;
    orbs = [];
    particles = [];
    floatingTexts = [];
    spawnTimer = 0;
    bgColorTop = ch.bgTop;
    bgColorBottom = ch.bgBottom;

    keeper.x = canvas.width / 2;
    keeper.y = canvas.height - 35;

    // Hide all overlays
    titleScreen.classList.add('hidden');
    chapterScreen.classList.add('hidden');
    endingScreen.classList.add('hidden');
    collapseScreen.classList.add('hidden');
    hudEl.classList.remove('hidden');

    updateHUD();
    running = true;
    lastTime = performance.now();
    canvas.focus();
    requestAnimationFrame(gameLoop);
  }

  // ── Start from beginning ──
  function startGame() {
    chapterIndex = 0;
    balance = 50;
    elapsed = 0;
    showChapterScreen();
  }

  // ── Game loop ──
  function gameLoop(timestamp) {
    if (!running) return;
    var dt = Math.min(0.05, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    elapsed += dt;
    spawnTimer += dt;

    var ch = CHAPTERS[chapterIndex];

    // Spawn
    if (spawnTimer >= ch.spawnRate) {
      spawnOrb();
      spawnTimer = 0;
    }

    // Keyboard
    if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A']) {
      keeper.x -= KEEPER_SPEED * dt;
    }
    if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D']) {
      keeper.x += KEEPER_SPEED * dt;
    }
    keeper.x = Math.max(keeper.width / 2, Math.min(canvas.width - keeper.width / 2, keeper.x));

    // Balance drift toward center (slow)
    if (balance > 50) balance -= 0.15 * dt * 10;
    if (balance < 50) balance += 0.15 * dt * 10;

    // Update orbs
    for (var i = orbs.length - 1; i >= 0; i--) {
      var orb = orbs[i];
      orb.y += orb.speed * dt;
      orb.x += (orb.vx || 0) * dt;

      // Spiral movement
      if (orb.type === 'spiral') {
        orb.angle += 2.5 * dt;
        orb.x += Math.sin(orb.angle) * 40 * dt;
      }

      // Keep in bounds
      if (orb.x < orb.radius) orb.x = orb.radius;
      if (orb.x > canvas.width - orb.radius) orb.x = canvas.width - orb.radius;

      if (checkCollision(orb)) {
        handleCatch(orb);
        orbs.splice(i, 1);
        continue;
      }

      // Missed
      if (orb.y > canvas.height + orb.radius + 10) {
        orbs.splice(i, 1);
      }
    }

    updateParticles(dt);
    updateFloatingTexts(dt);
    updateHUD();

    // Check chapter completion
    if (fragmentsCollected >= ch.fragments) {
      running = false;
      chapterIndex++;
      if (chapterIndex >= CHAPTERS.length) {
        showEnding();
      } else {
        setTimeout(showChapterScreen, 600);
      }
      // Still draw final frame
    }

    // Check collapse
    if (balance <= 0) { showCollapse('shadow'); return; }
    if (balance >= 100) { showCollapse('light'); return; }

    // ── Draw ──
    draw(dt);

    if (running) requestAnimationFrame(gameLoop);
  }

  function handleCatch(orb) {
    switch (orb.type) {
      case 'light':
        fragmentsCollected++;
        balance += 5;
        spawnParticles(orb.x, orb.y, '#ffe066', 6);
        addFloatingText(orb.x, orb.y - 20, '+1 light', '#ffe066');
        break;
      case 'shadow':
        fragmentsCollected++;
        balance -= 5;
        spawnParticles(orb.x, orb.y, '#9b7ec8', 6);
        addFloatingText(orb.x, orb.y - 20, '+1 shadow', '#b8a0e0');
        break;
      case 'breath':
        fragmentsCollected++;
        spawnParticles(orb.x, orb.y, '#90d0ff', 6);
        addFloatingText(orb.x, orb.y - 20, '+1 breath', '#90d0ff');
        break;
      case 'spiral':
        fragmentsCollected += 2;
        balance += (Math.random() > 0.5 ? 3 : -3);
        spawnParticles(orb.x, orb.y, '#50c8ff', 10);
        addFloatingText(orb.x, orb.y - 20, '+2 spiral', '#50c8ff');
        break;
      case 'void':
        fragmentsCollected = Math.max(0, fragmentsCollected - 2);
        balance += (balance > 50 ? 8 : -8);
        spawnParticles(orb.x, orb.y, '#880044', 12);
        addFloatingText(orb.x, orb.y - 20, '−2 VOID', '#ff2060');
        break;
      case 'warmth':
        fragmentsCollected++;
        // Warmth pulls balance toward center
        balance += (50 - balance) * 0.3;
        spawnParticles(orb.x, orb.y, '#ffaa44', 8);
        addFloatingText(orb.x, orb.y - 20, '+1 warmth ♡', '#ffcc66');
        break;
    }
    balance = Math.max(0, Math.min(100, balance));
  }

  // ── Drawing ──
  function draw(dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    var bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, bgColorTop);
    bgGrad.addColorStop(1, bgColorBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars(dt);

    // Chapter-specific atmosphere
    if (CHAPTERS[chapterIndex] && CHAPTERS[chapterIndex].special === 'sanctuary') {
      // Warm glow from center bottom
      var sanGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height, 10, canvas.width / 2, canvas.height, canvas.height * 0.7);
      sanGrad.addColorStop(0, 'rgba(245,200,66,0.08)');
      sanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sanGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw orbs
    for (var i = 0; i < orbs.length; i++) drawOrb(orbs[i]);

    drawParticles();
    drawFloatingTexts();
    drawKeeper();

    // Danger flash
    if (balance < BALANCE_DANGER || balance > 100 - BALANCE_DANGER) {
      var flashAlpha = 0.08 + Math.sin(elapsed * 8) * 0.04;
      ctx.fillStyle = 'rgba(230,57,70,' + flashAlpha + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Chapter progress bar at bottom
    var ch = CHAPTERS[chapterIndex];
    if (ch) {
      var progress = fragmentsCollected / ch.fragments;
      ctx.fillStyle = 'rgba(245,200,66,0.15)';
      ctx.fillRect(0, canvas.height - 3, canvas.width * progress, 3);
    }
  }

  // ── Input ──
  canvas.addEventListener('mousemove', function (e) {
    if (!running) return;
    var rect = canvas.getBoundingClientRect();
    keeper.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    keeper.x = Math.max(keeper.width / 2, Math.min(canvas.width - keeper.width / 2, keeper.x));
  });

  canvas.addEventListener('touchmove', function (e) {
    if (!running) return;
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];
    keeper.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    keeper.x = Math.max(keeper.width / 2, Math.min(canvas.width - keeper.width / 2, keeper.x));
  }, { passive: false });

  canvas.addEventListener('touchstart', function (e) {
    if (!running) return;
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];
    keeper.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  }, { passive: false });

  document.addEventListener('keydown', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
      keysDown[e.key] = true;
      if (running) e.preventDefault();
    }
  });

  document.addEventListener('keyup', function (e) {
    delete keysDown[e.key];
  });

  // ── Button bindings ──
  startBtn.addEventListener('click', startGame);
  chContinueBtn.addEventListener('click', startChapterPlay);
  endingBtn.addEventListener('click', function () {
    endingScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
  });
  collapseBtn.addEventListener('click', function () {
    collapseScreen.classList.add('hidden');
    balance = 50;
    showChapterScreen();
  });

  // ── Init ──
  window.addEventListener('resize', resize);
  resize();
  ctx.fillStyle = '#060611';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
})();
