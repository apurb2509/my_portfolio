(function () {
  const para = document.getElementById('bio-text');
  if (!para) return;

  const fullText = para.textContent.trim();

  para.innerHTML = fullText
    .split('')
    .map(ch =>
      ch === ' '
        ? '<span class="bio-char">&nbsp;</span>'
        : `<span class="bio-char">${ch}</span>`
    )
    .join('');

  const chars = para.querySelectorAll('.bio-char');
  let intervalId = null;
  let isRunning = false;

  function resetChars() {
    chars.forEach(c => {
      c.classList.remove('bio-char-current', 'bio-char-done');
    });
  }

  function startTypewriter() {
    if (isRunning) return;
    isRunning = true;
    resetChars();

    let i = 0;
    intervalId = setInterval(() => {
      if (i < chars.length) {
        if (i > 0) {
          chars[i - 1].classList.remove('bio-char-current');
          chars[i - 1].classList.add('bio-char-done');
        }
        chars[i].classList.add('bio-char-current');
        i++;
      } else {
        chars[chars.length - 1].classList.remove('bio-char-current');
        chars[chars.length - 1].classList.add('bio-char-done');
        clearInterval(intervalId);
        isRunning = false;
      }
    }, 30); // ← SPEED: lower = faster, higher = slower
  }

  function stopTypewriter() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      isRunning = false;
      resetChars();
    }
  }

  function checkPosition() {
    const rect = para.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    if (inView) {
      startTypewriter();
    } else {
      stopTypewriter(); // resets when scrolled away
    }
  }

  window.addEventListener('scroll', checkPosition);
  window.addEventListener('load', checkPosition);
  setTimeout(checkPosition, 500);
})();