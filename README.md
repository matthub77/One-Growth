# One Growth — website

Apple-inspired one-page site for **One Growth**, a marketing & strategy
consultancy that helps medical practices reach more patients.

Plain HTML/CSS/JS. No build step, no framework, no dependencies.

## Files (this is the entire project)

| File | Purpose |
|------|---------|
| `index.html` | All page content |
| `styles.css` | All styling (brand colors are variables at the top) |
| `script.js` | Nav, mobile menu, scroll animations, count-up stats, contact form |
| `netlify.toml` | Tells Netlify to serve `index.html` from the repo root — prevents the 404 |
| `.gitignore` | Keeps `.DS_Store` and other junk out of the repo |

## Run it locally

Double-click `index.html`, or serve it:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Put it on GitHub

**Important:** the three site files must sit at the **root** of the repo —
`index.html`, not `One Growth/index.html`. Nesting them in a subfolder is the
usual cause of a Netlify 404.

Easiest route (GitHub website):

1. Create a new empty repo (e.g. `one-growth`) — do **not** add a README from GitHub.
2. On the repo page: **Add file → Upload files**.
3. Open this folder in Finder, select the files *inside* it
   (`index.html`, `styles.css`, `script.js`, `netlify.toml`, `.gitignore`),
   and drag those into the browser — not the folder itself.
4. Commit.

Or with the command line, from inside this folder:

```bash
git init
git add .
git commit -m "One Growth site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/one-growth.git
git push -u origin main
```

## Deploy on Netlify

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Leave build command **empty**. Publish directory: `.` (a single dot).
   `netlify.toml` already sets this, so you can just click Deploy.
3. Done — every push to `main` redeploys.

## Before you go live — replace these

1. **Contact form.** Create a free form at <https://formspree.io>, then in
   `index.html` change `action="https://formspree.io/f/your-form-id"` to your
   real endpoint. Until then the form shows a "not connected yet" message.
2. **Email.** `hello@onegrowth.co` appears in the contact section and footer.
3. **Numbers.** The stats in "Why practices plateau" and "Results" are
   illustrative placeholders. Swap in real figures and delete the small grey
   disclaimer lines underneath.
4. **Testimonial.** Replace the placeholder quote in the Results section.

## Changing the look

Every brand value lives in `:root` at the top of `styles.css`:
`--brand` (blue), `--teal`, `--grad` (the blue→teal gradient), `--ink` (text).
Change those and the whole site follows.
