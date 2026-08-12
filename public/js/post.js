/* ============================================================
   NirithyBlog - Post Detail Page Logic
   Load post, render markdown, TOC, reading time, cover image,
   edit/delete, comments
   ============================================================ */

(function () {
  "use strict";

  var currentSlug = null;
  var currentPost = null;
  var replyToId = null;
  var replyToUsername = null;

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
    initTocToggle();
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

  // ===== Estimate Reading Time =====
  function estimateReadingTime(content) {
    var charCount = (content || "").replace(/\s/g, "").length;
    return Math.max(1, Math.ceil(charCount / 500));
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

  // ===== Build TOC from headings =====
  function buildTOC(container) {
    var headings = container.querySelectorAll("h1, h2, h3");
    if (headings.length < 2) return null;

    var tocHtml = '<div class="post-toc" id="postToc">';
    tocHtml += '<div class="post-toc__header">';
    tocHtml += '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor;"><path d="M3 9v2h6V9H3zm0-4v2h6V5H3zm12 0v2h6V5h-6zm-12 8v2h6v-2H3zm12 0v2h6v-2h-6zm0 4v2h6v-2h-6z"/></svg>';
    tocHtml += '<span>' + t("post.toc") + "</span>";
    tocHtml += "</div>";
    tocHtml += '<nav class="post-toc__nav"><ul>';

    headings.forEach(function (h, i) {
      var level = parseInt(h.tagName.charAt(1));
      var id = h.id || ("heading-" + i);

      // Ensure heading has an id for anchor links
      if (!h.id) h.id = id;

      var text = h.textContent || "";
      var indent = (level - 1) * 12;

      tocHtml +=
        '<li class="post-toc__item post-toc__item--h' + level + '" style="padding-left:' + (12 + indent) + 'px;">' +
        '<a href="#' + encodeURIComponent(id) + '" data-heading-id="' + encodeURIComponent(id) + '">' +
        MD3.escapeHtml(text) +
        "</a></li>";
    });

    tocHtml += "</ul></nav></div>";
    return tocHtml;
  }

  // ===== Init TOC Toggle (mobile) =====
  function initTocToggle() {
    document.addEventListener("click", function (e) {
      var toggle = e.target.closest("#tocToggleBtn");
      if (toggle) {
        var toc = document.getElementById("postToc");
        if (toc) {
          toc.classList.toggle("post-toc--open");
        }
      }
    });
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
      // XSS sanitize: remove script tags, event handlers, javascript: URLs
      var temp = document.createElement("div");
      temp.innerHTML = contentHtml;
      temp.querySelectorAll("script, iframe, object, embed").forEach(function (el) {
        el.remove();
      });
      temp.querySelectorAll("*").forEach(function (el) {
        // Remove event handler attributes
        var attrs = el.getAttributeNames();
        attrs.forEach(function (attr) {
          if (attr.toLowerCase().startsWith("on")) {
            el.removeAttribute(attr);
          }
          if ((attr === "href" || attr === "src") && el.getAttribute(attr).toLowerCase().startsWith("javascript:")) {
            el.removeAttribute(attr);
          }
        });
      });
      contentHtml = temp.innerHTML;
    } else {
      contentHtml = "<p>" + MD3.escapeHtml(post.content || "") + "</p>";
    }

    var tagsHtml = (post.tags || [])
      .map(function (tag) {
        return '<a class="chip" href="/tags?t=' + encodeURIComponent(tag) + '" style="height:28px;font-size:12px;cursor:pointer;padding:0 12px;text-decoration:none;">#' + MD3.escapeHtml(tag) + "</a>";
      })
      .join("");

    var uncategorized = t("post.uncategorized");
    var updatedLabel = t("post.updated");
    var authorLabel = t("post.author");
    var readingTime = estimateReadingTime(post.content || "");

    // Category as clickable link
    var categoryHtml = '<a href="/category?c=' + encodeURIComponent(post.category || uncategorized) + '" style="text-decoration:none;color:inherit;">' + MD3.escapeHtml(post.category || uncategorized) + '</a>';

    // Cover image HTML
    var coverHtml = "";
    if (post.coverImage) {
      coverHtml =
        '<div class="post-detail__cover">' +
        '<img src="' + MD3.escapeHtml(post.coverImage) + '" alt="' + MD3.escapeHtml(post.title) + '" />' +
        "</div>";
    }

    var authorHtml = "";
    if (post.authorName) {
      var levelColor = "#9E9E9E";
      var user = (window.Auth) ? Auth.getUser() : null;
      if (user && post.authorId === user.id) {
        levelColor = Auth.getLevelColor(user.level);
      }
      authorHtml =
        '<div class="post-detail__author">' +
        '<a class="post-author-avatar" href="/profile.html?u=' + encodeURIComponent(post.authorName) + '" style="background:' + levelColor + ';">' +
        MD3.escapeHtml(post.authorName.charAt(0).toUpperCase()) +
        "</a>" +
        '<span>' + authorLabel + ': <a class="post-author-link" href="/profile.html?u=' + encodeURIComponent(post.authorName) + '">' + MD3.escapeHtml(post.authorName) + '</a></span>' +
        "</div>";
    }

    container.innerHTML =
      '<div class="fade-in post-detail__layout">' +
      '<div class="post-detail__main">' +
      coverHtml +
      '<div class="post-detail__header">' +
      '<span class="post-detail__category">' +
      categoryHtml +
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
      '<span style="color:var(--md-outline);">|</span>' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--md-on-surface-variant);"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' +
      '<span>' + readingTime + " " + t("post.read_time") + "</span>" +
      '<span style="color:var(--md-outline);">|</span>' +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--md-on-surface-variant);"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' +
      '<span>' + (post.viewCount || 0) + " " + t("post.views") + "</span>" +
      "</div>" +
      (authorHtml ? authorHtml : "") +
      (tagsHtml
        ? '<div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;">' + tagsHtml + "</div>"
        : "") +
      "</div>" +
      '<div class="post-detail__content" id="postContent">' +
      contentHtml +
      "</div>" +
      '<div class="post-detail__actions">' +
      '<button class="like-btn" id="likeBtn">' +
      '<svg class="like-btn__icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>' +
      '<span class="like-btn__count" id="likeCount">' + (post.likeCount || 0) + '</span>' +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="post-detail__sidebar" id="postSidebar"></div>' +
      "</div>";

    // Build TOC after content is in DOM
    var contentEl = document.getElementById("postContent");
    if (contentEl) {
      var tocHtml = buildTOC(contentEl);
      var sidebar = document.getElementById("postSidebar");
      if (tocHtml && sidebar) {
        sidebar.innerHTML = tocHtml;
      }
    }

    MD3.initRipples();
    initLikeButton(post);
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

    // Cancel reply button
    var cancelReplyBtn = document.getElementById("cancelReplyBtn");
    if (cancelReplyBtn) {
      cancelReplyBtn.addEventListener("click", clearReplyTo);
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

    // Build tree: top-level vs replies grouped by parentId
    var topLevel = [];
    var repliesMap = {};
    comments.forEach(function (c) {
      if (!c.parentId) {
        topLevel.push(c);
      } else {
        if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
        repliesMap[c.parentId].push(c);
      }
    });

    var html = "";
    topLevel.forEach(function (c) {
      html += renderCommentItem(c, repliesMap, 0);
    });

    list.innerHTML = html;

    // Bind delete and reply buttons
    list.querySelectorAll(".comment-delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteComment(btn.dataset.commentId);
      });
    });
    list.querySelectorAll(".comment-reply-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setReplyTo(btn.dataset.commentId, btn.dataset.username);
      });
    });
  }

  function renderCommentItem(comment, repliesMap, depth) {
    var levelColor = (window.Auth) ? Auth.getLevelColor(comment.userLevel || 1) : "#9E9E9E";
    var user = (window.Auth && Auth.isLoggedIn()) ? Auth.getUser() : null;
    var canDelete = (user && (comment.userId === user.id || user.role === "admin"));
    var isOwn = (user && comment.userId === user.id);
    var ownClass = isOwn ? " comment-item--own" : "";

    // Avatar: uploaded/GitHub avatar or first letter
    var avatarStyle, avatarContent, avatarClass;
    if (comment.avatarUrl) {
      avatarStyle = "background-image:url('" + comment.avatarUrl + "');background-size:cover;background-position:center;";
      avatarContent = "";
      avatarClass = "comment-avatar comment-avatar--img";
    } else {
      avatarStyle = "background:" + levelColor + ";";
      avatarContent = MD3.escapeHtml(comment.username.charAt(0).toUpperCase());
      avatarClass = "comment-avatar";
    }

    // Reply-to indicator
    var replyToHtml = "";
    if (comment.replyToUsername) {
      replyToHtml = '<a class="comment-reply-to" href="/profile.html?u=' + encodeURIComponent(comment.replyToUsername) + '">@' + MD3.escapeHtml(comment.replyToUsername) + '</a>';
    }

    // Parse @mentions in content
    var contentHtml = parseMentions(comment.content);

    var html =
      '<div class="comment-item' + ownClass + '" style="--depth:' + depth + ';">' +
      '<div class="comment-item__header">' +
      '<a class="' + avatarClass + '" href="/profile.html?u=' + encodeURIComponent(comment.username) + '" style="' + avatarStyle + '">' + avatarContent + '</a>' +
      '<a class="comment-username" href="/profile.html?u=' + encodeURIComponent(comment.username) + '">' + MD3.escapeHtml(comment.username) + '</a>' +
      '<span class="comment-level-badge" style="background:' + levelColor + ';">Lv.' + comment.userLevel + '</span>' +
      '<span class="comment-time">' + MD3.timeAgo(comment.createdAt) + '</span>' +
      (canDelete ? '<button class="comment-delete-btn" data-comment-id="' + comment.id + '">' + t("comments.delete") + '</button>' : '') +
      '</div>' +
      '<p class="comment-content">' + replyToHtml + contentHtml + '</p>' +
      (window.Auth && Auth.isLoggedIn() ? '<button class="comment-reply-btn" data-comment-id="' + comment.id + '" data-username="' + MD3.escapeHtml(comment.username) + '">' + t("comments.reply") + '</button>' : '') +
      '</div>';

    // Render nested replies
    var replies = repliesMap[comment.id] || [];
    if (replies.length > 0) {
      html += '<div class="comment-replies">';
      replies.forEach(function (r) {
        html += renderCommentItem(r, repliesMap, depth + 1);
      });
      html += '</div>';
    }

    return html;
  }

  function parseMentions(text) {
    var escaped = MD3.escapeHtml(text);
    return escaped.replace(/@([a-zA-Z0-9_\-]+)/g, function (match, username) {
      return '<a class="mention" href="/profile.html?u=' + encodeURIComponent(username) + '">@' + MD3.escapeHtml(username) + '</a>';
    });
  }

  function setReplyTo(commentId, username) {
    replyToId = commentId;
    replyToUsername = username;
    var input = document.getElementById("commentInput");
    if (input) {
      input.value = "@" + username + " ";
      input.focus();
    }
    var indicator = document.getElementById("replyIndicator");
    if (indicator) {
      indicator.style.display = "";
      var nameEl = indicator.querySelector(".reply-indicator__name");
      if (nameEl) nameEl.textContent = username;
    }
  }

  function clearReplyTo() {
    replyToId = null;
    replyToUsername = null;
    var indicator = document.getElementById("replyIndicator");
    if (indicator) indicator.style.display = "none";
    var input = document.getElementById("commentInput");
    if (input) input.value = "";
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
      var body = { content: content };
      if (replyToId) {
        body.parentId = replyToId;
        body.replyTo = replyToUsername;
      }
      await MD3.api("/posts/" + encodeURIComponent(currentSlug) + "/comments", {
        method: "POST",
        body: body,
      });

      clearReplyTo();
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
    var confirmed = await MD3.showConfirm(
      t("comments.confirm_delete"),
      t("comments.confirm_delete_desc")
    );
    if (!confirmed) return;

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

  // ===== Like Button =====
  function initLikeButton(post) {
    var likeBtn = document.getElementById("likeBtn");
    var likeCount = document.getElementById("likeCount");
    if (!likeBtn || !likeCount) return;

    likeCount.textContent = post.likeCount || 0;

    // Check if current user has liked this post
    if (window.Auth && Auth.isLoggedIn()) {
      MD3.api("/posts/" + encodeURIComponent(post.slug) + "/like")
        .then(function (data) {
          if (data.liked) {
            likeBtn.classList.add("like-btn--active");
          }
          likeCount.textContent = data.likeCount || 0;
        })
        .catch(function () {});
    }

    likeBtn.addEventListener("click", async function () {
      if (!window.Auth || !Auth.isLoggedIn()) {
        MD3.showSnackbar(t("like.login_required"));
        return;
      }

      likeBtn.disabled = true;
      try {
        var data = await MD3.api("/posts/" + encodeURIComponent(post.slug) + "/like", {
          method: "POST",
        });
        likeCount.textContent = data.likeCount;
        if (data.liked) {
          likeBtn.classList.add("like-btn--active", "like-btn--pop");
          setTimeout(function () {
            likeBtn.classList.remove("like-btn--pop");
          }, 400);
        } else {
          likeBtn.classList.remove("like-btn--active");
        }
      } catch (e) {
        MD3.showSnackbar(t("msg.error_prefix") + e.message);
      } finally {
        likeBtn.disabled = false;
      }
    });
  }
})();
