document.querySelector('#year').textContent = new Date().getFullYear();

const tickerTrack = document.querySelector('.ticker-track');
if (tickerTrack) {
  const tickerSequence = tickerTrack.querySelector('.ticker-sequence[aria-hidden="true"]');
  if (tickerSequence) {
    tickerTrack.append(tickerSequence.cloneNode(true), tickerSequence.cloneNode(true));
  }
}

const cards = document.querySelectorAll('.system-card');
cards.forEach((card) => {
  card.addEventListener('mouseenter', () => cards.forEach((item) => item.classList.toggle('active', item === card)));
  card.addEventListener('focus', () => cards.forEach((item) => item.classList.toggle('active', item === card)));
});

const floating = document.querySelectorAll('[data-float]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) {
  window.addEventListener('pointermove', ({ clientX, clientY }) => {
    const pointerX = (clientX / window.innerWidth - .5) * 2;
    const pointerY = (clientY / window.innerHeight - .5) * 2;
    floating.forEach((card) => {
      const strength = Number(card.dataset.float);
      card.style.translate = `${pointerX * strength}px ${pointerY * strength}px`;
    });
  });
}

const reveal = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (isIntersecting) target.classList.add('seen');
}), { threshold: .14 });
document.querySelectorAll('.system-card,.work-item,.proof-list > div').forEach((item) => reveal.observe(item));
