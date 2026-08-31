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

/* ===== PAGE TRANSITION ===== */
// Aplica fade in ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-enter');
  setTimeout(() => {
    document.body.classList.remove('page-enter');
  }, 500);
});

// Intercepta cliques em links internos para fade out
document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  
  if (!link) return;
  
  // Verifica se é um link interno (não abre em aba nova, não é externo)
  const href = link.getAttribute('href');
  const isInternal = href && 
                    !href.startsWith('http') && 
                    !href.startsWith('tel:') && 
                    !href.startsWith('mailto:') &&
                    !link.hasAttribute('target');
  
  if (isInternal) {
    // Ignora se for link para âncora na mesma página
    const currentPage = window.location.pathname;
    const linkPage = new URL(href, window.location.origin).pathname;
    
    if (currentPage !== linkPage) {
      event.preventDefault();
      
      // Fade out e navega
      document.body.classList.add('page-loading');
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
  }
});
