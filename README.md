# Portfolio — Abubakar Albakri

A static portfolio site. No build step, no dependencies, no npm. Open
`index.html` in a browser and it works.

---

## Files

```
portfolio/
├── index.html      All page content and structure
├── css/
│   └── style.css   Design tokens, layout, components, responsive rules
├── js/
│   └── main.js     Case study content, modal, scroll rail, form
└── README.md
```

Three files do everything. Here's what each one owns, so you know where to
go when you want to change something.

### `index.html`

Page structure in document order: masthead, left rail, hero, work grid,
about, record, contact, footer, and the empty modal shell at the bottom that
JavaScript fills in.

Each project in the work grid is an `<article>` with a `data-project`
attribute. That attribute is the key that looks up the case study content in
`main.js` — so `data-project="securevault"` loads `CASES.securevault`.

### `css/style.css`

The top of the file is a `:root` block with every design token. Change a value
there and it propagates everywhere:

| Token | What it is |
|---|---|
| `--paper` | Page background, a cool drafting-paper grey |
| `--paper-raised` | Slightly lighter surface for inputs and hover states |
| `--ink` | Body text and headings, shifted blue rather than pure black |
| `--ink-soft` | Secondary text |
| `--rule` | Every hairline and border |
| `--signal` | The single accent, used only on links and hover |
| `--t--1` … `--t-5` | Type scale, a 1.25 minor third from a 17px base |
| `--rail-w` | Width of the left rail column |
| `--gutter` | Page margin, fluid between 20px and 64px |

Everything below is grouped by component with a comment header.

### `js/main.js`

Opens with a `CASES` object holding all six case studies. This is where you
edit project write-ups — each entry has a `year`, `title`, `standfirst`,
`stack` array, `repo` URL, and a `sections` array. Each section takes an `h`
heading plus any of `p` (array of paragraphs), `list` (array of bullets), or
`code` (a preformatted block).

Below that: modal open/close with focus trapping, the scroll rail, the mobile
nav, the counters, and form validation.

---

## Running it

Double-click `index.html`. That's genuinely it.

If you'd rather use a local server so paths behave exactly as they will in
production:

```bash
cd portfolio
python -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Editing content

**Add a project.** Two steps. First add the card in `index.html` inside
`<div class="grid">`, copying an existing `<article>` and changing the
`data-project` value:

```html
<article class="entry" data-project="mynewproject" tabindex="0" role="button"
         aria-label="Open My New Project case study">
  <div class="entry__top">
    <h3>My New Project</h3>
    <span class="entry__year">2026</span>
  </div>
  <p class="entry__blurb">One or two sentences on what it does.</p>
  <ul class="entry__stack"><li>Python</li><li>Flask</li></ul>
  <span class="entry__open">Read case study</span>
</article>
```

Then add the matching entry to `CASES` in `main.js` using the same key.
Add `class="entry entry--wide"` if you want it to span both columns.

**Change the colour scheme.** Edit the six colour tokens in `:root`. The
palette is deliberately restrained — one accent, used sparingly. If you add
a second accent, the discipline goes.

**Change the fonts.** Two families: Archivo for headings, Source Serif 4 for
body. Update the Google Fonts `<link>` in `index.html` and the `--display`
and `--body` tokens in the CSS.

---

## Making the contact form actually send

Right now the form validates properly and then opens the visitor's email
client with the message prefilled. That works everywhere and needs no account,
but it does depend on them having a mail client set up.

To have messages arrive in your inbox instead, use [Formspree](https://formspree.io)
— free tier, no backend needed. Sign up, create a form, then in `main.js`
replace the `window.location.href = 'mailto:...'` block with:

```js
fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: new FormData(form)
})
  .then(function (res) {
    if (!res.ok) throw new Error('Request failed');
    status.dataset.state = 'ok';
    status.textContent = 'Message sent. I will get back to you.';
    form.reset();
  })
  .catch(function () {
    status.dataset.state = 'bad';
    status.textContent = 'That did not send. Email me directly at bakri20041@outlook.com.';
  });
```

If you deploy to Netlify instead, add `netlify` and `name="contact"` to the
`<form>` tag and Netlify handles it with no JavaScript changes at all.

---

## Publishing it

**GitHub Pages.** Create a repo called `ekql-ops.github.io`, push these files
to it, and the site is live at `https://ekql-ops.github.io` within a minute.

```bash
cd portfolio
git init
git add .
git commit -m "Add portfolio site"
git branch -M main
git remote add origin https://github.com/ekql-ops/ekql-ops.github.io.git
git push -u origin main
```

**Netlify.** Drag the whole `portfolio` folder onto the deploy area at
[app.netlify.com/drop](https://app.netlify.com/drop). You get a URL straight
away and can point a custom domain at it later.

Either way, put the resulting URL on your CV and in your GitHub profile
README.

---

## The motion system

All timing runs off six tokens in `:root`, so you can retune the whole site
from one place:

| Token | Value | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances — a long expo deceleration |
| `--ease-soft` | `cubic-bezier(0.4, 0, 0.2, 1)` | Colour and background shifts |
| `--ease` | `cubic-bezier(.22, .61, .36, 1)` | The hero wipe and modal panel |
| `--d-enter` | `720ms` | Scroll reveals |
| `--d-hover` | `240ms` | Anything answering a pointer |
| `--d-press` | `90ms` | Active and pressed states |

The split between those last three is what makes it read as expensive rather
than busy: entrances are slow and unhurried, interactions are fast enough to
feel instant, and presses are near-immediate so nothing feels laggy under
your finger.

**Scroll reveals.** Elements matching the selectors in `REVEAL_GROUPS` in
`main.js` fade up 14px. Three rules keep this from reading as an effect:

1. Anything already on screen at load is marked `instant` and never animates.
   You cannot reveal something the visitor is already reading, and doing it
   anyway is the clearest tell of a templated site.
2. Siblings stagger 60ms apart, capped at five, so a group arrives as a
   sequence without leaving the last item waiting.
3. Each element is unobserved once revealed, so nothing re-animates when you
   scroll back up.

To add something to the reveal set, put its selector in `REVEAL_GROUPS`. To
take something out, remove it. No HTML changes needed either way.

**Why cards lift instead of scaling.** A 2% scale on a 700px-wide card moves
its edge 7px and reads as wobble. On a button the same value reads as
responsive. So the large cards take a 2px lift with a shadow, and
`scale(1.02)` is reserved for small controls where it works properly.

Cards also take `z-index: 2` on hover. The grid draws its rules with a 1px
gap and a background colour showing through, so without that, a lifted card
exposes a sliver of grid background along its bottom edge. If you restyle
the grid, keep the z-index.

**Performance.** `will-change` is applied only to elements still waiting to
reveal, and removed 800ms after they land — otherwise the browser holds a
GPU layer for every element on the page at once. All transforms use
`translate3d` so they stay on the compositor.

**Reduced motion.** `prefers-reduced-motion: reduce` collapses all of it:
reveals resolve instantly, the hero wipe is skipped, the counters don't run,
and every transform is stripped. Worth re-testing if you change anything —
on macOS it's under Accessibility → Display → Reduce motion.

---

## Accessibility and quality notes

Things that are already handled, so you don't undo them by accident:

- Skip link to main content for keyboard users
- Project cards are keyboard-operable — `tabindex`, `role="button"`, and
  Enter/Space handlers
- The modal traps focus while open, closes on Escape, and returns focus to
  the card that opened it
- `prefers-reduced-motion` disables the hero animation, the counters and all
  transitions
- Form errors are announced and tied to their fields, and clear as soon as
  the visitor starts fixing them
- Visible focus rings throughout — don't remove the `:focus-visible` rule
- Responsive at 1080px, 860px and 620px breakpoints

One deliberate CSS detail worth knowing about: `.modal[hidden]` has an
explicit `display: none`. Without it, `display: flex` beats the `hidden`
attribute and an invisible full-screen overlay swallows every click on the
page. If clicks ever stop registering, that rule is the first thing to check.
