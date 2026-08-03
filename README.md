# STEM-azing — New Website

A complete, custom-built 8-page site: Home, Biography, Portfolio, CV, Services & Pricing,
Blog, Booking, and NeuroPenetrance — built as plain HTML/CSS/JS so it can be hosted for
free on Netlify or GitHub Pages.

## Before you publish: 3 things to configure

This site is fully built and functional, but three pieces need YOUR real account details
plugged in — these can't be created on your behalf, since they involve your own payment
and scheduling accounts.

### 1. Payment (PayPal) — in `services.html`

Near the bottom of `services.html`, find this line:
```js
const PAYPAL_USERNAME = "YOURPAYPALNAME";
```
Replace `YOURPAYPALNAME` with your actual PayPal.me username (create one free at
paypal.me if you don't have one — takes about 2 minutes). This makes every "Pay 50%
deposit" button generate a real PayPal payment link with the correct amount and currency
automatically.

**Note on the prices themselves:** the EUR/USD numbers currently in `services.html` are
starting-rate placeholders grounded in typical freelance consulting/data science rates in
Germany (roughly €90–120/hr depending on service) — not your final pricing. Search for
`data-eur=` and `data-usd=` in that file to find and edit every price.

### 2. Booking (Calendly) — in `booking.html`

Find this line:
```html
data-url="https://calendly.com/YOUR-CALENDLY-USERNAME/20min"
```
Sign up free at calendly.com, create a "20 Minute Meeting" event type, and replace the
URL with your real scheduling link.

### 3. NeuroPenetrance demo link — in `neuropenetrance.html`

Find:
```html
src="https://neuropenetrance.streamlit.app"
```
Replace with your actual deployed Streamlit Cloud URL if it's different from this
placeholder.

## How to deploy (free)

### Option A: Netlify (recommended — fastest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this entire folder onto the page
3. You'll get a live URL in seconds (e.g., `random-name-123.netlify.app`)
4. To use your own domain name later: Site settings → Domain management → Add custom domain

### Option B: GitHub Pages (since you already have GitHub set up)
1. Create a new repository (e.g., `stem-azing-website`) the same way you did for
   `neuropenetrance_app`
2. Add all these files to it via GitHub Desktop, commit, and push
3. On GitHub.com, go to the repo's **Settings → Pages**
4. Under "Source," select the `main` (or `master`) branch and click Save
5. Your site will be live at `https://yourusername.github.io/stem-azing-website`

## Adding new blog posts

Open `blog.html` and find the `<div class="grid" id="blogGrid">` section. Each post is one
`<a class="card">` block. To add a new post, copy an existing block and edit the title,
date, excerpt, and link.

## Files in this folder

- `index.html` — Home
- `biography.html` — Biography
- `portfolio.html` — Professional portfolio
- `cv.html` — Full CV
- `services.html` — Services, pricing, and payment
- `booking.html` — 20-minute call booking
- `neuropenetrance.html` — NeuroPenetrance project page + live demo
- `blog.html` — Blog listing
- `styles.css` — Shared design system
- `nav.js` — Shared header/footer (edit once, updates every page)
