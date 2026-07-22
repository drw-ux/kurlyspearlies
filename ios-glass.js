/* Kurly's Pearlies — iOS Liquid Glass behaviors (preview build)
   Builds the floating glass dock, condenses the nav on scroll,
   hides the dock while scrolling down (classic iOS toolbar behavior). */
(function () {
  "use strict";
  var mq = window.matchMedia("(max-width:744px)");

  /* Where the page lives relative to root (set by the injector). */
  var root = (document.currentScript && document.currentScript.dataset.root) || "";
  var onBookPage = /\/book\//.test(location.pathname) || /book\/index\.html$/.test(location.pathname);

  var icons = {
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-5.8-7-11a7 7 0 0 1 14 0c0 5.2-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>'
  };

  function buildDock() {
    if (document.querySelector(".lg-dock")) return;
    var dock = document.createElement("nav");
    dock.className = "lg-dock";
    dock.setAttribute("aria-label", "Quick actions");
    var bookHref = onBookPage
      ? "https://kurlyspearlies.janeapp.com/#/dental-hygiene"
      : root + "book/";
    dock.innerHTML =
      '<a class="lg-side lg-press" href="tel:+14164604436" aria-label="Call Kurly’s Pearlies">' + icons.phone + "<span>Call</span></a>" +
      '<a class="lg-book lg-press" href="' + bookHref + '"' + (onBookPage ? ' target="_blank" rel="noopener"' : "") + ">" + icons.sparkle + "<span>Book</span></a>" +
      '<a class="lg-side lg-press" href="https://maps.apple.com/?daddr=28+Robina+Avenue,+Georgetown,+ON+L7G+5X9" target="_blank" rel="noopener" aria-label="Get directions">' + icons.pin + "<span>Visit</span></a>";
    /* enter after the page has had a moment to breathe */
    dock.classList.add("lg-hide");
    document.body.appendChild(dock);
    document.body.classList.add("lg-has-dock");
    var entered = false;
    function enter() {
      if (entered) return; entered = true;
      dock.classList.remove("lg-hide");
      dock.classList.add("lg-entered");
    }
    setTimeout(enter, 900);
    window.addEventListener("scroll", enter, { once: true, passive: true });
    return dock;
  }


  /* ---------- numbered glass menu (Boreal & Bay flow) ---------- */
  function buildMenu() {
    if (document.querySelector(".lg-menu") || !mq.matches) return;
    var nav = document.querySelector("nav.site .nav-inner");
    if (!nav) return;
    var btn = document.createElement("button");
    btn.className = "lg-menu-btn lg-press";
    btn.setAttribute("aria-label", "Open menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span>";
    nav.insertBefore(btn, nav.firstChild);

    var menu = document.createElement("div");
    menu.className = "lg-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute("aria-label", "Site menu");
    var r = root;
    menu.innerHTML =
      '<ul class="lg-menu-links">' +
      '<li><a href="' + r + '"><span class="lg-menu-num">01</span><span class="lg-menu-word">The <em>Studio</em></span></a></li>' +
      '<li><a href="' + r + '#offerings"><span class="lg-menu-num">02</span><span class="lg-menu-word">Services</span></a></li>' +
      '<li><a href="' + r + '#about"><span class="lg-menu-num">03</span><span class="lg-menu-word">Meet <em>Kelly</em></span></a></li>' +
      '<li><a href="' + r + '#locations"><span class="lg-menu-num">04</span><span class="lg-menu-word">Find <em>Us</em></span></a></li>' +
      '<li><a href="' + r + 'blog/"><span class="lg-menu-num">05</span><span class="lg-menu-word">The <em>Journal</em></span></a></li>' +
      "</ul>" +
      '<div class="lg-menu-foot">' +
      '<a class="lg-menu-book lg-press" href="' + r + 'book/">Book a Visit &rarr;</a>' +
      '<div class="lg-menu-meta"><a href="tel:+14164604436">416 460 4436</a><a href="https://www.instagram.com/kurlys_pearlies/" target="_blank" rel="noopener">Instagram</a></div>' +
      "</div>";
    document.body.appendChild(menu);

    function setOpen(open) {
      document.documentElement.classList.toggle("lg-menu-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    btn.addEventListener("click", function () {
      setOpen(!document.documentElement.classList.contains("lg-menu-open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }


  /* ---------- god-mode loading: fetch far ahead, fade in on arrival ---------- */
  function godScroll() {
    var imgs = [].slice.call(document.images).filter(function (im) {
      return !im.closest("nav") && !im.closest(".lg-dock") &&
             !/logo/.test(im.className) && im.width !== 0 || im.loading === "lazy";
    });
    function reveal(im) {
      if (im.complete && im.naturalWidth) im.classList.add("lg-in");
      else {
        im.addEventListener("load", function () { im.classList.add("lg-in"); }, { once: true });
        im.addEventListener("error", function () { im.classList.add("lg-in"); }, { once: true });
      }
      /* safety net: never leave a photo invisible */
      setTimeout(function () { im.classList.add("lg-in"); }, 2600);
    }
    /* start network fetch ~2000px before the photo scrolls in */
    var pre = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.loading = "eager"; e.target.decoding = "async"; pre.unobserve(e.target); }
      });
    }, { rootMargin: "2000px 0px" }) : null;
    /* begin the fade slightly before the photo enters the viewport */
    var rev = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); rev.unobserve(e.target); }
      });
    }, { rootMargin: "10% 0px" }) : null;
    imgs.forEach(function (im) {
      im.setAttribute("data-lgfade", "");
      if (pre && rev) { pre.observe(im); rev.observe(im); }
      else reveal(im);
    });
  }

  function init() {
    if (!mq.matches) return;
    var dock = buildDock();
    buildMenu();
    godScroll();
    var nav = document.querySelector("nav.site");
    /* nav is fixed on mobile (sticky is broken by overflow-x:hidden) —
       reserve its height and keep anchor targets clear of it */
    function padForNav() {
      if (!nav) return;
      var h = nav.offsetHeight;
      document.body.style.paddingTop = h + "px";
      document.documentElement.style.scrollPaddingTop = (h + 12) + "px";
    }
    padForNav();
    window.addEventListener("resize", padForNav);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(padForNav);
    var lastY = window.scrollY, acc = 0, ticking = false;

    function onScroll() {
      var y = window.scrollY;
      var dy = y - lastY;
      lastY = y;
      if (nav) nav.classList.toggle("lg-condensed", y > 28);
      if (dock && dock.classList.contains("lg-entered")) {
        /* accumulate direction so tiny jitters don't flicker the dock */
        if ((dy > 0 && acc < 0) || (dy < 0 && acc > 0)) acc = 0;
        acc += dy;
        if (y < 40 || acc < -14) dock.classList.remove("lg-hide");
        else if (acc > 90) dock.classList.add("lg-hide");
        /* always reveal near page bottom (contact / booking CTAs live there) */
        if (window.innerHeight + y >= document.documentElement.scrollHeight - 120)
          dock.classList.remove("lg-hide");
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
