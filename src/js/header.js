const header = document.querySelector('.header');
const menuToggle = document.querySelector('.header-menu-toggle');
const mobileMediaQuery = window.matchMedia('(max-width: 767px)');

if (header && menuToggle) {
  const navigation = header.querySelector('.header-navigation-list');
  const navigationLinks = [...header.querySelectorAll('.header-navigation-link')];
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let navigationTimeoutId;

  const currentPath = window.location.pathname.endsWith('/')
    ? `${window.location.pathname}index.html`
    : window.location.pathname;

  navigationLinks.forEach(link => {
    if (new URL(link.href).pathname === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const updateActiveLinkIndicator = () => {
    const activeLink = navigation?.querySelector('[aria-current="page"]');

    if (!activeLink) {
      return;
    }

    const navigationBounds = navigation.getBoundingClientRect();
    const activeLinkBounds = activeLink.getBoundingClientRect();

    navigation.style.setProperty(
      '--active-link-offset',
      `${activeLinkBounds.left - navigationBounds.left}px`,
    );
    navigation.style.setProperty('--active-link-width', `${activeLinkBounds.width}px`);
  };

  updateActiveLinkIndicator();
  requestAnimationFrame(() => navigation?.classList.add('is-navigation-ready'));
  window.addEventListener('resize', updateActiveLinkIndicator);

  const setMenuOpen = isOpen => {
    header.classList.toggle('is-menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigationLinks.forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));

    link.addEventListener('click', event => {
      if (mobileMediaQuery.matches || reduceMotionQuery.matches) {
        return;
      }

      const currentLink = navigation?.querySelector('[aria-current="page"]');

      if (currentLink === link) {
        return;
      }

      event.preventDefault();
      window.clearTimeout(navigationTimeoutId);
      currentLink?.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'page');
      updateActiveLinkIndicator();

      navigationTimeoutId = window.setTimeout(() => {
        window.location.assign(link.href);
      }, 250);
    });
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
