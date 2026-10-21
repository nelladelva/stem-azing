// STEM-azing — shared page behaviour, wired by data attributes:
//   [data-currency="EUR|USD"]  € / $ switch for .amount and .amount-project
//   [data-filter-group]        filter chips (.chip[data-filter]) over [data-tags] items
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  // ── Currency switch ──
  var currency = "EUR";
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
      el.innerHTML = symbol + val + (unit ? " " + unit.outerHTML : "");
    });
    document.querySelectorAll(".amount-project").forEach(function (el) {
      var val = el.getAttribute(attr);
      if (val) el.textContent = symbol + val;
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
})();
