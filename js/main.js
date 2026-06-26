const root = document.documentElement;
const progress = document.querySelector('.progress');
const cursorGlow = document.querySelector('.cursor-glow');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const navDropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.YPP = window.YPP || {};
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isHomePage = currentPage === 'index.html' || currentPage === '';
const memberModal = document.querySelector('[data-member-modal]');
const memberModalTriggers = document.querySelectorAll('[data-open-member-modal]');
const memberModalCloseTargets = document.querySelectorAll('[data-member-modal-close]');
const memberForm = memberModal?.querySelector('.member-form');
let memberModalLastFocus = null;
let memberModalCloseTimer = null;

window.YPP.buildYouTubeEmbedUrl = (input) => {
  if (!input) return '';
  if (!input.startsWith('http')) {
    return `https://www.youtube-nocookie.com/embed/${input}`;
  }

  try {
    const url = new URL(input);
    const videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
};

function closeDropdowns(){
  document.querySelectorAll('.nav-dropdown.open').forEach((dropdown) => {
    dropdown.classList.remove('open');
    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
}

function syncProgramMenus(){
  fetch('/api/programs').then(r => r.json()).then(programs => {
    document.querySelectorAll('.nav-dropdown-menu[data-programs]').forEach((menu) => {
      menu.innerHTML = programs.map(p => {
        const href = `${p.slug}.html`;
        const active = window.location.pathname.endsWith(href);
        return `<a${active ? ' class="active"' : ''} href="${href}">${p.title.replace(/\s*\(\d{4}\)$/, '')}</a>`;
      }).join('');
    });
  }).catch(() => {});
}

function syncHeaderState(){
  const brand = document.querySelector('.site-header .brand');
  if (brand && !isHomePage) {
    brand.setAttribute('href', 'index.html');
  }

  document.querySelectorAll('.site-header .nav > a, .site-header .nav > .nav-dropdown > .nav-dropdown-toggle').forEach((item) => {
    item.classList.remove('active');
  });

  const activeSelectorMap = [
    { match: ['about.html'], selector: '.site-header .nav > a[href="about.html"]' },
    { match: ['programs.html'], selector: '.site-header .nav > .nav-dropdown > .nav-dropdown-toggle' },
    { match: ['reports.html'], selector: '.site-header .nav > a[href="reports.html"]' },
    { match: ['gallery.html'], selector: '.site-header .nav > a[href="gallery.html"]' },
    { match: ['verify.html', 'verification.html'], selector: '.site-header .nav > a[href="verify.html"]' }
  ];

  const programPageMatch = /^program-(active-citizens|oic|human-rights-education|youth-action-for-democracy|umeed-e-jawan|nojawano-ka-wazir-e-azam)\.html$/.test(currentPage);
  if (programPageMatch) {
    document.querySelector('.site-header .nav > .nav-dropdown > .nav-dropdown-toggle')?.classList.add('active');
  } else {
    const mapping = activeSelectorMap.find(({ match }) => match.includes(currentPage));
    if (mapping) {
      document.querySelector(mapping.selector)?.classList.add('active');
    }
  }
}

function openMemberModal(){
  if (!memberModal) return;
  if (memberModalCloseTimer) {
    clearTimeout(memberModalCloseTimer);
    memberModalCloseTimer = null;
  }
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#join-member`);
  memberModalLastFocus = document.activeElement;
  memberModal.hidden = false;
  memberModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => memberModal.classList.add('open'));
  const firstField = memberModal.querySelector('input, select, textarea, button');
  firstField?.focus();
}

function closeMemberModal(){
  if (!memberModal || memberModal.hidden) return;
  memberModal.classList.remove('open');
  memberModal.setAttribute('aria-hidden', 'true');
  if (memberModalCloseTimer) clearTimeout(memberModalCloseTimer);
  memberModalCloseTimer = window.setTimeout(() => {
    memberModal.hidden = true;
    document.body.classList.remove('modal-open');
    memberForm?.classList.remove('submitted');
    memberForm?.reset();
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    if (memberModalLastFocus instanceof HTMLElement) {
      memberModalLastFocus.focus();
    }
    memberModalCloseTimer = null;
  }, 250);
}

memberModalTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (memberModal) {
      openMemberModal();
      return;
    }
    window.location.href = 'index.html#join-member';
  });
});

memberModalCloseTargets.forEach((target) => {
  target.addEventListener('click', closeMemberModal);
});

memberModal?.addEventListener('click', (event) => {
  if (event.target === memberModal) {
    closeMemberModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && memberModal && !memberModal.hidden) {
    closeMemberModal();
  }
});

memberForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!memberForm.checkValidity()) {
    memberForm.reportValidity();
    return;
  }

  const btn = memberForm.querySelector('button[type="submit"]');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    // Upload photo
    let photoPath = null;
    const photoInput = memberForm.querySelector('input[type="file"][accept="image/*"]');
    if (photoInput?.files[0]) {
      const fd = new FormData();
      fd.append('file', photoInput.files[0]);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      photoPath = upData.path;
    }

    // Upload CV
    let cvPath = null;
    const cvInput = memberForm.querySelector('input[type="file"][accept=".pdf,.doc,.docx"]');
    if (cvInput?.files[0]) {
      const fd = new FormData();
      fd.append('file', cvInput.files[0]);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      cvPath = upData.path;
    }

    const data = {
      full_name: memberForm.querySelector('[name="fullName"]')?.value,
      father_name: memberForm.querySelector('[name="fatherName"]')?.value,
      cnic: memberForm.querySelector('[name="identityNumber"]')?.value,
      province: memberForm.querySelector('[name="province"]')?.value,
      city: memberForm.querySelector('[name="city"]')?.value,
      country_code: memberForm.querySelector('[name="countryCode"]')?.value,
      phone: memberForm.querySelector('[name="contactNumber"]')?.value,
      email: memberForm.querySelector('[name="emailAddress"]')?.value,
      blood_group: memberForm.querySelector('[name="bloodGroup"]')?.value,
      profession: memberForm.querySelector('[name="profession"]')?.value,
      why_join: memberForm.querySelector('[name="whyJoin"]')?.value,
      mail_address: memberForm.querySelector('[name="mailAddress"]')?.value,
      photo_path: photoPath,
      cv_path: cvPath,
    };

    await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    closeMemberModal();
    // Show success modal
    const successModal = document.createElement('div');
    successModal.style.cssText = 'position:fixed;inset:0;z-index:400;display:grid;place-items:center;background:rgba(0,0,0,.5);backdrop-filter:blur(8px)';
    successModal.innerHTML = `<div style="max-width:440px;padding:40px;background:#fff;border-radius:28px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.2)">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(46,125,50,.1);display:grid;place-items:center;margin:0 auto 20px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2 style="margin:0 0 10px;font-size:22px;font-weight:800">Application Submitted!</h2>
      <p style="margin:0 0 24px;color:#666;line-height:1.6">Thank you! Your membership application has been received. We'll review and get back to you soon.</p>
      <button onclick="this.closest('div[style]').parentElement.remove()" style="padding:14px 36px;border-radius:999px;border:0;background:#d4a200;color:#1a1a1a;font-weight:800;font-size:15px;cursor:pointer">Done</button>
    </div>`;
    document.body.appendChild(successModal);
    successModal.addEventListener('click', (e) => { if (e.target === successModal) successModal.remove(); });
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }

  btn.textContent = 'Submit Application';
  btn.disabled = false;
});

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
  if(!isOpen) closeDropdowns();
});
nav?.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !nav.contains(link)) return;
  nav.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  closeDropdowns();
});

navDropdownToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const dropdown = toggle.closest('.nav-dropdown');
    const isOpen = dropdown?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('.nav-dropdown.open').forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('open');
      dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    }
  });
});

const bgSlides = document.querySelectorAll('.hero-bg-slide');
if (bgSlides.length > 1) {
  let bgCurrent = 0;
  setInterval(() => {
    bgSlides[bgCurrent].classList.remove('active');
    leaders[bgCurrent]?.classList.remove('active');
    bgCurrent = (bgCurrent + 1) % bgSlides.length;
    bgSlides[bgCurrent].classList.add('active');
    leaders[bgCurrent]?.classList.add('active');
  }, 5000);
}

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
window.observeReveals = (root = document) => {
  root.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
};
window.observeReveals(document);

syncHeaderState();
window.addEventListener('DOMContentLoaded', syncProgramMenus);
window.addEventListener('DOMContentLoaded', () => {
  if (memberModal && window.location.hash === '#join-member') {
    openMemberModal();
  }
});

function animateCounter(el){
  const target = Number(el.dataset.count || 0);
  const duration = 1600;
  const start = performance.now();
  function tick(now){
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    const suffix = el.dataset.suffix || '';
    el.textContent = (target > 999 ? value.toLocaleString() : value) + suffix;
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

const imageStack = document.getElementById('imageStack');
if (imageStack) {
  imageStack.addEventListener('click', () => {
    imageStack.classList.toggle('swapped');
  });
}
