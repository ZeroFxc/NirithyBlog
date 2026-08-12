/* ============================================================
   NirithyBlog - Post Detail Page Logic
   Load post, render markdown, edit/delete, comments
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
    initAuthListener();
    initComments();
  });

  // ===== Listen for auth changes =====
  function initAuthListener() {
    window.addEventListener("authChanged", function () {
      updateCommentUI();
      updateEditDeleteButtons();
    });
  }

  // ===== Listen for language change =====
  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      if (currentPost) {
        renderPost(currentPost);
      }
      loadComments(currentSlug);
    });
  }

  // ===== Update edit/delete buttons based on auth =====
  function updateEditDeleteButtons() {
    var editBtn = document.getElementById("editBtn");
    var deleteBtn = document.getElementById("deleteBtn");

    if (window.Auth && Auth.isLoggedIn() && Auth.getUser() && currentPost) {
      var user = Auth.getUser();
      if (currentPost.authorId === user.id) {
        if (editBtn) editBtn.style.display = "";
        if (deleteBtn) deleteBtn.style.display = "";
      } else {
        if (editBtn) editBtn.style.display = "none";
        if (deleteBtn) deleteBtn.style.display = "none";
      }
    } else {
      if (editBtn) editBtn.style.display = "none";
      if (deleteBtn) deleteBtn.style.display = "none";
    }
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
      updateEditDeleteButtons();

      // Show comments section
      var commentsSection = document.getElementById("commentsSection");
      if (commentsSection) commentsSection.style.display = "";
      loadComments(slug);
    } catch (e) {
      showError(t("empty.failed_title"), e.message);
    }
  }

  // ===== Render Post =====
  function renderPost(post) {
    var container = document.getElementById("postContainer");

    document.title = post.title + " - " + t("app.title");

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
    var authorLabel = t("post.author");

    var authorHtml = "";
    if (post.authorName) {
      var levelColor = "#9E9E9E";
      var user = (window.Auth) ? Auth.getUser() : null;
      if (user && post.authorId === user.id) {
        levelColor = Auth.getLevelColor(user.level);
      }
      authorHtml =
        '<div class="post-detail__author">' +
        '<span class="post-author-avatar" style="background:' + levelColor + ';">' +
        MD3.escapeHtml(post.authorName.charAt(0).toUpperCase()) +
        "</span>" +
        "<span>" + authorLabel + ': ' + MD3.escapeHtml(post.authorName) + "</span>" +
        "</div>";
    }

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
      "<span>" + MD3.formatDateTime(post.createdAt) + "</span>" +
      (post.updatedAt !== post.createdAt
        ? '<span style="color:var(--md-outline);">|</span><span>' + updatedLabel + ' ' + MD3.timeAgo(post.updatedAt) + "</span>"
        : "") +
      "</div>" +
      (authorHtml ? authorHtml : "") +
      (tagsHtml
        ? '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">' + tagsHtml + "</div>"
        : "") +
      "</div>" +
      '<div class="post-detail__content">' +
      contentHtml +
      "</div>" +
      "</div>";

    MD3.initRipples();
  }

  // ===== Show Error =====
  function showError(title, message) {
    var container = document.getElementById("postContainer");
    container.innerHTML =
      '<div class="empty-state">' +
      '<div class="empty-state__icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg></div>' +
      '<h2 class="empty-state__title">' + MD3.escapeHtml(title) + "</h2>" +
      '<p class="empty-state__description">' + MD3.escapeHtml(message) + "</p>" +
      '<button class="btn-tonal" onclick="window.location.href=\'/\'">' + t("empty.back_home") + '</button>' +
      "</div>";
  }

  // ===== Actions =====
  function initActions() {
    var editBtn = document.getElementById("editBtn");
    var deleteBtn = document.getElementById("deleteBtn");
    var deleteScrim = document.getElementById("deleteScrim");
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

  // ===== Comments =====
  function initComments() {
    var submitBtn = document.getElementById("commentSubmitBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", submitComment);
    }

    var input = document.getElementById("commentInput");
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          submitComment();
        }
      });
    }
  }

  function updateCommentUI() {
    var inputArea = document.getElementById("commentInputArea");
    var loginHint = document.getElementById("commentLoginHint");

    if (window.Auth && Auth.isLoggedIn()) {
      if (inputArea) inputArea.style.display = "";
      if (loginHint) loginHint.style.display = "none";
    } else {
      if (inputArea) inputArea.style.display = "none";
      if (loginHint) loginHint.style.display = "";
    }
  }

  async function loadComments(slug) {
    var list = document.getElementById("commentsList");
    if (!list) return;

    try {
      var data = await MD3.api("/posts/" + encodeURIComponent(slug) + "/comments");
      renderComments(data.comments || []);
    } catch (e) {
      list.innerHTML = '<p style="color:var(--md-on-surface-variant);">' + MD3.escapeHtml(e.message) + "</p>";
    }
  }

  function renderComments(comments) {
    var list = document.getElementById("commentsList");
    if (!list) return;

    updateCommentUI();

    if (comments.length === 0) {
      list.innerHTML =
        '<p style="color:var(--md-on-surface-variant);text-align:center;padding:24px 0;">' +
        t("comments.empty") + "</p>";
      return;
    }

    var html = "";
    comments.forEach(function (c) {
      var levelColor = (window.Auth) ? Auth.getLevelColor(c.userLevel || 1) : "#9E9E9E";
      var canDelete = (window.Auth && Auth.isLoggedIn() && Auth.getUser() && c.userId === Auth.getUser().id);
      var isOwn = (window.Auth && Auth.isLoggedIn() && Auth.getUser() && c.userId === Auth.getUser().id);
      var ownClass = isOwn ? " comment-item--own" : "";

      html +=
        '<div class="comment-item' + ownClass + '">' +
        '<div class="comment-item__header">' +
        '<span class="comment-avatar" style="background:' + levelColor + ';">' +
        MD3.escapeHtml(c.username.charAt(0).toUpperCase()) +
        "</span>" +
        '<span class="comment-username">' + MD3.escapeHtml(c.username) + "</span>" +
        '<span class="comment-level-badge" style="background:' + levelColor + ';">Lv.' + c.userLevel + "</span>" +
        '<span class="comment-time">' + MD3.timeAgo(c.createdAt) + "</span>" +
        (canDelete ? '<button class="comment-delete-btn" data-comment-id="' + c.id + '">' + t("comments.delete") + "</button>" : "") +
        "</div>" +
        '<p class="comment-content">' + MD3.escapeHtml(c.content) + "</p>" +
        "</div>";
    });

    list.innerHTML = html;

    // Bind delete buttons
    list.querySelectorAll(".comment-delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteComment(btn.dataset.commentId);
      });
    });
  }

  async function submitComment() {
    var input = document.getElementById("commentInput");
    var submitBtn = document.getElementById("commentSubmitBtn");

    if (!input || !submitBtn) return;

    var content = input.value.trim();
    if (!content) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "...";

    try {
      await MD3.api("/posts/" + encodeURIComponent(currentSlug) + "/comments", {
        method: "POST",
        body: { content: content },
      });

      input.value = "";
      MD3.showSnackbar(t("comments.posted"));
      loadComments(currentSlug);

      // Refresh user info (points changed)
      if (window.Auth && Auth.refreshUser) {
        await Auth.refreshUser();
      }
    } catch (e) {
      MD3.showSnackbar(t("msg.error_prefix") + e.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t("comments.submit");
    }
  }

  async function deleteComment(commentId) {
    if (!confirm(t("comments.confirm_delete"))) return;

    try {
      await MD3.api("/posts/" + encodeURIComponent(currentSlug) + "/comments/" + commentId, {
        method: "DELETE",
      });
      MD3.showSnackbar(t("comments.deleted"));
      loadComments(currentSlug);
    } catch (e) {
      MD3.showSnackbar(t("msg.error_prefix") + e.message);
    }
  }
})();
