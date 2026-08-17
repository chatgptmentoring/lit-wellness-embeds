/* =====================================================================
   PASTE THIS INTO WIX SITE CODE (masterPage.js), replacing what's there.

   Where: Wix Editor -> Dev Mode on -> code panel at the bottom -> in its
   file list click masterPage.js -> select all, delete, paste this, save.

   WHAT IT DOES
   1. Every embed measures itself and reports its real height. This
      listens and resizes the embed box to match.
   2. It then TRIES to resize the section holding that embed, so you
      never have to drag section edges to a pixel value at all.

   Step 2 is best-effort. Wix does not expose a settable height on
   containers in every version of the Editor, and where it doesn't, the
   attempt fails silently and nothing breaks — you just size that
   section by hand as before. Try it on one section and see.
   ===================================================================== */

$w.onReady(function () {

  // Extra breathing room, in pixels, left below the embed inside its
  // section. Raise it if sections feel cramped; 0 means a tight fit.
  var PADDING = 40;

  // Wix names HTML embeds html1, html2, html3... per page.
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

      h = Math.ceil(h);
      comp.height = h;
      fitSection(comp, h);
    });
  }

  /* Only the embed's DIRECT parent is touched. Walking further up the
     tree would risk resizing the page or the header, which is a much
     worse failure than leaving a section slightly too tall.          */
  function fitSection(comp, h) {
    try {
      var parent = comp.parent;
      if (!parent) return;
      parent.height = h + PADDING;
    } catch (e) {
      // Container height not settable in this Editor version. Harmless.
    }
  }

});
