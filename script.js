/* ============================================================
   One Growth — interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav shadow + scroll-progress rail ---------- */
  var nav = document.getElementById("nav");
  var progressBar = document.getElementById("scrollProgressBar");
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
    if (progressBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      progressBar.style.width = pct + "%";
    }
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }
  onScrollFrame();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

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

  /* ---------- Scrollspy: highlight the nav link for the section in view ---------- */
  var navLinks = document.querySelectorAll(".nav__links a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (a) {
      linkFor[a.getAttribute("href").slice(1)] = a;
    });
    var spySections = Object.keys(linkFor)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkFor[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (a) { a.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Ladder: stages fill in progressively as you scroll past ---------- */
  var ladder = document.querySelector(".ladder");
  if (ladder && "IntersectionObserver" in window) {
    var ladderItems = ladder.querySelectorAll("li");
    var steps = [];
    for (var s = 0; s <= 20; s++) steps.push(s / 20);

    var ladderIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var ratio = entry.intersectionRatio;
          var activeCount = Math.ceil(ratio * ladderItems.length);
          ladderItems.forEach(function (li, i) {
            li.classList.toggle("is-active", i < activeCount);
          });
        });
      },
      { threshold: steps }
    );
    ladderIO.observe(ladder);
  }

  /* ---------- Speciality selector ---------- */
  var specialityGroup = document.querySelector(".specialities");
  if (specialityGroup) {
    var specialityBtns = specialityGroup.querySelectorAll(".speciality");
    var specialityInput = document.getElementById("speciality");
    var specialityHint = document.getElementById("specialityHint");

    var selectSpeciality = function (value, persist) {
      specialityBtns.forEach(function (b) {
        var match = !!value && b.getAttribute("data-speciality") === value;
        b.classList.toggle("is-selected", match);
        b.setAttribute("aria-pressed", String(match));
      });
      if (specialityInput) specialityInput.value = value || "";
      if (specialityHint) specialityHint.hidden = !value;
      if (persist) {
        try {
          if (value) localStorage.setItem("og_speciality", value);
          else localStorage.removeItem("og_speciality");
        } catch (e) {}
      }
    };

    specialityBtns.forEach(function (btn) {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-speciality");
        var alreadySelected = btn.classList.contains("is-selected");
        selectSpeciality(alreadySelected ? null : value, true);
      });
    });

    try {
      var savedSpeciality = localStorage.getItem("og_speciality");
      if (savedSpeciality) selectSpeciality(savedSpeciality, false);
    } catch (e) {}
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
