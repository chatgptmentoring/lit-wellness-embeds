/* =====================================================================
   PASTE THIS INTO WIX **SITE CODE** (masterPage.js) — ONCE, EVER.

   Where: Wix Editor -> turn on Dev Mode -> the code panel opens at the
   bottom -> in the left file tree click "Site" (masterPage.js) -> paste
   this in -> Save.

   What it does: every embed we build measures itself and shouts its real
   height at the page. This listens and resizes the embed box to match.
   Because it lives in Site Code it runs on EVERY page automatically —
   you never hand-tune an embed height again, on desktop or mobile.

   Safe to paste even before you've added any embeds.
   ===================================================================== */

$w.onReady(function () {

  // Wix names HTML embeds html1, html2, html3... per page.
  // We just try the first 16 on whatever page is loading.
  for (var i = 1; i <= 16; i++) {
    hookUp('#html' + i);
  }

  function hookUp(id) {
    var comp;

    // $w() throws if the element doesn't exist on this page — that's fine.
    try { comp = $w(id); } catch (e) { return; }
    if (!comp || typeof comp.onMessage !== 'function') return;

    comp.onMessage(function (event) {
      var h = event && event.data && event.data.litwsHeight;
      if (!h) return;
      comp.height = Math.ceil(h);
    });
  }

});
