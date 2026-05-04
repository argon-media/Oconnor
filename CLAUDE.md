# O'Connor Detailing — Project Guide for Claude Code

You are working on a static marketing website for **O'Connor Detailing**, a ceramic coating and paint correction shop in Peoria Heights, IL. Owners: Griffin O'Connor (Founder/CEO) and Grayson Smiley (Shop Manager / Lead Tech).

Live site is hosted on Vercel and auto-deploys from this GitHub repo's `main` branch.

---

## Tech stack

Plain static HTML / CSS / JS. **No framework. No build step. No package manager.**

- `index.html` — the entire homepage
- `styles.css` — single stylesheet with all design tokens and components
- `app.js` — light interactivity (mobile menu, before/after sliders, video facade, tweak panel, service-worker kill switch)
- `vercel.json` — cache headers (HTML never cached, assets cached 7 days)
- `assets/` — all images, the CCI logo PNG, and gallery photos
- `uploads/` — legacy WordPress images, still used in a few places

Do **not** introduce React, Tailwind, a bundler, or any dependency that requires `npm install`. If a task seems to need one, push back and find a vanilla solution.

---

## Local preview

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>. That's it — no compile, no watch.

---

## Branch + PR workflow (mandatory)

Never push directly to `main`. Vercel deploys `main` straight to production.

```bash
git checkout main
git pull origin main
git checkout -b feature/<short-name>
# … make changes, test locally …
git add .
git commit -m "Short imperative message"
git push -u origin feature/<short-name>
```

Then open a Pull Request to `main` on GitHub. Vercel will automatically build a **preview URL** on the PR — share that for review before merging.

After merge, the production deploy runs automatically.

---

## Design system (use these — do not invent new tokens)

Defined as CSS custom properties at the top of `styles.css`:

| Token | Value | Use for |
|---|---|---|
| `--accent` | `#559ABB` | Primary brand color, links, primary buttons |
| `--accent-ink` | `#FFFFFF` | Text on accent backgrounds |
| `--ink` / `--ink-2` / `--ink-3` | dark navy/blacks | Section backgrounds |
| `--paper` / `--paper-2` | off-whites | Light section backgrounds |
| `--fg` | dark gray | Primary text on light bg |
| `--on-dark` / `--on-dark-mute` | white / muted white | Text on dark sections |
| `--line` / `--line-dark` | hairline borders | Dividers, card outlines |
| `--radius` / `--radius-s` | corner rounding | Cards / chips |
| `--header-h` | sticky header height | Scroll padding offsets |

**Fonts** (already loaded via `<link>` in `index.html`):

- **Barlow** — body and headings (weights 400/600/700/800/900, with italics)
- **JetBrains Mono** — eyebrows, attribution, monospace details

**Buttons** — reuse, do not restyle:
- `.btn .btn-primary` — solid accent (main CTA)
- `.btn .btn-primary .btn-lg` — large variant
- `.btn .btn-ghost` — outlined, **on dark sections**
- `.btn .btn-ghost-dark` — outlined, **on light sections**
- Add `<svg class="btn-icon" …>` inside for icons (phone, etc.)

**Sections** typically follow this rhythm:

```html
<section class="<name>" id="…">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Short label</div>
      <h2>Section title</h2>
      <p class="section-intro">One-line intro.</p>
    </div>
    …content…
  </div>
</section>
```

Use `.section-intro--dark` variant when the section background is dark.

---

## Adding a new page

1. **Copy `index.html` → `<page>.html`** as a starting template — gives you the header, footer, fonts, JSON-LD shell, sticky review badge, mobile CTA, and tweak panel for free.
2. Strip the body sections between header and footer; build the new page from reusable section blocks.
3. Update the nav `<a>` hrefs in **both** the desktop nav (`<header>` → `.nav`) and the mobile drawer (`#mobileDrawer`). The new page should be reachable from every page.
4. Update `<title>`, `<meta name="description">`, OG tags, and canonical URL at the top.
5. If the page has its own LocalBusiness/Service schema, update the JSON-LD block.
6. Test all links locally before pushing.

---

## Image rules

- Drop new files in `assets/` (preferred) or `uploads/`
- Max width **1600px**, target **<500 KB** per image
- **JPG** for photography, **PNG** for logos/transparency, **SVG** for icons
- macOS one-liner to resize + compress:
  ```bash
  sips -Z 1600 -s format jpeg -s formatOptions 78 input.png --out output.jpg
  ```
- Always include descriptive `alt=""` text. Add `loading="lazy"` for any image below the fold.

---

## What NOT to touch unless explicitly asked

- `vercel.json` — cache headers, intentionally tuned
- The service-worker kill-switch `<script>` near the top of `index.html` — fixes a stale-cache flash bug
- `assets/cci-logo.png` — the official Ceramic Coating Inc brand asset (correct proportions, do not redraw)
- The accent color `#559ABB` — this is the brand color; do not change globally
- `app.js` `__TWEAKS__` block — controls in-page edit mode; leaving it is fine, replacing the headline override is not

---

## Business / contact reference

- **Phone:** (309) 229-4277 — `tel:+13092294277`
- **Instagram:** <https://www.instagram.com/oconnordetailing/>
- **Address:** Peoria Heights, IL
- **Services:** Ceramic Coating, Maintenance Detailing, Paint Correction, Undercoating, Window Tinting
- **Credentials:** CCI (Ceramic Coating Inc) Multi-Certified Installer, Licensed IL LLC, $1M Liability, EST 2023, 100+ five-star Google reviews

---

## Quick task checklist before opening a PR

- [ ] Tested locally with `python3 -m http.server 8000`
- [ ] All new images compressed and in `assets/`
- [ ] Nav links updated on every page that exists
- [ ] No new dependencies, no build step introduced
- [ ] Used existing tokens / classes — no new colors or button styles
- [ ] Reasonable, descriptive commit message
- [ ] Pushed to a feature branch, PR opened against `main`
- [ ] Verified the Vercel preview URL once it builds

If any of the above is unclear, stop and ask before continuing.
