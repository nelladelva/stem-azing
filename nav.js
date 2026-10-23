// ============================================================
// STEM-azing — shared header/footer injector
// Keeps the menu and footer in one place across every page
// (main pages, /posts/ and /de/). All links are root-absolute.
// ============================================================

// German pages under /de/. true = show the EN | DE switch and German menus.
var DE_LIVE = true;

var NAV = {
  en: [
    { href: "/", label: "Home" },
    { href: "/services.html", label: "Services" },
    { href: "/biography.html", label: "Biography" },
    { href: "/about.html", label: "About" },
    { href: "/neuropenetrance.html", label: "NeuroPenetrance" },
    { href: "/writing.html", label: "Writing" }
  ],
  de: [
    { href: "/de/", label: "Start" },
    { href: "/de/services.html", label: "Leistungen" },
    { href: "/de/biography.html", label: "Biografie" },
    { href: "/de/about.html", label: "Über mich" },
    { href: "/de/neuropenetrance.html", label: "NeuroPenetrance" },
    { href: "/de/writing.html", label: "Texte" }
  ]
};

var STRINGS = {
  en: {
    cta: "Book a free call", booking: "/booking.html", menu: "Menu",
    blurb: "Science made clear, for every classroom, page and lab.",
    explore: "Explore", connect: "Connect", call: "Book a free 20-min call",
    impressum: "Impressum", privacy: "Privacy"
  },
  de: {
    cta: "Kostenloses Gespräch buchen", booking: "/de/booking.html", menu: "Menü",
    blurb: "Wissenschaft verständlich gemacht – für Unterricht, Text und Labor.",
    explore: "Seiten", connect: "Kontakt", call: "Kostenloses 20-Minuten-Gespräch",
    impressum: "Impressum", privacy: "Datenschutz"
  }
};

var EMAIL = "stemazing.advancement@gmail.com";

function langOf(pathname) {
  return /^\/de(\/|$)/.test(pathname || "") ? "de" : "en";
}

// Language of the menu and footer: German only once DE_LIVE is on, so
// hidden German pages (e.g. the legal ones) never link into other German pages.
function menuLang(pathname) {
  return DE_LIVE ? langOf(pathname) : "en";
}

function navLinks(lang) { return NAV[lang] || NAV.en; }
function ctaLabel(lang) { return (STRINGS[lang] || STRINGS.en).cta; }

// Same page in the other language, or null (posts are English only,
// and nothing links to German while DE_LIVE is false).
function alternateUrl(pathname, toLang) {
  if (!DE_LIVE) return null;
  var p = pathname || "/";
  if (/^\/posts\//.test(p)) return null;
  var from = langOf(p);
  if (from === toLang) return p;
  if (toLang === "de") {
    var file = p.replace(/^\//, "");
    return file === "" || file === "index.html" ? "/de/" : "/de/" + file;
  }
  var en = p.replace(/^\/de\/?/, "");
  return en === "" || en === "index.html" ? "/" : "/" + en;
}

function footerLinks(lang) {
  var s = STRINGS[lang] || STRINGS.en;
  var pre = lang === "de" ? "/de" : "";
  return [
    { href: pre + "/impressum.html", label: s.impressum },
    { href: pre + "/datenschutz.html", label: s.privacy },
    { href: "https://www.linkedin.com/in/nelladelva", label: "LinkedIn", external: true },
    { href: "https://x.com/NellaDelva", label: "X", external: true },
    { href: "https://www.instagram.com/stem_azing/", label: "Instagram", external: true }
  ];
}

function _setDeLive(on) { DE_LIVE = !!on; }

function isActive(href, pathname) {
  return href === pathname.replace(/index\.html$/, "");
}

function renderHeader(pathname) {
  var lang = menuLang(pathname);
  var s = STRINGS[lang];
  var links = navLinks(lang).map(function (l) {
    return '<a href="' + l.href + '"' + (isActive(l.href, pathname) ? ' aria-current="page"' : "") + ">" + l.label + "</a>";
  }).join("");
  var alt = alternateUrl(pathname, lang === "de" ? "en" : "de");
  var sw = alt
    ? '<span class="lang-switch">' +
        (lang === "en" ? '<b>EN</b> | <a href="' + alt + '" hreflang="de" lang="de">DE</a>'
                       : '<a href="' + alt + '" hreflang="en" lang="en">EN</a> | <b>DE</b>') +
      "</span>"
    : "";
  var home = lang === "de" ? "/de/" : "/";
  document.getElementById("site-header").innerHTML =
    '<div class="nav wrap">' +
      '<a href="' + home + '" class="brand">STEM-azing</a>' +
      '<button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="navlinks">' + s.menu + "</button>" +
      '<nav class="navlinks" id="navlinks" aria-label="Main">' + links + sw +
        '<a href="' + s.booking + '" class="btn btn--accent nav-cta">' + s.cta + "</a>" +
      "</nav>" +
    "</div>";
  var toggle = document.getElementById("menuToggle");
  toggle.addEventListener("click", function () {
    var open = document.getElementById("navlinks").classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function renderFooter(pathname) {
  var lang = menuLang(pathname);
  var s = STRINGS[lang];
  var explore = navLinks(lang).map(function (l) { return '<a href="' + l.href + '">' + l.label + "</a>"; }).join("");
  var fl = footerLinks(lang);
  var social = fl.filter(function (l) { return l.external; }).map(function (l) {
    return '<a href="' + l.href + '" target="_blank" rel="noopener">' + l.label + "</a>";
  }).join("");
  var legal = fl.filter(function (l) { return !l.external; }).map(function (l) {
    return '<a href="' + l.href + '">' + l.label + "</a>";
  }).join("");
  document.getElementById("site-footer").innerHTML =
    '<div class="wrap footer-grid">' +
      '<div><p class="footer-brand">STEM-azing</p><p>' + s.blurb + '</p><div class="footer-row">' + social + "</div></div>" +
      '<div><p class="footer-h">' + s.explore + '</p><div class="footer-col">' + explore + "</div></div>" +
      '<div><p class="footer-h">' + s.connect + '</p><div class="footer-col"><a href="' + s.booking + '">' + s.call + "</a>" +
        '<a href="mailto:' + EMAIL + '">' + EMAIL + "</a></div></div>" +
    "</div>" +
    '<div class="wrap footer-bottom"><span>&copy; ' + new Date().getFullYear() + " Nella C. Delva, Ph.D. — STEM-azing · Berlin</span>" +
      '<span class="footer-row">' + legal + "</span></div>";
}

if (typeof document !== "undefined") {
  var start = function () {
    var path = location.pathname;
    if (document.getElementById("site-header")) renderHeader(path);
    if (document.getElementById("site-footer")) renderFooter(path);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}

if (typeof module !== "undefined") {
  module.exports = {
    get DE_LIVE() { return DE_LIVE; },
    langOf: langOf, menuLang: menuLang, navLinks: navLinks, ctaLabel: ctaLabel,
    alternateUrl: alternateUrl, footerLinks: footerLinks, _setDeLive: _setDeLive
  };
}
