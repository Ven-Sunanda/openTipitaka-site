/* global OPENTIPITAKA_SITE_I18N */

/** Fixed outbound links (custom domains do not affect these). */
const SITE_EXTERNAL_LINKS = {
  onlineReading: "https://tipitaka.paauksociety.org",
  appleAppStore: "https://apps.apple.com/mm/app/opentipitaka/id6760888347",
  googlePlay: "https://play.google.com/store/apps/details?id=org.opentipitaka.app&pcampaignid=web_share",
  /** Leave empty until the Microsoft Store listing URL is ready. */
  microsoftStore: "",
  /**
   * Canonical GitHub repo URL (used on custom domains where path-based guess fails).
   * Leave empty to rely only on *.github.io/<repo>/ inference.
   */
  githubRepository: "https://github.com/Ven-Sunanda/openTipitaka-site",
  /** Optional override; if empty, derived as `<githubRepository>/issues` when repository is known. */
  githubIssues: "",
  /** General feedback (leave empty to hide that row). */
  feedbackEmailGeneral: "main@dhammasarana.org",
  /** App-specific technical questions (leave empty to hide that row). */
  feedbackEmailApp: "opentipitaka@gmail.com",
  /** Optional mailto subject lines (URL-encoded when building links). */
  feedbackEmailGeneralSubject: "OpenTipitaka — general feedback",
  feedbackEmailAppSubject: "OpenTipitaka — app support",
  /**
   * This file server expects `dir=Root/Tipitaka/...` with literal slashes (not `%2F`).
   * Encode spaces in folder names only (e.g. SqlLite%20Database).
   */
  apkMirror: "https://dhamma.paauksociety.org/index.php?dir=Root/Tipitaka",
  manualDatabases: "https://dhamma.paauksociety.org/index.php?dir=Root/Tipitaka/SqlLite%20Database",
};

function wireExternalSiteLinks() {
  const map = {
    onlineReadingLink: SITE_EXTERNAL_LINKS.onlineReading,
    appleAppStoreLink: SITE_EXTERNAL_LINKS.appleAppStore,
    googlePlayLink: SITE_EXTERNAL_LINKS.googlePlay,
    apkMirrorLink: SITE_EXTERNAL_LINKS.apkMirror,
    tipitakaDocumentsLink: SITE_EXTERNAL_LINKS.apkMirror,
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

function resolveGithubRepositoryUrl() {
  const fixed = (SITE_EXTERNAL_LINKS.githubRepository || "").trim();
  if (fixed) return fixed.replace(/\/+$/, "");
  return guessGithubRepoUrl();
}

function resolveGithubIssuesUrl() {
  const override = (SITE_EXTERNAL_LINKS.githubIssues || "").trim();
  if (override) return override;
  const repo = resolveGithubRepositoryUrl();
  if (!repo) return null;
  return `${repo}/issues`;
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
  const en = OPENTIPITAKA_SITE_I18N.languages.en;
  document.documentElement.lang = lang;

  const nodes = document.querySelectorAll("[data-i18n]");
  for (const node of nodes) {
    const key = node.getAttribute("data-i18n");
    if (!key) continue;
    const value = dict[key] ?? en[key];
    if (typeof value !== "string") continue;
    node.textContent = value;
  }

  for (const node of document.querySelectorAll("[data-i18n-alt]")) {
    const key = node.getAttribute("data-i18n-alt");
    if (!key) continue;
    const value = dict[key] ?? en[key];
    if (typeof value !== "string") continue;
    node.setAttribute("alt", value);
  }

  for (const node of document.querySelectorAll("[data-i18n-aria-label]")) {
    const key = node.getAttribute("data-i18n-aria-label");
    if (!key) continue;
    const value = dict[key] ?? en[key];
    if (typeof value !== "string") continue;
    node.setAttribute("aria-label", value);
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
  const repoUrl = resolveGithubRepositoryUrl();
  if (!repoUrl) return;

  const links = [
    { id: "githubLink", href: repoUrl },
    { id: "footerGithubLink", href: repoUrl },
  ];

  for (const { id, href } of links) {
    const element = document.getElementById(id);
    if (!element) continue;
    element.setAttribute("href", href);
  }
}

function wireFeedbackMailRow(address, subjectKey, linkId, wrapId) {
  const raw = (address || "").trim();
  const link = document.getElementById(linkId);
  const wrap = document.getElementById(wrapId);
  if (!link || !wrap) return false;
  if (!raw) {
    wrap.setAttribute("hidden", "");
    return false;
  }
  const subject = (SITE_EXTERNAL_LINKS[subjectKey] || "").trim();
  link.setAttribute("href", buildMailtoHref(raw, subject));
  wrap.removeAttribute("hidden");
  return true;
}

function wireFeedbackLinks() {
  const issuesUrl = resolveGithubIssuesUrl();
  const issuesLink = document.getElementById("feedbackIssuesLink");
  const issuesWrap = document.getElementById("feedbackIssuesWrap");
  let showIssues = false;
  if (issuesLink && issuesWrap) {
    if (issuesUrl) {
      issuesLink.setAttribute("href", issuesUrl);
      issuesWrap.removeAttribute("hidden");
      showIssues = true;
    } else {
      issuesWrap.setAttribute("hidden", "");
    }
  }

  const showEmailGeneral = wireFeedbackMailRow(
    SITE_EXTERNAL_LINKS.feedbackEmailGeneral,
    "feedbackEmailGeneralSubject",
    "feedbackEmailGeneralLink",
    "feedbackEmailGeneralWrap",
  );
  const showEmailApp = wireFeedbackMailRow(
    SITE_EXTERNAL_LINKS.feedbackEmailApp,
    "feedbackEmailAppSubject",
    "feedbackEmailAppLink",
    "feedbackEmailAppWrap",
  );
  const showAnyEmail = showEmailGeneral || showEmailApp;

  const block = document.getElementById("supportFeedbackBlock");
  if (block) {
    if (!showIssues && !showAnyEmail) block.setAttribute("hidden", "");
    else block.removeAttribute("hidden");
  }
}

function buildMailtoHref(address, subject) {
  const path = `mailto:${address}`;
  if (!subject) return path;
  return `${path}?subject=${encodeURIComponent(subject)}`;
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

function wireScreenshotLightbox() {
  const dialog = document.getElementById("screenshotLightbox");
  const fullImg = document.getElementById("screenshotLightboxImg");
  const closeBtn = dialog?.querySelector(".screenshot-lightbox-close");
  if (!dialog || !fullImg || !closeBtn) return;

  document.querySelectorAll(".screenshot-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-screenshot-src");
      const thumb = btn.querySelector("img");
      if (src) fullImg.setAttribute("src", src);
      const alt = thumb?.getAttribute("alt") || "";
      fullImg.setAttribute("alt", alt);
      dialog.showModal();
    });
  });

  closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function main() {
  wireGithubLinks();
  wireExternalSiteLinks();
  wireFeedbackLinks();

  const lang = readPreferredLanguage();
  buildLanguageSelector(lang);
  setUrlQueryLanguage(lang);
  applyTranslations(lang);
  wireSmoothScroll();
  wireScreenshotLightbox();
}

main();

