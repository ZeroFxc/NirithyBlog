/* ============================================================
   MD3 Blog - i18n Internationalization
   Supports: English (en), Chinese (zh-CN)
   ============================================================ */

(function (global) {
  "use strict";

  var translations = {
    "en": {
      // App
      "app.title": "MD3 Blog",
      "app.search_placeholder": "Search posts...",
      "app.filter_all": "All",
      "app.new_post": "New Post",

      // Empty states
      "empty.no_posts_title": "No posts yet",
      "empty.no_posts_desc": "Be the first to publish a post on this blog.",
      "empty.write_post": "Write a Post",
      "empty.no_results_title": "No posts found",
      "empty.no_results_desc": "Try adjusting your search or filters.",
      "empty.failed_title": "Failed to load",
      "empty.retry": "Retry",
      "empty.back_home": "Back to Home",
      "empty.no_post_title": "No post specified",
      "empty.no_post_desc": "Please go back and select a post.",
      "empty.not_found_title": "Post not found",
      "empty.not_found_desc": "The post you are looking for does not exist.",

      // Post detail
      "post.updated": "Updated",
      "post.uncategorized": "Uncategorized",

      // Editor
      "editor.new_post": "New Post",
      "editor.edit_post": "Edit Post",
      "editor.title": "Title",
      "editor.title_placeholder": "Enter post title...",
      "editor.category": "Category",
      "editor.category_placeholder": "e.g. Technology",
      "editor.slug": "Slug (URL)",
      "editor.slug_placeholder": "auto-generated-if-empty",
      "editor.tags": "Tags",
      "editor.tags_placeholder": "Type a tag and press Enter...",
      "editor.content": "Content (Markdown)",
      "editor.content_placeholder": "Write your post in Markdown...",
      "editor.preview_placeholder": "Preview will appear here...",
      "editor.save": "Save",
      "editor.saving": "Saving...",

      // Dialog
      "dialog.delete_title": "Delete Post",
      "dialog.delete_content": "Are you sure you want to delete this post? This action cannot be undone.",
      "dialog.cancel": "Cancel",
      "dialog.delete": "Delete",
      "dialog.deleting": "Deleting...",

      // Messages
      "msg.title_required": "Title is required",
      "msg.content_required": "Content is required",
      "msg.post_created": "Post created successfully",
      "msg.post_updated": "Post updated successfully",
      "msg.post_deleted": "Post deleted successfully",
      "msg.error_prefix": "Error: ",

      // Toolbar
      "toolbar.heading": "Heading",
      "toolbar.bold": "Bold",
      "toolbar.italic": "Italic",
      "toolbar.quote": "Quote",
      "toolbar.code": "Code",
      "toolbar.link": "Link",
      "toolbar.list": "List",
      "toolbar.ordered_list": "Ordered List",
      "toolbar.image": "Image",
      "toolbar.table": "Table",

      // Footer
      "footer.open_source": "Open Source",
      "footer.powered_by": "Powered by Cloudflare Workers + R2",

      // Time ago
      "time.just_now": "just now",
      "time.m_ago": "m ago",
      "time.h_ago": "h ago",
      "time.d_ago": "d ago",
      "time.w_ago": "w ago",
      "time.mo_ago": "mo ago",
      "time.y_ago": "y ago"
    },

    "zh-CN": {
      // App
      "app.title": "MD3 \u535a\u5ba2",
      "app.search_placeholder": "\u641c\u7d22\u6587\u7ae0...",
      "app.filter_all": "\u5168\u90e8",
      "app.new_post": "\u65b0\u5efa\u6587\u7ae0",

      // Empty states
      "empty.no_posts_title": "\u8fd8\u6ca1\u6709\u6587\u7ae0",
      "empty.no_posts_desc": "\u6210\u4e3a\u7b2c\u4e00\u4f4d\u53d1\u5e03\u6587\u7ae0\u7684\u4eba\u3002",
      "empty.write_post": "\u5199\u4e00\u7bc7",
      "empty.no_results_title": "\u672a\u627e\u5230\u6587\u7ae0",
      "empty.no_results_desc": "\u8bd5\u8bd5\u8c03\u6574\u641c\u7d22\u6216\u7b5b\u9009\u6761\u4ef6\u3002",
      "empty.failed_title": "\u52a0\u8f7d\u5931\u8d25",
      "empty.retry": "\u91cd\u8bd5",
      "empty.back_home": "\u8fd4\u56de\u9996\u9875",
      "empty.no_post_title": "\u672a\u6307\u5b9a\u6587\u7ae0",
      "empty.no_post_desc": "\u8bf7\u8fd4\u56de\u9009\u62e9\u4e00\u7bc7\u6587\u7ae0\u3002",
      "empty.not_found_title": "\u6587\u7ae0\u4e0d\u5b58\u5728",
      "empty.not_found_desc": "\u60a8\u8981\u67e5\u627e\u7684\u6587\u7ae0\u4e0d\u5b58\u5728\u3002",

      // Post detail
      "post.updated": "\u66f4\u65b0\u4e8e",
      "post.uncategorized": "\u672a\u5206\u7c7b",

      // Editor
      "editor.new_post": "\u65b0\u5efa\u6587\u7ae0",
      "editor.edit_post": "\u7f16\u8f91\u6587\u7ae0",
      "editor.title": "\u6807\u9898",
      "editor.title_placeholder": "\u8f93\u5165\u6587\u7ae0\u6807\u9898...",
      "editor.category": "\u5206\u7c7b",
      "editor.category_placeholder": "\u4f8b\u5982\uff1a\u6280\u672f",
      "editor.slug": "\u94fe\u63a5 (URL)",
      "editor.slug_placeholder": "\u7559\u7a7a\u5219\u81ea\u52a8\u751f\u6210",
      "editor.tags": "\u6807\u7b7e",
      "editor.tags_placeholder": "\u8f93\u5165\u6807\u7b7e\u540e\u6309 Enter...",
      "editor.content": "\u6b63\u6587 (Markdown)",
      "editor.content_placeholder": "\u7528 Markdown \u5199\u4f60\u7684\u6587\u7ae0...",
      "editor.preview_placeholder": "\u9884\u89c8\u5c06\u5728\u6b64\u5904\u663e\u793a...",
      "editor.save": "\u4fdd\u5b58",
      "editor.saving": "\u4fdd\u5b58\u4e2d...",

      // Dialog
      "dialog.delete_title": "\u5220\u9664\u6587\u7ae0",
      "dialog.delete_content": "\u786e\u5b9a\u8981\u522a\u9664\u8fd9\u7bc7\u6587\u7ae0\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500\u3002",
      "dialog.cancel": "\u53d6\u6d88",
      "dialog.delete": "\u5220\u9664",
      "dialog.deleting": "\u522a\u9664\u4e2d...",

      // Messages
      "msg.title_required": "\u6807\u9898\u4e0d\u80fd\u4e3a\u7a7a",
      "msg.content_required": "\u6b63\u6587\u4e0d\u80fd\u4e3a\u7a7a",
      "msg.post_created": "\u6587\u7ae0\u521b\u5efa\u6210\u529f",
      "msg.post_updated": "\u6587\u7ae0\u66f4\u65b0\u6210\u529f",
      "msg.post_deleted": "\u6587\u7ae0\u522a\u9664\u6210\u529f",
      "msg.error_prefix": "\u9519\u8bef\uff1a",

      // Toolbar
      "toolbar.heading": "\u6807\u9898",
      "toolbar.bold": "\u7c97\u4f53",
      "toolbar.italic": "\u659c\u4f53",
      "toolbar.quote": "\u5f15\u7528",
      "toolbar.code": "\u4ee3\u7801",
      "toolbar.link": "\u94fe\u63a5",
      "toolbar.list": "\u5217\u8868",
      "toolbar.ordered_list": "\u6709\u5e8f\u5217\u8868",
      "toolbar.image": "\u56fe\u7247",
      "toolbar.table": "\u8868\u683c",

      // Footer
      "footer.open_source": "\u5f00\u6e90\u9879\u76ee",
      "footer.powered_by": "\u57fa\u4e8e Cloudflare Workers + R2 \u9a71\u52a8",

      // Time ago
      "time.just_now": "\u521a\u521a",
      "time.m_ago": "\u5206\u949f\u524d",
      "time.h_ago": "\u5c0f\u65f6\u524d",
      "time.d_ago": "\u5929\u524d",
      "time.w_ago": "\u5468\u524d",
      "time.mo_ago": "\u4e2a\u6708\u524d",
      "time.y_ago": "\u5e74\u524d"
    }
  };

  var currentLang = "en";

  // ===== Init Language =====
  function initLanguage() {
    var saved = localStorage.getItem("md3-lang");
    var browserLang = navigator.language || navigator.userLanguage || "en";
    var lang = saved || (browserLang.startsWith("zh") ? "zh-CN" : "en");
    setLanguage(lang);

    var toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        setLanguage(currentLang === "en" ? "zh-CN" : "en");
      });
    }
  }

  function setLanguage(lang) {
    if (!translations[lang]) lang = "en";
    currentLang = lang;
    localStorage.setItem("md3-lang", lang);
    document.documentElement.lang = lang;

    // Update all data-i18n elements
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var text = t(key);
      if (text) el.textContent = text;
    });

    // Update all data-i18n-placeholder elements
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var text = t(key);
      if (text) el.placeholder = text;
    });

    // Update all data-i18n-title attributes
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      var text = t(key);
      if (text) el.title = text;
    });

    // Update language toggle label
    var langLabel = document.getElementById("langLabel");
    if (langLabel) {
      langLabel.textContent = lang === "en" ? "CN" : "EN";
    }

    // Dispatch event so page scripts can re-render
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: lang } }));
  }

  // ===== Translate =====
  function t(key) {
    var lang = currentLang;
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // Fallback to English
    if (translations["en"] && translations["en"][key]) {
      return translations["en"][key];
    }
    return key;
  }

  function getLang() {
    return currentLang;
  }

  // ===== Export =====
  global.I18N = {
    initLanguage: initLanguage,
    setLanguage: setLanguage,
    t: t,
    getLang: getLang,
    translations: translations
  };
})(window);
