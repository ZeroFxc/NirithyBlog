/* ============================================================
   NirithyBlog - i18n Internationalization
   Supports: English (en), Chinese (zh-CN)
   ============================================================ */

(function (global) {
  "use strict";

  var translations = {
    "en": {
      // App
      "app.title": "NirithyBlog",
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
      "post.author": "Author",

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
      "editor.login_required": "Please login to create posts",

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
      "time.y_ago": "y ago",

      // Auth
      "auth.login": "Login",
      "auth.register": "Register",
      "auth.logout": "Logout",
      "auth.no_account": "No account? Register",
      "auth.has_account": "Already have an account? Login",
      "auth.fields_required": "Username and password are required",
      "auth.processing": "Processing...",
      "auth.login_success": "Login successful",
      "auth.register_success": "Registration successful",
      "auth.logged_out": "Logged out",

      // Check-in
      "checkin.checkin": "Check-in",
      "checkin.done": "Checked in",
      "checkin.success": "Check-in successful!",
      "checkin.already": "Already checked in today",
      "checkin.streak": "streak",

      // Comments
      "comments.title": "Comments",
      "comments.placeholder": "Write a comment...",
      "comments.submit": "Post Comment",
      "comments.empty": "No comments yet. Be the first to comment!",
      "comments.login_required": "Please login to comment",
      "comments.delete": "Delete",
      "comments.confirm_delete": "Delete this comment?",
      "comments.posted": "Comment posted!",
      "comments.deleted": "Comment deleted"
    },

    "zh-CN": {
      // App
      "app.title": "NirithyBlog",
      "app.search_placeholder": "搜索文章...",
      "app.filter_all": "全部",
      "app.new_post": "新建文章",

      // Empty states
      "empty.no_posts_title": "还没有文章",
      "empty.no_posts_desc": "成为第一位发布文章的人。",
      "empty.write_post": "写一篇",
      "empty.no_results_title": "未找到文章",
      "empty.no_results_desc": "试试调整搜索或筛选条件。",
      "empty.failed_title": "加载失败",
      "empty.retry": "重试",
      "empty.back_home": "返回首页",
      "empty.no_post_title": "未指定文章",
      "empty.no_post_desc": "请返回选择一篇文章。",
      "empty.not_found_title": "文章不存在",
      "empty.not_found_desc": "您要查找的文章不存在。",

      // Post detail
      "post.updated": "更新于",
      "post.uncategorized": "未分类",
      "post.author": "作者",

      // Editor
      "editor.new_post": "新建文章",
      "editor.edit_post": "编辑文章",
      "editor.title": "标题",
      "editor.title_placeholder": "输入文章标题...",
      "editor.category": "分类",
      "editor.category_placeholder": "例如：技术",
      "editor.slug": "链接 (URL)",
      "editor.slug_placeholder": "留空则自动生成",
      "editor.tags": "标签",
      "editor.tags_placeholder": "输入标签后按 Enter...",
      "editor.content": "正文 (Markdown)",
      "editor.content_placeholder": "用 Markdown 写你的文章...",
      "editor.preview_placeholder": "预览将在此处显示...",
      "editor.save": "保存",
      "editor.saving": "保存中...",
      "editor.login_required": "请登录后再创建文章",

      // Dialog
      "dialog.delete_title": "删除文章",
      "dialog.delete_content": "确定要删除这篇文章吗？此操作不可撤销。",
      "dialog.cancel": "取消",
      "dialog.delete": "删除",
      "dialog.deleting": "删除中...",

      // Messages
      "msg.title_required": "标题不能为空",
      "msg.content_required": "正文不能为空",
      "msg.post_created": "文章创建成功",
      "msg.post_updated": "文章更新成功",
      "msg.post_deleted": "文章删除成功",
      "msg.error_prefix": "错误：",

      // Toolbar
      "toolbar.heading": "标题",
      "toolbar.bold": "粗体",
      "toolbar.italic": "斜体",
      "toolbar.quote": "引用",
      "toolbar.code": "代码",
      "toolbar.link": "链接",
      "toolbar.list": "列表",
      "toolbar.ordered_list": "有序列表",
      "toolbar.image": "图片",
      "toolbar.table": "表格",

      // Footer
      "footer.open_source": "开源项目",
      "footer.powered_by": "基于 Cloudflare Workers + R2 驱动",

      // Time ago
      "time.just_now": "刚刚",
      "time.m_ago": "分钟前",
      "time.h_ago": "小时前",
      "time.d_ago": "天前",
      "time.w_ago": "周前",
      "time.mo_ago": "个月前",
      "time.y_ago": "年前",

      // Auth
      "auth.login": "登录",
      "auth.register": "注册",
      "auth.logout": "退出登录",
      "auth.no_account": "没有账号？去注册",
      "auth.has_account": "已有账号？去登录",
      "auth.fields_required": "用户名和密码不能为空",
      "auth.processing": "处理中...",
      "auth.login_success": "登录成功",
      "auth.register_success": "注册成功",
      "auth.logged_out": "已退出登录",

      // Check-in
      "checkin.checkin": "签到",
      "checkin.done": "已签到",
      "checkin.success": "签到成功！",
      "checkin.already": "今天已签到",
      "checkin.streak": "连续",

      // Comments
      "comments.title": "评论",
      "comments.placeholder": "写下你的评论...",
      "comments.submit": "发表评论",
      "comments.empty": "还没有评论，来抢沙发吧！",
      "comments.login_required": "请登录后再评论",
      "comments.delete": "删除",
      "comments.confirm_delete": "确定删除这条评论吗？",
      "comments.posted": "评论发表成功！",
      "comments.deleted": "评论已删除"
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
