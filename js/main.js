// STEM-azing — shared site behavior (mobile nav, filter chips, scroll reveal)
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".navlinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Generic chip-filter: any [data-filter-group] wraps chips [data-filter] and
  // items with [data-tags="a,b,c"]; clicking a chip shows matching items.
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var chips = group.querySelectorAll(".chip");
    var targetSelector = group.getAttribute("data-filter-group");
    var items = document.querySelectorAll(targetSelector + " [data-tags]");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var filter = chip.getAttribute("data-filter");
        items.forEach(function (item) {
          var tags = (item.getAttribute("data-tags") || "").split(",");
          var show = filter === "all" || tags.indexOf(filter) !== -1;
          item.style.display = show ? "" : "none";
        });
      });
    });
  });

  // Scroll reveal — progressive enhancement only. Content is visible by
  // default (see CSS); we only ever hide it here if we can also guarantee
  // showing it again, so a JS failure never leaves content invisible.
  if ("IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".reveal");
    revealEls.forEach(function (el) { el.classList.add("reveal-init"); });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
