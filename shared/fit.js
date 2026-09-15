/* =====================================================================
   LIT Wellness Solutions — fit-to-box
   Load BEFORE shared/embed.js, on embeds whose root has [data-fit].

   The Wix CLASSIC mobile view gives an HTML embed a box height of its own
   (about 200px by default), unrelated to the content, and Wix page code
   cannot resize an embed. Left alone, a too-short box crops the section.
   So the section measures the box it was given:
     box shorter than the section -> scale the whole section down to fit
     box taller than the section  -> centre it
   Nothing is ever cut off. Paint the background on <html> so the spare
   space never shows an edge.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-fit]');
  if (!root) return;

  var natural = 0;
  root.style.transformOrigin = '50% 0';

  function fit() {
    root.style.transform = 'none';
    natural = root.offsetHeight;               // layout height, unscaled
    var H = window.innerHeight;
    if (!natural || H < 40) return;
    if (H < natural - 1) {
      root.style.transform = 'scale(' + (H / natural).toFixed(4) + ')';
    } else if (H > natural + 1) {
      root.style.transform = 'translateY(' + Math.floor((H - natural) / 2) + 'px)';
    }
  }

  /* embed.js reports this instead of measuring, so the auto-height
     snippet (where Wix honours it) sizes the box to the real design. */
  window.litwsMeasure = function () { return natural || root.offsetHeight; };

  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  if (typeof ResizeObserver === 'function') new ResizeObserver(fit).observe(document.documentElement);
  setInterval(fit, 500);   // Wix does not always fire resize into the iframe
  fit();
})();
