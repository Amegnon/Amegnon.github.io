(function () {
  var body = document.body;
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  var scrollTopBtn = document.getElementById('scroll-top');
  var sidebar = document.getElementById('sidebar');
  var imageLightbox = null;
  var imageLightboxContent = null;
  var imageLightboxCaption = null;
  var imageLightboxClose = null;
  var lastFocusedElement = null;
  var updateSidebarToggleIcon = null;

  function addClickFeedback(el) {
    if (!el) return;
    el.addEventListener('pointerdown', function () {
      el.classList.add('clicked');
      setTimeout(function () {
        el.classList.remove('clicked');
      }, 170);
    });
  }

  function applyTheme(theme) {
    var resolvedTheme = theme === 'dark' ? 'dark' : 'light';
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(resolvedTheme + '-theme');
    localStorage.setItem('portfolio-theme', resolvedTheme);
  }

  var storedTheme = localStorage.getItem('portfolio-theme');
  applyTheme(storedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var nextTheme = root.classList.contains('light-theme') ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
    addClickFeedback(themeBtn);
  }

  var currentPage = body.getAttribute('data-page');
  if (currentPage) {
    var activeNav = document.querySelector('[data-nav="' + currentPage + '"]');
    if (activeNav) {
      activeNav.classList.add('active');
      if (typeof activeNav.scrollIntoView === 'function') {
        activeNav.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function isMobileSidebar() {
    if (!window.matchMedia) return false;
    return window.matchMedia('(max-width: 1100px)').matches;
  }

  function getPrimaryScrollTarget() {
    return document.querySelector('.page-header') || document.getElementById('main');
  }

  function smoothScrollTo(target) {
    if (!target) return;
    var offset = 72;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
  }

  function setSidebarCollapsed(collapsed, persist) {
    root.classList.toggle('sidebar-collapsed', collapsed);
    if (persist) {
      localStorage.setItem('portfolio-sidebar', collapsed ? 'collapsed' : 'expanded');
    }
    if (typeof updateSidebarToggleIcon === 'function') {
      updateSidebarToggleIcon();
    }
  }

  function syncSidebarMode() {
    var isMobile = isMobileSidebar();
    root.classList.toggle('sidebar-mobile', isMobile);

    if (isMobile) {
      var stored = localStorage.getItem('portfolio-sidebar');
      if (!stored) {
        setSidebarCollapsed(true, false);
      } else {
        setSidebarCollapsed(stored === 'collapsed', false);
      }
    } else {
      setSidebarCollapsed(false, false);
      localStorage.setItem('portfolio-sidebar', 'expanded');
    }
  }

  if (sidebar) {
    var sidebarState = localStorage.getItem('portfolio-sidebar');
    if (sidebarState === 'collapsed') {
      root.classList.add('sidebar-collapsed');
    }

    var sidebarToggleBtn = document.createElement('button');
    sidebarToggleBtn.id = 'sidebar-collapse-toggle';
    body.appendChild(sidebarToggleBtn);

    updateSidebarToggleIcon = function () {
      var isCollapsed = root.classList.contains('sidebar-collapsed');
      sidebarToggleBtn.innerHTML = isCollapsed
        ? '<i class="fa-solid fa-bars"></i>'
        : '<i class="fa-solid fa-xmark"></i>';
      sidebarToggleBtn.setAttribute(
        'aria-label',
        isCollapsed ? 'Ouvrir le menu lateral' : 'Fermer le menu lateral'
      );
    };

    updateSidebarToggleIcon();

    var toggleTouchActive = false;
    function handleSidebarToggle() {
      var wasCollapsed = root.classList.contains('sidebar-collapsed');
      setSidebarCollapsed(!wasCollapsed, true);
      updateSidebarToggleIcon();
    }

    sidebarToggleBtn.addEventListener('click', function (event) {
      if (toggleTouchActive) {
        toggleTouchActive = false;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      handleSidebarToggle();
    });

    sidebarToggleBtn.addEventListener('touchend', function (event) {
      toggleTouchActive = true;
      event.preventDefault();
      event.stopPropagation();
      handleSidebarToggle();
    });

    addClickFeedback(sidebarToggleBtn);
    syncSidebarMode();
    window.addEventListener('resize', syncSidebarMode);

    sidebar.addEventListener('click', function (event) {
      if (isMobileSidebar()) {
        event.stopPropagation();
      }
    });

    sidebar.addEventListener('touchend', function (event) {
      if (isMobileSidebar()) {
        event.stopPropagation();
      }
    });

    function shouldIgnoreBodyClose(event) {
      if (!event || !event.target) return false;
      var target = event.target;
      if (sidebarToggleBtn && sidebarToggleBtn.contains(target)) return true;
      if (sidebar && sidebar.contains(target)) return true;
      return false;
    }

    body.addEventListener('click', function (event) {
      if (shouldIgnoreBodyClose(event)) return;
      if (isMobileSidebar() && !root.classList.contains('sidebar-collapsed')) {
        setSidebarCollapsed(true, true);
      }
    });

    body.addEventListener('touchend', function (event) {
      if (shouldIgnoreBodyClose(event)) return;
      if (isMobileSidebar() && !root.classList.contains('sidebar-collapsed')) {
        setSidebarCollapsed(true, true);
      }
    });
  }

  var clickable = document.querySelectorAll('.interactive-card, #sidebar nav a, #scroll-top');
  clickable.forEach(addClickFeedback);

  var navLinks = document.querySelectorAll('#sidebar nav a');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href') || '';
      var targetAttr = link.getAttribute('target');
      var currentPath = (window.location.pathname || '').split('/').pop();
      var mobileView = isMobileSidebar();
      var shouldNavigate = true;
      if (href.indexOf('#') !== -1) {
        var parts = href.split('#');
        var targetId = parts[1];
        var target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          event.preventDefault();
          smoothScrollTo(target);
          if (history && history.replaceState) {
            history.replaceState(null, '', '#' + targetId);
          }
          if (mobileView && sessionStorage) {
            sessionStorage.setItem('scroll-target', targetId);
          }
          if (mobileView) {
            setSidebarCollapsed(true, true);
          }
          shouldNavigate = false;
        } else if (mobileView) {
          event.preventDefault();
          setSidebarCollapsed(true, true);
          if (targetAttr === '_blank') {
            window.open(href);
          } else {
            window.location.href = href;
          }
        }
      } else {
        if (currentPath && href === currentPath) {
          var mainTarget = getPrimaryScrollTarget();
          if (mainTarget) {
            event.preventDefault();
            smoothScrollTo(mainTarget);
          }
          shouldNavigate = false;
        }
        if (mobileView && sessionStorage) {
          sessionStorage.setItem('scroll-target', 'primary');
        }
        if (mobileView && shouldNavigate) {
          event.preventDefault();
          setSidebarCollapsed(true, true);
          if (targetAttr === '_blank') {
            window.open(href);
          } else {
            window.location.href = href;
          }
        }
      }
      if (typeof link.scrollIntoView === 'function') {
        link.scrollIntoView({ block: 'nearest' });
      }
    });
  });

  if (sessionStorage) {
    var pendingScrollTarget = sessionStorage.getItem('scroll-target');
    if (pendingScrollTarget) {
      if (isMobileSidebar()) {
        sessionStorage.removeItem('scroll-target');
        var resolvedTarget = pendingScrollTarget === 'primary'
          ? getPrimaryScrollTarget()
          : document.getElementById(pendingScrollTarget);
        if (resolvedTarget) {
          var scrollToTarget = function () {
            smoothScrollTo(resolvedTarget);
          };
          requestAnimationFrame(scrollToTarget);
          setTimeout(scrollToTarget, 180);
        }
      } else {
        sessionStorage.removeItem('scroll-target');
      }
    }
  }

  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 280) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function ensureImageLightbox() {
    if (imageLightbox) return;

    imageLightbox = document.createElement('div');
    imageLightbox.className = 'image-lightbox';
    imageLightbox.setAttribute('aria-hidden', 'true');

    var dialog = document.createElement('div');
    dialog.className = 'image-lightbox-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Apercu image');

    imageLightboxClose = document.createElement('button');
    imageLightboxClose.type = 'button';
    imageLightboxClose.className = 'image-lightbox-close';
    imageLightboxClose.setAttribute('aria-label', 'Fermer l image');
    imageLightboxClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    imageLightboxContent = document.createElement('img');
    imageLightboxContent.className = 'image-lightbox-media';
    imageLightboxContent.alt = 'Image agrandie';

    imageLightboxCaption = document.createElement('p');
    imageLightboxCaption.className = 'image-lightbox-caption';

    dialog.appendChild(imageLightboxClose);
    dialog.appendChild(imageLightboxContent);
    dialog.appendChild(imageLightboxCaption);
    imageLightbox.appendChild(dialog);
    body.appendChild(imageLightbox);

    imageLightbox.addEventListener('click', function (event) {
      if (event.target === imageLightbox) closeImageLightbox();
    });

    imageLightboxClose.addEventListener('click', closeImageLightbox);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && imageLightbox.classList.contains('open')) {
        closeImageLightbox();
      }
    });
  }

  function openImageLightbox(src, altText) {
    if (!src) return;
    ensureImageLightbox();

    imageLightboxContent.src = src;
    imageLightboxContent.alt = altText || 'Image agrandie';
    imageLightboxCaption.textContent = altText || '';
    imageLightbox.classList.add('open');
    imageLightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('lightbox-open');
    lastFocusedElement = document.activeElement;
    imageLightboxClose.focus();
  }

  function closeImageLightbox() {
    if (!imageLightbox) return;

    imageLightbox.classList.remove('open');
    imageLightbox.setAttribute('aria-hidden', 'true');
    imageLightboxContent.src = '';
    imageLightboxContent.alt = 'Image agrandie';
    imageLightboxCaption.textContent = '';
    body.classList.remove('lightbox-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function makeImageZoomable(imageEl, label) {
    if (!imageEl) return;

    imageEl.classList.add('zoomable-image');
    imageEl.setAttribute('tabindex', '0');
    imageEl.setAttribute('role', 'button');
    imageEl.setAttribute('aria-label', label || 'Agrandir l image');

    imageEl.addEventListener('click', function () {
      openImageLightbox(imageEl.src, imageEl.alt || label);
    });

    imageEl.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImageLightbox(imageEl.src, imageEl.alt || label);
      }
    });
  }

  function createCertificationCard(item) {
    var card = document.createElement('article');
    card.className = 'certification-card interactive-card';

    var imageWrap = document.createElement('div');
    imageWrap.className = 'cert-image';

    var image = document.createElement('img');
    image.src = item.image || 'assets/certifications/ejpt-placeholder.svg';
    image.alt = item.image_alt || item.title || 'Certification';
    image.loading = 'lazy';
    makeImageZoomable(image, 'Agrandir la certification');
    imageWrap.appendChild(image);

    var title = document.createElement('h3');
    title.textContent = item.title || 'Certification';

    var meta = document.createElement('p');
    meta.className = 'cert-meta';
    meta.textContent = (item.issuer || 'Organisme') + ' | ' + (item.year || 'N/A');

    var desc = document.createElement('p');
    desc.textContent = item.description || '';

    var actions = document.createElement('p');
    actions.className = 'cert-actions';

    if (item.link) {
      var link = document.createElement('a');
      link.className = 'cert-link';
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.link_label || 'Voir certification';
      actions.appendChild(link);
    }

    card.appendChild(imageWrap);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(desc);
    card.appendChild(actions);

    addClickFeedback(card);
    return card;
  }

  function renderCertifications(grid, certifications) {
    grid.innerHTML = '';
    certifications.forEach(function (item) {
      grid.appendChild(createCertificationCard(item));
    });
  }

  function readInlineCertificationsFallback() {
    var fallbackNode = document.getElementById('certifications-fallback-data');
    if (!fallbackNode) return null;

    try {
      var parsed = JSON.parse(fallbackNode.textContent || '{}');
      if (parsed && Array.isArray(parsed.certifications)) return parsed.certifications;
    } catch (error) {
      return null;
    }

    return null;
  }

  function fetchCertificationsJson() {
    var paths = [
      'data/certifications.json',
      './data/certifications.json',
      '/data/certifications.json'
    ];

    var attempt = Promise.reject(new Error('No path attempted'));
    paths.forEach(function (path) {
      attempt = attempt.catch(function () {
        return fetch(path).then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        });
      });
    });

    return attempt;
  }

  function loadCertificationsFromJson() {
    var grid = document.getElementById('certifications-grid');
    if (!grid) return;

    fetchCertificationsJson()
      .then(function (data) {
        if (!data || !Array.isArray(data.certifications)) {
          throw new Error('JSON invalide');
        }

        renderCertifications(grid, data.certifications);
      })
      .catch(function () {
        var fallbackCertifications = readInlineCertificationsFallback();
        if (fallbackCertifications && fallbackCertifications.length) {
          renderCertifications(grid, fallbackCertifications);
          return;
        }

        grid.innerHTML = '<p class="fictive-note">Impossible de charger les certifications.</p>';
      });
  }

  var profileImage = document.querySelector('.profile-image img');
  if (profileImage) {
    makeImageZoomable(profileImage, 'Agrandir la photo de profil');
  }

  loadCertificationsFromJson();
})();
