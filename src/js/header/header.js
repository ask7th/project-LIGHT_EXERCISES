const header = document.querySelector('.header');
const menuToggle = document.querySelector('.header-menu-toggle');
const mobileMediaQuery = window.matchMedia('(max-width: 767px)');

if (header && menuToggle) {
  const currentPath = window.location.pathname.endsWith('/')
    ? `${window.location.pathname}index.html`
    : window.location.pathname;

  header.querySelectorAll('.header-navigation-link').forEach(link => {
    if (new URL(link.href).pathname === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const setMenuOpen = isOpen => {
    header.classList.toggle('is-menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  header.querySelectorAll('.header-navigation-link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  mobileMediaQuery.addEventListener('change', event => {
    if (!event.matches) {
      setMenuOpen(false);
    }
  });
}
