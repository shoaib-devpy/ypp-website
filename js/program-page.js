(() => {
  const key = document.body?.dataset?.program;
  const data = window.YPP_PROGRAMS?.[key];
  if (!data) return;

  const titleEl = document.querySelector('[data-program-title]');
  const eyebrowEl = document.querySelector('[data-program-eyebrow]');
  const leadEl = document.querySelector('[data-program-lead]');
  const introEl = document.querySelector('[data-program-intro]');
  const focusEl = document.querySelector('[data-program-focus]');
  const galleryEl = document.querySelector('[data-program-gallery]');
  const videoEl = document.querySelector('[data-program-videos]');

  document.title = `${data.title} | Programs | Youth Parliament Pakistan`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', data.lead);
  if (titleEl) titleEl.innerHTML = `${data.title}`;
  if (eyebrowEl) eyebrowEl.textContent = data.eyebrow;
  if (leadEl) leadEl.textContent = data.lead;

  const introText = data.introText.map((copy) => `<p>${copy}</p>`).join('');
  if (introEl) {
    const metaLines = [];
    if (data.donor) metaLines.push({ label: data.donorLabel || 'Donor', value: data.donor });
    if (data.partner) metaLines.push({ label: data.partnerLabel || 'Partner', value: data.partner });
    introEl.innerHTML = `
      <img src="${data.heroImage}" alt="${data.heroAlt}" />
      <div>
        <p class="eyebrow">${data.eyebrow}</p>
        <h2>${data.introTitle}</h2>
        ${metaLines.map((item) => `<p class="program-partner"><strong>${item.label}:</strong> ${item.value}</p>`).join('')}
        ${introText}
      </div>
    `;
  }

  if (focusEl) {
    focusEl.innerHTML = data.focus.map((item, index) => `
      <article class="content-card reveal">
        <span class="num">0${index + 1}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>
    `).join('');
  }

  if (galleryEl) {
    galleryEl.previousElementSibling?.remove();
    galleryEl.remove();
  }

  if (videoEl) {
    if (!data.videos?.length) {
      videoEl.previousElementSibling?.remove();
      videoEl.remove();
    } else {
      videoEl.innerHTML = data.videos.map((item) => {
        const embedUrl = item.kind === 'website' ? '' : (item.embedUrl || window.YPP?.buildYouTubeEmbedUrl?.(item.videoId || item.href));
        if (embedUrl) {
          return `
            <article class="report-card program-video-card reveal">
              <div class="program-video-media">
                <iframe
                  src="${embedUrl}"
                  title="${item.title}"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>
              </div>
              <div class="program-video-body">
                <h3>${item.title}</h3>
                <p>${item.text}</p>
                ${item.href ? `<a class="program-video-source" href="${item.href}" target="_blank" rel="noopener">Open on YouTube</a>` : ''}
                <span class="report-badge">VIDEO</span>
              </div>
            </article>
          `;
        }

        const linkLabel = item.linkLabel || (item.kind === 'website' ? 'More details' : 'Open link');
        return `
          <a class="report-card reveal" href="${item.href}" target="_blank" rel="noopener">
            <div class="report-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 3h7v7"/>
                <path d="M10 14 21 3"/>
                <path d="M21 14v7h-7"/>
                <path d="M3 10V3h7"/>
              </svg>
            </div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <span class="program-video-source">${linkLabel}</span>
          </a>
        `;
      }).join('');
    }
  }

  const ctaStrip = document.querySelector('.cta-strip p');
  if (ctaStrip) {
    const totalPrograms = Object.keys(window.YPP_PROGRAMS || {}).length;
    ctaStrip.textContent = `Use the dropdown in the header to move between all ${totalPrograms} program pages.`;
  }

  window.observeReveals?.(document);
})();
