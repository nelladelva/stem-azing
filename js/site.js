// STEM-azing — shared page behaviour, wired by data attributes:
//   [data-currency="EUR|USD"]  € / $ switch for .amount and .amount-project
//   [data-filter-group]        filter chips (.chip[data-filter]) over [data-tags] items
//   .pay-btn[data-service]     invoice-request dialog (#payModal) → pre-filled email
//   [data-calendly-load]       loads the Calendly widget into .calendly-slot[data-url] on click

var INVOICE_EMAIL = "stemazing.advancement@gmail.com";

var INVOICE_TEXT = {
  en: {
    subject: "Invoice request: ",
    body: function (o) {
      return "Hello Dr. Delva,\n\nPlease send me an invoice for " + o.service + " (starting rate " + formatMoney(o.symbol, o.amount, "en") + (o.unit || "") + ", " + o.currency + ").\n\n" +
        "Billing name:\nBilling address:\nShort project description:\n\nThank you!\n\n(No VAT is charged under § 19 UStG.)";
    }
  },
  de: {
    subject: "Rechnungsanfrage: ",
    body: function (o) {
      return "Guten Tag Frau Dr. Delva,\n\nbitte senden Sie mir eine Rechnung für " + o.service + " (Startpreis " + formatMoney(o.symbol, o.amount, "de") + (o.unit || "") + ", " + o.currency + ").\n\n" +
        "Rechnungsname:\nRechnungsadresse:\nKurze Projektbeschreibung:\n\nVielen Dank!\n\n(Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.)";
    }
  }
};

// "€150" in English, "150 €" in German
function formatMoney(symbol, value, lang) {
  var v = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "de" ? "." : ",");
  return lang === "de" ? v + " " + symbol : symbol + v;
}

// { service, symbol, amount, unit, currency, lang } → { subject, href }
function buildInvoiceMail(o) {
  var t = INVOICE_TEXT[o.lang] || INVOICE_TEXT.en;
  var subject = t.subject + o.service;
  return {
    subject: subject,
    href: "mailto:" + INVOICE_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(t.body(o))
  };
}

if (typeof module !== "undefined") module.exports = { buildInvoiceMail: buildInvoiceMail, formatMoney: formatMoney };
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  // ── Currency switch ──
  var currency = "EUR";
  var pageLang = document.documentElement.lang === "de" ? "de" : "en";
  window.stemCurrency = function () { return currency; };

  function setCurrency(cur) {
    currency = cur;
    var symbol = cur === "EUR" ? "€" : "$";
    var attr = cur === "EUR" ? "data-eur" : "data-usd";
    document.querySelectorAll("[data-currency]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-currency") === cur ? "true" : "false");
    });
    document.querySelectorAll(".amount").forEach(function (el) {
      var val = el.getAttribute(attr);
      if (!val) return;
      var unit = el.querySelector(".unit");
      el.innerHTML = formatMoney(symbol, val, pageLang) + (unit ? " " + unit.outerHTML : "");
    });
    document.querySelectorAll(".amount-project").forEach(function (el) {
      var val = el.getAttribute(attr);
      if (val) el.textContent = formatMoney(symbol, val, pageLang);
    });
  }

  document.querySelectorAll("[data-currency]").forEach(function (b) {
    b.addEventListener("click", function () { setCurrency(b.getAttribute("data-currency")); });
  });

  // ── Filter chips ──
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var chips = group.querySelectorAll(".chip");
    var items = document.querySelectorAll(group.getAttribute("data-filter-group") + " [data-tags]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        var filter = chip.getAttribute("data-filter");
        items.forEach(function (item) {
          var tags = (item.getAttribute("data-tags") || "").split(",");
          item.style.display = filter === "all" || tags.indexOf(filter) !== -1 ? "" : "none";
        });
      });
    });
  });
  // ── Invoice request dialog ──
  var modal = document.getElementById("payModal");
  var lastFocus = null;
  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".pay-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!modal) return;
      var card = btn.closest(".service");
      var priceEl = card.querySelector(".amount");
      var unit = priceEl.querySelector(".unit");
      var symbol = currency === "EUR" ? "€" : "$";
      var amount = priceEl.getAttribute(currency === "EUR" ? "data-eur" : "data-usd");
      var unitText = unit ? unit.textContent.trim().replace(/^\/\s*/, "/") : "";
      var service = btn.getAttribute("data-service");
      var lang = btn.getAttribute("data-lang") || document.documentElement.lang || "en";
      var mail = buildInvoiceMail({ service: service, symbol: symbol, amount: amount, unit: unitText, currency: currency, lang: lang });
      document.getElementById("payModalService").textContent = service;
      document.getElementById("payModalAmount").textContent = formatMoney(symbol, amount, lang) + unitText;
      document.getElementById("invoiceLink").href = mail.href;
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      document.getElementById("invoiceLink").focus();
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach(function (b) { b.addEventListener("click", closeModal); });
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (!modal || !modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var items = modal.querySelectorAll("a[href], button");
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // ── Calendly, loaded only after a click ──
  document.querySelectorAll("[data-calendly-load]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var slot = btn.closest(".calendly-slot");
      if (!slot || slot.querySelector(".calendly-inline-widget")) return;
      var w = document.createElement("div");
      w.className = "calendly-inline-widget";
      w.setAttribute("data-url", slot.getAttribute("data-url"));
      slot.appendChild(w);
      var sc = document.createElement("script");
      sc.src = "https://assets.calendly.com/assets/external/widget.js";
      sc.async = true;
      document.body.appendChild(sc);
      btn.disabled = true;
    });
  });
})();
