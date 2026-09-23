/* ==========================================================================
   Stanford Evans Property Services — interactions
   Vanilla JS, no dependencies. Every block is defensive so a missing
   element on a sub-page (e.g. privacy.html) never throws.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- header */
  var header = document.getElementById('siteHeader');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------- mobile nav menu */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  if (toggle && nav) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after tapping any link inside the drawer.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { setMenu(false); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset the drawer if the viewport grows into the desktop layout.
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && nav.classList.contains('is-open')) {
        setMenu(false);
      }
    });
  }

  /* ------------------------------------------------------- scroll reveals */
  var revealables = document.querySelectorAll('.reveal');

  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(revealables, function (el) {
        el.classList.add('is-visible');
      });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var el = entry.target;
          // Stagger siblings so grids cascade instead of popping at once.
          var siblings = el.parentElement
            ? Array.prototype.filter.call(el.parentElement.children, function (child) {
                return child.classList.contains('reveal');
              })
            : [];
          var index = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
          el.classList.add('is-visible');
          observer.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

      Array.prototype.forEach.call(revealables, function (el) {
        observer.observe(el);
      });
    }
  }

  /* --------------------------------------------- FAQ: one panel at a time */
  var faqItems = document.querySelectorAll('.faq-item');

  Array.prototype.forEach.call(faqItems, function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) { return; }
      Array.prototype.forEach.call(faqItems, function (other) {
        if (other !== item) { other.open = false; }
      });
    });
  });

  /* ------------------------------------------------ active nav highlighting */
  var navLinks = nav ? nav.querySelectorAll('ul a[href^="#"]') : [];
  var sections = [];

  Array.prototype.forEach.call(navLinks, function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) { sections.push({ link: link, target: target }); }
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.filter(function (s) { return s.target === entry.target; })[0];
        if (!match) { return; }
        if (entry.isIntersecting) {
          sections.forEach(function (s) { s.link.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s.target); });
  }

  /* ------------------------------------------------------------ footer year */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    var current = new Date().getFullYear();
    // The source site states a 2026 copyright; never show an older year.
    yearEl.textContent = String(Math.max(current, 2026));
  }
})();
