// Газпром газораспределение Великий Новгород — landing interactions
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Плавная прокрутка к якорям
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        // Пустая ссылка-заглушка — не прыгаем наверх
        e.preventDefault();
      }
    });
  });

  // Мегаменю: эффект «джинна» из бургера и обратно
  var header = document.getElementById("site-header");
  var openBtn = document.querySelector("[data-menu-open]");
  var mobilePanel = document.getElementById("mobile-menu");
  var desktopPanel = document.getElementById("megamenu");

  function getPanel() {
    return window.matchMedia("(max-width: 767px)").matches ? mobilePanel : desktopPanel;
  }

  var menuOpen = false;
  var menuAnim = null;
  var activePanel = null;

  function genieFrames() {
    var r = openBtn.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var hw = r.width / 2;
    var hh = r.height / 2;
    var pin = function (x, y) { return x + "px " + y + "px"; };
    var box = [pin(cx - hw, cy - hh), pin(cx + hw, cy - hh), pin(cx + hw, cy + hh), pin(cx - hw, cy + hh)].join(", ");
    var funnel = ["0px 0px", "100% 0px", pin(cx + hw, cy + hh), pin(cx - hw, cy + hh)].join(", ");
    var full = "0px 0px, 100% 0px, 100% 100%, 0px 100%";
    return [
      { clipPath: "polygon(" + box + ")", opacity: 0.4, offset: 0 },
      { clipPath: "polygon(" + funnel + ")", opacity: 1, offset: 0.55 },
      { clipPath: "polygon(" + full + ")", opacity: 1, offset: 1 }
    ];
  }
  var genieTiming = { duration: 560, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "both" };

  function setAria(open) {
    var panel = activePanel || getPanel();
    header.classList.toggle("is-menu-open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function openMenu() {
    if (menuOpen) return;
    var panel = getPanel();
    if (!panel) return;
    menuOpen = true;
    activePanel = panel;
    setAria(true);
    closeSubmenus();

    if (panel.id === "mobile-menu") {
      panel.classList.add("is-open");
      document.body.classList.add("menu-open");
      var closeBtn = panel.querySelector("[data-menu-close]");
      if (closeBtn) closeBtn.focus();
      return;
    }

    if (menuAnim) menuAnim.cancel();
    panel.style.display = "block";
    if (reduceMotion) return;
    menuAnim = panel.animate(genieFrames(), genieTiming);
  }

  function closeMenu() {
    if (!menuOpen) return;
    var panel = activePanel || getPanel();
    menuOpen = false;
    activePanel = null;
    setAria(false);

    if (panel && panel.id === "mobile-menu") {
      panel.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      if (openBtn) openBtn.focus();
      return;
    }

    if (!panel) return;
    if (reduceMotion || !menuAnim) {
      panel.style.display = "none";
      return;
    }
    menuAnim.onfinish = function () {
      if (!menuOpen) panel.style.display = "none";
    };
    menuAnim.reverse();
  }

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      if (menuOpen) closeMenu(); else openMenu();
    });
  }
  [mobilePanel, desktopPanel].forEach(function (p) {
    if (!p) return;
    var btn = p.querySelector("[data-menu-close]");
    if (btn) btn.addEventListener("click", closeMenu);
  });

  // Подменю пунктов навигации: открываются по клику на пункт.
  // Положение: левый край — у пункта, верх — у нижней границы верхней полосы шапки.
  var mainbar = header ? header.querySelector(".mainbar") : null;
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav__item"));

  function placeSubmenu(item) {
    var sub = item.querySelector(".submenu");
    var link = item.querySelector(".nav__link");
    if (!sub || !link || !mainbar) return;
    var hr = header.getBoundingClientRect();
    var lr = link.getBoundingClientRect();
    var mr = mainbar.getBoundingClientRect();
    sub.style.left = (lr.left - hr.left) + "px";
    sub.style.top = (mr.bottom - hr.top) + "px";
  }

  function closeSubmenus() {
    navItems.forEach(function (item) {
      item.classList.remove("is-open");
      var link = item.querySelector(".nav__link[aria-haspopup]");
      if (link) link.setAttribute("aria-expanded", "false");
    });
  }

  function toggleSubmenu(item) {
    var link = item.querySelector(".nav__link");
    var open = !item.classList.contains("is-open");
    closeSubmenus();
    if (open) {
      placeSubmenu(item);
      item.classList.add("is-open");
      link.setAttribute("aria-expanded", "true");
    }
  }

  navItems.forEach(function (item) {
    var link = item.querySelector(".nav__link");
    if (!link) return;
    link.addEventListener("click", function (e) {
      if (!item.querySelector(".submenu")) {
        // Пункт без подменю в макете — ссылка-заглушка
        e.preventDefault();
        return;
      }
      e.preventDefault();
      toggleSubmenu(item);
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__item")) closeSubmenus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (menuOpen) closeMenu();
      closeSubmenus();
    }
  });

  // Мобильное меню: аккордеон. Одновременно открыт один раздел.
  var mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    var accordionButtons = mobileMenu.querySelectorAll(".mobile-menu__link[aria-controls]");
    accordionButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".mobile-menu__item");
        var willOpen = !item.classList.contains("is-open");

        mobileMenu.querySelectorAll(".mobile-menu__item.is-open").forEach(function (openItem) {
          openItem.classList.remove("is-open");
          var openButton = openItem.querySelector(".mobile-menu__link[aria-controls]");
          if (openButton) openButton.setAttribute("aria-expanded", "false");
        });

        if (willOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    var mobileSearch = mobileMenu.querySelector(".mobile-menu__search");
    if (mobileSearch) {
      mobileSearch.addEventListener("submit", function (e) {
        e.preventDefault();
      });
    }
  }
  window.addEventListener("resize", function () {
    if (menuOpen) closeMenu();
    navItems.forEach(function (item) {
      if (item.classList.contains("is-open")) placeSubmenu(item);
    });
  });

  // Слайдеры: плавная смена слайдов (затухание + лёгкое приближение).
  // Структура: [data-slider] > .slider__viewport > .slider__track > .slider__page (слайды).
  // Видны только слайды, доступные на текущей ширине экрана.
  // Точки создаются автоматически в [data-dots].
  // data-autoplay — пауза между слайдами в миллисекундах.
  function initSlider(root) {
    var track = root.querySelector(".slider__track");
    var dotsWrap = root.querySelector("[data-dots]");
    if (!track || !dotsWrap) return null;

    var autoplay = reduceMotion ? 0 : parseInt(root.getAttribute("data-autoplay") || "0", 10);
    var pages = [];
    var current = 0;
    var timer = null;

    function visiblePages() {
      return Array.prototype.filter.call(
        track.querySelectorAll(":scope > .slider__page"),
        function (p) { return getComputedStyle(p).display !== "none"; }
      );
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (autoplay > 0 && pages.length > 1) {
        timer = setInterval(function () { go(current + 1); }, autoplay);
      }
    }

    function go(i) {
      if (pages.length === 0) return;
      current = ((i % pages.length) + pages.length) % pages.length;
      pages.forEach(function (p, j) { p.classList.toggle("is-active", j === current); });
      Array.prototype.forEach.call(dotsWrap.children, function (d, j) {
        d.classList.toggle("is-active", j === current);
        d.setAttribute("aria-current", j === current ? "true" : "false");
      });
    }

    function build() {
      stop();
      pages = visiblePages();
      dotsWrap.innerHTML = "";
      pages.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider__dot";
        dot.setAttribute("aria-label", "Показать слайд " + (i + 1));
        dot.addEventListener("click", function () {
          go(i);
          start();
        });
        dotsWrap.appendChild(dot);
      });
      go(0);
      start();
    }

    // Автопрокрутка останавливается, пока курсор над слайдером
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    build();
    return build;
  }

  var rebuilders = [];
  document.querySelectorAll("[data-slider]").forEach(function (root) {
    var rebuild = initSlider(root);
    if (rebuild) rebuilders.push(rebuild);
  });

  // При переходе между десктопом и мобильной версией пересобираем слайдеры
  var resizeTimer = null;
  var lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      rebuilders.forEach(function (rebuild) { rebuild(); });
    }, 150);
  });
})();
