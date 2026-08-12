/* ============================================================
   NirithyBlog - Tags Page
   Shows all tags or posts filtered by a tag
   ============================================================ */

(function () {
  "use strict";

  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var tag = params.get("t");

    if (tag) {
      loadPostsByTag(tag);
    } else {
      loadAllTags();
    }
    initLangListener();
  });

  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      var params = new URLSearchParams(window.location.search);
      var tag = params.get("t");
      if (tag) loadPostsByTag(tag);
      else loadAllTags();
    });
  }

  async function loadAllTags() {
    var container = document.getElementById("tagsContainer");
    try {
      var data = await MD3.api("/tags");
      var tags = data.tags || [];

      if (tags.length === 0) {
        container.innerHTML =
          '<div class="empty-state">' +
          '<div class="empty-state__icon"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="currentColor"/></svg></div>' +
          '<h2 class="empty-state__title">' + t("tags.empty_title") + '</h2>' +
          '<p class="empty-state__desc">' + t("tags.empty_desc") + '</p>' +
          "</div>";
        return;
      }

      var html =
        '<h1 class="page-title" data-i18n="tags.title">' + t("tags.title") + '</h1>' +
        '<p class="page-subtitle">' + t("tags.subtitle") + '</p>' +
        '<div class="tags-cloud">';

      tags.forEach(function (tag) {
        var size = Math.min(24, 13 + Math.floor(tag.count / 2));
        html +=
          '<a class="tag-pill" href="/tags?t=' + encodeURIComponent(tag.name) + '" style="font-size:' + size + 'px;">' +
          '<span class="tag-pill__name">#' + MD3.escapeHtml(tag.name) + '</span>' +
          '<span class="tag-pill__count">' + tag.count + '</span>' +
          '</a>';
      });

      html += '</div>';
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = '<p style="color:var(--md-on-surface-variant);text-align:center;">' + MD3.escapeHtml(e.message) + '</p>';
    }
  }

  async function loadPostsByTag(tag) {
    var container = document.getElementById("tagsContainer");

    container.innerHTML =
      '<div class="loading-container"><div class="progress-circular"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"></circle></svg></div></div>';

    try {
      var data = await MD3.api("/tags/" + encodeURIComponent(tag));
      var posts = data.posts || [];

      var html =
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">' +
        '<button class="icon-button" onclick="history.back()" aria-label="Back">' +
        '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>' +
        '</button>' +
        '<div>' +
        '<h1 class="page-title">#' + MD3.escapeHtml(tag) + '</h1>' +
        '<p class="page-subtitle">' + posts.length + ' ' + t("tags.posts_count") + '</p>' +
        '</div>' +
        '</div>';

      if (posts.length === 0) {
        html +=
          '<div class="empty-state">' +
          '<h2 class="empty-state__title">' + t("tags.no_posts_title") + '</h2>' +
          '<p class="empty-state__desc">' + t("tags.no_posts_desc") + '</p>' +
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
            '<span style="font-size:12px;font-weight:500;color:var(--md-primary);text-transform:uppercase;letter-spacing:0.5px;">' +
            MD3.escapeHtml(p.category || "Uncategorized") +
            '</span>' +
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

      // Attach click handlers
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
