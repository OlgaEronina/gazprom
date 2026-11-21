// Газпром газораспределение Великий Новгород — landing interactions
(function () {
  "use strict";

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

  // Мегаменю: открывается по бургеру (десктоп), закрывается крестиком.
  // В мобильной версии панель скрыта стилями — макета для неё нет.
  var header = document.getElementById("site-header");
  var openBtn = document.querySelector("[data-menu-open]");
  var closeBtn = document.querySelector("[data-menu-close]");
  function setMenu(open) {
    if (!header || !openBtn) return;
    header.classList.toggle("is-menu-open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (openBtn) {
    openBtn.addEventListener("click", function () {
      setMenu(!header.classList.contains("is-menu-open"));
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", function () { setMenu(false); });
  }

  // Слайдеры
  // Один слайд = один элемент .slider__page внутри .slider__track.
  // Учитываются только слайды, видимые на текущей ширине экрана
  // (например, мобильные слайды скрыты на десктопе).
  // Точки создаются автоматически в [data-dots].
  // data-autoplay — пауза между сменой слайдов, в миллисекундах.
  function initSlider(root) {
    var track = root.querySelector(".slider__track");
    var dotsWrap = root.querySelector("[data-dots]");
    if (!track || !dotsWrap) return null;

    var autoplay = parseInt(root.getAttribute("data-autoplay") || "0", 10);
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
      track.style.transform = "translateX(-" + current * 100 + "%)";
      Array.prototype.forEach.call(dotsWrap.children, function (d, j) {
        d.classList.toggle("is-active", j === current);
      });
    }

    function build() {
      stop();
      pages = visiblePages();
      dotsWrap.innerHTML = "";
      current = 0;
      track.style.transform = "translateX(0)";
      pages.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Показать слайд " + (i + 1));
        dot.addEventListener("click", function () {
          go(i);
          start();
        });
        dotsWrap.appendChild(dot);
      });
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
