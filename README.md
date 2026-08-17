# LIT Wellness Solutions — Wix HTML embeds

Custom-designed sections that drop into the existing Wix site as HTML embeds,
served from GitHub Pages. Design spec = `LITWellness_Wix_Build_Guide.md`
(Newsreader/Karla, `#355D80`, `#A9502F`) and `LitWellnessSolutions Redesign Audit.pdf`.

---

## One-time setup

### Step 1 — Put this folder on GitHub Pages

1. Create a new **public** repo on GitHub, e.g. `lit-wellness-embeds`.
2. Upload **the contents of this `wix-embeds` folder** to the repo root
   (so `01-trust-marquee.html` and the `shared/` folder sit at the top level).
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: `main`, folder: `/ (root)` → **Save**.
4. Wait ~1 minute. Your base URL is now:

   ```
   https://YOUR-USERNAME.github.io/lit-wellness-embeds/
   ```

5. Test it: open `https://YOUR-USERNAME.github.io/lit-wellness-embeds/preview.html`
   — you should see both sections, and the toolbar should say “auto-height ok”.

> Public repo is required for free GitHub Pages. Nothing sensitive lives here —
> just markup. Every file carries `<meta name="robots" content="noindex">` so
> Google will not index these files and they cannot compete with the real site.

### Step 2 — Turn on auto-resize in Wix (do this once, ever)

Without this, every embed box has a fixed height you'd have to tune by hand for
desktop **and** mobile, on every section. With it, embeds size themselves.

1. In the Wix Editor: **Site → Site History → save a restore point first.**
2. Top bar → **Dev Mode → Turn on Dev Mode.** (Reversible. It does not change
   anything on the live site by itself.)
3. A code panel opens at the bottom. In the file tree on its left, click
   **Site** (the `masterPage.js` file) — *not* Page Code.
4. Paste in the entire contents of `velo/masterPage.js` from this folder.
5. **Save.**

That's it. It runs on every page of the site automatically.

---

## Adding an embed to a page

1. In the Editor, click **Add Elements → Embed Code → Embed HTML**.
2. Drag the box roughly where the section belongs.
3. Click **Enter Code** → choose the **Website address (URL)** tab.
4. Paste the embed's URL, e.g.
   `https://YOUR-USERNAME.github.io/lit-wellness-embeds/01-trust-marquee.html`
5. Click **Apply**.
6. Stretch the box **full width** (drag the side handles to the edges, or use the
   stretch toggle in the element's layout panel). Width matters; height doesn't —
   the Site Code snippet handles height.
7. **Save.** Then **Preview** to check it — embeds often show as a grey box in
   the Editor canvas and only render properly in Preview and on the live site.

**That is the last time you touch Wix for that section.** Any future change to
the design or copy is a file edit here → push to GitHub → the live site updates
itself within a minute. No re-pasting.

---

## Rules that keep this safe

| Rule | Why |
|---|---|
| Never put a page's **H1 or keyword copy** inside an embed | iframe content is a separate document — Google does not credit it to the Wix page. The 5 keyword-assigned pages (`/`, `/blog`, `/free-resources`, `/culture-of-wellness`, `/mindful-eating-freedom`) must keep real, native Wix text |
| Every embed file keeps its `robots: noindex` meta | stops the GitHub copy competing with the real site |
| Links get `target="_top"` (internal) / `_blank` (external) | otherwise a click loads the page *inside* the little embed box. `shared/embed.js` does this automatically |
| Images come from `static.wixstatic.com` (her Media Manager) | never hotlink the live site's rendered pages; Media Manager URLs are stable and CDN-served |
| Anything Tanya will want to edit herself stays native Wix | she can't edit embedded sections in the Editor |

---

## Files

```
shared/tokens.css   Design tokens — colours, fonts, radii. Change once, all embeds update.
shared/base.css     Reset, type scale, buttons, reveal animation.
shared/embed.js     Auto-height reporting + scroll reveal + link target fixing.
velo/masterPage.js  The snippet that goes into Wix Site Code (once).
preview.html       Local/hosted test harness. Mimics exactly what Wix does.
NN-name.html        One embed per file.
```

## Embed index

| # | File | Page | Status | Assets needed |
|---|---|---|---|---|
| 01 | `01-trust-marquee.html` | Home (under hero) | ✅ Built | none |
| 02 | `02-five-pillars.html` | Home | ✅ Built | none |
