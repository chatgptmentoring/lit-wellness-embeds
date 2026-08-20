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

## Section heights — one number each, desktop AND mobile

Live base URL: **https://chatgptmentoring.github.io/lit-wellness-embeds/**

Verified identical at 320 / 390 / 600 / 749 / 750 / 1000 / 1440 / 1920px.
Set the Wix section height once in desktop view; Mobile view never needs
touching.

| # | File | Height | Page |
|---|---|---|---|
| 01 | `01-trust-marquee.html` | 66 | Home |
| 02 | `02-five-pillars.html` | 592 | Home |
| 03 | `03-pain-points.html` | 222 | Home |
| 04 | `04-how-we-help.html` | 218 | Home |
| 05 | `05-services-grid.html` | 656 | Home |
| 06 | `06-testimonials.html` | 388 | Home |
| 07 | `07-final-cta.html` | 640 | Home |
| 08 | `08-speaking-topics.html` | 342 | /speaking |
| 09 | `09-speaking-videos.html` | 1232 | /speaking |
| 10 | `10-insurance-steps.html` | 400 | Home + /insurance-coverage |
| 11 | `11-books.html` | 870 | Home + /books |
| 12 | `12-hero-visual.html` | 620 | Home hero, beside native text |

Held constant by three mechanisms: grids keep their column count from
750px up and shrink the cards rather than wrapping; below 750px they
become sideways-scrolling rails instead of stacking; and each embed sits
in a `.locked` wrapper whose min-height clears its own tallest layout.
Cards have fixed heights, images use fixed pixel heights with
`object-fit` rather than aspect ratios, and long titles are line-clamped.

**Re-measure after any content change.** Adding a card to a rail is free;
adding a ROW is not, and neither is a longer heading.

### Which homepage sections may be embedded

Build Guide 10.2 assigns keywords to most homepage sections, and Google does
not read iframe content, so:

| Homepage section | Keywords assigned? | Approach |
|---|---|---|
| Hero / H1 | yes | **native Wix** |
| Trust strip | no | embed 01 |
| Sound familiar? | H2 only | native H2 + embed 03 |
| How we help | H2 only | native H2 + embed 04 |
| Who we are | yes | **native Wix** |
| Insurance | H2 only | native H2 + embed 10 |
| 5 Pillars | no | embed 02 |
| Services grid | card titles | native H2 + keyword sentence, then embed 05 |
| Testimonials | no | embed 06 |
| Final CTA | brand name, already native | embed 07 |

Pages *without* assigned keywords (`/speaking`, `/books`, `/faq`, `/contact`,
`/insurance-coverage`, the About pages) can be embedded much more freely.

## Embed index

| # | Own heading? | Notes |
|---|---|---|
| 01 trust marquee | n/a | decorative |
| 02 five pillars | yes, no keywords | blue band, full-bleed |
| 03 pain points | **no — native H2 required above** | transparent |
| 04 how we help | **no — native H2 required above** | transparent |
| 05 services grid | **no — native H2 + keyword sentence above** | card 6 -> Fay until /insurance-coverage exists |
| 06 testimonials | no | attribution slots empty pending real names |
| 07 final CTA | yes | "Wellness Solutions" is already native site-wide |
| 08 speaking topics | **no — native H2 required above** | copy needs Tanya's sign-off |
| 09 speaking videos | **no — native H2 required above** | replaces the homepage video library |
| 10 insurance steps | **no — native H2 required above** | coverage wording must not be strengthened |
| 11 books | yes | new book has NO buy button until it is published |
| 12 hero visual | n/a — no text at all | **H1 stays native Wix**; place beside it |

### Deliberately NOT embedded

| Thing | Why it stays native Wix |
|---|---|
| FAQ | Q&A is high-value indexable text and Tanya edits it herself |
| Contact / eBook forms | Wix Forms handle delivery and storage |
| Hero, insurance heading, "who we are" | carry assigned homepage keywords |
| Header, footer, nav | sitewide, and the nav restructure is the audit's #1 item |

### Images

All served from Tanya's own Wix account through the **CDN resizer**, never
the bare original. Appending `/v1/fit/w_N,h_N,al_c,q_85,enc_auto/name.ext`
to a `static.wixstatic.com` URL resizes on request and `enc_auto` serves
AVIF to browsers that take it. This matters more than it sounds:

| Image | Original | Resized (AVIF) |
|---|---|---|
| 2026 award badge | 5.5 MB | 6.6 KB |
| Logo | 2.2 MB | ~35 KB |
| Mindful Me cover | 1.8 MB | 26 KB |
| Portrait | — | 89 KB |

**Never reference a bare `static.wixstatic.com` URL in an embed.**

### Outstanding

| Item | Needed from |
|---|---|
| `assets/food-isnt-the-problem.jpg` is a PLACEHOLDER | drop the real cover in, same filename |
| New book buy link + launch date | Tanya, once published |
| Testimonial attributions | Tanya |
| High-res speaking photo | Tanya |

