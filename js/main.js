/* ─────────────────────────────────────────────
   ORDÖ · Main JavaScript
   ───────────────────────────────────────────── */

(function () {
  'use strict';

  // ── Nav scroll behavior ──────────────────────

  const nav = document.getElementById('nav');

  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Inner pages (no full-screen hero): start scrolled
  const hasFullHero = document.querySelector('.hero');
  if (!hasFullHero && nav) {
    nav.classList.add('scrolled');
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  // ── Mobile drawer ────────────────────────────

  const navToggle    = document.getElementById('nav-toggle');
  const navDrawer    = document.getElementById('nav-drawer');
  const drawerClose  = document.getElementById('nav-drawer-close');

  function openDrawer() {
    navDrawer.classList.add('open');
    navDrawer.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawerClose.focus();
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    navDrawer.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    navToggle.focus();
  }

  if (navToggle) navToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

  // Close drawer on nav link click
  if (navDrawer) {
    navDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });


  // ── Fade-up scroll animations ────────────────

  const fadeEls = document.querySelectorAll('.fade-up');

  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  // ── Service tabs (services.html) ─────────────

  const tabBtns = document.querySelectorAll('.tab-btn[data-panel]');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const panelId = btn.getAttribute('data-panel');

      // Update tab state
      tabBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show/hide panels
      document.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
        panel.hidden = true;
      });
      const target = document.getElementById('panel-' + panelId);
      if (target) {
        target.hidden = false;
        // Re-trigger fade-ups in the newly shown panel
        target.querySelectorAll('.fade-up:not(.visible)').forEach(function (el) {
          el.classList.add('visible');
        });
      }
    });
  });

  // Handle hash links for services (e.g. services.html#medical)
  function activateTabFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const matchingBtn = document.querySelector('.tab-btn[data-panel="' + hash + '"]');
    if (matchingBtn) matchingBtn.click();
  }

  if (tabBtns.length) {
    activateTabFromHash();
    window.addEventListener('hashchange', activateTabFromHash);
  }


  // ── Gallery filter buttons ────────────────────

  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      // Gallery items filtering (wired up when real photos are added)
    });
  });


  // ── Contact form (Formspree) ──────────────────
  //
  // Setup (one time, free):
  //   1. Go to https://formspree.io and create a free account
  //   2. Click "New Form" — name it "ORDÖ Contact"
  //   3. Copy the form ID (looks like: xeojpwkj)
  //   4. Replace YOUR_FORM_ID below AND in contact.html form action

  var FORMSPREE_ID = 'YOUR_FORM_ID';

  var form        = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!validateForm(form)) return;

      var submitBtn = form.querySelector('[type="submit"]');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      try {
        var res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          form.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('visible');
        } else {
          submitBtn.textContent = 'Try again';
          submitBtn.disabled = false;
        }
      } catch (err) {
        submitBtn.textContent = 'Try again';
        submitBtn.disabled = false;
      }
    });
  }

  function validateForm(form) {
    let valid = true;

    form.querySelectorAll('[required]').forEach(function (field) {
      const group = field.closest('.form-group');
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#c0392b';
        field.addEventListener('input', function () {
          field.style.borderColor = '';
        }, { once: true });
      }
    });

    // Email format check
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      valid = false;
      emailField.style.borderColor = '#c0392b';
    }

    return valid;
  }

})();
