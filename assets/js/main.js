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
