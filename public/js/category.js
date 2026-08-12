/* ============================================================
   NirithyBlog - Category Page
   Shows all categories or posts filtered by a category
   ============================================================ */

(function () {
  "use strict";

  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var cat = params.get("c");

    if (cat) {
      loadPostsByCategory(cat);
    } else {
      loadAllCategories();
    }
    initLangListener();
  });

  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      var params = new URLSearchParams(window.location.search);
      var cat = params.get("c");
      if (cat) loadPostsByCategory(cat);
      else loadAllCategories();
    });
  }

  async function loadAllCategories() {
    var container = document.getElementById("categoryContainer");
    try {
      var data = await MD3.api("/categories");
      var cats = data.categories || [];

      if (cats.length === 0) {
        container.innerHTML =
          '<div class="empty-state">' +
          '<h2 class="empty-state__title">' + t("category.empty_title") + '</h2>' +
          '<p class="empty-state__desc">' + t("category.empty_desc") + '</p>' +
          '</div>';
        return;
      }

      var html =
        '<h1 class="page-title" data-i18n="category.title">' + t("category.title") + '</h1>' +
        '<p class="page-subtitle">' + t("category.subtitle") + '</p>' +
        '<div class="category-list">';

      cats.forEach(function (cat) {
        html +=
          '<a class="category-card" href="/category?c=' + encodeURIComponent(cat.name) + '">' +
          '<div class="category-card__icon">' +
          '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/></svg>' +
          '</div>' +
          '<div class="category-card__info">' +
          '<span class="category-card__name">' + MD3.escapeHtml(cat.name) + '</span>' +
          '<span class="category-card__count">' + cat.count + ' ' + t("category.posts") + '</span>' +
          '</div>' +
          '</a>';
      });

      html += '</div>';
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = '<p style="color:var(--md-on-surface-variant);text-align:center;">' + MD3.escapeHtml(e.message) + '</p>';
    }
  }

  async function loadPostsByCategory(cat) {
    var container = document.getElementById("categoryContainer");

    container.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/categories/" + encodeURIComponent(cat));
      var posts = data.posts || [];

      var html =
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">' +
        '<button class="icon-button" onclick="history.back()" aria-label="Back">' +
        '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>' +
        '</button>' +
        '<div>' +
        '<h1 class="page-title">' + MD3.escapeHtml(cat) + '</h1>' +
        '<p class="page-subtitle">' + posts.length + ' ' + t("category.posts") + '</p>' +
        '</div>' +
        '</div>';

      if (posts.length === 0) {
        html +=
          '<div class="empty-state">' +
          '<h2 class="empty-state__title">' + t("category.no_posts_title") + '</h2>' +
          '<p class="empty-state__desc">' + t("category.no_posts_desc") + '</p>' +
          '</div>';
      } else {
        html += '<div class="post-grid">';
        posts.forEach(function (p) {
          var coverHtml = p.coverImage
            ? '<div class="card__cover"><img src="' + MD3.escapeHtml(p.coverImage) + '" alt="' + MD3.escapeHtml(p.title) + '" loading="lazy" /></div>'
            : "";

          html +=
            '<article class="card fade-in" data-slug="' + MD3.escapeHtml(p.slug) + '">' +
            coverHtml +
            '<div class="card__content">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
            '<span style="font-size:12px;color:var(--md-on-surface-variant);">' + MD3.timeAgo(p.createdAt) + '</span>' +
            '</div>' +
            '<h3 class="card__title">' + MD3.escapeHtml(p.title) + '</h3>' +
            '<p class="card__excerpt">' + MD3.escapeHtml(p.excerpt || '') + '</p>' +
            '</div>' +
            '</article>';
        });
        html += '</div>';
      }

      container.innerHTML = html;

      container.querySelectorAll(".card").forEach(function (card) {
        card.addEventListener("click", function () {
          window.location.href = "/post?slug=" + encodeURIComponent(card.dataset.slug);
        });
        MD3.attachRipple(card);
      });
    } catch (e) {
      container.innerHTML = '<p style="color:var(--md-on-surface-variant);text-align:center;">' + MD3.escapeHtml(e.message) + '</p>';
    }
  }
})();
