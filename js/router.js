/**
 * BalanceLedger — Lightweight Declarative Client-Side Router Library
 * Pure Vanilla JavaScript (History API + Fetch). Zero dependencies.
 */
(function (global) {
  "use strict";

  /**
   * Central route declaration mapping clean URLs to static HTML files.
   */
  var ROUTES = {
    "/": "/index.html",
    "/buddhist-method": "/buddhist-method.html",
    "/50-30-20-calculator": "/50-30-20-calculator.html",
    "/6-jars-calculator": "/6-jars-calculator.html",
    "/about": "/about.html",
    "/contact": "/contact.html",
    "/privacy-policy": "/privacy-policy.html"
  };

  var HTML_TO_CLEAN = {
    "/index.html": "/",
    "/buddhist-method.html": "/buddhist-method",
    "/50-30-20-calculator.html": "/50-30-20-calculator",
    "/6-jars-calculator.html": "/6-jars-calculator",
    "/about.html": "/about",
    "/contact.html": "/contact",
    "/privacy-policy.html": "/privacy-policy"
  };

  function normalizePath(pathname) {
    if (!pathname) return "/";
    var clean = pathname;
    if (clean.length > 1 && clean.endsWith("/")) {
      clean = clean.slice(0, -1);
    }
    if (HTML_TO_CLEAN[clean]) {
      return HTML_TO_CLEAN[clean];
    }
    return clean;
  }

  function createRouter(routeTable) {
    var routes = routeTable || {};
    var isNavigating = false;

    function resolve(pathname) {
      var clean = normalizePath(pathname);
      return routes[clean] ? { path: clean, file: routes[clean] } : null;
    }

    function updateNavState(activePath) {
      var navLinks = document.querySelectorAll("#site-nav .nav-link");
      navLinks.forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var linkPath = normalizePath(href);
        var isMatch = linkPath === activePath;
        link.classList.toggle("is-active", isMatch);
        if (isMatch) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      var siteNav = document.getElementById("site-nav");
      var navToggle = document.getElementById("nav-toggle");
      if (siteNav && siteNav.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
      }
      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
      }
    }

    function swapDocument(htmlText, targetPath, hash) {
      var parser = new DOMParser();
      var nextDoc = parser.parseFromString(htmlText, "text/html");

      var nextMain = nextDoc.querySelector("main");
      var currentMain = document.querySelector("main");
      if (!nextMain || !currentMain) {
        return false;
      }

      currentMain.replaceWith(nextMain);

      if (nextDoc.title) {
        document.title = nextDoc.title;
      }

      var nextDesc = nextDoc.querySelector('meta[name="description"]');
      var currentDesc = document.querySelector('meta[name="description"]');
      if (nextDesc && currentDesc) {
        currentDesc.setAttribute("content", nextDesc.getAttribute("content") || "");
      }

      updateNavState(targetPath);

      if (global.BalanceLedger && typeof global.BalanceLedger.initPage === "function") {
        global.BalanceLedger.initPage();
      }

      var adSlots = nextMain.querySelectorAll("ins.adsbygoogle");
      adSlots.forEach(function (slot) {
        if (!slot.getAttribute("data-adsbygoogle-status")) {
          try {
            (global.adsbygoogle = global.adsbygoogle || []).push({});
          } catch (err) {
            // Ignore if AdSense script is blocked or not yet loaded
          }
        }
      });

      if (hash) {
        var targetEl = document.querySelector(hash);
        if (targetEl) {
          targetEl.scrollIntoView();
          return true;
        }
      }
      window.scrollTo({ top: 0, behavior: "auto" });
      return true;
    }

    function navigate(urlString, pushHistory) {
      if (isNavigating) return;
      var parsed;
      try {
        parsed = new URL(urlString, window.location.origin);
      } catch (err) {
        return;
      }

      var match = resolve(parsed.pathname);
      if (!match) {
        window.location.href = urlString;
        return;
      }

      isNavigating = true;

      fetch(match.file, { credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Route fetch failed: " + response.status);
          }
          return response.text();
        })
        .then(function (htmlText) {
          var swapped = swapDocument(htmlText, match.path, parsed.hash);
          if (!swapped) {
            window.location.href = urlString;
            return;
          }
          if (pushHistory) {
            var nextUrl = match.path + (parsed.search || "") + (parsed.hash || "");
            window.history.pushState({ path: match.path }, "", nextUrl);
          }
        })
        .catch(function () {
          window.location.href = match.file + (parsed.search || "") + (parsed.hash || "");
        })
        .finally(function () {
          isNavigating = false;
        });
    }

    function handleLinkClick(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      var link = event.target.closest("a");
      if (!link) return;

      if (link.hasAttribute("download") || (link.target && link.target !== "_self")) {
        return;
      }

      var rawHref = link.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return;
      }

      var url;
      try {
        url = new URL(link.href, window.location.origin);
      } catch (err) {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      var match = resolve(url.pathname);
      if (!match) return;

      event.preventDefault();

      var currentClean = normalizePath(window.location.pathname);
      if (currentClean === match.path && url.hash) {
        var anchor = document.querySelector(url.hash);
        if (anchor) anchor.scrollIntoView();
        return;
      }

      navigate(url.pathname + url.search + url.hash, true);
    }

    function start() {
      // Normalize direct .html loads (e.g. /buddhist-method.html -> /buddhist-method)
      if (HTML_TO_CLEAN[window.location.pathname] && window.history && window.history.replaceState) {
        var cleanUrl = HTML_TO_CLEAN[window.location.pathname] + window.location.search + window.location.hash;
        window.history.replaceState({ path: HTML_TO_CLEAN[window.location.pathname] }, "", cleanUrl);
      }

      document.addEventListener("click", handleLinkClick);

      window.addEventListener("popstate", function () {
        navigate(window.location.pathname + window.location.search + window.location.hash, false);
      });
    }

    return {
      routes: routes,
      resolve: resolve,
      navigate: navigate,
      start: start
    };
  }

  var appRouter = createRouter(ROUTES);
  global.BalanceLedgerRouter = appRouter;

  document.addEventListener("DOMContentLoaded", function () {
    appRouter.start();
  });
})(window);
