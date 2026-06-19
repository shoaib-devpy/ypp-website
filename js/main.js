const root = document.documentElement;
const progress = document.querySelector('.progress');
const cursorGlow = document.querySelector('.cursor-glow');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateProgress(){
  const scrollTop = window.scrollY;
  const height = document.body.scrollHeight - window.innerHeight;
  progress.style.width = `${Math.max(0, Math.min(100, (scrollTop / height) * 100))}%`;
}
window.addEventListener('scroll', updateProgress, { passive:true });
updateProgress();

navToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

if(!prefersReduced && cursorGlow){
  window.addEventListener('pointermove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }, { passive:true });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold:.16, rootMargin:'0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function animateCounter(el){
  const target = Number(el.dataset.count || 0);
  const duration = 1600;
  const start = performance.now();
  function tick(now){
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    el.textContent = target > 999 ? value.toLocaleString() : value;
    if(progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold:.35 });
document.querySelectorAll('.counter-grid').forEach(el => counterObserver.observe(el));

const slides = document.querySelectorAll('.slider-slide');
const dots = document.querySelectorAll('.slider-dot');
const leaders = document.querySelectorAll('.showcase-leader');
if (slides.length > 1) {
  let current = 0;
  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    leaders[current]?.classList.remove('active');
    current = index % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    leaders[current]?.classList.add('active');
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); }));
  setInterval(() => goToSlide(current + 1), 4000);
}

if(!prefersReduced){
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * .12}px, ${y * .16}px)`;
    });
    btn.addEventListener('pointerleave', () => btn.style.transform = '');
  });
}
