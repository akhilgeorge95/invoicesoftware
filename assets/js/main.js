/* ==========================================================================
   InvoiceSoftware.ae — interaction & animation engine
   No dependencies. Every module guards against missing markup so the same
   file can be shared across all pages.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- Theme */
  /* Set as early as possible in <head> too, to avoid a flash. */

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("is-theme", theme); } catch (e) { /* private mode */ }
  }

  function initTheme() {
    $$("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    });
  }

  /* ------------------------------------------------------ Nav + progress */

  function initNav() {
    var nav = $(".nav");
    var bar = $(".progress-bar");
    var burger = $(".nav__burger");
    var menu = $(".mobile-menu");

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle("is-stuck", y > 12);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (burger && menu) {
      var close = function () {
        burger.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      };
      burger.addEventListener("click", function () {
        var open = burger.getAttribute("aria-expanded") === "true";
        if (open) { close(); return; }
        burger.setAttribute("aria-expanded", "true");
        menu.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
      $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
  }

  /* ------------------------------------------------- Stagger index setup */
  /* Gives children a --i custom property so CSS can cascade delays. */

  function initStagger() {
    var groups = [
      ".check-list", ".timeline", ".steps", ".chart",
      ".mobile-menu", ".line-items", "[data-stagger]"
    ];
    $$(groups.join(",")).forEach(function (group) {
      $$(":scope > *", group).forEach(function (child, i) {
        child.style.setProperty("--i", i);
      });
    });
  }

  /* -------------------------------------------------------- Split words */
  /* Wraps each word of [data-split] in a span for a cascading entrance.
     Elements matching ATOMIC animate as a single unit instead of being split:
     gradient text relies on background-clip against the whole element, which
     breaks if its glyphs are moved into transformed child spans. */

  var ATOMIC = ".grad-text, .rotator, [data-split-atom]";

  function initSplit() {
    $$("[data-split]").forEach(function (el) {
      var index = 0;
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var text = child.textContent;
            if (!text.trim()) return;
            var frag = document.createDocumentFragment();
            text.split(/(\s+)/).forEach(function (chunk) {
              if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
              var span = document.createElement("span");
              span.className = "word";
              span.style.setProperty("--w", index++);
              span.textContent = chunk;
              frag.appendChild(span);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && !child.classList.contains("word")) {
            if (child.matches(ATOMIC)) {
              child.classList.add("word");
              child.style.setProperty("--w", index++);
              return;
            }
            walk(child);
          }
        });
      };
      walk(el);
    });
  }

  /* ----------------------------------------------------- Scroll reveals */

  function initReveal() {
    var targets = $$(".reveal, .steps, .timeline, .showcase, .check-list--solo");

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      $$(".line-item").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    targets.forEach(function (el) { io.observe(el); });

    /* Auto-stagger siblings inside a [data-reveal-group] wrapper. */
    $$("[data-reveal-group]").forEach(function (group) {
      var step = parseInt(group.getAttribute("data-reveal-group"), 10) || 90;
      $$(":scope > .reveal", group).forEach(function (el, i) {
        el.style.setProperty("--delay", i * step + "ms");
      });
    });
  }

  /* -------------------------------------------------- Hero invoice build */

  function initInvoiceBuild() {
    var items = $$(".line-item");
    if (!items.length) return;
    if (reduced) { items.forEach(function (el) { el.classList.add("is-in"); }); return; }
    items.forEach(function (el, i) {
      setTimeout(function () { el.classList.add("is-in"); }, 700 + i * 160);
    });
  }

  /* ------------------------------------------------------- Number counters */

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = parseInt(el.getAttribute("data-duration"), 10) || 1800;

    if (reduced) {
      el.textContent = prefix + target.toLocaleString("en-AE", {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      return;
    }

    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);           // easeOutQuart
      el.textContent = prefix + (target * eased).toLocaleString("en-AE", {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nums = $$("[data-count]");
    if (!nums.length) return;

    if (!("IntersectionObserver" in window)) { nums.forEach(animateCount); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------- Cursor spotlight cards */

  function initSpotlight() {
    if (reduced || window.matchMedia("(hover: none)").matches) return;
    $$(".card--spot").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ------------------------------------------------------ Magnetic buttons */

  function initMagnetic() {
    if (reduced || window.matchMedia("(hover: none)").matches) return;
    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.18 + "px," + y * 0.28 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ----------------------------------------------------- Hero mouse parallax */

  function initParallax() {
    var stage = $(".hero__visual");
    var inner = $(".hero__visual-inner");
    if (!stage || !inner || reduced || window.matchMedia("(hover: none)").matches) return;

    var frame = null;
    window.addEventListener("mousemove", function (e) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        var px = (e.clientX / window.innerWidth) - 0.5;
        var py = (e.clientY / window.innerHeight) - 0.5;
        inner.style.transform =
          "rotateY(" + (px * 9) + "deg) rotateX(" + (-py * 7) + "deg) translateZ(0)";
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------- Pricing toggle */

  function initPricing() {
    var toggle = $(".billing-toggle");
    if (!toggle) return;

    var buttons = $$("button", toggle);
    var pill = $(".billing-toggle__pill", toggle);

    function movePill(btn) {
      if (!pill) return;
      pill.style.width = btn.offsetWidth + "px";
      pill.style.transform = "translateX(" + btn.offsetLeft + "px)";
    }

    function remeasure() {
      var active = $("button.is-active", toggle);
      if (active) movePill(active);
    }

    function setCycle(cycle) {
      buttons.forEach(function (b) {
        var active = b.getAttribute("data-cycle") === cycle;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
        if (active) movePill(b);
      });

      $$("[data-monthly]").forEach(function (el) {
        var next = el.getAttribute(cycle === "annual" ? "data-annual" : "data-monthly");
        if (next === null || el.textContent === next) return;
        el.textContent = next;
        el.classList.remove("is-morph");
        void el.offsetWidth;                          // restart the animation
        el.classList.add("is-morph");
      });

      $$("[data-period-monthly]").forEach(function (el) {
        el.textContent = el.getAttribute(
          cycle === "annual" ? "data-period-annual" : "data-period-monthly"
        );
      });

      $$("[data-note-annual]").forEach(function (el) {
        el.textContent = cycle === "annual" ? el.getAttribute("data-note-annual") : "";
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () { setCycle(b.getAttribute("data-cycle")); });
    });

    setCycle("monthly");
    window.addEventListener("resize", remeasure);

    /* Web fonts change the button widths, so measure again once they land. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  }

  /* ------------------------------------------------------------ Accordion */

  function initAccordion() {
    $$(".acc-item").forEach(function (item) {
      var btn = $(".acc-btn", item);
      if (!btn) return;
      btn.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        var group = item.closest(".accordion");
        if (group) {
          $$(".acc-item", group).forEach(function (other) {
            other.classList.remove("is-open");
            var b = $(".acc-btn", other);
            if (b) b.setAttribute("aria-expanded", "false");
          });
        }
        item.classList.toggle("is-open", !open);
        btn.setAttribute("aria-expanded", String(!open));
      });
    });
  }

  /* -------------------------------------------------------- Word rotator */

  function initRotator() {
    var rot = $(".rotator");
    if (!rot) return;
    var list = $(".rotator__list", rot);
    var words = $$("span", list);
    if (words.length < 2 || reduced) return;

    var i = 0;
    setInterval(function () {
      i = (i + 1) % words.length;
      list.style.transform = "translateY(-" + (i * 1.06) + "em)";
    }, 2600);
  }

  /* ------------------------------------------------------- Contact form */

  function initForm() {
    var form = $("[data-demo-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = $("button[type=submit]", form);
      var status = $("[data-form-status]", form);
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = "Send request"; }
        if (status) {
          status.hidden = false;
          status.textContent =
            "Thanks — your request is queued. Connect this form to your CRM or mail handler to receive it.";
        }
      }, 900);
    });
  }

  /* ------------------------------------------------------- Current year */

  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* --------------------------------------------------------------- Boot */

  function boot() {
    initTheme();
    initNav();
    initStagger();
    initSplit();
    initReveal();
    initInvoiceBuild();
    initCounters();
    initSpotlight();
    initMagnetic();
    initParallax();
    initPricing();
    initAccordion();
    initRotator();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
