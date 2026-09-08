/* ============================================================
   One Growth — interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav shadow on scroll ---------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
    };
    toggle.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
  }

  /* ---------- Count-up numbers ---------- */
  function formatNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = prefix + formatNum(target) + suffix;
      return;
    }

    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var shown = target % 1 === 0 ? Math.round(val) : val.toFixed(1);
      el.textContent = prefix + formatNum(shown) + suffix;
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + formatNum(target) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal on scroll + trigger nested animations ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  function activate(el) {
    el.classList.add("is-visible");
    el.querySelectorAll("[data-count]").forEach(runCounter);
    if (el.matches("[data-count]")) runCounter(el);
    el.querySelectorAll(".viz--growth").forEach(function (v) {
      v.classList.add("is-visible");
    });
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(activate);
    document.querySelectorAll(".viz--growth").forEach(function (v) {
      v.classList.add("is-visible");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          activate(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      if (!form.checkValidity()) {
        status.classList.add("is-err");
        status.textContent = "Please fill in your name, practice, and a valid email.";
        form.reportValidity();
        return;
      }

      var action = form.getAttribute("action") || "";
      if (action.indexOf("your-form-id") !== -1) {
        status.classList.add("is-err");
        status.textContent =
          "Form not connected yet — add your Formspree ID (or endpoint) to the form's action attribute.";
        return;
      }

      var btn = form.querySelector("button[type=submit]");
      var label = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            status.classList.add("is-ok");
            status.textContent = "Thanks — we'll be in touch within one business day.";
          } else {
            throw new Error("Bad response");
          }
        })
        .catch(function () {
          status.classList.add("is-err");
          status.textContent =
            "Something went wrong. Email hello@onegrowth.co and we'll pick it up.";
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = label;
          }
        });
    });
  }
})();
