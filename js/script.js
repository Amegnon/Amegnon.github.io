(function () {
  var body = document.body;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var imageLightbox = null;
  var imageLightboxContent = null;
  var imageLightboxCaption = null;
  var imageLightboxClose = null;
  var lastFocusedElement = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /* ------------------------------------------------------------------
     Thème
     ------------------------------------------------------------------ */
  var themeBtn = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    var resolvedTheme = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = resolvedTheme;
    try {
      localStorage.setItem('portfolio-theme', resolvedTheme);
    } catch (error) {}
    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = resolvedTheme === 'light' ? '#fbf8f7' : '#060609';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
    });
  }

  /* ------------------------------------------------------------------
     Navigation : menu mobile, section active, état au défilement
     ------------------------------------------------------------------ */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function setMenuOpen(open) {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menuBtn.innerHTML = open
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      setMenuOpen(mobileMenu.hidden);
    });

    mobileMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenuOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (!mobileMenu.hidden && !mobileMenu.contains(event.target)) setMenuOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !mobileMenu.hidden) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });
  }

  var navLinks = document.querySelectorAll('[data-nav]');
  var sections = document.querySelectorAll('[data-section]');

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('data-nav') === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ------------------------------------------------------------------
     Apparition au défilement
     ------------------------------------------------------------------ */
  var revealNodes = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealNodes.forEach(function (node) {
      revealObserver.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add('is-in');
    });
  }

  /* ------------------------------------------------------------------
     Halo qui suit la souris sur les cartes
     ------------------------------------------------------------------ */
  if (finePointer) {
    document.addEventListener('pointermove', function (event) {
      var card = event.target.closest ? event.target.closest('.spotlight') : null;
      if (!card) return;
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Hero : inclinaison 3D du paquet de cartes, texte tapé, compteurs
     ------------------------------------------------------------------ */
  var stage = document.getElementById('stage');

  if (stage && finePointer && !reduceMotion) {
    stage.addEventListener('pointermove', function (event) {
      var rect = stage.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      stage.style.setProperty('--ry', (x * 16).toFixed(2) + 'deg');
      stage.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
    });

    stage.addEventListener('pointerleave', function () {
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    });
  }

  var typed = document.getElementById('typed');

  if (typed && !reduceMotion) {
    var words = [];
    try {
      words = JSON.parse(typed.getAttribute('data-words') || '[]');
    } catch (error) {}

    if (words.length > 1) {
      var wordIndex = 0;
      var charIndex = words[0].length;
      var deleting = true;

      var tick = function () {
        var word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        typed.textContent = word.slice(0, charIndex);

        var delay = deleting ? 28 : 62;
        if (!deleting && charIndex === word.length) {
          deleting = true;
          delay = 2200;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 320;
        }
        setTimeout(tick, delay);
      };

      setTimeout(tick, 2600);
    }
  }

  function animateCount(node) {
    var target = parseInt(node.getAttribute('data-count'), 10);
    if (!target || reduceMotion) return;
    var start = null;
    var duration = 1100;

    function frame(now) {
      if (start === null) start = now;
      var progress = clamp((now - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }

    node.textContent = '0';
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (node) {
      countObserver.observe(node);
    });
  }

  /* ------------------------------------------------------------------
     Défilement : barre de progression, nav, retour en haut,
     profondeur des cartes projets empilées
     ------------------------------------------------------------------ */
  var progressBar = document.querySelector('.progress');
  var scrollTopBtn = document.getElementById('scroll-top');
  var stackCards = Array.prototype.slice.call(document.querySelectorAll('.stack__card'));
  var scrollTicking = false;

  function updateStack() {
    if (!stackCards.length) return;
    var viewport = window.innerHeight;

    // Part de chaque carte déjà arrivée à sa position collante (0 → 1)
    var arrived = stackCards.map(function (card) {
      var style = getComputedStyle(card);
      if (style.position !== 'sticky') return 0;
      var stickyTop = parseFloat(style.top) || 0;
      var distance = card.getBoundingClientRect().top - stickyTop;
      return clamp(1 - distance / (viewport * 0.55), 0, 1);
    });

    stackCards.forEach(function (card, index) {
      var depth = 0;
      for (var next = index + 1; next < arrived.length; next += 1) depth += arrived[next];
      card.firstElementChild.style.setProperty('--depth', depth.toFixed(3));
    });
  }

  function onScroll() {
    scrollTicking = false;
    var scrolled = window.scrollY || window.pageYOffset;
    var max = root.scrollHeight - window.innerHeight;

    if (progressBar) progressBar.style.setProperty('--progress', max > 0 ? (scrolled / max).toFixed(4) : '0');
    if (nav) nav.classList.toggle('is-scrolled', scrolled > 12);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrolled > 480);
    updateStack();
  }

  function requestScrollUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     Copie de l'e-mail
     ------------------------------------------------------------------ */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.lastElementChild.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-on');
    }, 2200);
  }

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () {
          showToast('Adresse e-mail copiée');
        }).catch(function () {
          showToast(value);
        });
      } else {
        showToast(value);
      }
    });
  });

  var yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------
     Visionneuse d'image
     ------------------------------------------------------------------ */
  function ensureImageLightbox() {
    if (imageLightbox) return;

    imageLightbox = document.createElement('div');
    imageLightbox.className = 'image-lightbox';
    imageLightbox.setAttribute('aria-hidden', 'true');

    var dialog = document.createElement('div');
    dialog.className = 'image-lightbox-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'Aperçu de l\'image');

    imageLightboxClose = document.createElement('button');
    imageLightboxClose.type = 'button';
    imageLightboxClose.className = 'image-lightbox-close';
    imageLightboxClose.setAttribute('aria-label', 'Fermer l\'image');
    imageLightboxClose.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

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
    imageLightboxContent.removeAttribute('src');
    imageLightboxContent.alt = 'Image agrandie';
    imageLightboxCaption.textContent = '';
    body.classList.remove('lightbox-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function makeImageZoomable(imageEl, label) {
    if (!imageEl) return;

    imageEl.setAttribute('tabindex', '0');
    imageEl.setAttribute('role', 'button');
    imageEl.setAttribute('aria-label', label || 'Agrandir l\'image');

    imageEl.addEventListener('click', function () {
      openImageLightbox(imageEl.currentSrc || imageEl.src, imageEl.alt || label);
    });

    imageEl.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImageLightbox(imageEl.currentSrc || imageEl.src, imageEl.alt || label);
      }
    });
  }

  makeImageZoomable(document.getElementById('profile-photo'), 'Agrandir la photo de profil');

  /* ------------------------------------------------------------------
     Certifications (data/certifications.json, repli sur le JSON inline)
     ------------------------------------------------------------------ */
  function createCertificationCard(item, index, total) {
    var card = document.createElement('article');
    card.className = 'cert';

    // Position dans l'éventail : --o (écart signé au centre), --a (écart absolu)
    var offset = index - (total - 1) / 2;
    card.style.setProperty('--o', String(offset));
    card.style.setProperty('--a', String(Math.abs(offset)));

    var imageWrap = document.createElement('div');
    imageWrap.className = 'cert__media';

    var image = document.createElement('img');
    image.src = item.image || '';
    image.alt = item.image_alt || item.title || 'Certification';
    image.loading = 'lazy';
    makeImageZoomable(image, 'Agrandir : ' + (item.title || 'certification'));
    imageWrap.appendChild(image);

    var content = document.createElement('div');
    content.className = 'cert__body';

    var meta = document.createElement('p');
    meta.className = 'cert__meta';
    meta.textContent = (item.issuer || 'Organisme') + ' · ' + (item.year || 'N/A');

    var title = document.createElement('h3');
    title.className = 'cert__title';
    title.textContent = item.title || 'Certification';

    var desc = document.createElement('p');
    desc.className = 'cert__desc';
    desc.textContent = item.description || '';

    content.appendChild(meta);
    content.appendChild(title);
    content.appendChild(desc);

    if (item.link) {
      var actions = document.createElement('p');
      actions.className = 'cert__actions';

      var link = document.createElement('a');
      link.className = 'btn btn-soft btn-sm';
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = (item.link_label || 'Voir certification') + ' ';

      var icon = document.createElement('i');
      icon.className = 'fa-solid fa-arrow-up-right-from-square';
      icon.setAttribute('aria-hidden', 'true');
      link.appendChild(icon);

      actions.appendChild(link);
      content.appendChild(actions);
    }

    card.appendChild(imageWrap);
    card.appendChild(content);
    return card;
  }

  function renderCertifications(grid, certifications) {
    grid.innerHTML = '';
    grid.style.setProperty('--n', String(certifications.length));
    certifications.forEach(function (item, index) {
      grid.appendChild(createCertificationCard(item, index, certifications.length));
    });

    var statNode = document.getElementById('stat-certs');
    if (statNode) {
      statNode.setAttribute('data-count', String(certifications.length));
      statNode.textContent = String(certifications.length);
    }
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

  function loadCertifications() {
    var grid = document.getElementById('certifications-grid');
    if (!grid) return;

    // Rendu immédiat depuis le JSON inline, puis mise à jour si le fichier diffère
    var fallbackCertifications = readInlineCertificationsFallback();
    if (fallbackCertifications && fallbackCertifications.length) {
      renderCertifications(grid, fallbackCertifications);
    }

    if (!window.fetch || window.location.protocol === 'file:') return;

    fetch('data/certifications.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.certifications)) throw new Error('JSON invalide');
        if (JSON.stringify(data.certifications) !== JSON.stringify(fallbackCertifications)) {
          renderCertifications(grid, data.certifications);
        }
      })
      .catch(function () {
        if (!grid.children.length) {
          grid.innerHTML = '<p class="muted">Impossible de charger les certifications.</p>';
        }
      });
  }

  loadCertifications();
})();
