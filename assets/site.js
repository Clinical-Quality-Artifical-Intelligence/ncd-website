(function () {
  // Sticky header separation once scrolled
  var topBar = document.querySelector('.top');
  if (topBar) {
    function syncHeader() {
      topBar.classList.toggle('scrolled', window.scrollY > 12);
    }
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  // Mobile menu with state label and Escape key support
  var btn = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (btn && nav) {
    function setMenu(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    }
    btn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        btn.focus();
      }
    });
  }

  // Prompt Cycle tabs (WAI-ARIA tabs pattern)
  var list = document.querySelector('[data-cycle] [role="tablist"]');
  var tabs = list ? [].slice.call(list.querySelectorAll('[role="tab"]')) : [];
  function selectTab(t, focusTab) {
    if (!t) return;
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(x.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focusTab !== false) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t, true); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  // Hero wheel nodes jump smoothly to the matching Prompt Cycle step
  var wheelNodes = document.querySelectorAll('.wheel .node[data-step]');
  wheelNodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var tab = document.getElementById(node.getAttribute('data-step'));
      var section = document.getElementById('cycle');
      if (tab) selectTab(tab, false);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Interactive 3D perspective tilt on cards (desktop pointers only; respects reduced motion)
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    var TILT_SELECTOR = '.card, .person, .road li, .feature, .steps button';
    var activeCard = null;

    function resetCard(el) {
      if (!el) return;
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var target = e.target && e.target.closest ? e.target.closest(TILT_SELECTOR) : null;
      if (activeCard && activeCard !== target) {
        resetCard(activeCard);
        activeCard = null;
      }
      if (!target) return;
      activeCard = target;
      var rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var maxTilt = target.classList.contains('feature') ? 3.5 : 8;
      var rx = ((0.5 - py) * maxTilt).toFixed(2);
      var ry = ((px - 0.5) * maxTilt).toFixed(2);
      target.style.setProperty('--rx', rx + 'deg');
      target.style.setProperty('--ry', ry + 'deg');
    }, { passive: true });

    document.addEventListener('pointerout', function (e) {
      if (activeCard && (!e.relatedTarget || !activeCard.contains(e.relatedTarget))) {
        resetCard(activeCard);
        activeCard = null;
      }
    });
  }

  // Fullscreen autoplay launcher for "The Arrival" (delegates click gesture via allow="autoplay; fullscreen")
  var filmTriggers = document.querySelectorAll('[data-open-film]');
  var activeModal = null, lastTrigger = null;
  function closeFilmModal() {
    if (!activeModal) return;
    activeModal.remove();
    activeModal = null;
    document.body.style.overflow = '';
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }
  function openFilmModal(trigger) {
    if (activeModal) return;
    lastTrigger = trigger;
    var modal = document.createElement('div');
    modal.className = 'film-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'The Arrival — Interactive Film');
    modal.innerHTML =
      '<div class="film-bar">' +
        '<button type="button" data-close-film aria-label="Close presentation">\u2715 Close</button>' +
        '<a href="https://future.nursingcitizendevelopment.com/" target="_blank" rel="noopener">Open in new tab \u2197</a>' +
      '</div>' +
      '<iframe src="https://future.nursingcitizendevelopment.com/?embed=1" allow="autoplay; fullscreen" allowfullscreen title="The Arrival — The Future of Nursing Citizen Development"></iframe>';
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;
    var closeBtn = modal.querySelector('[data-close-film]');
    if (closeBtn) closeBtn.addEventListener('click', closeFilmModal);
  }
  filmTriggers.forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0)) return;
      e.preventDefault();
      openFilmModal(el);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeModal) {
      e.preventDefault();
      closeFilmModal();
    }
  });
})();
