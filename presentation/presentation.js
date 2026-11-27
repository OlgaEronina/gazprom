// Интерактивная презентация дизайн-концепции.
// Каталог шаблонов и настройки просмотра.
(function () {
  "use strict";

  var DESKTOP_W = 1440;
  var MOBILE_W = 393;
  var MOBILE_H = 852;
  var PHONE_BEZEL = 10;

  // Чтобы добавить новый шаблон, достаточно добавить объект в нужную группу.
  // src — путь к готовой странице относительно папки presentation/.
  // mobile: false — если для страницы нет корректной мобильной вёрстки.
  var TEMPLATES = [
    {
      id: "home",
      group: "Главная",
      name: "Главная страница",
      src: "../index.html",
      mobile: true,
      desc: "Первый экран, сервисы, новости, интернет-приёмная и филиалы"
    },

    {
      id: "news-cover",
      group: "Новости и публикации",
      name: "Новость с обложкой",
      src: "../news-cover.html",
      mobile: true,
      desc: "Статья с большой обложкой в начале"
    },
    {
      id: "news-gallery",
      group: "Новости и публикации",
      name: "Новость с фотогалереей",
      src: "../news-gallery.html",
      mobile: true,
      desc: "Статья с блоком фотографий"
    },
    {
      id: "news-text",
      group: "Новости и публикации",
      name: "Новость без изображения",
      src: "../news-text.html",
      mobile: true,
      desc: "Текстовая статья без изображений"
    },
    {
      id: "news-list",
      group: "Новости и публикации",
      name: "Список новостей",
      src: "../press-center.html#news",
      mobile: true,
      desc: "Карточки новостей с постраничной навигацией"
    },
    {
      id: "actual",
      group: "Новости и публикации",
      name: "Актуальная информация",
      src: "../actual.html",
      mobile: true,
      desc: "Подборка актуальных материалов карточками"
    },

    {
      id: "subscribers",
      group: "Разделы сайта",
      name: "Абонентам",
      src: "../subscribers.html",
      mobile: true,
      desc: "Разделы и услуги для абонентов"
    },
    {
      id: "applications",
      group: "Разделы сайта",
      name: "Заявки",
      src: "../applications.html",
      mobile: true,
      desc: "Заявки для физических и юридических лиц"
    },
    {
      id: "gasification",
      group: "Разделы сайта",
      name: "Газификация",
      src: "../gasification.html",
      mobile: true,
      desc: "Газификация и догазификация"
    },
    {
      id: "about",
      group: "Разделы сайта",
      name: "О компании",
      src: "../about.html",
      mobile: true,
      desc: "Информация о компании и руководстве"
    },
    {
      id: "press",
      group: "Разделы сайта",
      name: "Пресс-центр",
      src: "../press-center.html",
      mobile: true,
      desc: "Раздел с боковым меню: новости, вопросы, медиа"
    },
    {
      id: "persons",
      group: "Разделы сайта",
      name: "Руководство",
      src: "../persons.html",
      mobile: true,
      desc: "Руководство компании"
    },
    {
      id: "contacts",
      group: "Разделы сайта",
      name: "Контакты",
      src: "../contacts.html",
      mobile: true,
      desc: "Управление и центры приёма абонентов"
    },

    {
      id: "price",
      group: "Цены и таблицы",
      name: "Прейскурант услуг",
      src: "../signallers.html",
      mobile: true,
      desc: "Страница с таблицами цен"
    },

    {
      id: "request-connect",
      group: "Формы и обращения",
      name: "Договор на обслуживание ВКГО",
      src: "../request-connect.html",
      mobile: true,
      desc: "Форма запроса на заключение договора"
    },
    {
      id: "request-work",
      group: "Формы и обращения",
      name: "Заявка на выполнение работ",
      src: "../request-work.html",
      mobile: true,
      desc: "Форма заявки на ремонт и обслуживание"
    },
    {
      id: "ask",
      group: "Формы и обращения",
      name: "Задать вопрос",
      src: "../ask.html",
      mobile: true,
      desc: "Форма вопроса в пресс-центр"
    }
  ];

  var PHONE_OFF_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<rect x="7" y="2" width="10" height="20" rx="2.5"></rect>' +
    '<path d="M11 18h2"></path>' +
    '<path d="M3 3l18 18"></path>' +
    "</svg>";

  var state = {
    id: null,
    device: "desktop"
  };

  var loadedId = null;

  var els = {
    catalog: document.getElementById("catalog"),
    catalogNav: document.getElementById("catalogNav"),
    catalogToggle: document.getElementById("catalogToggle"),
    catalogBackdrop: document.getElementById("catalogBackdrop"),
    stage: document.getElementById("stage"),
    canvas: document.getElementById("canvas"),
    frame: document.getElementById("frame"),
    iframe: document.getElementById("preview"),
    loader: document.getElementById("loader"),
    notice: document.getElementById("notice"),
    noticeText: document.getElementById("noticeText"),
    noticeDesktop: document.getElementById("noticeDesktop"),
    currentName: document.getElementById("currentName")
  };

  var deviceButtons = Array.prototype.slice.call(
    document.querySelectorAll(".device-btn")
  );

  function currentTemplate() {
    return TEMPLATES.filter(function (t) { return t.id === state.id; })[0] || null;
  }

  function withCacheBust(src) {
    var hashIndex = src.indexOf("#");
    var base = hashIndex >= 0 ? src.slice(0, hashIndex) : src;
    var hash = hashIndex >= 0 ? src.slice(hashIndex) : "";
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + "r=" + Date.now() + hash;
  }

  function renderCatalog() {
    var groups = [];
    TEMPLATES.forEach(function (t) {
      if (groups.indexOf(t.group) === -1) groups.push(t.group);
    });

    els.catalogNav.innerHTML = "";

    groups.forEach(function (group) {
      var section = document.createElement("div");
      section.className = "catalog__group";

      var title = document.createElement("p");
      title.className = "catalog__group-title";
      title.textContent = group;
      section.appendChild(title);

      TEMPLATES.filter(function (t) { return t.group === group; }).forEach(function (t) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "catalog__item";
        btn.dataset.id = t.id;
        btn.title = t.mobile === false
          ? t.desc + " · Мобильная версия в подготовке"
          : t.desc;

        var name = document.createElement("span");
        name.className = "catalog__item-name";
        name.textContent = t.name;
        btn.appendChild(name);

        if (t.mobile === false) {
          var flag = document.createElement("span");
          flag.className = "catalog__flag";
          flag.title = "Мобильная версия в подготовке";
          flag.setAttribute("aria-hidden", "true");
          flag.innerHTML = PHONE_OFF_ICON;
          btn.appendChild(flag);

          var note = document.createElement("span");
          note.className = "visually-hidden";
          note.textContent = "Мобильная версия в подготовке.";
          btn.appendChild(note);
        }

        btn.addEventListener("click", function () {
          selectTemplate(t.id);
          if (window.matchMedia("(max-width: 980px)").matches) closeCatalog();
        });

        section.appendChild(btn);
      });

      els.catalogNav.appendChild(section);
    });
  }

  function updateActiveItem() {
    Array.prototype.forEach.call(
      els.catalogNav.querySelectorAll(".catalog__item"),
      function (btn) {
        var active = btn.dataset.id === state.id;
        btn.classList.toggle("is-active", active);
        if (active) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      }
    );
  }

  function selectTemplate(id) {
    var t = TEMPLATES.filter(function (item) { return item.id === id; })[0];
    if (!t) return;

    state.id = id;
    loadedId = null;
    els.currentName.textContent = t.name;
    els.iframe.title = "Предпросмотр: " + t.name;
    document.title = t.name + " — Дизайн-концепция сайта";
    updateActiveItem();
    ensureLoaded();
    resetFrameScroll();
  }

  function ensureLoaded() {
    var t = currentTemplate();
    if (!t) return;

    if (state.device === "mobile" && t.mobile === false) {
      showNotice(t);
      return;
    }

    hideNotice();

    if (loadedId !== t.id) {
      loadedId = t.id;
      els.loader.hidden = false;
      els.iframe.src = withCacheBust(t.src);
    }
  }

  function showNotice(t) {
    els.loader.hidden = true;
    els.canvas.hidden = true;
    els.notice.hidden = false;
    els.noticeText.textContent =
      "«" + t.name + "» — для этого шаблона пока подготовлена только компьютерная версия.";
  }

  function hideNotice() {
    els.notice.hidden = true;
    els.canvas.hidden = false;
  }

  function setDevice(device) {
    if (state.device === device) return;
    state.device = device;

    deviceButtons.forEach(function (btn) {
      var active = btn.dataset.device === device;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    els.stage.classList.toggle("stage--mobile", device === "mobile");
    ensureLoaded();
    layout();
    resetFrameScroll();
  }

  function resetFrameScroll() {
    try {
      els.iframe.contentWindow.scrollTo(0, 0);
    } catch (e) {
      /* Если страница открыта не с того же домена, прокрутка недоступна. */
    }
  }

  function layout() {
    var cs = window.getComputedStyle(els.stage);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var availW = Math.max(240, els.stage.clientWidth - padX);
    var availH = Math.max(240, els.stage.clientHeight - padY);

    if (state.device === "desktop") {
      var scale = Math.min(1, availW / DESKTOP_W);
      var frameH = Math.max(320, availH / scale);

      els.frame.className = "frame frame--desktop";
      els.frame.style.width = DESKTOP_W + "px";
      els.frame.style.height = frameH + "px";
      els.iframe.style.width = DESKTOP_W + "px";
      els.iframe.style.height = frameH + "px";
      els.frame.style.transform = "scale(" + scale + ")";

      els.canvas.style.width = Math.round(DESKTOP_W * scale) + "px";
      els.canvas.style.height = Math.round(frameH * scale) + "px";
    } else {
      var phoneW = MOBILE_W + PHONE_BEZEL * 2;
      var phoneH = MOBILE_H + PHONE_BEZEL * 2;
      var phoneScale = Math.min(1, availW / phoneW, availH / phoneH);

      els.frame.className = "frame frame--mobile";
      els.frame.style.width = phoneW + "px";
      els.frame.style.height = phoneH + "px";
      els.iframe.style.width = MOBILE_W + "px";
      els.iframe.style.height = MOBILE_H + "px";
      els.frame.style.transform = "scale(" + phoneScale + ")";

      els.canvas.style.width = Math.round(phoneW * phoneScale) + "px";
      els.canvas.style.height = Math.round(phoneH * phoneScale) + "px";
    }
  }

  function openCatalog() {
    els.catalog.classList.add("is-open");
    els.catalogBackdrop.hidden = false;
    els.catalogToggle.setAttribute("aria-expanded", "true");
  }

  function closeCatalog() {
    els.catalog.classList.remove("is-open");
    els.catalogBackdrop.hidden = true;
    els.catalogToggle.setAttribute("aria-expanded", "false");
  }

  els.catalogToggle.addEventListener("click", function () {
    if (els.catalog.classList.contains("is-open")) closeCatalog();
    else openCatalog();
  });

  els.catalogBackdrop.addEventListener("click", closeCatalog);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCatalog();
  });

  els.noticeDesktop.addEventListener("click", function () {
    setDevice("desktop");
  });

  deviceButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setDevice(btn.dataset.device);
    });
  });

  els.iframe.addEventListener("load", function () {
    if (!loadedId) return;
    els.loader.hidden = true;
    resetFrameScroll();
  });

  var resizeFrame = 0;
  window.addEventListener("resize", function () {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(layout);
  });

  renderCatalog();
  layout();
  selectTemplate(TEMPLATES[0].id);
})();
