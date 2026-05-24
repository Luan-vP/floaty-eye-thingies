# floaty eye thingies

> A browser game poem about the little floaty things inside your eyes.

**▶ Play: https://luan-vp.github.io/floaty-eye-thingies/**

Look into the light and you'll find them — the faint strands and clusters that
drift across your vision. The whole piece rests on one true detail: you can
never look straight at a floater. The moment your gaze settles on one, it
slides away. Here, your pointer (or fingertip) is your gaze, and the floaters
keep the same shyness.

There's nothing to win. Just look.

## Controls

- **Desktop:** move the mouse. Your cursor is your gaze; floaters drift away
  from it.
- **Mobile:** drag a finger across the screen.

## Run it locally

No build step, no dependencies — plain HTML, CSS, and Canvas. Open
`index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Hosting on GitHub Pages

The repo is Pages-ready out of the box. Two equivalent ways to turn it on:

**Option A — Actions (recommended).** A workflow at
`.github/workflows/pages.yml` deploys on every push to `main`.
In the repo's **Settings → Pages**, set **Source: GitHub Actions**.

**Option B — Branch deploy.** In **Settings → Pages**, set
**Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

The site lives at `https://<user>.github.io/<repo>/`. A `.nojekyll` file at
the root keeps Pages from touching anything.

## Publishing as a game poem

If you want to list this on itch.io, a personal site, or a collection, the
README itself is the press kit. Copy-paste blurb:

> **floaty eye thingies** — a browser game poem about the little drifting
> things inside your eyes. They slip away the moment you try to look at
> them. There's nothing to win. Just look.
> Play in the browser, desktop or mobile.

Recommended tags: `game-poem`, `browser`, `vignette`, `quiet`, `meditative`,
`canvas`, `no-input` (pointer only), `under-100kb`.

Assets you can use for listings:

- `assets/og.svg` — 1200×630 share image. Most modern platforms (Discord,
  Mastodon, GitHub previews) render SVG fine. For broadest reach (Twitter/X,
  iMessage), export a PNG screenshot of the running piece and replace it.
- `assets/favicon.svg` — single floater on the pale field.

Once you know the canonical URL, set the OG/Twitter `image` and add an
`og:url` to absolute paths in `index.html` — some crawlers don't resolve
relative URLs.

## Credits

Made by [@Luan-vP](https://github.com/Luan-vP). _Update this line with your
preferred byline._

License: _TBD — for a game poem, consider [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
for the work and MIT for the code, or just pick one. Add a `LICENSE` file
when you do._

## Files

```
index.html       page, poem text, social meta
style.css        the bright field and the surfacing words
src/main.js      the engine: floaters, wander, gaze-shyness
src/core/math.js shared math + vector helpers
assets/          favicon and share image
```

The engine is mid-refactor from a single file into pluggable modules —
see [issue #1](https://github.com/Luan-vP/floaty-eye-thingies/issues/1)
for the architecture.
