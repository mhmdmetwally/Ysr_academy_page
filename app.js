const LOCALES = {
  en: {
    code: "en",
    dir: "ltr",
    path: "data/content.json",
    label: "English",
    switcherLabel: "Language",
    loadingEyebrow: "Loading Content",
    loadingTitle: "Preparing the academy page...",
    loadingBody: "The page reads all academy information from the selected JSON file.",
    errorEyebrow: "Content Error",
    errorTitle: "Unable to load the academy data.",
    errorNote: "If you opened the file directly in the browser, run it with a simple local server so the JSON file can be loaded.",
    unknownError: "Unknown loading error.",
    defaultPageTitle: "Academy Overview",
    defaultLogoAlt: "Academy logo",
    defaultVideoTitle: "Academy video",
    defaultVideoUnsupported: "Your browser does not support the video tag.",
    defaultStudentAlt: "Student",
    defaultLocationTitle: "Academy location",
    defaultSocialCta: "Visit"
  },
  ar: {
    code: "ar",
    dir: "rtl",
    path: "data/content.ar.json",
    label: "العربية",
    switcherLabel: "اللغة",
    loadingEyebrow: "جاري التحميل",
    loadingTitle: "يتم تجهيز صفحة الأكاديمية...",
    loadingBody: "تقرأ الصفحة جميع بيانات الأكاديمية من ملف JSON المختار.",
    errorEyebrow: "خطأ في المحتوى",
    errorTitle: "تعذر تحميل بيانات الأكاديمية.",
    errorNote: "إذا فتحت الملف مباشرة في المتصفح، شغّله عبر خادم محلي بسيط حتى يمكن تحميل ملف JSON.",
    unknownError: "حدث خطأ غير معروف أثناء التحميل.",
    defaultPageTitle: "نظرة عامة على الأكاديمية",
    defaultLogoAlt: "شعار الأكاديمية",
    defaultVideoTitle: "فيديو الأكاديمية",
    defaultVideoUnsupported: "متصفحك لا يدعم تشغيل الفيديو.",
    defaultStudentAlt: "طالب",
    defaultLocationTitle: "موقع الأكاديمية",
    defaultSocialCta: "زيارة"
  }
};

const APP_EDIT_VERSION = "hide-empty-side-panel-v1-2026-06-06";
console.log(`ACADIMY homescreen edit version: ${APP_EDIT_VERSION}`);

const state = {
  localeSwitcher: document.getElementById("locale-switcher"),
  hero: document.getElementById("hero"),
  content: document.getElementById("content"),
  statusPanel: document.getElementById("status-panel"),
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorMessage: document.getElementById("error-message"),
  activeLocale: getLocaleConfig(),
  sections: {
    about: document.getElementById("about-section"),
    courses: document.getElementById("courses-section"),
    pricing: document.getElementById("pricing-section"),
    media: document.getElementById("media-section"),
    testimonials: document.getElementById("testimonials-section"),
    contact: document.getElementById("contact-section"),
    offers: document.getElementById("offers-section")
  }
};

init();

async function init() {
  applyLocaleChrome();

  try {
    const response = await fetch(state.activeLocale.path, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }

    const content = await response.json();
    renderPage(content);
    showContent();
  } catch (error) {
    showError(error);
  }
}

function renderPage(content) {
  document.title = content?.site?.pageTitle || state.activeLocale.defaultPageTitle;
  document.documentElement.lang = content?.site?.language || state.activeLocale.code;
  document.documentElement.dir = content?.site?.direction || state.activeLocale.dir;

  renderHero(content.hero);
  renderAbout(content.about);
  renderCourses(content.courses);
  renderPricing(content.pricing);
  renderMedia(content.media);
  renderTestimonials(content.testimonials);
  renderContact(content.contact);
  renderOffers(content.offers);
}

function renderHero(hero = {}) {
  const sidePanel = renderHeroSidePanel(hero.sidePanel);
  const heroCardClass = sidePanel ? "hero-card" : "hero-card hero-card--single";

  state.hero.innerHTML = `
    <div class="${heroCardClass}">
      <div class="hero-copy">
        <div>
          <div class="hero-brand">
            <img class="brand-logo" src="${escapeAttribute(hero.logo?.src || "")}" alt="${escapeAttribute(getTextValue(hero.logo?.alt) || state.activeLocale.defaultLogoAlt)}">
            <div class="hero-headings">
              <h1 class="hero-title">${renderFieldText(hero, "name")}</h1>
              <p class="hero-subtitle">${renderFieldText(hero, "tagline")}</p>
            </div>
          </div>
        </div>

        <div class="hero-meta">
          ${renderPills(hero.highlights)}
        </div>

        <div class="hero-actions">
          ${renderAction(hero.primaryAction, "primary-button")}
          ${renderAction(hero.secondaryAction, "secondary-button")}
        </div>
      </div>

      ${sidePanel}
    </div>
  `;
}

function renderHeroSidePanel(sidePanel = {}) {
  const stats = (sidePanel.stats || []).filter(hasStatContent);

  if (!hasTextValue(sidePanel.label) && !hasTextValue(sidePanel.summary) && !stats.length) {
    return "";
  }

  return `
      <aside class="hero-side">
        <div class="hero-side-content">
          ${hasTextValue(sidePanel.label) ? `<p class="hero-side-label">${renderFieldText(sidePanel, "label")}</p>` : ""}
          ${hasTextValue(sidePanel.summary) ? `<p class="hero-highlight">${renderFieldText(sidePanel, "summary")}</p>` : ""}
          ${stats.length ? `<div class="stat-grid">${stats.map(renderStatCard).join("")}</div>` : ""}
        </div>
      </aside>
  `;
}

function renderAbout(about = {}) {
  const cards = (about.cards || []).filter(hasCardContent);
  const story = renderRichTextBlock(about.story);
  const results = renderResults(about.results);
  const hasContent = cards.length > 0 || Boolean(story) || Boolean(results);

  toggleSection(state.sections.about, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.about.innerHTML = `
    ${renderSectionHeader(about)}
    ${cards.length ? `<div class="summary-grid">${cards.map(renderInfoCard).join("")}</div>` : ""}
    ${story}
    ${results}
  `;
}

function renderCourses(courses = {}) {
  const items = (courses.items || []).filter(hasCourseContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.courses, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.courses.innerHTML = `
    ${renderSectionHeader(courses)}
    <div class="course-grid">
      ${items.map(renderCourseCard).join("")}
    </div>
  `;
}

function renderPricing(pricing = {}) {
  const plans = (pricing.plans || []).filter(hasPriceContent);
  const hasContent = plans.length > 0;

  toggleSection(state.sections.pricing, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.pricing.innerHTML = `
    ${renderSectionHeader(pricing)}
    <div class="pricing-grid">
      ${plans.map(renderPriceCard).join("")}
    </div>
  `;
}

function renderMedia(media = {}) {
  const items = (media.items || []).filter(hasMediaContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.media, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.media.innerHTML = `
    ${renderSectionHeader(media)}
    <div class="media-grid">
      ${items.map(renderMediaCard).join("")}
    </div>
  `;

  enhanceMediaCards();
}

function renderTestimonials(testimonials = {}) {
  const items = (testimonials.items || []).filter(hasTestimonialContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.testimonials, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.testimonials.innerHTML = `
    ${renderSectionHeader(testimonials)}
    <div class="testimonial-grid">
      ${items.map(renderTestimonialCard).join("")}
    </div>
  `;
}

function renderContact(contact = {}) {
  const details = (contact.details || []).filter(hasContactContent);
  const socialLinks = (contact.socialLinks || []).filter(hasSocialContent);
  const hasMap = Boolean(contact.location?.embedUrl);
  const hasContent = details.length > 0 || socialLinks.length > 0 || hasMap;

  toggleSection(state.sections.contact, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.contact.innerHTML = `
    ${renderSectionHeader(contact)}
    ${details.length ? `<div class="contact-grid">${details.map(renderContactCard).join("")}</div>` : ""}
    ${renderMap(contact.location)}
    ${socialLinks.length ? `<div class="social-grid">${socialLinks.map(renderSocialLink).join("")}</div>` : ""}
  `;
}

function renderOffers(offers = {}) {
  const items = (offers.items || []).filter(hasOfferContent);
  const hasContent = items.length > 0;

  toggleSection(state.sections.offers, hasContent);

  if (!hasContent) {
    return;
  }

  state.sections.offers.innerHTML = `
    ${renderSectionHeader(offers)}
    <div class="offer-grid">
      ${items.map(renderOfferCard).join("")}
    </div>
  `;
}

function renderSectionHeader(section = {}) {
  return `
    <div class="section-header">
      <h2>${renderFieldText(section, "heading")}</h2>
      <p>${renderFieldText(section, "intro")}</p>
    </div>
  `;
}

function renderPills(items = []) {
  return items
    .map((item) => `<span class="pill">${renderTextValue(item)}</span>`)
    .join("");
}

function renderAction(action = {}, className = "") {
  if (!hasTextValue(action.label) || !action.href) {
    return "";
  }

  const target = action.newTab ? "_blank" : "_self";
  const rel = action.newTab ? ' rel="noreferrer noopener"' : "";
  return `<a class="${className}" href="${escapeAttribute(action.href)}" target="${target}"${rel}>${renderFieldText(action, "label")}</a>`;
}

function renderStatCard(stat = {}) {
  return `
    <article class="stat-card">
      <span class="stat-value">${renderFieldText(stat, "value")}</span>
      <span class="stat-label">${renderFieldText(stat, "label")}</span>
    </article>
  `;
}

function renderInfoCard(card = {}) {
  return `
    <article class="info-card">
      <h3>${renderFieldText(card, "title")}</h3>
      <p>${renderFieldText(card, "text")}</p>
    </article>
  `;
}

function renderResults(results = {}) {
  const items = (results.items || []).filter(hasResultContent);

  if (!items.length) {
    return "";
  }

  return `
    <div class="section-header">
      <h2>${renderFieldText(results, "heading")}</h2>
      <p>${renderFieldText(results, "intro")}</p>
    </div>
    <div class="results-grid">
      ${items.map(renderResultCard).join("")}
    </div>
  `;
}

function renderResultCard(item = {}) {
  return `
    <article class="result-card">
      <strong>${renderFieldText(item, "value")}</strong>
      <h3>${renderFieldText(item, "title")}</h3>
      <p>${renderFieldText(item, "text")}</p>
    </article>
  `;
}

function renderCourseCard(course = {}) {
  return `
    <article class="course-card">
      <h3>${renderFieldText(course, "title")}</h3>
      <p>${renderFieldText(course, "description")}</p>
      <div class="course-meta">
        ${renderMetaChip(course.duration)}
        ${renderMetaChip(course.level)}
        ${renderMetaChip(course.schedule)}
      </div>
      <div class="advantage-list">
        ${(course.advantages || []).map((item) => `<span class="advantage-pill">${renderTextValue(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderMetaChip(value = "") {
  if (!hasTextValue(value)) {
    return "";
  }

  return `<span class="meta-chip">${renderTextValue(value)}</span>`;
}

function renderPriceCard(plan = {}) {
  return `
    <article class="price-card">
      <h3>${renderFieldText(plan, "name")}</h3>
      <p>${renderFieldText(plan, "description")}</p>
      <div class="price-value">
        <strong>${renderFieldText(plan, "price")}</strong>
        <span>${renderFieldText(plan, "billing")}</span>
      </div>
      <div class="price-meta">
        ${renderMetaChip(plan.audience)}
        ${renderMetaChip(plan.duration)}
      </div>
      <div class="price-feature-list">
        ${(plan.features || []).map((feature) => `<span class="feature-pill">${renderTextValue(feature)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderMediaCard(item = {}) {
  const title = getFieldText(item, "title").trim();
  const caption = getFieldText(item, "caption").trim();
  const hasTitle = Boolean(title);
  const hasCaption = Boolean(caption);
  const hasBody = hasCaption;
  const className = hasTitle && !hasCaption ? "media-card has-title-overlay" : "media-card";
  const mediaFrame = item.type === "video"
    ? renderVideo(item)
    : `<button class="media-open-button" type="button" data-fullscreen-src="${escapeAttribute(item.src || "")}" data-fullscreen-alt="${escapeAttribute(getTextValue(item.alt) || title || "Academy media")}" aria-label="Open ${escapeAttribute(title || getTextValue(item.alt) || "academy media")} fullscreen">
        <img src="${escapeAttribute(item.src || "")}" alt="${escapeAttribute(getTextValue(item.alt) || title || "Academy media")}" loading="lazy">
      </button>`;

  return `
    <article class="${className}">
      <div class="media-frame">
        ${mediaFrame}
        ${hasTitle && !hasCaption ? `<h3 class="media-overlay-title">${renderFieldText(item, "title")}</h3>` : ""}
      </div>
      ${hasBody ? `
        <div class="media-body">
          ${hasTitle ? `<h3>${renderFieldText(item, "title")}</h3>` : ""}
          <p class="media-caption">${renderFieldText(item, "caption")}</p>
        </div>
      ` : ""}
    </article>
  `;
}

function renderVideo(item = {}) {
  if (item.embedUrl) {
    return `<iframe src="${escapeAttribute(item.embedUrl)}" title="${escapeAttribute(getFieldText(item, "title") || state.activeLocale.defaultVideoTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  return `<video controls preload="metadata" poster="${escapeAttribute(item.poster || "")}">
    <source src="${escapeAttribute(item.src || "")}">
    ${escapeHtml(state.activeLocale.defaultVideoUnsupported)}
  </video>`;
}

function enhanceMediaCards() {
  const mediaGrid = state.sections.media.querySelector(".media-grid");

  if (!mediaGrid) {
    return;
  }

  mediaGrid.querySelectorAll(".media-card").forEach((card) => {
    const image = card.querySelector("img");
    const video = card.querySelector("video");
    const media = image || video;

    if (!media) {
      return;
    }

    const applyRatio = () => updateMediaRatio(card, media);

    if (image) {
      if (image.complete && image.naturalWidth) {
        applyRatio();
      } else {
        image.addEventListener("load", applyRatio, { once: true });
      }
    }

    if (video) {
      if (video.videoWidth) {
        applyRatio();
      } else {
        video.addEventListener("loadedmetadata", applyRatio, { once: true });
      }
    }
  });

  mediaGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".media-open-button");

    if (!button) {
      return;
    }

    const image = button.querySelector("img");
    openMediaViewer(image, button.dataset.fullscreenSrc, button.dataset.fullscreenAlt);
  });
}

function updateMediaRatio(card, media) {
  const width = media.naturalWidth || media.videoWidth;
  const height = media.naturalHeight || media.videoHeight;

  if (!width || !height) {
    return;
  }

  const ratio = width / height;
  card.style.setProperty("--media-ratio", `${width} / ${height}`);
  card.classList.toggle("media-is-portrait", ratio < 0.85);
  card.classList.toggle("media-is-square", ratio >= 0.85 && ratio <= 1.15);
  card.classList.toggle("media-is-wide", ratio > 1.45);
}

function openMediaViewer(image, fallbackSrc = "", fallbackAlt = "") {
  if (!image && !fallbackSrc) {
    return;
  }

  const viewer = getMediaViewer();
  const viewerImage = viewer.querySelector(".media-viewer-image");

  viewerImage.src = image?.currentSrc || fallbackSrc || image?.src || "";
  viewerImage.alt = image?.alt || fallbackAlt || "";
  viewer.hidden = false;
  document.body.classList.add("has-media-viewer");
  viewer.querySelector(".media-viewer-close").focus();
}

function closeMediaViewer() {
  const viewer = document.querySelector(".media-viewer");

  if (!viewer) {
    return;
  }

  viewer.hidden = true;
  viewer.querySelector(".media-viewer-image").removeAttribute("src");
  document.body.classList.remove("has-media-viewer");
}

function getMediaViewer() {
  let viewer = document.querySelector(".media-viewer");

  if (viewer) {
    return viewer;
  }

  viewer = document.createElement("div");
  viewer.className = "media-viewer";
  viewer.hidden = true;
  viewer.innerHTML = `
    <button class="media-viewer-close" type="button" aria-label="Close fullscreen image">X</button>
    <img class="media-viewer-image" alt="">
  `;
  document.body.appendChild(viewer);
  viewer.querySelector(".media-viewer-close").addEventListener("click", closeMediaViewer);
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      closeMediaViewer();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) {
      closeMediaViewer();
    }
  });

  return viewer;
}

function renderTestimonialCard(item = {}) {
  return `
    <article class="testimonial-card">
      <blockquote>"${renderFieldText(item, "quote")}"</blockquote>
      <div class="testimonial-author">
        <img class="testimonial-avatar" src="${escapeAttribute(item.avatar || "")}" alt="${escapeAttribute(getFieldText(item, "name") || state.activeLocale.defaultStudentAlt)}">
        <div>
          <strong>${renderFieldText(item, "name")}</strong>
          <span>${renderFieldText(item, "result")}</span>
        </div>
      </div>
    </article>
  `;
}

function renderContactCard(item = {}) {
  const value = item.href
    ? `<a href="${escapeAttribute(item.href)}" target="${item.newTab ? "_blank" : "_self"}"${item.newTab ? ' rel="noreferrer noopener"' : ""}>${renderFieldText(item, "value")}</a>`
    : `<span>${renderFieldText(item, "value")}</span>`;

  return `
    <article class="contact-card">
      <h3>${renderFieldText(item, "label")}</h3>
      <p>${value}</p>
    </article>
  `;
}

function renderMap(location = {}) {
  if (!location.embedUrl) {
    return "";
  }

  return `
    <div class="map-box">
      <iframe
        src="${escapeAttribute(location.embedUrl)}"
        title="${escapeAttribute(getFieldText(location, "title") || state.activeLocale.defaultLocationTitle)}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

function renderSocialLink(link = {}) {
  const target = link.newTab ? "_blank" : "_self";
  const rel = link.newTab ? ' rel="noreferrer noopener"' : "";

  return `
    <a class="social-link" href="${escapeAttribute(link.href || "#")}" target="${target}"${rel}>
      <div>
        <strong>${renderFieldText(link, "label")}</strong>
        <span>${renderFieldText(link, "handle")}</span>
      </div>
      <span>${renderFieldText(link, "callToAction", state.activeLocale.defaultSocialCta)}</span>
    </a>
  `;
}

function renderOfferCard(offer = {}) {
  return `
    <article class="offer-card">
      <h3>${renderFieldText(offer, "title")}</h3>
      <p>${renderFieldText(offer, "description")}</p>
      <div class="offer-badge-row">
        ${(offer.highlights || []).map((item) => `<span class="offer-badge">${renderTextValue(item)}</span>`).join("")}
      </div>
      <p class="offer-expiry">${renderFieldText(offer, "expiry")}</p>
    </article>
  `;
}

function renderRichTextBlock(block = {}) {
  if (!hasTextValue(block.title) && !block.paragraphs?.length && !block.bullets?.length) {
    return "";
  }

  return `
    <div class="timeline-card rich-text">
      ${hasTextValue(block.title) ? `<h3>${renderFieldText(block, "title")}</h3>` : ""}
      ${(block.paragraphs || []).map((paragraph) => `<p>${renderTextValue(paragraph)}</p>`).join("")}
      ${block.bullets?.length ? `<ul>${block.bullets.map((bullet) => `<li>${renderTextValue(bullet)}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function showContent() {
  state.statusPanel.classList.add("is-hidden");
  state.content.hidden = false;
}

function showError(error) {
  state.loadingState.hidden = true;
  state.errorState.hidden = false;
  state.errorMessage.textContent = error.message || state.activeLocale.unknownError;
}

function renderFieldText(source = {}, fieldName = "", fallback = "") {
  const rawValue = source?.[fieldName];
  const text = getTextValue(rawValue) || fallback;
  const direction = getFieldDirection(source, fieldName, rawValue);

  if (!direction) {
    return escapeHtml(text);
  }

  return `<span dir="${direction}">${escapeHtml(text)}</span>`;
}

function renderTextValue(value = "") {
  const text = getTextValue(value);
  const direction = getTextDirection(value);

  if (!direction) {
    return escapeHtml(text);
  }

  return `<span dir="${direction}">${escapeHtml(text)}</span>`;
}

function getFieldText(source = {}, fieldName = "", fallback = "") {
  return getTextValue(source?.[fieldName]) || fallback;
}

function getTextValue(value = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value.text ?? value.value ?? "");
  }

  return String(value ?? "");
}

function getFieldDirection(source = {}, fieldName = "", rawValue = "") {
  return normalizeDirection(
    getTextDirection(rawValue) ||
    source?.[`${fieldName}Dir`] ||
    source?.[`${fieldName}Direction`]
  );
}

function getTextDirection(value = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  return normalizeDirection(value.dir || value.direction);
}

function normalizeDirection(direction = "") {
  const normalized = String(direction).toLowerCase();
  return ["ltr", "rtl", "auto"].includes(normalized) ? normalized : "";
}

function hasTextValue(value = "") {
  return Boolean(getTextValue(value).trim());
}

function getLocaleConfig() {
  const params = new URLSearchParams(window.location.search);
  const requestedLocale = params.get("lang")?.toLowerCase();

  return LOCALES[requestedLocale] || LOCALES.en;
}

function applyLocaleChrome() {
  document.documentElement.lang = state.activeLocale.code;
  document.documentElement.dir = state.activeLocale.dir;
  renderLocaleSwitcher();
  renderStatusCopy();
}

function renderLocaleSwitcher() {
  if (!state.localeSwitcher) {
    return;
  }

  const links = Object.values(LOCALES)
    .map((locale) => {
      const isActive = locale.code === state.activeLocale.code;
      const href = buildLocaleHref(locale.code);
      const className = isActive ? "locale-link is-active" : "locale-link";
      const ariaCurrent = isActive ? ' aria-current="page"' : "";

      return `<a class="${className}" href="${escapeAttribute(href)}"${ariaCurrent}>${escapeHtml(locale.label)}</a>`;
    })
    .join("");

  state.localeSwitcher.innerHTML = `
    <span class="locale-switcher-label">${escapeHtml(state.activeLocale.switcherLabel)}</span>
    <div class="locale-switcher-links">
      ${links}
    </div>
  `;
}

function buildLocaleHref(localeCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", localeCode);
  return `${url.pathname}${url.search}${url.hash}`;
}

function renderStatusCopy() {
  state.loadingState.innerHTML = `
    <span class="status-eyebrow">${escapeHtml(state.activeLocale.loadingEyebrow)}</span>
    <h1>${escapeHtml(state.activeLocale.loadingTitle)}</h1>
    <p>${escapeHtml(state.activeLocale.loadingBody)}</p>
  `;

  state.errorState.innerHTML = `
    <span class="status-eyebrow">${escapeHtml(state.activeLocale.errorEyebrow)}</span>
    <h1>${escapeHtml(state.activeLocale.errorTitle)}</h1>
    <p id="error-message"></p>
    <p class="status-note">${escapeHtml(state.activeLocale.errorNote)}</p>
  `;

  state.errorMessage = document.getElementById("error-message");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function toggleSection(element, shouldShow) {
  element.hidden = !shouldShow;

  if (!shouldShow) {
    element.innerHTML = "";
  }
}

function hasCardContent(card = {}) {
  return Boolean(hasTextValue(card.title) || hasTextValue(card.text));
}

function hasCourseContent(course = {}) {
  return Boolean(
    hasTextValue(course.title) ||
    hasTextValue(course.description) ||
    hasTextValue(course.duration) ||
    hasTextValue(course.level) ||
    hasTextValue(course.schedule) ||
    (course.advantages || []).length
  );
}

function hasPriceContent(plan = {}) {
  return Boolean(
    hasTextValue(plan.name) ||
    hasTextValue(plan.description) ||
    hasTextValue(plan.price) ||
    hasTextValue(plan.billing) ||
    hasTextValue(plan.audience) ||
    hasTextValue(plan.duration) ||
    (plan.features || []).length
  );
}

function hasMediaContent(item = {}) {
  return Boolean(item.src || item.embedUrl || hasTextValue(item.title) || hasTextValue(item.caption));
}

function hasTestimonialContent(item = {}) {
  return Boolean(hasTextValue(item.quote) || hasTextValue(item.name) || hasTextValue(item.result) || item.avatar);
}

function hasContactContent(item = {}) {
  return Boolean(hasTextValue(item.label) || hasTextValue(item.value) || item.href);
}

function hasSocialContent(link = {}) {
  return Boolean(hasTextValue(link.label) || hasTextValue(link.handle) || link.href);
}

function hasOfferContent(offer = {}) {
  return Boolean(
    hasTextValue(offer.title) ||
    hasTextValue(offer.description) ||
    hasTextValue(offer.expiry) ||
    (offer.highlights || []).length
  );
}

function hasResultContent(item = {}) {
  return Boolean(hasTextValue(item.value) || hasTextValue(item.title) || hasTextValue(item.text));
}

function hasStatContent(stat = {}) {
  return Boolean(hasTextValue(stat.value) || hasTextValue(stat.label));
}
