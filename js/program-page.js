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
          const vidId = item.videoId || (item.href?.match(/[?&]v=([^&]+)/)?.[1]) || '';
          const thumbUrl = vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : '';
          return `
            <article class="report-card program-video-card reveal">
              <div class="program-video-media yt-thumb" data-yt="${vidId}" style="cursor:pointer">
                <img src="${thumbUrl}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;display:block" />
                <button class="yt-play" aria-label="Play video" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:68px;height:48px;border:0;background:none;cursor:pointer;padding:0"><svg viewBox="0 0 68 48"><path d="M66.5 7.7s-.7-4.7-2.8-6.8C60.7-2 57.2-2 55.6-2.2 46.4-3 34-3 34-3s-12.4 0-21.6 1C10.8-1.8 7.3-1.8 4.3 1.1 2.2 3.2 1.5 7.9 1.5 7.9S.8 13.4.8 19v5.2c0 5.6.7 11.1.7 11.1s.7 4.7 2.8 6.8c3 3 7 2.9 8.7 3.2 6.3.6 26.8.9 26.8.9s12.4 0 21.6-1c1.6-.2 5.1-.2 8.1-3.1 2.1-2.1 2.8-6.8 2.8-6.8s.7-5.5.7-11.1V19c0-5.6-.7-11.3-.7-11.3z" fill="#212121" fill-opacity=".8"/><path d="M45 24 27 14v20" fill="#fff"/></svg></button>
              </div>
              <div class="program-video-body">
                <h3>${item.title}</h3>
                <p>${item.text}</p>
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

  document.querySelectorAll('.yt-thumb[data-yt]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const id = thumb.dataset.yt;
      if (id) window.open('https://www.youtube.com/watch?v=' + id, '_blank');
    });
  });
})();
