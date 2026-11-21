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

  // Слайдеры
  // Каждый слайдер — это блок с data-slider.
  // Внутри: .slider__track > .slider__page (один слайд = одна .slider__page),
  // а точки переключения создаются автоматически в [data-dots].
  // data-autoplay — пауза между сменой слайдов в миллисекундах.
  document.querySelectorAll("[data-slider]").forEach(function (root) {
    var track = root.querySelector(".slider__track");
    var dotsWrap = root.querySelector("[data-dots]");
    if (!track || !dotsWrap) return;

    var pages = Array.prototype.slice.call(
      track.querySelectorAll(":scope > .slider__page")
    );
    if (pages.length === 0) return;

    var autoplay = parseInt(root.getAttribute("data-autoplay") || "0", 10);
    var current = 0;
    var timer = null;

    pages.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Показать слайд " + (i + 1));
      dot.addEventListener("click", function () {
        go(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    function go(i) {
      if (pages.length <= 1) {
        current = 0;
      } else {
        current = ((i % pages.length) + pages.length) % pages.length;
      }
      track.style.transform = "translateX(-" + current * 100 + "%)";
      Array.prototype.forEach.call(dotsWrap.children, function (d, j) {
        d.classList.toggle("is-active", j === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (autoplay > 0 && pages.length > 1) {
        timer = setInterval(function () {
          go(current + 1);
        }, autoplay);
      }
    }

    if (autoplay > 0 && pages.length > 1) {
      timer = setInterval(function () {
        go(current + 1);
      }, autoplay);
    }

    // Останавливаем автопрокрутку, пока курсор над слайдером
    root.addEventListener("mouseenter", function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    root.addEventListener("mouseleave", restart);
  });
})();
