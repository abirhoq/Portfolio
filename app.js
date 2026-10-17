/**
 * Portfolio Experience & Ultra-Smooth Scroll-Based Background Animation
 * 240 Frames @ 24fps | Native 1280x720 Canvas Render
 * Features: LERP Inertia Physics, HiDPI Retina Scaling, Intelligent Caching,
 * and Dynamic Viewport Scroller Binding.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 240;
  const FRAME_BASE_PATH = 'frames/frame_';
  const LERP_FACTOR = 0.085; // Damping constant for Apple-like silky momentum
  const EPSILON = 0.0002;    // Snap threshold to stop rAF when resting

  // --- DOM Elements ---
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const siteHeader = document.getElementById('site-header');
  const loader = document.getElementById('loader');
  const loaderPercent = document.getElementById('loader-percent');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  const loaderDetails = document.getElementById('loader-details');
  const fallbackProgressBar = document.getElementById('scroll-progress-bar');
  const navItems = document.querySelectorAll('.nav-item');

  // --- State Variables ---
  const images = new Array(TOTAL_FRAMES);
  const loadedFlags = new Array(TOTAL_FRAMES).fill(false);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let renderedFrameIndex = -1;
  let isLoopRunning = false;
  let isLoaderDismissed = false;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let dpr = 1;

  // Modern Web Guidance: Check if native scroll-timeline is supported
  const supportsNativeScrollTimeline =
    window.CSS &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline', 'scroll()');

  /**
   * Format 1-based index to 4-digit filename: "0001" to "0240"
   */
  function getFrameUrl(index) {
    const padded = String(index).padStart(4, '0');
    return `${FRAME_BASE_PATH}${padded}.png`;
  }

  /**
   * Resize Canvas Buffer respecting Device Pixel Ratio (capped at 2 for performance)
   */
  function handleResize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(viewportWidth * dpr);
    canvas.height = Math.round(viewportHeight * dpr);

    // Turn on high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Force redraw on resize
    if (renderedFrameIndex >= 0) {
      drawFrame(renderedFrameIndex);
    }
  }

  /**
   * Draw specific frame with "cover" aspect-ratio preservation
   */
  function drawFrame(index) {
    let img = images[index];

    // If target frame is still downloading, find nearest available cached frame
    if (!loadedFlags[index]) {
      img = findNearestLoadedImage(index);
      if (!img) return; // No frames loaded at all yet
    }

    const imgWidth = img.naturalWidth || 1280;
    const imgHeight = img.naturalHeight || 720;
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    // Render cleanly onto canvas
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    renderedFrameIndex = index;
  }

  /**
   * Find nearest loaded frame index to prevent stutter/blanks during rapid scrubs
   */
  function findNearestLoadedImage(targetIdx) {
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const forward = targetIdx + offset;
      if (forward < TOTAL_FRAMES && loadedFlags[forward]) {
        return images[forward];
      }
      const backward = targetIdx - offset;
      if (backward >= 0 && loadedFlags[backward]) {
        return images[backward];
      }
    }
    return null;
  }

  /**
   * Animation Render Loop with Linear Interpolation (LERP)
   */
  function animate() {
    const delta = targetProgress - currentProgress;

    if (Math.abs(delta) > EPSILON) {
      currentProgress += delta * LERP_FACTOR;
    } else {
      currentProgress = targetProgress;
    }

    // Calculate corresponding frame (0 to 239)
    const targetFrame = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );

    if (targetFrame !== renderedFrameIndex) {
      drawFrame(targetFrame);
    }

    // Update fallback scroll progress bar if CSS scroll-timeline is unsupported
    if (!supportsNativeScrollTimeline && fallbackProgressBar) {
      fallbackProgressBar.style.transform = `scaleX(${currentProgress})`;
    }

    // Continue rAF loop if still interpolating
    if (Math.abs(targetProgress - currentProgress) > EPSILON) {
      requestAnimationFrame(animate);
    } else {
      isLoopRunning = false;
    }
  }

  /**
   * Trigger the animation loop if it is not already running
   */
  function requestTick() {
    if (!isLoopRunning) {
      isLoopRunning = true;
      requestAnimationFrame(animate);
    }
  }

  /**
   * Scroll Event Handler
   */
  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const scrollTop = window.scrollY || window.pageYOffset || 0;
    targetProgress = Math.min(1, Math.max(0, scrollTop / maxScroll));

    // Header blur state on scroll
    if (scrollTop > 60) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Active navigation state update based on scroll position
    updateActiveNav(scrollTop);

    requestTick();
  }

  /**
   * Update Active Navigation Pill
   */
  function updateActiveNav(scrollTop) {
    const sections = ['hero', 'services', 'process', 'work', 'about', 'contact'];
    let currentSection = 'hero';

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop - 180;
        if (scrollTop >= top) {
          currentSection = id;
        }
      }
    });

    navItems.forEach((item) => {
      const href = item.getAttribute('href');
      if (href === `#${currentSection}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Concurrent Progressive Image Preloader
   */
  function preloadImages() {
    // 1. Prioritize frame 1 (index 0) for instantaneous first paint
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    images[0] = firstImg;

    firstImg.onload = () => {
      loadedFlags[0] = true;
      loadedCount++;
      drawFrame(0);
      updateLoaderProgress();

      // Once frame 1 is ready, load the remaining 239 frames concurrently in batches
      preloadRemainingFrames();
    };

    firstImg.onerror = () => {
      console.warn('Failed to load initial frame:', firstImg.src);
      preloadRemainingFrames();
    };
  }

  /**
   * Load remaining frames with concurrency control
   */
  function preloadRemainingFrames() {
    const queue = [];
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      queue.push(i);
    }

    const CONCURRENCY = 8;
    let activeWorkers = 0;

    function processQueue() {
      while (activeWorkers < CONCURRENCY && queue.length > 0) {
        const index = queue.shift();
        activeWorkers++;

        const img = new Image();
        img.src = getFrameUrl(index + 1);
        images[index] = img;

        img.onload = () => {
          loadedFlags[index] = true;
          loadedCount++;
          activeWorkers--;
          updateLoaderProgress();
          processQueue();
        };

        img.onerror = () => {
          console.warn(`Failed to load frame ${index + 1}`);
          activeWorkers--;
          processQueue();
        };
      }
    }

    processQueue();
  }

  /**
   * Update Loading Progress UI
   */
  function updateLoaderProgress() {
    const progressPct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    loaderPercent.textContent = `${progressPct}%`;
    loaderBarFill.style.width = `${progressPct}%`;
    loaderDetails.textContent = `Loading frames: ${loadedCount} / ${TOTAL_FRAMES}`;

    // Dismiss loader smoothly once initial interactive buffer (or 100%) is ready
    if (!isLoaderDismissed && (loadedCount >= Math.min(36, TOTAL_FRAMES) || loadedCount === TOTAL_FRAMES)) {
      isLoaderDismissed = true;
      setTimeout(() => {
        loader.classList.add('loaded');
        // Ensure initial frame is drawn
        drawFrame(renderedFrameIndex >= 0 ? renderedFrameIndex : 0);
      }, 250);
    }
  }

  /**
   * Initialize Case Study Modal Controller (Reads data-* attributes from clicked button)
   */
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

    // Close when clicking directly on the dark backdrop outside modal-box
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

  // --- Initialization ---
  function init() {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial state check
    onScroll();

    // Initialize Modal Controller
    initCaseStudyModal();

    // Start loading frames
    preloadImages();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

  // --- Mobile Hamburger Menu Handler ---
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

  // --- Lightweight IntersectionObserver for Fade-Up Motion ---
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

  // Run initializers
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMobileMenu();
      initScrollReveal();
    });
  } else {
    initMobileMenu();
    initScrollReveal();
  }
