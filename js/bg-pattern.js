// bg-pattern.js
// Lightweight CSS-driven ambient background
// Replaces the heavy canvas rAF loop with a pure CSS animated gradient

(function () {
  // Remove any existing bg canvas
  const existing = document.getElementById('bg-pattern-canvas');
  if (existing) existing.remove();

  // Set body background to our dark base
  document.body.style.backgroundColor = '#0a0a0f';

  // Inject a fixed background div with CSS animations
  const bg = document.createElement('div');
  bg.id = 'bg-ambient';
  Object.assign(bg.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '0',
    pointerEvents: 'none',
    overflow: 'hidden',
  });

  bg.innerHTML = `
    <style>
      #bg-ambient {
        background: #0a0a0f;
      }

      /* Slow-shifting radial gradients — GPU-only, zero JS cost */
      #bg-orb-1 {
        position: absolute;
        width: 70vw;
        height: 70vw;
        top: -20%;
        right: -15%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(124,58,237,0.055) 0%, transparent 65%);
        animation: orbDrift1 22s ease-in-out infinite alternate;
        will-change: transform;
      }

      #bg-orb-2 {
        position: absolute;
        width: 60vw;
        height: 60vw;
        bottom: -15%;
        left: -10%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(6,182,212,0.045) 0%, transparent 65%);
        animation: orbDrift2 28s ease-in-out infinite alternate;
        will-change: transform;
      }

      #bg-orb-3 {
        position: absolute;
        width: 40vw;
        height: 40vw;
        top: 40%;
        left: 40%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168,85,247,0.035) 0%, transparent 65%);
        animation: orbDrift3 18s ease-in-out infinite alternate;
        will-change: transform;
      }

      /* Subtle grid lines overlay */
      #bg-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
        background-size: 80px 80px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      }

      /* Noise texture for depth */
      #bg-noise {
        position: absolute;
        inset: 0;
        opacity: 0.03;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 300px 300px;
      }

      @keyframes orbDrift1 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-5%, 8%) scale(1.08); }
      }

      @keyframes orbDrift2 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(6%, -7%) scale(1.06); }
      }

      @keyframes orbDrift3 {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-8%, 5%) scale(1.1); }
      }
    </style>
    <div id="bg-orb-1"></div>
    <div id="bg-orb-2"></div>
    <div id="bg-orb-3"></div>
    <div id="bg-grid"></div>
    <div id="bg-noise"></div>
  `;

  // Insert as the very first child of body
  document.body.insertBefore(bg, document.body.firstChild);
})();