# m-amir1998.github.io

Personal portfolio of **Amir Mohammadisarab** — PhD researcher in cooperative robotics,
connected automated vehicles, LLM-based reasoning and MLOps.

Built from scratch with **vanilla HTML/CSS/JS** — no frameworks, no build step, no dependencies.
Deployed with GitHub Pages.

## Editing content

Almost everything you'll ever want to change lives in **`js/data.js`**:

| What | Where |
|---|---|
| Typed roles in the hero | `SITE_DATA.roles` |
| Tech-stack chips | `SITE_DATA.stack` |
| Project cards | `SITE_DATA.projects` |
| Education/experience timeline | `SITE_DATA.timeline` |
| Publications | `SITE_DATA.publications` |
| Bio, about text, social links, email | `index.html` (search for `PLACEHOLDER`) |
| Profile photo | replace `images/profile.svg` with e.g. `images/profile.jpg` and update the `<img>` in `index.html` |
| CV | add your PDF as `files/cv.pdf`, update the link in `index.html`, and delete the `#cvBtn` handler at the bottom of `js/main.js` |

Search the repo for **`PLACEHOLDER`** to find everything still waiting for real data.

## Structure

```
index.html      — single-page site (all sections)
404.html        — themed not-found page
css/style.css   — design system: tokens, dark/light themes, animations
js/data.js      — ✏️ all editable content
js/hero.js      — animated canvas hero (V2X network + LiDAR sweep)
js/main.js      — typing effect, scroll reveals, counters, nav, theme toggle
images/         — profile picture and assets
files/          — CV and downloadable files
```

## Running locally

Any static server works:

```bash
python -m http.server 4000
# then open http://localhost:4000
```

## Notes

- Dark theme is the default; the toggle persists the choice in `localStorage`.
- All animations respect `prefers-reduced-motion`.
- `.nojekyll` tells GitHub Pages to serve the files as-is (no Jekyll build).
