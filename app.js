/* global OPENTIPITAKA_SITE_I18N */

/** Fixed outbound links (custom domains do not affect these). */
const SITE_EXTERNAL_LINKS = {
  onlineReading: "https://tipitaka.paauksociety.org",
  appleAppStore: "https://apps.apple.com/mm/app/opentipitaka/id6760888347",
  googlePlay: "https://play.google.com/store/apps/details?id=org.opentipitaka.app&pcampaignid=web_share",
  /** Leave empty until the Microsoft Store listing URL is ready. */
  microsoftStore: "",
  apkMirror: "https://dhamma.paauksociety.org/index.php?dir=Root%2FTipitaka",
  manualDatabases: "https://dhamma.paauksociety.org/index.php?dir=Root%2FTipitaka%2FSqlLite%20Database",
};

function wireExternalSiteLinks() {
  const map = {
    onlineReadingLink: SITE_EXTERNAL_LINKS.onlineReading,
    appleAppStoreLink: SITE_EXTERNAL_LINKS.appleAppStore,
    googlePlayLink: SITE_EXTERNAL_LINKS.googlePlay,
    apkMirrorLink: SITE_EXTERNAL_LINKS.apkMirror,
    manualDatabasesLink: SITE_EXTERNAL_LINKS.manualDatabases,
  };
  for (const [id, url] of Object.entries(map)) {
    if (!url) continue;
    const el = document.getElementById(id);
    if (el) el.setAttribute("href", url);
  }

  const msUrl = (SITE_EXTERNAL_LINKS.microsoftStore || "").trim();
  const msEl = document.getElementById("microsoftStoreLink");
  const wrap = document.getElementById("msStoreWrap");
  if (msUrl && msEl && wrap) {
    msEl.setAttribute("href", msUrl);
    wrap.removeAttribute("hidden");
  } else if (wrap) {
    wrap.setAttribute("hidden", "");
  }
}

function getRepoFromLocation() {
  // If deployed at https://<user>.github.io/<repo>/, repo is the first path segment.
  // If deployed at a custom domain root, this returns null and links remain as '#'.
  const pathname = window.location.pathname || "/";
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  return parts[0];
}

function getUserFromLocation() {
  const hostname = window.location.hostname || "";
  const suffix = ".github.io";
  if (!hostname.endsWith(suffix)) return null;
  const user = hostname.slice(0, -suffix.length);
  return user || null;
}

function guessGithubRepoUrl() {
  const user = getUserFromLocation();
  const repo = getRepoFromLocation();
  if (!user || !repo) return null;
  return `https://github.com/${user}/${repo}`;
}

function readPreferredLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get("lang");
  if (fromQuery && OPENTIPITAKA_SITE_I18N.languages[fromQuery]) return fromQuery;

  const saved = window.localStorage.getItem("opentipitaka_site_lang");
  if (saved && OPENTIPITAKA_SITE_I18N.languages[saved]) return saved;

  const browserLang = (navigator.language || "en").toLowerCase();
  if (OPENTIPITAKA_SITE_I18N.languages[browserLang]) return browserLang;
  const base = browserLang.split("-")[0];
  if (OPENTIPITAKA_SITE_I18N.languages[base]) return base;

  return "en";
}

function setUrlQueryLanguage(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url.toString());
}

function applyTranslations(lang) {
  const dict = OPENTIPITAKA_SITE_I18N.languages[lang] || OPENTIPITAKA_SITE_I18N.languages.en;
  document.documentElement.lang = lang;

  const nodes = document.querySelectorAll("[data-i18n]");
  for (const node of nodes) {
    const key = node.getAttribute("data-i18n");
    if (!key) continue;
    const value = dict[key] ?? OPENTIPITAKA_SITE_I18N.languages.en[key];
    if (typeof value !== "string") continue;
    node.textContent = value;
  }
}

function buildLanguageSelector(selectedLang) {
  const select = document.getElementById("langSelect");
  if (!select) return;

  select.innerHTML = "";
  const languageEntries = Object.entries(OPENTIPITAKA_SITE_I18N.languageLabels);
  for (const [code, label] of languageEntries) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    option.selected = code === selectedLang;
    select.appendChild(option);
  }

  select.addEventListener("change", () => {
    const lang = select.value;
    window.localStorage.setItem("opentipitaka_site_lang", lang);
    setUrlQueryLanguage(lang);
    applyTranslations(lang);
  });
}

function wireGithubLinks() {
  const repoUrl = guessGithubRepoUrl();
  if (!repoUrl) return;

  const links = [
    { id: "githubLink", href: repoUrl },
    { id: "footerGithubLink", href: repoUrl },
    { id: "releasesLink", href: `${repoUrl}/releases` },
    { id: "footerReleasesLink", href: `${repoUrl}/releases` },
    { id: "docsLink", href: `${repoUrl}/blob/main/PROJECT.md` },
  ];

  for (const { id, href } of links) {
    const element = document.getElementById(id);
    if (!element) continue;
    element.setAttribute("href", href);
  }
}

function wireSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  for (const link of anchorLinks) {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function main() {
  wireGithubLinks();
  wireExternalSiteLinks();

  const lang = readPreferredLanguage();
  buildLanguageSelector(lang);
  setUrlQueryLanguage(lang);
  applyTranslations(lang);
  wireSmoothScroll();
}

main();

