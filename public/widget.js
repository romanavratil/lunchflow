/**
 * LunchFlow Widget v2.0
 * Shadow DOM widget with full design config + time-based visibility.
 *
 * Usage:
 *   <script src="/widget.js" data-restaurant-id="your-id"></script>
 */
(function () {
  "use strict";

  var REFRESH = 30 * 1000; // 30 s — fast enough to see dashboard changes quickly
  var API_BASE = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src).origin
    : window.location.origin;
  var RESTAURANT_ID = document.currentScript && document.currentScript.dataset.restaurantId;

  if (!RESTAURANT_ID) { console.warn("[LunchFlow] No data-restaurant-id set."); return; }

  // ── Helpers ─────────────────────────────────────────────────────────────
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k) {
      if (k === "style" && typeof attrs[k] === "object") {
        Object.assign(e.style, attrs[k]);
      } else if (k === "onclick") {
        e.addEventListener("click", attrs[k]);
      } else {
        e[k] = attrs[k];
      }
    });
    if (children) [].concat(children).forEach(function(c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  function svgFork() {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", "15"); s.setAttribute("height", "15");
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.innerHTML = '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>';
    return s;
  }

  // Locale → currency suffix map (covers most common cases)
  var LOCALE_CURRENCY = {
    "cs":"Kč","sk":"€","de":"€","at":"€","fr":"€","it":"€","es":"€",
    "pt":"€","nl":"€","be":"€","fi":"€","el":"€","hr":"€","sl":"€",
    "pl":"zł","hu":"Ft","ro":"lei","bg":"лв","ru":"₽","uk":"₴",
    "tr":"₺","sv":"kr","da":"kr","nb":"kr","nn":"kr",
    "en-US":"$","en-CA":"CA$","en-AU":"A$","en-NZ":"NZ$","en-GB":"£",
    "en":"$","ja":"¥","zh":"¥","ko":"₩","th":"฿","in":"Rp",
  };

  function getCurrencySuffix(cfg) {
    // Explicit override in config takes priority
    if (cfg && cfg.currency) return cfg.currency;
    var lang = (navigator.language || "en").toLowerCase();
    return LOCALE_CURRENCY[lang] || LOCALE_CURRENCY[lang.split("-")[0]] || "";
  }

  /** "HH:MM" → minutes since midnight */
  function toMins(t) {
    if (!t) return 0;
    var parts = t.split(":").map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  }

  function inSchedule(cfg) {
    if (!cfg) return true;
    var from  = toMins(cfg.showFrom  || "00:00");
    var until = toMins(cfg.showUntil || "23:59");
    if (from === 0 && until >= 1439) return true; // all-day
    var now   = new Date();
    var cur   = now.getHours() * 60 + now.getMinutes();
    return cur >= from && cur <= until;
  }

  /** Convert borderRadius setting to a CSS value */
  function radius(cfg) {
    var map = { sharp: "0px", rounded: "14px", pill: "24px" };
    return map[cfg && cfg.borderRadius] || "14px";
  }

  // ── CSS (injected into Shadow DOM) ───────────────────────────────────────
  function buildStyles(cfg) {
    var r      = radius(cfg);
    var rSm    = cfg.borderRadius === "sharp" ? "0px" : cfg.borderRadius === "pill" ? "14px" : "10px";
    var bg     = (cfg && cfg.modalBg)     || "#ffffff";
    var accent = (cfg && cfg.modalAccent) || "#6366f1";
    var text   = (cfg && cfg.modalText)   || "#111111";
    var isDark = (function(hex) {
      hex = hex.replace("#", "");
      if (hex.length !== 6) return false;
      var r = parseInt(hex.slice(0,2),16)/255, g = parseInt(hex.slice(2,4),16)/255, b = parseInt(hex.slice(4,6),16)/255;
      function lin(c){ return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }
      return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b) < 0.35;
    })(bg);
    var sub    = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)";
    var border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    var itemBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.035)";
    var fabBg  = (cfg && cfg.fabColor) || accent;
    var pos    = (cfg && cfg.fabPosition === "bottom-left") ? "left:24px;right:auto" : "right:24px;left:auto";

    return ":host{all:initial;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}" +

      ".lf-bar{position:fixed;top:0;left:0;right:0;z-index:2147483646;display:flex;align-items:center;" +
      "justify-content:center;padding:10px 48px;font-size:13px;font-weight:500;letter-spacing:.01em;" +
      "box-shadow:0 1px 8px rgba(0,0,0,.15);transition:transform .3s ease}" +
      ".lf-bar.hidden{transform:translateY(-100%)}" +
      ".lf-bar-close{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:transparent;" +
      "border:none;cursor:pointer;font-size:18px;line-height:1;opacity:.6;padding:4px 8px;border-radius:4px}" +
      ".lf-bar-close:hover{opacity:1;background:rgba(0,0,0,.1)}" +

      /* FAB — never moves, always anchored to corner */
      ".lf-fab{position:fixed;bottom:20px;" + pos + ";z-index:2147483648;border:none;" +
      "border-radius:" + r + ";padding:11px 18px;font-size:14px;font-weight:600;color:#fff;" +
      "background:" + fabBg + ";cursor:pointer;display:flex;align-items:center;gap:8px;" +
      "box-shadow:0 4px 20px rgba(0,0,0,.28);transition:transform .15s,box-shadow .15s}" +
      ".lf-fab:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.35)}" +
      ".lf-fab:active{transform:translateY(0)}" +

      ".lf-bd{position:fixed;inset:0;z-index:2147483646;" +
      "background:" + (cfg.displayMode === "modal" ? "rgba(0,0,0,.5)" : "rgba(0,0,0,.2)") + ";" +
      "opacity:0;pointer-events:none;transition:opacity .25s}" +
      ".lf-bd.open{opacity:1;pointer-events:all}" +

      /* Panel — corner mode: above FAB; modal mode: centered overlay */
      (cfg.displayMode === "modal"
        ? ".lf-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 40px));opacity:0;pointer-events:none;" +
          "z-index:2147483647;width:min(420px,calc(100vw - 32px));max-height:82vh;" +
          "border-radius:" + r + ";background:" + bg + ";color:" + text + ";" +
          "box-shadow:0 24px 80px rgba(0,0,0,.35);overflow:hidden;" +
          "transition:transform .3s cubic-bezier(.34,1.08,.64,1),opacity .3s;display:flex;flex-direction:column}" +
          ".lf-modal.open{transform:translate(-50%,-50%);opacity:1;pointer-events:all}"
        : ".lf-modal{position:fixed;bottom:72px;" +
          (cfg.fabPosition === "bottom-left" ? "left:16px;right:auto;" : "right:16px;left:auto;") +
          "border-radius:" + r + ";transform:translateY(calc(100% + 80px));" +
          "z-index:2147483647;width:min(380px,calc(100vw - 32px));max-height:76vh;" +
          "background:" + bg + ";color:" + text + ";" +
          "box-shadow:0 8px 48px rgba(0,0,0,.28);overflow:hidden;" +
          "transition:transform .32s cubic-bezier(.34,1.08,.64,1);display:flex;flex-direction:column}" +
          ".lf-modal.open{transform:translateY(0)}"
      ) +

      ".lf-handle{display:none}" +
      ".lf-head{padding:14px 20px 10px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0}" +
      ".lf-name{font-size:20px;font-weight:800;letter-spacing:-.03em;line-height:1.1;color:" + text + "}" +
      ".lf-date{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:" + sub + ";margin-top:3px}" +
      ".lf-x{background:" + itemBg + ";border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;" +
      "display:flex;align-items:center;justify-content:center;font-size:17px;color:" + text + ";flex-shrink:0}" +
      ".lf-x:hover{background:" + border + "}" +

      ".lf-body{overflow-y:auto;padding:4px 20px 28px;flex:1;-webkit-overflow-scrolling:touch}" +
      ".lf-hr{height:1px;background:" + border + ";margin:0 0 14px}" +
      ".lf-sec{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:" + sub + ";margin:14px 0 7px}" +
      ".lf-soup{font-size:13px;font-style:italic;padding:9px 13px;" +
      "background:" + itemBg + ";border-radius:" + rSm + ";border-left:3px solid " + accent + "}" +
      ".lf-row{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;" +
      "background:" + itemBg + ";border-radius:" + rSm + ";margin-bottom:7px;gap:10px;transition:background .15s}" +
      ".lf-row:hover{background:" + border + "}" +
      ".lf-row.out{opacity:.42}" +
      ".lf-rname{font-size:13px;font-weight:500;color:" + text + "}" +
      ".lf-rdesc{font-size:11px;color:" + sub + ";margin-top:1px;line-height:1.35}" +
      ".lf-row.out .lf-rname{text-decoration:line-through}" +
      ".lf-rtag{font-size:9px;font-weight:700;background:#fee2e2;color:#dc2626;padding:2px 6px;border-radius:20px;margin-top:2px}" +
      ".lf-rprice{font-size:13px;font-weight:700;color:" + accent + ";white-space:nowrap}" +
      ".lf-empty{text-align:center;padding:28px 16px;color:" + sub + ";font-size:13px}" +
      ".lf-foot{text-align:center;padding:10px 20px 20px;font-size:10px;color:" + sub + ";" +
      "flex-shrink:0;border-top:1px solid " + border + "}" +
      ".lf-foot a{color:" + accent + ";text-decoration:none;font-weight:600}" +
      ".lf-foot a:hover{text-decoration:underline}";
  }

  // ── Widget class ─────────────────────────────────────────────────────────
  function Widget() {
    this.data = null;
    this.open = false;
    this.barDismissed = false;
    this._boot();
  }

  Widget.prototype._boot = function() {
    var self = this;
    this.host = document.createElement("div");
    this.host.id = "lunchflow-widget";
    document.body.appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: "closed" });

    this.styleEl = document.createElement("style");
    this.shadow.appendChild(this.styleEl);

    this.bar = el("div", { className: "lf-bar hidden" });
    this.barClose = el("button", { className: "lf-bar-close", title: "Dismiss", innerHTML: "×",
      onclick: this._dismissBar.bind(this) });
    this.bar.appendChild(this.barClose);

    this.bd = el("div", { className: "lf-bd", onclick: this._close.bind(this) });
    this.modal = el("div", { className: "lf-modal" });
    this.fab = el("button", { className: "lf-fab", onclick: this._toggle.bind(this), title: "Today's Menu" });

    this.shadow.appendChild(this.bar);
    this.shadow.appendChild(this.fab);
    this.shadow.appendChild(this.bd);
    this.shadow.appendChild(this.modal);

    // Hide entire widget until first fetch so nothing flashes unstyled
    this.host.style.display = "none";
    this._firstLoad = true;

    this._fetch();
    setInterval(this._fetch.bind(this), REFRESH);

    // Re-fetch the instant the tab becomes visible again (e.g. switching from dashboard)
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "visible") self._fetch();
    });
    window.addEventListener("focus", function() { self._fetch(); });
  };

  Widget.prototype._fetch = function() {
    var self = this;
    fetch(API_BASE + "/api/v1/widget/" + RESTAURANT_ID + "?t=" + Date.now(), { cache: "no-store" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) { if (d) { self.data = d; self._render(); } })
      .catch(function(e) { console.warn("[LunchFlow]", e); });
  };

  Widget.prototype._render = function() {
    var d = this.data;
    if (!d) return;
    var cfg = d.widgetConfig || {};

    // Rebuild styles
    this.styleEl.textContent = buildStyles(cfg);

    // FAB label (set before revealing)
    var label = (cfg.fabLabel || "Today's Menu");
    this.fab.innerHTML = "";
    this.fab.appendChild(svgFork());
    this.fab.appendChild(document.createTextNode(label));

    // FAB visibility — reveal only after styles+label are ready
    var visible = inSchedule(cfg);
    var self = this;
    if (this._firstLoad) {
      this._firstLoad = false;
      this.host.style.display = "";
      if (visible) {
        this.fab.style.display = "flex";
        this.fab.style.opacity = "0";
        this.fab.style.transition = "opacity .25s";
        setTimeout(function() {
          self.fab.style.opacity = "1";
          // Auto-open after FAB fades in — skip if user already closed it today
          if (cfg.autoOpen && !self.open && !self._dismissedToday()) {
            setTimeout(function() { self._open(); }, 300);
          }
        }, 16);
      } else {
        this.fab.style.display = "none";
      }
    } else {
      this.fab.style.display = visible ? "flex" : "none";
    }

    // Announcement bar
    var ann = d.announcement;
    if (ann && !this.barDismissed) {
      this.bar.style.background = ann.bgColor;
      this.bar.style.color = ann.textColor;
      this.barClose.style.color = ann.textColor;
      var old = this.bar.querySelector(".lf-bar-txt");
      if (old) old.remove();
      this.bar.insertBefore(el("span", { className: "lf-bar-txt" }, ann.text), this.barClose);
      this.bar.classList.remove("hidden");
      document.body.style.paddingTop = this.bar.offsetHeight + "px";
    } else {
      this.bar.classList.add("hidden");
      document.body.style.paddingTop = "";
    }

    this._renderModal(d, cfg);
  };

  Widget.prototype._renderModal = function(d, cfg) {
    var menu = d.menu;
    var date = new Date().toLocaleDateString(navigator.language || "en", { weekday:"long", month:"long", day:"numeric" });

    this.modal.innerHTML = "";
    this.modal.appendChild(el("div", { className: "lf-handle" }));

    // Header
    var head = el("div", { className: "lf-head" });
    var titleWrap = el("div", {}, [
      el("div", { className: "lf-name" }, cfg.modalTitle || (d.restaurant && d.restaurant.name) || "Today's Menu"),
      el("div", { className: "lf-date" }, date)
    ]);
    var closeBtn = el("button", { className: "lf-x", innerHTML: "×", onclick: this._close.bind(this) });
    head.appendChild(titleWrap);
    head.appendChild(closeBtn);
    this.modal.appendChild(head);

    // Body
    var body = el("div", { className: "lf-body" });
    body.appendChild(el("div", { className: "lf-hr" }));

    if (!menu || (!menu.soup && !(menu.mains && menu.mains.length))) {
      body.appendChild(el("div", { className: "lf-empty" }, "No menu posted for today yet"));
    } else {
      var cur = getCurrencySuffix(cfg);
      if (menu.soup) {
        body.appendChild(el("div", { className: "lf-sec" }, "Soup of the Day"));
        var soupRow = el("div", { className: "lf-row", style: { marginBottom: "0" } });
        soupRow.appendChild(el("div", { className: "lf-rname", style: { fontStyle: "italic" } }, menu.soup));
        if (menu.soupPrice) soupRow.appendChild(el("div", { className: "lf-rprice" }, menu.soupPrice + (cur ? "\u00a0" + cur : "")));
        body.appendChild(soupRow);
      }
      if (menu.mains && menu.mains.length) {
        body.appendChild(el("div", { className: "lf-sec" }, "Main Courses"));
        menu.mains.forEach(function(item) {
          var row = el("div", { className: "lf-row" + (item.soldOut ? " out" : "") });
          var left = el("div", {}, el("div", { className: "lf-rname" }, item.name));
          if (item.description) left.appendChild(el("div", { className: "lf-rdesc" }, item.description));
          if (item.soldOut) left.appendChild(el("div", { className: "lf-rtag" }, "SOLD OUT"));
          row.appendChild(left);
          row.appendChild(el("div", { className: "lf-rprice" }, item.price + (cur ? "\u00a0" + cur : "")));
          body.appendChild(row);
        });
      }
    }

    this.modal.appendChild(body);
    this.modal.appendChild(
      el("div", { className: "lf-foot" }, ["Powered by ",
        el("a", { href: "https://lunchflow.app", target: "_blank", rel: "noopener" }, "LunchFlow")])
    );
  };

  Widget.prototype._toggle = function() { this.open ? this._close() : this._open(); };

  Widget.prototype._open = function() {
    this.open = true;
    this.modal.classList.add("open");
    this.bd.classList.add("open");
    // Track open event (best-effort, ignore errors)
    fetch(API_BASE + "/api/v1/widget/" + RESTAURANT_ID + "/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "open" }),
    }).catch(function() {});
  };

  Widget.prototype._close = function() {
    this.open = false;
    this.modal.classList.remove("open");
    this.bd.classList.remove("open");
    // Remember that the user closed it today so auto-open won't fire again
    try {
      var today = new Date();
      var ds = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
      localStorage.setItem("lf-closed-" + RESTAURANT_ID, ds);
    } catch(e) {}
  };

  Widget.prototype._dismissedToday = function() {
    try {
      var today = new Date();
      var ds = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
      return localStorage.getItem("lf-closed-" + RESTAURANT_ID) === ds;
    } catch(e) { return false; }
  };

  Widget.prototype._dismissBar = function() {
    this.barDismissed = true;
    this.bar.classList.add("hidden");
    document.body.style.paddingTop = "";
  };

  // ── Boot ─────────────────────────────────────────────────────────────────
  function boot() {
    if (document.getElementById("lunchflow-widget")) return;
    new Widget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
