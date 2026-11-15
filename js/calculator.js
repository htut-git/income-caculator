/**
 * BalanceLedger — Shared Income Management & Budgeting Calculator
 * Pure Vanilla JavaScript (ES6+), zero dependencies.
 */
(function () {
  "use strict";

  var CURRENCIES = {
    USD: { code: "USD", symbol: "$", zeroDecimal: false },
    MMK: { code: "MMK", symbol: "K", zeroDecimal: true },
    THB: { code: "THB", symbol: "฿", zeroDecimal: false },
    SGD: { code: "SGD", symbol: "S$", zeroDecimal: false },
    INR: { code: "INR", symbol: "₹", zeroDecimal: false },
    EUR: { code: "EUR", symbol: "€", zeroDecimal: false },
    GBP: { code: "GBP", symbol: "£", zeroDecimal: false },
    JPY: { code: "JPY", symbol: "¥", zeroDecimal: true }
  };

  var METHODS = {
    buddhist: {
      id: "buddhist",
      title: "Buddhist Method (Sigālovāda Sutta 25/50/25)",
      shortLabel: "Buddhist 25/50/25",
      subtitle: "Classical four-part wisdom adapted into a balanced three-bucket monthly allocation.",
      bestFor:
        "This method works best for entrepreneurs, freelancers, and growth-minded earners who want to actively reinvest half their income into their livelihood, career, or business. It is equally ideal for household stewards who value steady generosity alongside a disciplined, untouched emergency reserve.",
      categories: [
        {
          title: "Living Expenses & Generosity",
          detail: "Dāna, daily needs & supporting family",
          percent: 25,
          tone: "emerald"
        },
        {
          title: "Work, Business & Personal Growth",
          detail: "Reinvestment, tools & skill building",
          percent: 50,
          tone: "gold"
        },
        {
          title: "Emergency & Future Reserve",
          detail: "Untouched safety net & crisis protection",
          percent: 25,
          tone: "teal"
        }
      ]
    },
    "50-30-20": {
      id: "50-30-20",
      title: "The 50/30/20 Rule",
      shortLabel: "50/30/20 Rule",
      subtitle: "Popularized modern framework separating fixed essentials, lifestyle choices, and future wealth.",
      bestFor:
        "The 50/30/20 Rule works best for salaried professionals and steady-income households seeking an intuitive, low-maintenance monthly structure. It offers clear guardrails so you can enjoy dining and leisure guilt-free while still dedicating a reliable 20% toward savings or debt payoff.",
      categories: [
        {
          title: "Needs",
          detail: "Rent, food, utilities & core essentials",
          percent: 50,
          tone: "emerald"
        },
        {
          title: "Wants",
          detail: "Lifestyle, dining & entertainment",
          percent: 30,
          tone: "gold"
        },
        {
          title: "Savings & Debt Repayment",
          detail: "Emergency fund, investing & extra debt payoff",
          percent: 20,
          tone: "teal"
        }
      ]
    },
    "6-jars": {
      id: "6-jars",
      title: "The 6 Jars Money Management Method",
      shortLabel: "6 Jars Method",
      subtitle: "Granular six-account system balancing necessities, freedom, education, leisure, and giving.",
      bestFor:
        "The 6 Jars Method works best for intentional planners who prefer giving every single dollar or kyat a dedicated purpose before it is spent. It shines for lifelong learners and aspiring investors who want structured buckets for self-education, passive income, and guilt-free fun.",
      categories: [
        {
          title: "Necessities",
          detail: "Core living costs, housing & bills",
          percent: 55,
          tone: "emerald"
        },
        {
          title: "Financial Freedom",
          detail: "Investments & passive income assets",
          percent: 10,
          tone: "teal"
        },
        {
          title: "Long-Term Savings",
          detail: "Big purchases & emergency buffer",
          percent: 10,
          tone: "sage"
        },
        {
          title: "Education",
          detail: "Courses, books & skill growth",
          percent: 10,
          tone: "gold"
        },
        {
          title: "Play",
          detail: "Guilt-free fun, travel & leisure",
          percent: 10,
          tone: "slate"
        },
        {
          title: "Give",
          detail: "Charity, community & helping others",
          percent: 5,
          tone: "gold"
        }
      ]
    },
    "80-20": {
      id: "80-20",
      title: "The 80/20 Rule (Pay Yourself First)",
      shortLabel: "80/20 Rule",
      subtitle: "Minimalist two-step rule that secures your savings first and simplifies everything else.",
      bestFor:
        "The 80/20 Rule works best for busy individuals and budgeting beginners who dislike tracking dozens of micro-categories every week. As long as you automate the 20% savings transfer on payday, you can manage the remaining 80% for all living costs without spreadsheet fatigue.",
      categories: [
        {
          title: "Savings & Investments",
          detail: "Automated first transfer for future wealth",
          percent: 20,
          tone: "teal"
        },
        {
          title: "All Living Expenses & Spending",
          detail: "Housing, bills, food & flexible lifestyle",
          percent: 80,
          tone: "emerald"
        }
      ]
    },
    "70-20-10": {
      id: "70-20-10",
      title: "The 70/20/10 Rule",
      shortLabel: "70/20/10 Rule",
      subtitle: "Practical middle-ground budget allocating 70% to living, 20% to saving, and 10% to debt or giving.",
      bestFor:
        "The 70/20/10 Rule works best for households in higher-cost cities or earners balancing living costs with active debt reduction or charitable giving. It provides extra breathing room for everyday expenses compared to the 50/30/20 rule while keeping a strong 30% combined wealth-and-impact rate.",
      categories: [
        {
          title: "Living Expenses",
          detail: "All monthly necessities and everyday spending",
          percent: 70,
          tone: "emerald"
        },
        {
          title: "Savings & Investments",
          detail: "Emergency reserve & long-term compounding",
          percent: 20,
          tone: "teal"
        },
        {
          title: "Debt Payoff or Giving",
          detail: "Accelerated loan payoff, tithing, or charity",
          percent: 10,
          tone: "gold"
        }
      ]
    }
  };

  /**
   * Format a numeric value cleanly with commas and currency symbol.
   */
  function formatCurrency(amount, currencyCode, forceDecimals) {
    var cfg = CURRENCIES[currencyCode] || CURRENCIES.USD;
    var safeAmount = Number.isFinite(amount) && amount >= 0 ? amount : 0;

    var fractionDigits = 0;
    if (!cfg.zeroDecimal) {
      fractionDigits = forceDecimals ? 2 : 0;
    }

    var formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(cfg.zeroDecimal ? Math.round(safeAmount) : safeAmount);

    var spacer = cfg.symbol === "K" ? " " : "";
    return cfg.symbol + spacer + formattedNumber;
  }

  /**
   * Initialize responsive mobile navigation menu across all pages.
   */
  function initNavigation() {
    var navToggle = document.getElementById("nav-toggle");
    var siteNav = document.getElementById("site-nav");
    if (!navToggle || !siteNav) return;

    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      siteNav.classList.toggle("is-open", !expanded);
    });
  }

  /**
   * Initialize static contact form feedback if present on contact.html.
   */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    var status = document.getElementById("contact-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nameInput = document.getElementById("contact-name");
      var emailInput = document.getElementById("contact-email");
      var msgInput = document.getElementById("contact-message");

      var name = nameInput ? nameInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";
      var message = msgInput ? msgInput.value.trim() : "";

      if (!name || !email || !message) {
        status.hidden = false;
        status.textContent = "Please fill in your name, email address, and message before sending.";
        return;
      }

      status.hidden = false;
      status.textContent =
        "Thank you, " +
        name +
        "! Your message has been validated. Because this site runs as a static site with no backend database, please send urgent inquiries directly to hello@balanceledger.org.";
      form.reset();
    });
  }

  /**
   * Initialize the multi-method income calculator on pages containing #budget-calculator.
   */
  function initCalculator() {
    var container = document.getElementById("budget-calculator");
    if (!container) return;

    var incomeInput = document.getElementById("monthly-income");
    var currencySelect = document.getElementById("currency-select");
    var currencyPrefix = document.getElementById("currency-prefix");
    var calculateBtn = document.getElementById("calculate-btn");
    var calcForm = document.getElementById("calculator-form");
    var methodSelect = document.getElementById("method-select");
    var tabButtons = container.querySelectorAll("[data-method-tab]");
    var resultsGrid = document.getElementById("results-grid");
    var resultsTitle = document.getElementById("results-method-title");
    var resultsSubtitle = document.getElementById("results-method-subtitle");
    var methodBestFor = document.getElementById("method-best-for");
    var copyBtn = document.getElementById("copy-breakdown-btn");
    var copyFeedback = document.getElementById("copy-feedback");

    var defaultMethod = container.getAttribute("data-default-method") || "buddhist";
    if (!METHODS[defaultMethod]) {
      defaultMethod = "buddhist";
    }

    var state = {
      method: defaultMethod,
      currency: currencySelect ? currencySelect.value : "USD",
      income: incomeInput ? parseFloat(incomeInput.value) || 0 : 3000
    };

    var copyTimer = null;

    function parseIncome() {
      if (!incomeInput) return 0;
      var raw = parseFloat(incomeInput.value);
      if (!Number.isFinite(raw) || raw < 0) {
        return 0;
      }
      return raw;
    }

    function syncMethodSelectors(methodId) {
      if (methodSelect && methodSelect.value !== methodId) {
        methodSelect.value = methodId;
      }
      tabButtons.forEach(function (btn) {
        var isMatch = btn.getAttribute("data-method-tab") === methodId;
        btn.classList.toggle("is-active", isMatch);
        btn.setAttribute("aria-selected", String(isMatch));
      });
    }

    function updatePrefix() {
      if (!currencyPrefix) return;
      var cfg = CURRENCIES[state.currency] || CURRENCIES.USD;
      currencyPrefix.textContent = cfg.symbol;
    }

    function render() {
      var method = METHODS[state.method] || METHODS.buddhist;
      var income = state.income;
      var cfg = CURRENCIES[state.currency] || CURRENCIES.USD;

      // Determine whether any category amount has fractional cents so formatting stays uniform
      var hasCents = false;
      if (!cfg.zeroDecimal) {
        hasCents = method.categories.some(function (cat) {
          var val = (income * cat.percent) / 100;
          return Math.abs(val - Math.round(val)) > 0.004;
        });
      }

      if (resultsTitle) {
        resultsTitle.textContent = method.title;
      }
      if (resultsSubtitle) {
        resultsSubtitle.textContent =
          "Breakdown for " + formatCurrency(income, state.currency, hasCents) + " monthly income — " + method.subtitle;
      }
      if (methodBestFor) {
        methodBestFor.textContent = method.bestFor;
      }

      if (!resultsGrid) return;

      resultsGrid.classList.remove("has-three", "has-six");
      if (method.categories.length === 3) {
        resultsGrid.classList.add("has-three");
      } else if (method.categories.length === 6) {
        resultsGrid.classList.add("has-six");
      }

      resultsGrid.textContent = "";

      method.categories.forEach(function (cat) {
        var amount = (income * cat.percent) / 100;

        var card = document.createElement("article");
        card.className = "result-card";
        card.setAttribute("data-tone", cat.tone);

        var topRow = document.createElement("div");
        topRow.className = "result-card-top";

        var titleWrap = document.createElement("div");
        var titleEl = document.createElement("h3");
        titleEl.className = "result-card-title";
        titleEl.textContent = cat.title;
        titleWrap.appendChild(titleEl);

        var detailEl = document.createElement("p");
        detailEl.className = "result-card-detail";
        detailEl.textContent = cat.detail;
        titleWrap.appendChild(detailEl);

        var badge = document.createElement("span");
        badge.className = "percent-badge";
        badge.textContent = cat.percent + "%";

        topRow.appendChild(titleWrap);
        topRow.appendChild(badge);

        var amountEl = document.createElement("div");
        amountEl.className = "result-amount";
        amountEl.textContent = formatCurrency(amount, state.currency, hasCents);

        var track = document.createElement("div");
        track.className = "progress-track";
        track.setAttribute("role", "progressbar");
        track.setAttribute("aria-valuenow", String(cat.percent));
        track.setAttribute("aria-valuemin", "0");
        track.setAttribute("aria-valuemax", "100");
        track.setAttribute("aria-label", cat.title + " allocation " + cat.percent + "%");

        var fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = cat.percent + "%";
        track.appendChild(fill);

        card.appendChild(topRow);
        card.appendChild(amountEl);
        card.appendChild(track);
        resultsGrid.appendChild(card);
      });
    }

    function buildClipboardSummary() {
      var method = METHODS[state.method] || METHODS.buddhist;
      var income = state.income;
      var cfg = CURRENCIES[state.currency] || CURRENCIES.USD;
      var hasCents = !cfg.zeroDecimal && method.categories.some(function (cat) {
        var val = (income * cat.percent) / 100;
        return Math.abs(val - Math.round(val)) > 0.004;
      });

      var lines = [
        method.title,
        "Monthly Income: " + formatCurrency(income, state.currency, hasCents) + " (" + state.currency + ")",
        "----------------------------------------"
      ];

      method.categories.forEach(function (cat) {
        var amount = (income * cat.percent) / 100;
        lines.push(
          cat.percent +
            "% — " +
            cat.title +
            " (" +
            cat.detail +
            "): " +
            formatCurrency(amount, state.currency, hasCents)
        );
      });

      lines.push("----------------------------------------");
      lines.push("Calculated with BalanceLedger");
      return lines.join("\n");
    }

    function showCopyMessage(msg) {
      if (!copyFeedback) return;
      copyFeedback.textContent = msg;
      if (copyTimer) {
        clearTimeout(copyTimer);
      }
      copyTimer = setTimeout(function () {
        copyFeedback.textContent = "";
      }, 2800);
    }

    function fallbackCopyText(text) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      var copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (err) {
        copied = false;
      }
      document.body.removeChild(textarea);
      return copied;
    }

    // Event bindings
    if (incomeInput) {
      incomeInput.addEventListener("input", function () {
        state.income = parseIncome();
        render();
      });
    }

    if (currencySelect) {
      currencySelect.addEventListener("change", function () {
        state.currency = currencySelect.value;
        updatePrefix();
        render();
      });
    }

    if (calcForm) {
      calcForm.addEventListener("submit", function (event) {
        event.preventDefault();
        state.income = parseIncome();
        render();
      });
    }

    if (calculateBtn) {
      calculateBtn.addEventListener("click", function () {
        state.income = parseIncome();
        render();
      });
    }

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nextMethod = btn.getAttribute("data-method-tab");
        if (METHODS[nextMethod]) {
          state.method = nextMethod;
          syncMethodSelectors(nextMethod);
          render();
        }
      });
    });

    if (methodSelect) {
      methodSelect.addEventListener("change", function () {
        var nextMethod = methodSelect.value;
        if (METHODS[nextMethod]) {
          state.method = nextMethod;
          syncMethodSelectors(nextMethod);
          render();
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = buildClipboardSummary();
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard.writeText(text).then(
            function () {
              showCopyMessage("Breakdown copied to clipboard!");
            },
            function () {
              var ok = fallbackCopyText(text);
              showCopyMessage(ok ? "Breakdown copied to clipboard!" : "Unable to copy automatically.");
            }
          );
        } else {
          var ok = fallbackCopyText(text);
          showCopyMessage(ok ? "Breakdown copied to clipboard!" : "Unable to copy automatically.");
        }
      });
    }

    // Initial render
    syncMethodSelectors(state.method);
    updatePrefix();
    state.income = parseIncome();
    render();
  }

  function initPage() {
    initCalculator();
    initContactForm();
  }

  window.BalanceLedger = {
    initPage: initPage
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initPage();
  });
})();
