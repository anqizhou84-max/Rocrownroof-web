// 轻量级 i18n 配置：后期新增语言时，只需要在这里加语言代码，并新增 /locales/{lang}.json。
const I18N_CONFIG = {
  defaultLang: "en",
  storageKey: "rocrown-language",
  supportedLangs: {
    zh: { label: "中文" },
    en: { label: "English" },
    es: { label: "Español" },
    fr: { label: "Français" },
    ar: { label: "العربية", rtl: true },
    ru: { label: "Русский" },
  },
};

let currentLang = I18N_CONFIG.defaultLang;
let currentDict = {};
let fallbackDict = {};

// 从嵌套对象中读取翻译，例如 t("home.hero.title")。
function getNestedValue(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source);
}

// 翻译函数：当前语言缺失时自动回退英文，英文也缺失时显示 key，便于排查。
function t(key) {
  return getNestedValue(currentDict, key) || getNestedValue(fallbackDict, key) || key;
}

// 判断当前 URL 第一段是否是语言代码，例如 /es/ 或 /ar/inquiry.html。
function getLangFromPath() {
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
  return I18N_CONFIG.supportedLangs[firstSegment] ? firstSegment : "";
}

// 读取用户上次选择的语言。
function getSavedLang() {
  const saved = localStorage.getItem(I18N_CONFIG.storageKey);
  return I18N_CONFIG.supportedLangs[saved] ? saved : "";
}

// 当前页面是首页还是询盘页，用于语言切换时生成对应 URL。
function getPageName() {
  return window.location.pathname.endsWith("inquiry.html") ? "inquiry.html" : "";
}

// 生成语言路径：/en/、/es/、/ar/inquiry.html。
function buildLangUrl(lang, pageName = getPageName()) {
  return `/${lang}/${pageName}`;
}

// 加载 JSON 语言包。使用绝对路径，保证 /es/ 这类目录下也能加载。
async function loadLocale(lang) {
  const response = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Missing locale: ${lang}`);
  return response.json();
}

// 更新 html 的 lang 和 dir；阿拉伯语自动 RTL。
function updateDocumentDirection(lang) {
  const config = I18N_CONFIG.supportedLangs[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = config?.rtl ? "rtl" : "ltr";
}

// 更新 title、meta description、canonical、hreflang，服务多语言 SEO。
function updateSeo(lang) {
  const pageKey = getPageName() ? "inquiry" : "home";
  const seo = t(`seo.${pageKey}`);

  if (seo.title) document.title = seo.title;

  const description = document.querySelector('meta[name="description"]');
  if (description && seo.description) {
    description.setAttribute("content", seo.description);
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute("href", buildLangUrl(lang));
  }

  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
    const hreflang = link.getAttribute("hreflang");
    if (I18N_CONFIG.supportedLangs[hreflang]) {
      link.setAttribute("href", buildLangUrl(hreflang));
    }
    if (hreflang === "x-default") {
      link.setAttribute("href", buildLangUrl(I18N_CONFIG.defaultLang));
    }
  });
}

// 扫描页面里带 data-i18n 的元素并替换文案。
function translatePage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", t(element.dataset.i18nAlt));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", t(element.dataset.i18nTitle));
  });
}

// 把站内链接同步到当前语言路径，避免用户从 /es/ 点进英文默认页。
function localizeInternalLinks() {
  const sectionIds = ["products", "solutions", "applications", "factory", "map", "contact"];

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    if (href.includes("inquiry.html")) {
      link.setAttribute("href", buildLangUrl(currentLang, "inquiry.html"));
      return;
    }

    if (href === "#" || href.endsWith("index.html") || href === "./index.html") {
      link.setAttribute("href", `/${currentLang}/`);
      return;
    }

    const matchedSection = sectionIds.find((id) => href === `#${id}` || href.endsWith(`#${id}`));
    if (matchedSection) {
      link.setAttribute("href", `/${currentLang}/#${matchedSection}`);
    }
  });
}

// 创建右上角语言切换器；原生 HTML 站点不依赖 React/Vue。
function mountLanguageSwitcher() {
  const header = document.querySelector(".site-header");
  const cta = document.querySelector(".header-cta");
  if (!header || document.querySelector(".language-switcher")) return;

  const switcher = document.createElement("div");
  switcher.className = "language-switcher";
  switcher.innerHTML = `
    <button class="language-current" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span>${currentLang.toUpperCase()}</span>
      <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
    </button>
    <div class="language-menu" role="listbox"></div>
  `;

  const menu = switcher.querySelector(".language-menu");
  Object.entries(I18N_CONFIG.supportedLangs).forEach(([lang, config]) => {
    const option = document.createElement("button");
    option.type = "button";
    option.role = "option";
    option.dataset.lang = lang;
    option.textContent = `${config.label} · ${lang.toUpperCase()}`;
    option.setAttribute("aria-selected", String(lang === currentLang));
    option.addEventListener("click", () => changeLanguage(lang));
    menu.appendChild(option);
  });

  switcher.querySelector(".language-current").addEventListener("click", () => {
    const open = switcher.classList.toggle("is-open");
    switcher.querySelector(".language-current").setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!switcher.contains(event.target)) {
      switcher.classList.remove("is-open");
      switcher.querySelector(".language-current").setAttribute("aria-expanded", "false");
    }
  });

  header.insertBefore(switcher, cta);
}

// 切换语言：保存 localStorage，然后跳转到对应语言路径，页面内容随路径加载。
function changeLanguage(lang) {
  localStorage.setItem(I18N_CONFIG.storageKey, lang);
  window.location.href = buildLangUrl(lang);
}

// 初始化语言。优先 URL，其次 localStorage，最后英文。
async function initI18n() {
  const pathLang = getLangFromPath();
  const savedLang = getSavedLang();
  currentLang = pathLang || savedLang || I18N_CONFIG.defaultLang;

  // 如果用户有历史语言偏好，但当前在根路径，则自动跳到对应语言路径。
  if (!pathLang && savedLang) {
    window.location.replace(buildLangUrl(savedLang));
    return;
  }

  try {
    fallbackDict = await loadLocale(I18N_CONFIG.defaultLang);
    currentDict = currentLang === I18N_CONFIG.defaultLang ? fallbackDict : await loadLocale(currentLang);
  } catch (error) {
    currentLang = I18N_CONFIG.defaultLang;
    currentDict = fallbackDict;
  }

  updateDocumentDirection(currentLang);
  updateSeo(currentLang);
  translatePage();
  localizeInternalLinks();
  mountLanguageSwitcher();
}

document.addEventListener("DOMContentLoaded", initI18n);
