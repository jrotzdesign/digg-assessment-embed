# Digg Agency assessment: WordPress embed

The Growth Opportunity Assessment ("Your Sales & Marketing Growth Gap") as a
single script for an Elementor HTML widget on thediggagency.com. Same questions,
scoring, results copy and email gate as the production demo
(`jrotzdesign/digg-assessment`, `digg-site-with-assessment.html`).

## The snippet

```html
<div id="digg-assessment"></div>
<script src="https://cdn.jsdelivr.net/gh/jrotzdesign/digg-assessment-embed@v1.0.0/dist/digg-assessment.js" defer data-cfasync="false" data-jetpack-boost="ignore"></script>
```

Paste both lines into one HTML widget, in a full-width container with no padding,
on a page using the **Elementor Full Width** template.

- Everything renders inside `#digg-assessment`. Every CSS rule is scoped to it
  (the build fails otherwise), and the script adds no globals.
- No fonts are loaded. It uses the Montserrat and Open Sans her site already serves.
- No cookies, no storage, no tracking.
- `data-cfasync="false"` and `data-jetpack-boost="ignore"` keep Cloudflare Rocket
  Loader and Jetpack Boost from deferring or rewriting the script if either is
  switched on later.

## Settings

At the top of `src/app.js`:

| Setting | Now | What it does |
|---|---|---|
| `ENDPOINT` | `null` | Where leads are POSTed as JSON. `null` = demo mode: nothing is sent, and the lead is logged to the browser console. This repo is public, so use an endpoint that is safe to be public. |
| `BOOK_URL` | `https://www.thediggagency.com/contact-us/` | Where "Book a call" goes, in the same tab. `null` = the old "Demo only" alert. |

Optional: `data-offset="80"` on the div makes the scroll stop 80px lower. You only
need it if the auto-detection of a sticky header or admin bar ever gets it wrong.

## Releasing a change

1. Edit `src/` (content changes go in the production repo first, and then
   `src/questions.js` is copied over: the build refuses to run if they differ).
2. Bump `VERSION`, then run `node build.mjs`.
3. Test (below), commit, then `git tag vX.Y.Z && git push origin main vX.Y.Z`.
4. Check that `https://cdn.jsdelivr.net/gh/jrotzdesign/digg-assessment-embed@vX.Y.Z/dist/digg-assessment.js`
   serves the new file.
5. On **staging**, change only the version in the widget's script URL. Update,
   purge the cache, test.
6. Then do the same on live. Tagged files are immutable on jsDelivr, so each page
   keeps exactly the version its snippet names.

**Rollback:** put the previous version back in the widget's URL and purge the cache.

## Tests

```sh
python3 -I test/make_fixture.py <saved copy of her homepage .html> test/fixture
cp dist/digg-assessment.js test/fixture/dist/
python3 -m http.server 8801 -d test/fixture &
python3 -m http.server 8802 -d ../digg-assessment &
python3 -I test/run_tests.py http://localhost:8801 http://localhost:8802 /tmp/shots
```

These run in Chromium at 1440 and in WebKit at 390 (iPhone touch emulation),
against her real theme, kit, header, footer and fonts. They cover:

- intro, questions, scroll, the email gate and Start over
- four paths (all A, all D, mixed, two-way tie) plus 25 random answer sets
- payload and results text compared with production
- computed styles compared with production
- her header and footer unchanged
- no sideways scroll, no console errors, no globals

`test/fixture/` is her page, so it is git-ignored.
