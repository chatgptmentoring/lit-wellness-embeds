/* =====================================================================
   LIT Wellness Solutions — shared embed runtime
   1. Reports the embed's real height to the Wix page (auto-resize)
   2. Runs the scroll-reveal animation
   3. Forces every link to break out of the iframe

   Requires the matching 6-line snippet in Wix Site Code (see
   /velo/masterPage.js). Without it the embed still renders fine — you
   just have to set the iframe height by hand in the Editor.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Auto-height ---------------------------------------- */
  var lastHeight = 0;

  /* Measure the CONTENT, never scrollHeight.
     body.scrollHeight / documentElement.scrollHeight are floored at the
     iframe's own viewport height, so using them makes the embed ratchet
     bigger every time Wix resizes it and never shrink back. Bounding
     boxes of the top-level children give the true content height.     */
  function measure() {
    var max = Math.ceil(document.body.getBoundingClientRect().height);
    var kids = document.body.children;

    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      var tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK') continue;

      var bottom = Math.ceil(el.getBoundingClientRect().bottom + window.pageYOffset);
      if (bottom > max) max = bottom;
    }
    return max;
  }

  function report() {
    var h = measure();
    if (!h || Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    try {
      window.parent.postMessage({ litwsHeight: h }, '*');
    } catch (e) { /* not embedded, or blocked — harmless */ }
  }

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(report).observe(document.body);
  }
  window.addEventListener('load', report);
  window.addEventListener('resize', report);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(report);
  }
  // Belt-and-braces: images and late layout shifts.
  [100, 400, 900, 2000].forEach(function (ms) { setTimeout(report, ms); });
  report();

  /* ---------- 2. Scroll reveal -------------------------------------- */
  var targets = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) || !targets.length) {
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.getAttribute('data-reveal-delay') || '0', 10);
        setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- 3. Break links out of the iframe ---------------------- */
  /* Without this, clicking a link loads the destination INSIDE the
     little embed box instead of navigating the real page.             */
  Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') return;                 // in-embed anchor
    if (a.hasAttribute('target')) return;               // author set it
    var external = /^https?:\/\//i.test(href) &&
                   href.indexOf('litwellnesssolutions.com') === -1;
    if (external) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    } else {
      a.setAttribute('target', '_top');
    }
  });
})();
