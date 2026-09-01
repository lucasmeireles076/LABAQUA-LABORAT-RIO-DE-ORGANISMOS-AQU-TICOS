// Revela seções abaixo da dobra (classe .reveal) conforme entram na tela.
// Dispara uma única vez por elemento; sem IntersectionObserver, mostra tudo de imediato.
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }
}

/* ===== CRÉDITO "DESENVOLVIDO POR" ===== */
const devCredit = document.createElement('div');
devCredit.className = 'dev-credit';
devCredit.innerHTML = '<span>Desenvolvido por</span>' +
  '<a href="https://www.instagram.com/lucasmeireles.dg/" target="_blank" rel="noopener" aria-label="Instagram de Lucas Meireles">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>' +
  'Lucas Meireles</a>';
const footerWrap = document.querySelector('footer .wrap');
if (footerWrap) footerWrap.appendChild(devCredit);

/* ===== MENU MOBILE (hambúrguer lateral) =====
   Injeta o botão e o overlay via JS (em vez de editar o HTML de cada
   página) — main.js já é compartilhado por todas elas. */
const headerRight = document.querySelector('.header-right');
const mainNav = document.getElementById('mainNav');
if (headerRight && mainNav) {
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Abrir menu');
  hamburger.setAttribute('aria-controls', 'mainNav');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  headerRight.appendChild(hamburger);

  const navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  document.body.appendChild(navOverlay);

  const closeMobileNav = () => {
    mainNav.classList.remove('open');
    navOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openMobileNav = () => {
    mainNav.classList.add('open');
    navOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    mainNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  navOverlay.addEventListener('click', closeMobileNav);
  mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileNav));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMobileNav(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMobileNav(); });
}

const navButtons = document.querySelectorAll('.nav-item button.nav-top');

navButtons.forEach((btn) => {
  const item = btn.closest('.nav-item');
  const dropdown = item.querySelector('.dropdown');
  const dropdownId = dropdown ? dropdown.id || `nav-dropdown-${Math.random().toString(36).slice(2, 8)}` : null;

  if (dropdown && !dropdown.id) {
    dropdown.id = dropdownId;
  }

  if (btn && dropdownId) {
    btn.setAttribute('aria-controls', dropdownId);
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.nav-item.open').forEach((openedItem) => {
      openedItem.classList.remove('open');
      const openBtn = openedItem.querySelector('button.nav-top');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item.open').forEach((item) => {
    item.classList.remove('open');
    const btn = item.querySelector('button.nav-top');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.nav-item.open').forEach((item) => {
      item.classList.remove('open');
      const btn = item.querySelector('button.nav-top');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });

    const panel = document.getElementById('suggestPanel');
    const toggle = document.getElementById('suggestToggle');
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      if (toggle) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
});

const suggestPanel = document.getElementById('suggestPanel');
const suggestToggle = document.getElementById('suggestToggle');
const suggestForm = document.getElementById('suggestForm');
const suggestMsg = document.getElementById('suggestMsg');

if (suggestToggle && suggestPanel) {
  suggestToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = suggestPanel.classList.toggle('open');
    suggestToggle.classList.toggle('active', isOpen);
    suggestToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (event) => {
    if (!suggestPanel.contains(event.target) && event.target !== suggestToggle) {
      suggestPanel.classList.remove('open');
      suggestToggle.classList.remove('active');
      suggestToggle.setAttribute('aria-expanded', 'false');
    }
  });

  suggestPanel.addEventListener('click', (event) => event.stopPropagation());
}

if (suggestForm && suggestMsg) {
  suggestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    suggestMsg.classList.add('show');
    suggestMsg.textContent = 'Sugestão registrada por aqui — obrigado! (formulário de demonstração, ainda sem envio real)';
    suggestForm.reset();
    suggestPanel.querySelector('input, textarea')?.focus();
    setTimeout(() => {
      suggestMsg.classList.remove('show');
    }, 4500);
  });
}

/* ===== PAGE TRANSITION =====
   A transição entre páginas agora é feita pela View Transitions API nativa
   (ver @view-transition em styles.css) — o navegador cuida do crossfade
   sozinho, sem JS atrasando a navegação real com setTimeout. */
