/* ============================================================
   MD3 Blog - Editor Page Logic
   Markdown toolbar, live preview, tags input, save
   ============================================================ */

(function () {
  "use strict";

  var editMode = false;
  var currentSlug = null;
  var tags = [];
  var isSaving = false;

  // ===== i18n helper =====
  function t(key) {
    if (window.I18N) return I18N.t(key);
    return key;
  }

  // ===== Init =====
  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    currentSlug = params.get("slug");
    editMode = !!currentSlug;

    // Update title
    updateEditorTitle();

    // Configure marked
    if (typeof marked !== "undefined") {
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false,
      });
    }

    // Check auth - require login
    checkAuth();

    initToolbar();
    initPreview();
    initTagsInput();
    initSave();
    initSlugAutogen();
    initLangListener();
    initAuthListener();
  });

  // ===== Check Auth =====
  async function checkAuth() {
    if (window.Auth) {
      // Wait for Auth to finish initializing
      if (Auth.ready) await Auth.ready();
      if (!Auth.isLoggedIn()) {
        // Not logged in - show login dialog
        Auth.showLoginDialog();
        MD3.showSnackbar(t("editor.login_required"));
      } else {
        // Logged in - load post if editing
        if (editMode) {
          loadPost(currentSlug);
          verifyOwnership();
        }
      }
    } else {
      // No auth system - just load
      if (editMode) {
        loadPost(currentSlug);
      }
    }
  }

  // ===== Verify ownership for edit mode =====
  async function verifyOwnership() {
    try {
      var data = await MD3.api("/posts/" + encodeURIComponent(currentSlug));
      var post = data.post;
      var user = Auth.getUser();
      if (post && user && post.authorId !== user.id) {
        MD3.showSnackbar(t("msg.error_prefix") + "You can only edit your own posts");
        setTimeout(function () {
          window.location.href = "/";
        }, 2000);
      }
    } catch (e) {
      // ignore
    }
  }

  // ===== Listen for auth changes =====
  function initAuthListener() {
    window.addEventListener("authChanged", function () {
      if (!Auth.isLoggedIn()) {
        window.location.href = "/";
      }
    });
  }

  // ===== Listen for language change =====
  function initLangListener() {
    window.addEventListener("languageChanged", function () {
      updateEditorTitle();
      // Re-render preview placeholder if empty
      var textarea = document.getElementById("contentInput");
      if (textarea && !textarea.value.trim()) {
        var preview = document.getElementById("previewArea");
        if (preview) {
          preview.innerHTML =
            '<p style="color: var(--md-on-surface-variant); opacity: 0.5;">' + t("editor.preview_placeholder") + '</p>';
        }
      }
      // Update save button if not saving
      if (!isSaving) {
        var saveBtn = document.getElementById("saveBtn");
        if (saveBtn) saveBtn.textContent = t("editor.save");
      }
    });
  }

  // ===== Update editor title =====
  function updateEditorTitle() {
    var titleEl = document.getElementById("editorTitle");
    if (titleEl) titleEl.textContent = editMode ? t("editor.edit_post") : t("editor.new_post");
  }

  // ===== Load Post (Edit Mode) =====
  async function loadPost(slug) {
    try {
      var data = await MD3.api("/posts/" + encodeURIComponent(slug));
      var post = data.post;

      document.getElementById("titleInput").value = post.title || "";
      document.getElementById("categoryInput").value = post.category || "";
      document.getElementById("slugInput").value = post.slug || "";
      document.getElementById("contentInput").value = post.content || "";

      tags = post.tags || [];
      renderTags();

      updatePreview();
    } catch (e) {
      MD3.showSnackbar(t("msg.error_prefix") + e.message);
    }
  }

  // ===== Markdown Toolbar =====
  function initToolbar() {
    var buttons = document.querySelectorAll(".toolbar-btn");
    var textarea = document.getElementById("contentInput");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var type = btn.dataset.md;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var text = textarea.value;
        var selected = text.substring(start, end);
        var replacement = "";
        var cursorOffset = 0;

        switch (type) {
          case "heading":
            replacement = "## " + (selected || "Heading");
            cursorOffset = selected ? 0 : "Heading".length;
            break;
          case "bold":
            replacement = "**" + (selected || "bold") + "**";
            cursorOffset = selected ? 0 : "bold".length;
            break;
          case "italic":
            replacement = "*" + (selected || "italic") + "*";
            cursorOffset = selected ? 0 : "italic".length;
            break;
          case "quote":
            replacement = "> " + (selected || "Quote");
            cursorOffset = selected ? 0 : "Quote".length;
            break;
          case "code":
            replacement = "`" + (selected || "code") + "`";
            cursorOffset = selected ? 0 : "code".length;
            break;
          case "link":
            replacement = "[" + (selected || "link text") + "](https://)";
            cursorOffset = selected ? -9 : "link text".length - 9;
            break;
          case "list":
            replacement = "- " + (selected || "List item");
            cursorOffset = selected ? 0 : "List item".length;
            break;
          case "ordered-list":
            replacement = "1. " + (selected || "List item");
            cursorOffset = selected ? 0 : "List item".length;
            break;
          case "image":
            replacement = "![" + (selected || "alt text") + "](https://)";
            cursorOffset = selected ? -9 : "alt text".length - 9;
            break;
          case "table":
            replacement =
              "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |";
            break;
          default:
            return;
        }

        textarea.value =
          text.substring(0, start) + replacement + text.substring(end);

        // Set cursor position
        var newPos = start + replacement.length + cursorOffset;
        if (cursorOffset === 0 && selected) {
          // Select the replacement text
          textarea.setSelectionRange(start, start + replacement.length);
        } else {
          textarea.setSelectionRange(newPos, newPos);
        }

        textarea.focus();
        updatePreview();
      });
    });
  }

  // ===== Live Preview =====
  function initPreview() {
    var textarea = document.getElementById("contentInput");
    if (textarea) {
      textarea.addEventListener("input", updatePreview);
    }
    updatePreview();
  }

  function updatePreview() {
    var textarea = document.getElementById("contentInput");
    var preview = document.getElementById("previewArea");
    if (!textarea || !preview) return;

    var content = textarea.value.trim();
    if (!content) {
      preview.innerHTML =
        '<p style="color: var(--md-on-surface-variant); opacity: 0.5;">' + t("editor.preview_placeholder") + '</p>';
      return;
    }

    if (typeof marked !== "undefined") {
      preview.innerHTML = marked.parse(content);
    } else {
      preview.innerHTML = "<pre>" + MD3.escapeHtml(content) + "</pre>";
    }
  }

  // ===== Tags Input =====
  function initTagsInput() {
    var input = document.getElementById("tagsInput");

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        var value = input.value.trim();
        if (value && tags.indexOf(value) === -1 && tags.length < 10) {
          tags.push(value);
          renderTags();
        }
        input.value = "";
      } else if (e.key === "Backspace" && !input.value && tags.length > 0) {
        tags.pop();
        renderTags();
      }
    });

    input.addEventListener("blur", function () {
      var value = input.value.trim();
      if (value && tags.indexOf(value) === -1 && tags.length < 10) {
        tags.push(value);
        renderTags();
      }
      input.value = "";
    });
  }

  function renderTags() {
    var container = document.getElementById("tagsInputContainer");
    var input = document.getElementById("tagsInput");

    // Remove existing tags
    container.querySelectorAll(".tags-input__tag").forEach(function (el) {
      el.remove();
    });

    // Add tags before input
    tags.forEach(function (tag, index) {
      var tagEl = document.createElement("span");
      tagEl.className = "tags-input__tag";
      tagEl.innerHTML =
        MD3.escapeHtml(tag) +
        '<button type="button" data-index="' +
        index +
        '"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>';
      container.insertBefore(tagEl, input);

      tagEl.querySelector("button").addEventListener("click", function () {
        tags.splice(index, 1);
        renderTags();
      });
    });
  }

  // ===== Slug Auto-generation =====
  function initSlugAutogen() {
    var titleInput = document.getElementById("titleInput");
    var slugInput = document.getElementById("slugInput");

    titleInput.addEventListener("input", function () {
      if (!editMode || !slugInput.value) {
        var slug = titleInput.value
          .toLowerCase()
          .trim()
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .substring(0, 60);
        slugInput.value = slug;
      }
    });
  }

  // ===== Save =====
  function initSave() {
    var saveBtn = document.getElementById("saveBtn");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async function () {
      var title = document.getElementById("titleInput").value.trim();
      var category = document.getElementById("categoryInput").value.trim() || t("post.uncategorized");
      var slug = document.getElementById("slugInput").value.trim();
      var content = document.getElementById("contentInput").value;

      // Validation
      if (!title) {
        MD3.showSnackbar(t("msg.title_required"));
        document.getElementById("titleInput").focus();
        return;
      }

      if (!content.trim()) {
        MD3.showSnackbar(t("msg.content_required"));
        document.getElementById("contentInput").focus();
        return;
      }

      // Disable button
      isSaving = true;
      saveBtn.textContent = t("editor.saving");
      saveBtn.disabled = true;

      var body = {
        title: title,
        content: content,
        excerpt:
          content.substring(0, 150).replace(/[#*>`\n]/g, " ").trim() + "...",
        tags: tags,
        category: category,
      };

      if (slug) body.slug = slug;

      try {
        var data;
        if (editMode) {
          data = await MD3.api("/posts/" + encodeURIComponent(currentSlug), {
            method: "PUT",
            body: body,
          });
          MD3.showSnackbar(t("msg.post_updated"));
        } else {
          data = await MD3.api("/posts", {
            method: "POST",
            body: body,
          });
          MD3.showSnackbar(t("msg.post_created"));
        }

        // Redirect to post page
        var newSlug = data.post.slug;
        setTimeout(function () {
          window.location.href = "/post?slug=" + encodeURIComponent(newSlug);
        }, 800);
      } catch (e) {
        MD3.showSnackbar(t("msg.error_prefix") + e.message);
        isSaving = false;
        saveBtn.textContent = t("editor.save");
        saveBtn.disabled = false;
      }
    });
  }
})();
