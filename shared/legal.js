/* LIT Wellness Solutions — legal pages: section menu, scroll-spy, print. */
(function () {
  'use strict';

  var root = document.querySelector('.legal');
  var doc = document.querySelector('.legal-doc');
  var tocList = document.querySelector('.legal-toc ol');
  if (!root || !doc || !tocList) return;

  var sections = Array.prototype.slice.call(doc.querySelectorAll('h2[id]'));

  function jumpTo(el) {
    var top = Math.max(0, el.offsetTop - 12);
    // Set the position directly; the CSS smooth-scroll animates it where
    // supported, and it still lands even where smooth scrolling is off.
    doc.scrollTop = top;
  }

  // In-document links (e.g. "see Tanya AI coach below") scroll the frame too.
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (!t) return;
      e.preventDefault();
      jumpTo(t);
    });
  });

  // Build the menu from the headings, so it can never drift from the text.
  sections.forEach(function (h, i) {
    var num = document.createElement('span');
    num.className = 'num';
    num.textContent = (i + 1) + '.';
    h.insertBefore(num, h.firstChild);

    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.getAttribute('data-short') || h.textContent.replace(/^\d+\.\s*/, '');
    a.addEventListener('click', function (e) {
      e.preventDefault();
      jumpTo(h);
      root.classList.remove('toc-open');
      try { history.replaceState(null, '', '#' + h.id); } catch (err) {}
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });

  var links = Array.prototype.slice.call(tocList.querySelectorAll('a'));

  function spy() {
    var top = doc.scrollTop + 60;
    var current = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= top) current = i;
    }
    if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 4) current = sections.length - 1;
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
    var active = links[current];
    if (active && window.innerWidth >= 750) {
      var toc = document.querySelector('.legal-toc');
      var r = active.offsetTop - toc.scrollTop;
      if (r < 0 || r > toc.clientHeight - 40) toc.scrollTop = active.offsetTop - 80;
    }
  }
  doc.addEventListener('scroll', spy, { passive: true });
  spy();

  // Open at a section if the URL has #section-id (direct links to the file).
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) setTimeout(function () { jumpTo(target); spy(); }, 60);
  }

  var toggle = document.querySelector('.toc-toggle');
  if (toggle) toggle.addEventListener('click', function () { root.classList.toggle('toc-open'); });

  var print = document.querySelector('[data-print]');
  if (print) print.addEventListener('click', function () { window.print(); });

  // The document fills the Wix box; report a fixed design height.
  window.litwsMeasure = function () { return window.innerWidth < 750 ? 720 : 900; };
})();
