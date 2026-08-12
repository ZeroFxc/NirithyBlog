/* ============================================================
   MD3 Blog - Post Detail Page Logic
   Load post, render markdown, edit/delete actions
   ============================================================ */

(function () {
  "use strict";

  var currentSlug = null;
  var currentPost = null;

  // ===== i18n helper =====
  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  // ===== Init =====
  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    currentSlug = params.get("slug");

    if (!currentSlug) {
      showError(t("empty.no_post_title"), t("empty.no_post_desc"));
      return;
    }

    loadPost(currentSlug);
    initActions();
    initLangListener();
  });

  // ===== Listen for language change =====
  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      if (currentPost) {
        renderPost(currentPost);
      }
    });
  }

  // ===== Load Post =====
  async function loadPost(slug) {
    var container = document.getElementById("postContainer");

    try {
      var data = await MD3.api("/posts/" + encodeURIComponent(slug));
      var post = data.post;

      if (!post) {
        showError(t("empty.not_found_title"), t("empty.not_found_desc"));
        return;
      }

      currentPost = post;
      renderPost(post);
    } catch (e) {
      showError(t("empty.failed_title"), e.message);
    }
  }

  // ===== Render Post =====
  function renderPost(post) {
    var container = document.getElementById("postContainer");

    // Update title
    document.title = post.title + " - " + t("app.title");

    // Configure marked
    if (typeof marked !== "undefined") {
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
      });
    }

    var contentHtml;
    if (typeof marked !== "undefined") {
      contentHtml = marked.parse(post.content || "");
    } else {
      contentHtml = "<p>" + MD3.escapeHtml(post.content || "") + "</p>";
    }

    var tagsHtml = (post.tags || [])
      .map(function (tag) {
        return '<span class="chip" style="height:28px;font-size:12px;cursor:default;padding:0 12px;">#' + MD3.escapeHtml(tag) + "</span>";
      })
      .join("");

    var uncategorized = t("post.uncategorized");
    var updatedLabel = t("post.updated");

    container.innerHTML =
      '<div class="fade-in">' +
      '<div class="post-detail__header">' +
      '<span class="post-detail__category">' +
      MD3.escapeHtml(post.category || uncategorized) +
      "</span>" +
      '<h1 class="post-detail__title">' +
      MD3.escapeHtml(post.title) +
      "</h1>" +
      '<div class="post-detail__meta">' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--md-on-surface-variant);"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' +
      "<span>" +
      MD3.formatDateTime(post.createdAt) +
      "</span>" +
      (post.updatedAt !== post.createdAt
        ? '<span style="color:var(--md-outline);">|</span><span>' + updatedLabel + ' ' + MD3.timeAgo(post.updatedAt) + "</span>"
        : "") +
      "</div>" +
      (tagsHtml
        ? '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">' + tagsHtml + "</div>"
        : "") +
      "</div>" +
      '<div class="post-detail__content">' +
      contentHtml +
      "</div>" +
      "</div>";

    // Re-attach ripples for new elements
    MD3.initRipples();
  }

  // ===== Show Error =====
  function showError(title, message) {
    var container = document.getElementById("postContainer");
    container.innerHTML =
      '<div class="empty-state">' +
      '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></div>' +
      '<h2 class="empty-state__title">' +
      MD3.escapeHtml(title) +
      "</h2>" +
      '<p class="empty-state__description">' +
      MD3.escapeHtml(message) +
      "</p>" +
      '<button class="btn-tonal" onclick="window.location.href=\'/\'">' + t("empty.back_home") + '</button>' +
      "</div>";
  }

  // ===== Actions =====
  function initActions() {
    var editBtn = document.getElementById("editBtn");
    var deleteBtn = document.getElementById("deleteBtn");
    var deleteScrim = document.getElementById("deleteScrim");
    var deleteDialog = document.getElementById("deleteDialog");
    var cancelDelete = document.getElementById("cancelDelete");
    var confirmDelete = document.getElementById("confirmDelete");

    if (editBtn) {
      editBtn.addEventListener("click", function () {
        if (currentSlug) {
          window.location.href = "/editor?slug=" + encodeURIComponent(currentSlug);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        MD3.showDialog("deleteDialog");
      });
    }

    if (cancelDelete) {
      cancelDelete.addEventListener("click", function () {
        MD3.hideDialog("deleteDialog");
      });
    }

    if (deleteScrim) {
      deleteScrim.addEventListener("click", function () {
        MD3.hideDialog("deleteDialog");
      });
    }

    if (confirmDelete) {
      confirmDelete.addEventListener("click", async function () {
        confirmDelete.textContent = t("dialog.deleting");
        confirmDelete.disabled = true;

        try {
          await MD3.api("/posts/" + encodeURIComponent(currentSlug), {
            method: "DELETE",
          });
          MD3.hideDialog("deleteDialog");
          MD3.showSnackbar(t("msg.post_deleted"));
          setTimeout(function () {
            window.location.href = "/";
          }, 1000);
        } catch (e) {
          MD3.showSnackbar(t("msg.error_prefix") + e.message);
          confirmDelete.textContent = t("dialog.delete");
          confirmDelete.disabled = false;
          MD3.hideDialog("deleteDialog");
        }
      });
    }
  }
})();
