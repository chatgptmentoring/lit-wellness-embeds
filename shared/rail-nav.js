/* =====================================================================
   LIT Wellness Solutions — slider controls for phone rails
   Add data-rail-nav to a .rail and load this file. On phones it adds
   dots and previous/next buttons under the rail; they follow swipes.
   ===================================================================== */
(function () {
  'use strict';

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var BACK  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-rail-nav]'), function (rail) {
    var items = rail.children;
    var count = items.length;
    if (count < 2) return;

    var label = rail.getAttribute('data-rail-nav') || 'item';
    var nav = document.createElement('div');
    nav.className = 'rail-nav';
    var dots = '';
    for (var d = 0; d < count; d++) dots += '<i></i>';
    nav.innerHTML =
      '<div class="rail-dots" aria-hidden="true">' + dots + '</div>' +
      '<div class="rail-arrows">' +
        '<button type="button" class="rail-btn prev" aria-label="Previous ' + label + '">' + BACK + '</button>' +
        '<button type="button" class="rail-btn next" aria-label="Next ' + label + '">' + ARROW + '</button>' +
      '</div>';
    rail.parentNode.insertBefore(nav, rail.nextSibling);

    var dotEls = nav.querySelectorAll('.rail-dots i');
    var prev = nav.querySelector('.prev');
    var next = nav.querySelector('.next');
    var current = 0;

    function step() {
      return items[1].offsetLeft - items[0].offsetLeft || 1;
    }
    function lastReachable() {
      // Index of the card that sits first when the rail is scrolled to its end.
      var max = rail.scrollWidth - rail.clientWidth;
      return Math.min(count - 1, Math.ceil(max / step() - 0.01));
    }
    function update() {
      var i = Math.round(rail.scrollLeft / step());
      if (rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4) i = lastReachable();
      current = Math.max(0, Math.min(count - 1, i));
      var last = lastReachable();
      // One dot per stop: when two cards show at once there are fewer stops than cards.
      Array.prototype.forEach.call(dotEls, function (el, n) {
        el.style.display = n > last ? 'none' : '';
        el.classList.toggle('on', n === current);
      });
      prev.disabled = current === 0;
      next.disabled = current >= lastReachable();
    }
    function go(i) {
      i = Math.max(0, Math.min(lastReachable(), i));
      // Set the position directly (CSS scroll-behavior animates it).
      rail.scrollLeft = items[i].offsetLeft - items[0].offsetLeft;
      setTimeout(update, 450);
    }

    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });

    var t;
    rail.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
