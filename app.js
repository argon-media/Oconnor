/* O'Connor Detailing — interactions */
(() => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header elevation
  const header = document.getElementById('siteHeader');
  const updateHeader = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Services dropdown (click to toggle on touch)
  document.querySelectorAll('.nav-item.has-menu').forEach(item => {
    const btn = item.querySelector('.nav-link');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item.has-menu.open').forEach(item => {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        const btn = item.querySelector('.nav-link');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Mobile menu
  const mBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (mBtn && drawer) {
    mBtn.addEventListener('click', () => {
      const open = drawer.getAttribute('data-open') === 'true';
      drawer.setAttribute('data-open', String(!open));
      drawer.hidden = open; // when closing, we can hide; keep visible when open
      if (!open) drawer.removeAttribute('hidden');
      mBtn.setAttribute('aria-expanded', String(!open));
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.setAttribute('data-open', 'false');
      drawer.hidden = true;
      mBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Before/after sliders
  document.querySelectorAll('[data-ba]').forEach(wrap => {
    const input = wrap.querySelector('.ba-input');
    const apply = (v) => {
      wrap.style.setProperty('--pos', v + '%');
    };
    apply(Number(input.value));
    input.addEventListener('input', () => apply(Number(input.value)));
    // Also allow click/drag positioning over the element itself (for mobile where invisible range is fine)
  });

  // Quote form — fake submit, show success
  const form = document.getElementById('quoteForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // basic validation
      const required = form.querySelectorAll('[required]');
      for (const el of required) {
        if (!el.checkValidity()) { el.reportValidity(); return; }
      }
      form.classList.add('submitted');
      const success = form.querySelector('.form-success');
      if (success) success.hidden = false;
      // If real booking link desired:
      // window.location.href = 'https://orbisx.ca/app/booknow/VSVHh';
    });
  }

  // Smooth offset for sticky header on in-page anchor jumps
  // (CSS handles smooth, just account for header height)
  document.documentElement.style.scrollPaddingTop = 'calc(var(--header-h) + 8px)';

  // =========================================================
  // Tweaks — host-integrated edit-mode
  // =========================================================
  const TWEAKS = window.__TWEAKS__ || { accent: 'racing', headline: 'outcome', hero: 'dark', cards: 'classic' };
  const apply = (key, val) => {
    TWEAKS[key] = val;
    if (key === 'accent') document.body.dataset.accent = val;
    if (key === 'hero')   document.body.dataset.hero   = val;
    if (key === 'cards')  document.body.dataset.cards  = val;
    if (key === 'headline') {
      // Headline is authored directly in index.html. Tweak panel no longer overrides it.
      return;
    }
    // reflect active state in panel
    document.querySelectorAll('[data-accent]').forEach(b => b.classList.toggle('active', b.dataset.accent === TWEAKS.accent));
    document.querySelectorAll('[data-headline]').forEach(b => b.classList.toggle('active', b.dataset.headline === TWEAKS.headline));
    document.querySelectorAll('[data-hero]').forEach(b => b.classList.toggle('active', b.dataset.hero === TWEAKS.hero));
    document.querySelectorAll('[data-cards]').forEach(b => b.classList.toggle('active', b.dataset.cards === TWEAKS.cards));
  };
  // initial apply
  Object.keys(TWEAKS).forEach(k => apply(k, TWEAKS[k]));

  // Tweak panel wiring
  const panel = document.getElementById('tweakPanel');
  const closeBtn = document.getElementById('tweakClose');
  const showPanel = () => { panel.hidden = false; };
  const hidePanel = () => { panel.hidden = true; };
  if (closeBtn) closeBtn.addEventListener('click', hidePanel);

  document.querySelectorAll('[data-accent]').forEach(b => b.addEventListener('click', () => {
    apply('accent', b.dataset.accent);
    postEdit({ accent: b.dataset.accent });
  }));
  document.querySelectorAll('[data-headline]').forEach(b => b.addEventListener('click', () => {
    apply('headline', b.dataset.headline);
    postEdit({ headline: b.dataset.headline });
  }));
  document.querySelectorAll('[data-hero]').forEach(b => b.addEventListener('click', () => {
    apply('hero', b.dataset.hero);
    postEdit({ hero: b.dataset.hero });
  }));
  document.querySelectorAll('[data-cards]').forEach(b => b.addEventListener('click', () => {
    apply('cards', b.dataset.cards);
    postEdit({ cards: b.dataset.cards });
  }));

  function postEdit(edits) {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    } catch (e) {}
  }

  // Host edit-mode protocol
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode')   showPanel();
    if (d.type === '__deactivate_edit_mode') hidePanel();
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  // Populate YouTube video titles via oEmbed
  document.querySelectorAll('.video-card[data-yt]').forEach(card => {
    const labelEl = card.querySelector('.video-label');
    if (!labelEl || labelEl.dataset.static === 'true') return;
    const id = card.getAttribute('data-yt');
    const url = 'https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D' + encodeURIComponent(id) + '&format=json';
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.title) {
          labelEl.textContent = data.title;
          card.setAttribute('aria-label', 'Watch: ' + data.title);
        }
      })
      .catch(() => {});
  });

  // Video click-to-play facade — swap YouTube thumbnail for iframe in place
  document.querySelectorAll('.video-card[data-yt]').forEach(card => {
    card.addEventListener('click', (e) => {
      // allow cmd/ctrl/middle-click to open in new tab normally
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      const id = card.getAttribute('data-yt');
      const thumb = card.querySelector('.video-thumb');
      if (!thumb || thumb.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      thumb.innerHTML = '';
      thumb.appendChild(iframe);
    });
  });

})();
