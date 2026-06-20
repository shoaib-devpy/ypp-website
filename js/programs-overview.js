(() => {
  const grid = document.querySelector('[data-programs-grid]');
  if (!grid || !window.YPP_PROGRAMS) return;

  const items = [
    { key: 'wazirAzam', slug: 'program-nojawano-ka-wazir-e-azam.html' },
    { key: 'floodRehab', slug: 'program-oic.html' },
    { key: 'humanRights', slug: 'program-human-rights-education.html' },
    { key: 'democracy', slug: 'program-youth-action-for-democracy.html' },
    { key: 'umeedJawan', slug: 'program-umeed-e-jawan.html' },
    { key: 'activeCitizens', slug: 'program-active-citizens.html' }
  ];

  grid.innerHTML = items.map((item, index) => {
    const program = window.YPP_PROGRAMS[item.key];
    return `
      <a class="content-card program-link-card reveal" href="${item.slug}">
        <span class="num">0${index + 1}</span>
        <h3>${program.title}</h3>
        <p>${program.lead}</p>
        <p style="margin-top:18px;color:var(--primary);font-weight:800">Open page →</p>
      </a>
    `;
  }).join('');

  window.observeReveals?.(grid);
})();
