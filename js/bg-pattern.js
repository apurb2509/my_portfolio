// bg-pattern.js
// Flowing animated background: infinite weaving sine-wave grid
// Warm brown / tan / beige tones — replaces flat bg colour

(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-pattern-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0', left: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: '0',          // sits below everything
    });
  
    // Insert as very first child of body so everything renders above it
    document.body.insertBefore(canvas, document.body.firstChild);
  
    // Also set body bg to the base dark-warm colour so there are no flashes
    document.body.style.backgroundColor = '#d8cfc4';
  
    const ctx = canvas.getContext('2d');
    let W, H;
  
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
  
    // ── Palette ──
    const BG       = '#d4c9bb';   // warm greige base — slightly darker than original
    const COLORS   = [
      'rgba(82,  60,  38,  0.18)',  // dark walnut
      'rgba(110, 84,  55,  0.13)',  // mid-brown
      'rgba(155, 125, 88,  0.10)',  // tan
      'rgba(60,  44,  28,  0.15)',  // espresso
      'rgba(190, 160, 115, 0.08)',  // pale gold
    ];
  
    // ── Wave line system ──
    // Each "band" is a flowing diagonal sine wave
    const BANDS = [];
    const BAND_COUNT = 28;
  
    function initBands() {
      BANDS.length = 0;
      for (let i = 0; i < BAND_COUNT; i++) {
        BANDS.push({
          // Spread across full diagonal span
          offset: (i / BAND_COUNT) * (W + H),
          speed:  1.0 + Math.random() * 0.6,   // flow speed
          amp:    18  + Math.random() * 32,        // wave amplitude
          freq:   0.004 + Math.random() * 0.006,  // wave frequency
          phase:  Math.random() * Math.PI * 2,    // starting phase
          phaseSpeed: 0.012 + Math.random() * 0.014, // how fast phase shifts
          color:  COLORS[i % COLORS.length],
          width:  0.8 + Math.random() * 1.2,
          dir:    i % 2 === 0 ? 1 : -1,           // alternate diagonal direction
        });
      }
    }
    initBands();
    window.addEventListener('resize', initBands);
  
    // ── Cross-hatch fine grid (static-ish, very slow drift) ──
    const GRID_LINES = [];
    const GRID_COUNT = 18;
  
    function initGrid() {
      GRID_LINES.length = 0;
      for (let i = 0; i <= GRID_COUNT; i++) {
        GRID_LINES.push({
          t: i / GRID_COUNT,
          speed: (Math.random() - 0.5) * 0.08,
          alpha: 0.04 + Math.random() * 0.04,
          width: 0.4 + Math.random() * 0.4,
        });
      }
    }
    initGrid();
  
    // ── Floating dot field ──
    const DOTS = [];
    const DOT_COUNT = 60;
    function initDots() {
      DOTS.length = 0;
      for (let i = 0; i < DOT_COUNT; i++) {
        DOTS.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.6 + Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.05 - Math.random() * 0.2,
          alpha: 0.04 + Math.random() * 0.10,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    }
    initDots();
    window.addEventListener('resize', () => { resize(); initBands(); initGrid(); initDots(); });
  
    let t = 0;
  
    function drawBand(b, t) {
      ctx.save();
      ctx.strokeStyle = b.color;
      ctx.lineWidth   = b.width;
      ctx.globalAlpha = 1;
      ctx.beginPath();
  
      const span = W + H;
      const phase = b.phase + t * b.phaseSpeed;
      const pos   = ((b.offset + t * b.speed) % span + span) % span;
  
      if (b.dir === 1) {
        // Diagonal: top-left to bottom-right orientation
        // Start on the top or left edge
        for (let s = 0; s <= span; s += 4) {
          const waveMod = Math.sin(s * b.freq + phase) * b.amp;
          const rx = (s - pos + waveMod) % (W * 2);
          const px = rx - H * 0.5;
          const py = s - px;
  
          // Map to screen: diagonal line across canvas
          const screenX = px;
          const screenY = py;
          if (s === 0) ctx.moveTo(screenX, screenY);
          else         ctx.lineTo(screenX, screenY);
        }
      } else {
        // Opposite diagonal
        for (let s = 0; s <= span; s += 4) {
          const waveMod = Math.sin(s * b.freq + phase) * b.amp;
          const rx = (pos - s + waveMod + span * 2) % (W * 2);
          const px = W - rx + H * 0.5;
          const py = s - (W - px);
          if (s === 0) ctx.moveTo(px, py);
          else         ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.restore();
    }
  
    // Simpler, reliable wave-band renderer using screen-space sampling
    function drawBandV2(b, t) {
      ctx.save();
      ctx.strokeStyle = b.color;
      ctx.lineWidth   = b.width;
      ctx.beginPath();
  
      const phase = b.phase + t * b.phaseSpeed;
      // How far along the diagonal this band sits (0..1)
      const span  = W + H;
      const pos   = ((b.offset + t * b.speed * 40) % span + span) % span;
  
      // Draw as a line going from left edge to bottom edge (or top to right)
      // by sampling x from -H to W+H
      const startX = -H;
      const endX   = W + H;
  
      for (let px = startX; px <= endX; px += 3) {
        // base y for this diagonal position
        const baseY = pos - px + (b.dir === 1 ? 0 : W - px * 2);
        const wave  = Math.sin(px * b.freq + phase) * b.amp;
        const py    = baseY + wave;
        if (px === startX) ctx.moveTo(px, py);
        else               ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }
  
    function drawGridLines(t) {
      GRID_LINES.forEach(g => {
        const pos = ((g.t + t * g.speed * 0.01) % 1 + 1) % 1;
        ctx.save();
        ctx.strokeStyle = `rgba(72, 52, 32, ${g.alpha})`;
        ctx.lineWidth = g.width;
        ctx.beginPath();
        // Horizontal slow drift
        const y = pos * H;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.restore();
      });
    }
  
    function drawDots(t) {
      DOTS.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.pulse += d.pulseSpeed;
        if (d.y < -5)  d.y = H + 5;
        if (d.x < -5)  d.x = W + 5;
        if (d.x > W+5) d.x = -5;
        const a = d.alpha * (0.6 + 0.4 * Math.sin(d.pulse));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(65, 45, 28, 1)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  
    // ── Organic mesh: a grid of slowly shifting nodes connected by lines ──
    const MESH_COLS = 9;
    const MESH_ROWS = 7;
    const meshNodes = [];
  
    function initMesh() {
      meshNodes.length = 0;
      for (let row = 0; row <= MESH_ROWS; row++) {
        for (let col = 0; col <= MESH_COLS; col++) {
          meshNodes.push({
            bx: (col / MESH_COLS) * W,  // base x
            by: (row / MESH_ROWS) * H,  // base y
            ox: (Math.random() - 0.5) * 60,  // random offset
            oy: (Math.random() - 0.5) * 60,
            sx: 0.3 + Math.random() * 0.4,   // oscillation speed
            sy: 0.25 + Math.random() * 0.35,
            px: Math.random() * Math.PI * 2, // phase
            py: Math.random() * Math.PI * 2,
          });
        }
      }
    }
    initMesh();
    window.addEventListener('resize', () => {
      meshNodes.forEach((n, i) => {
        const col = i % (MESH_COLS + 1);
        const row = Math.floor(i / (MESH_COLS + 1));
        n.bx = (col / MESH_COLS) * W;
        n.by = (row / MESH_ROWS) * H;
      });
    });
  
    function getNode(row, col) {
      const n = meshNodes[row * (MESH_COLS + 1) + col];
      return {
        x: n.bx + n.ox * Math.sin(t * n.sx + n.px),
        y: n.by + n.oy * Math.sin(t * n.sy + n.py),
      };
    }
  
    function drawMesh() {
      ctx.save();
      ctx.strokeStyle = 'rgba(72, 50, 30, 0.055)';
      ctx.lineWidth = 0.6;
  
      // Horizontal mesh lines
      for (let row = 0; row <= MESH_ROWS; row++) {
        ctx.beginPath();
        for (let col = 0; col <= MESH_COLS; col++) {
          const n = getNode(row, col);
          if (col === 0) ctx.moveTo(n.x, n.y);
          else           ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }
  
      // Vertical mesh lines
      for (let col = 0; col <= MESH_COLS; col++) {
        ctx.beginPath();
        for (let row = 0; row <= MESH_ROWS; row++) {
          const n = getNode(row, col);
          if (row === 0) ctx.moveTo(n.x, n.y);
          else           ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }
  
      ctx.restore();
    }
  
    function loop() {
      t += 0.008;
  
      // Fill base bg
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
  
      // Organic mesh beneath everything
      drawMesh();
  
      // Drifting diagonal wave bands
      BANDS.forEach(b => drawBandV2(b, t));
  
      // Slow horizontal grid shimmer
      drawGridLines(t);
  
      // Floating dust dots
      drawDots(t);
  
      requestAnimationFrame(loop);
    }
  
    loop();
  })();