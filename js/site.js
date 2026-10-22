// STEM-azing — shared page behaviour, wired by data attributes:
//   [data-currency="EUR|USD"]  € / $ switch for .amount and .amount-project
//   [data-filter-group]        filter chips (.chip[data-filter]) over [data-tags] items
//   a.pay-btn                  links to the request forms; get ?currency= when the € / $ switch changes
//   [data-calendly-load]       loads the Calendly widget into .calendly-slot[data-url] on click

// "€150" in English, "150 €" in German
function formatMoney(symbol, value, lang) {
  var v = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "de" ? "." : ",");
  return lang === "de" ? v + " " + symbol : symbol + v;
}

if (typeof module !== "undefined") module.exports = { formatMoney: formatMoney };
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
    document.querySelectorAll("a.pay-btn").forEach(function (a) {
      a.href = a.getAttribute("href").split("?")[0] + "?currency=" + cur;
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
