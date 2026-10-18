/**
 * Portfolio Interactive Scripts
 * Lightweight, accessible, and fast.
 * - IntersectionObserver active nav highlighting
 * - Case study modal with data-attributes & keyboard accessibility
 * - Mobile hamburger menu
 * - Fade-up scroll animations
 * - Formspree fetch contact form submission
 */

(function () {
  'use strict';

  // --- Header Scrolled Background ---
  const siteHeader = document.getElementById('site-header');
  function onScroll() {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    if (siteHeader) {
      if (scrollTop > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  }

  // --- Active Navigation Highlight via IntersectionObserver ---
  function initActiveNavObserver() {
    const navLinks = document.querySelectorAll('.nav-item');
    const sectionIds = ['hero', 'services', 'pricing', 'process', 'work', 'about', 'contact'];

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // --- Case Study Modal Controller ---
  function initCaseStudyModal() {
    const modal = document.getElementById('case-study-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    if (!modal) return;

    const modalTitle = document.getElementById('modal-title');
    const modalSummary = document.getElementById('modal-summary');
    const modalPagespeed = document.getElementById('modal-pagespeed');
    const modalProblem = document.getElementById('modal-problem');
    const modalTodo = document.getElementById('modal-todo');
    const modalResults = document.getElementById('modal-results');
    const modalUrl = document.getElementById('modal-url');

    function openModalFromButton(btn) {
      if (!btn) return;

      const title = btn.getAttribute('data-title') || '';
      const summary = btn.getAttribute('data-summary') || '';
      const pagespeed = btn.getAttribute('data-pagespeed') || '';
      const problem = btn.getAttribute('data-problem') || '';
      const todo = btn.getAttribute('data-todo') || '';
      const results = btn.getAttribute('data-results') || '';
      const url = btn.getAttribute('data-url') || '#';

      if (modalTitle) modalTitle.textContent = title;
      if (modalSummary) modalSummary.textContent = summary;
      if (modalPagespeed) modalPagespeed.textContent = pagespeed;
      if (modalProblem) modalProblem.textContent = problem;
      if (modalTodo) modalTodo.textContent = todo;
      if (modalResults) modalResults.textContent = results;
      if (modalUrl) modalUrl.href = url;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Attach click listeners to all buttons matching .btn-case-study
    const caseStudyBtns = document.querySelectorAll('.btn-case-study');
    caseStudyBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModalFromButton(btn);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    // Close when clicking directly on the backdrop outside modal-box
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // --- Formspree Contact Form Fetch Submission ---
  const FORM_ENDPOINT = "https://formspree.io/f/xvkzyblw";

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('contact-status');
    const submitBtn = document.getElementById('contact-submit-btn');
    if (!form || !statusEl) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const msgInput = document.getElementById('contact-msg');
      const urlInput = document.getElementById('contact-url');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = msgInput ? msgInput.value.trim() : '';
      const website = urlInput ? urlInput.value.trim() : '';

      // Validation
      if (!name) {
        showStatus('Please enter your name.', 'error');
        if (nameInput) nameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!message || message.length < 10) {
        showStatus('Please enter a message of at least 10 characters.', 'error');
        if (msgInput) msgInput.focus();
        return;
      }

      // Button loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        const textSpan = submitBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'Sending...';
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            website: website,
            message: message
          })
        });

        if (response.ok) {
          showStatus('Request received. I will reply by email.', 'success');
          form.reset();
        } else {
          showStatus('Something went wrong. Please try again or email me directly at abirhoq99@gmail.com.', 'error');
        }
      } catch (err) {
        showStatus('Unable to send request right now. Please check your connection or email me at abirhoq99@gmail.com.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          const textSpan = submitBtn.querySelector('span');
          if (textSpan) textSpan.textContent = 'Send Request';
        }
      }
    });

    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.style.display = 'block';
      statusEl.className = 'contact-status-box ' + type;
    }
  }

  // --- Mobile Hamburger Menu ---
  function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-toggle');
    const mobileDropdown = document.getElementById('mobile-nav-dropdown');
    if (!hamburgerBtn || !mobileDropdown) return;

    hamburgerBtn.addEventListener('click', () => {
      const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
      hamburgerBtn.classList.toggle('active');
      mobileDropdown.classList.toggle('active');
    });

    const mobileLinks = mobileDropdown.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.classList.remove('active');
        mobileDropdown.classList.remove('active');
      });
    });
  }

  // --- Lightweight Scroll Reveal ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el) => observer.observe(el));
  }

  // --- Initialization ---
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    initActiveNavObserver();
    initCaseStudyModal();
    initContactForm();
    initMobileMenu();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
