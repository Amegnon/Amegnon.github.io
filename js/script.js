(function () {
  var body = document.body;
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  var scrollTopBtn = document.getElementById('scroll-top');
  var sidebar = document.getElementById('sidebar');

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
    if (activeNav) activeNav.classList.add('active');
  }

  if (sidebar) {
    var sidebarState = localStorage.getItem('portfolio-sidebar');
    if (sidebarState === 'collapsed') {
      body.classList.add('sidebar-collapsed');
    }

    var sidebarToggleBtn = document.createElement('button');
    sidebarToggleBtn.id = 'sidebar-collapse-toggle';
    sidebarToggleBtn.setAttribute('aria-label', 'Rabattre le menu lateral');
    sidebarToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    sidebar.appendChild(sidebarToggleBtn);

    sidebarToggleBtn.addEventListener('click', function () {
      body.classList.toggle('sidebar-collapsed');
      localStorage.setItem(
        'portfolio-sidebar',
        body.classList.contains('sidebar-collapsed') ? 'collapsed' : 'expanded'
      );
    });

    addClickFeedback(sidebarToggleBtn);
  }

  var clickable = document.querySelectorAll('.interactive-card, #sidebar nav a, #scroll-top');
  clickable.forEach(addClickFeedback);

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

  function createCertificationCard(item) {
    var card = document.createElement('article');
    card.className = 'certification-card interactive-card';

    var imageWrap = document.createElement('div');
    imageWrap.className = 'cert-image';

    var image = document.createElement('img');
    image.src = item.image || 'assets/certifications/ejpt-placeholder.svg';
    image.alt = item.image_alt || item.title || 'Certification';
    image.loading = 'lazy';
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

  loadCertificationsFromJson();
})();
