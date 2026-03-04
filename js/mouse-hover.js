// mouse-hover.js
// Darker zebra-stripe ripple effect + brown custom cursor

(function () {
  /* ─── Canvas setup ─── */
  const canvas = document.createElement("canvas");
  canvas.id = "zebra-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0", left: "0",
    width: "100vw", height: "100vh",
    pointerEvents: "none",
    zIndex: "9997",
  });
  document.body.appendChild(canvas);

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
  });

  /* ─── Stripe palette — darker warm browns/tans ─── */
  const stripeColors = [
    "rgba(55, 40, 28, 0.11)",    // deep espresso
    "rgba(90, 68, 48, 0.09)",    // dark walnut
    "rgba(130, 100, 70, 0.08)",  // mid-tan
    "rgba(55, 40, 28, 0.07)",
    "rgba(72, 56, 40, 0.10)",
  ];

  const ripples = [];
  let mouseX = -999, mouseY = -999;
  let lastX = -999, lastY = -999;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      ripples.push({
        x: mouseX, y: mouseY,
        radius: 0,
        maxRadius: 200 + Math.random() * 100,
        speed: 2.8 + Math.random() * 1.4,
        alpha: 1,
        stripeWidth: 9 + Math.random() * 7,
        angle: -45 + (Math.random() - 0.5) * 20, // slight angle variation
        colorIndex: Math.floor(Math.random() * stripeColors.length),
      });
      lastX = mouseX;
      lastY = mouseY;
      if (ripples.length > 20) ripples.shift();
    }
  });

  function drawZebraRipple(r) {
    const { x, y, radius, stripeWidth, colorIndex, angle } = r;
    const color = stripeColors[colorIndex];

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.globalAlpha = r.alpha * 0.9;
    ctx.strokeStyle = color;
    ctx.lineWidth = stripeWidth;

    // Rotate stripe direction slightly per ripple
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-x, -y);

    const size = radius * 2 + 60;
    const startX = x - radius - 30;
    const startY = y - radius - 30;
    const count = Math.ceil(size / (stripeWidth * 2)) + 2;

    for (let i = -count; i <= count * 2; i++) {
      const offset = i * stripeWidth * 2;
      ctx.beginPath();
      ctx.moveTo(startX + offset, startY);
      ctx.lineTo(startX + offset + size, startY + size);
      ctx.stroke();
    }
    ctx.restore();

    // Soft edge glow ring
    ctx.save();
    ctx.globalAlpha = r.alpha * 0.06;
    const grad = ctx.createRadialGradient(x, y, radius * 0.65, x, y, radius);
    grad.addColorStop(0, "rgba(55, 40, 28, 0)");
    grad.addColorStop(0.6, "rgba(55, 40, 28, 0.2)");
    grad.addColorStop(1, "rgba(55, 40, 28, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.alpha <= 0) { ripples.splice(i, 1); continue; }
      drawZebraRipple(r);
    }
    requestAnimationFrame(animate);
  }
  animate();
})();