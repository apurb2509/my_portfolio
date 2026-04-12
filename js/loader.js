// loader.js
// Page loader — shows elegant name reveal, hides when page is ready

(function () {
  // Create loader HTML
  const loader = document.createElement('div');
  loader.id = 'page-loader';

  const name = 'APURB';
  const letters = name.split('').map((ch, i) =>
    `<span class="loader-letter${i === 0 || i === 4 ? ' accent' : ''}" data-i="${i}">${ch}</span>`
  ).join('');

  loader.innerHTML = `
    <div class="loader-name">${letters}</div>
    <p class="loader-tagline">Full-Stack Developer &nbsp;·&nbsp; GenAI Engineer</p>
    <div class="loader-progress-wrap">
      <div class="loader-progress-bar" id="loader-bar"></div>
    </div>
  `;

  // Insert as first child
  document.documentElement.appendChild(loader);

  const bar      = loader.querySelector('#loader-bar');
  const tagline  = loader.querySelector('.loader-tagline');
  const letters_ = loader.querySelectorAll('.loader-letter');

  // Animate progress bar
  let progress = 0;
  const barInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, 85);
    bar.style.width = progress + '%';
  }, 120);

  // Stagger letter entrance
  letters_.forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, 120 + i * 80);
  });

  // Show tagline
  setTimeout(() => tagline.classList.add('visible'), 450);

  // Hide loader function
  let hidden = false;
  function hideLoader() {
    if (hidden) return;
    hidden = true;

    clearInterval(barInterval);
    bar.style.transition = 'width 0.25s ease';
    bar.style.width = '100%';

    setTimeout(() => {
      loader.classList.add('loader-hidden');
      // Remove from DOM after transition
      setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 700);
    }, 300);
  }

  // Hide when page fully loads
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 600));
  }

  // Fallback: hide after 3s max regardless
  setTimeout(hideLoader, 3000);

  // Expose globally so other modules can trigger early hide
  window.hideLoader = hideLoader;
})();
