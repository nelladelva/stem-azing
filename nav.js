// ============================================================
// STEM-azing — shared header/footer injector
// Keeps the nav and footer in one place across every page.
// ============================================================

const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "biography.html", label: "Biography" },
  { href: "portfolio.html", label: "Portfolio" },
  { href: "cv.html", label: "CV" },
  { href: "services.html", label: "Services & Pricing" },
  { href: "blog.html", label: "Blog" },
  { href: "neuropenetrance.html", label: "NeuroPenetrance" },
];

function renderHeader(activePage){
  const nav = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${activePage === l.href ? 'active' : ''}">${l.label}</a>`
  ).join('');

  document.getElementById('site-header').innerHTML = `
    <div class="nav">
      <a href="index.html" class="brand"><span class="brand-mark"></span>STEM-azing</a>
      <nav class="navlinks" id="navlinks">
        ${nav}
        <a href="booking.html" class="nav-cta">Book a Call</a>
      </nav>
      <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">&#9776;</button>
    </div>
  `;

  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navlinks').classList.toggle('open');
  });
}

function renderFooter(){
  document.getElementById('site-footer').innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <h4>STEM-azing</h4>
          <p style="max-width:340px; font-size:14px; opacity:0.85;">
            Global scientist bridging bench research and data science —
            consulting, writing, and translating discovery into impact.
          </p>
          <div class="social-row">
            <a href="https://www.linkedin.com/in/nelladelva" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://x.com/NellaDelva" target="_blank" rel="noopener">X</a>
            <a href="https://www.instagram.com/stem_azing/" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <a href="portfolio.html">Portfolio</a>
            <a href="services.html">Services & Pricing</a>
            <a href="blog.html">Blog</a>
            <a href="neuropenetrance.html">NeuroPenetrance</a>
          </div>
        </div>
        <div>
          <h4>Connect</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <a href="booking.html">Book a 20-min call</a>
            <a href="mailto:stemazing.advancement@gmail.com">stemazing.advancement@gmail.com</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Nella C. Delva, Ph.D. — STEM-azing</span>
        <span>Berlin, Germany</span>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page') || '';
  renderHeader(page);
  renderFooter();
});
