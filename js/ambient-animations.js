// ambient-animations.js
// Always-on subtle background animations: floating dust, drifting diagonal lines, slow warmth orbs

(function () {
    const canvas = document.createElement("canvas");
    canvas.id = "ambient-canvas";
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0", left: "0",
      width: "100vw", height: "100vh",
      pointerEvents: "none",
      zIndex: "9996",
      opacity: "1",
    });
    document.body.insertBefore(canvas, document.body.firstChild);
  
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  
    window.addEventListener("resize", () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      initParticles();
      initOrbs();
      initLines();
    });
  
    /* ── 1. Dust particles ── */
    const PARTICLE_COUNT = 55;
    const particles = [];
  
    function randBetween(a, b) { return a + Math.random() * (b - a); }
  
    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: randBetween(0, W),
          y: randBetween(0, H),
          r: randBetween(0.8, 2.6),
          alpha: randBetween(0.04, 0.14),
          vx: randBetween(-0.18, 0.18),
          vy: randBetween(-0.28, -0.06), // drift upward slowly
          pulseSpeed: randBetween(0.004, 0.012),
          pulseOffset: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5
            ? "rgba(72, 56, 38, X)"   // warm brown dust
            : "rgba(160, 130, 90, X)", // tan dust
        });
      }
    }
  
    function updateParticle(p, t) {
      p.x += p.vx;
      p.y += p.vy;
      // Wrap around
      if (p.y < -10) p.y = H + 10;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
  
      const pulse = p.alpha * (0.7 + 0.3 * Math.sin(t * p.pulseSpeed + p.pulseOffset));
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = p.color.replace("X", "1");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  
    /* ── 2. Slow warm orbs ── */
    const ORB_COUNT = 4;
    const orbs = [];
  
    function initOrbs() {
      orbs.length = 0;
      const colors = [
        [180, 140, 90],   // warm amber
        [140, 100, 65],   // tan-brown
        [200, 170, 120],  // pale gold
        [100, 75, 50],    // deep brown
      ];
      for (let i = 0; i < ORB_COUNT; i++) {
        const c = colors[i % colors.length];
        orbs.push({
          x: randBetween(W * 0.1, W * 0.9),
          y: randBetween(H * 0.1, H * 0.9),
          baseX: 0, baseY: 0,
          r: randBetween(120, 280),
          alpha: randBetween(0.022, 0.046),
          speedX: randBetween(-0.12, 0.12),
          speedY: randBetween(-0.09, 0.09),
          color: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
        });
        orbs[i].baseX = orbs[i].x;
        orbs[i].baseY = orbs[i].y;
      }
    }
  
    function updateOrb(orb, t) {
      orb.x = orb.baseX + Math.sin(t * orb.speedX * 0.5) * 80;
      orb.y = orb.baseY + Math.cos(t * orb.speedY * 0.5) * 60;
  
      ctx.save();
      ctx.globalAlpha = orb.alpha;
      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  
    /* ── 3. Drifting diagonal scan lines ── */
    const LINES = [];
    const LINE_COUNT = 5;
  
    function initLines() {
      LINES.length = 0;
      for (let i = 0; i < LINE_COUNT; i++) {
        LINES.push({
          x: randBetween(-W * 0.5, W * 1.5),
          speed: randBetween(0.15, 0.45),
          width: randBetween(0.5, 1.2),
          alpha: randBetween(0.025, 0.065),
          color: Math.random() > 0.5
            ? "rgba(72, 56, 38, 1)"
            : "rgba(120, 90, 60, 1)",
        });
      }
    }
  
    function updateLine(ln) {
      ln.x += ln.speed;
      if (ln.x > W * 1.6) {
        ln.x = -W * 0.6;
        ln.alpha = randBetween(0.025, 0.065);
      }
      ctx.save();
      ctx.globalAlpha = ln.alpha;
      ctx.strokeStyle = ln.color;
      ctx.lineWidth = ln.width;
      ctx.beginPath();
      ctx.moveTo(ln.x, 0);
      ctx.lineTo(ln.x - H, H);   // 45° diagonal
      ctx.stroke();
      ctx.restore();
    }
  
    /* ── Main loop ── */
    initParticles();
    initOrbs();
    initLines();
  
    let t = 0;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;
  
      orbs.forEach(o => updateOrb(o, t));
      LINES.forEach(l => updateLine(l));
      particles.forEach(p => updateParticle(p, t * 60));
  
      requestAnimationFrame(loop);
    }
    loop();
  })();