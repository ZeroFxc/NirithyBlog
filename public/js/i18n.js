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
      "app.no_more_posts": "No more posts",
      "app.loading_more": "Loading more...",

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
      "post.read_time": "min read",
      "post.toc": "Table of Contents",

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
      "editor.cover_image": "Cover Image URL",
      "editor.cover_image_placeholder": "https://example.com/cover.jpg",

      // Dialog
      "dialog.delete_title": "Delete Post",
      "dialog.delete_content": "Are you sure you want to delete this post? This action cannot be undone.",
      "dialog.cancel": "Cancel",
      "dialog.delete": "Delete",
      "dialog.deleting": "Deleting...",

      // Confirm
      "confirm.ok": "Confirm",
      "confirm.cancel": "Cancel",

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
      "auth.login_github": "Login with GitHub",
      "auth.bind_github": "Bind GitHub",
      "auth.unbind_github": "Unbind GitHub",
      "auth.unbind_confirm": "Are you sure you want to unbind your GitHub account?",
      "auth.github_bound": "GitHub account bound successfully",
      "auth.github_unbound": "GitHub account unbound",
      "auth.github_failed": "GitHub authentication failed",
      "auth.github_already_bound": "This GitHub account is already linked to another user",
      "auth.auth_required": "Please log in first",
      "auth.invalid_state": "Invalid state, please try again",
      "auth.token_exchange_failed": "GitHub token exchange failed",
      "auth.github_user_failed": "Failed to get GitHub user info",
      "auth.no_user_to_bind": "No user to bind, please log in first",
      "auth.user_not_found": "User not found",
      "auth.banned": "Your account has been banned",

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
      "comments.confirm_delete_desc": "This action cannot be undone.",
      "comments.posted": "Comment posted!",
      "comments.deleted": "Comment deleted",

      // Navigation
      "nav.home": "Home",
      "nav.profile": "Profile",
      "nav.tags": "Tags",
      "nav.admin": "Admin",
      "nav.new_post": "New Post",

      // Profile
      "profile.not_found": "User not found",
      "profile.admin_badge": "ADMIN",
      "profile.points": "pts",
      "profile.next_level": "Next level",
      "profile.posts": "Posts",
      "profile.streak": "Streak",
      "profile.status": "Status",
      "profile.joined": "Joined",
      "profile.tab_posts": "Posts",
      "profile.tab_comments": "Comments",
      "profile.tab_points": "Points Log",
      "profile.no_posts": "No posts yet",
      "profile.no_comments": "No comments yet",
      "profile.no_points": "No points history yet",
      "profile.total_points": "Total Points",

      // Admin
      "admin.title": "Admin Dashboard",
      "admin.no_access": "Access Denied",
      "admin.no_access_desc": "You need admin privileges to access this page.",
      "admin.tab_stats": "Statistics",
      "admin.tab_users": "Users",
      "admin.tab_posts": "Posts",
      "admin.tab_comments": "Comments",
      "admin.stat_users": "Total Users",
      "admin.stat_posts": "Total Posts",
      "admin.stat_comments": "Total Comments",
      "admin.stat_checkin_today": "Checked in Today",
      "admin.user_username": "Username",
      "admin.user_level": "Level",
      "admin.user_points": "Points",
      "admin.user_posts": "Posts",
      "admin.user_role": "Role",
      "admin.user_status": "Status",
      "admin.user_actions": "Actions",
      "admin.role_admin": "Admin",
      "admin.role_user": "User",
      "admin.status_ok": "Active",
      "admin.status_banned": "Banned",
      "admin.promote": "Promote",
      "admin.demote": "Demote",
      "admin.ban": "Ban",
      "admin.unban": "Unban",
      "admin.banned": "banned",
      "admin.unbanned": "unbanned",
      "admin.post_title": "Title",
      "admin.post_author": "Author",
      "admin.post_category": "Category",
      "admin.post_date": "Date",
      "admin.post_actions": "Actions",
      "admin.delete": "Delete",
      "admin.no_posts": "No posts found",
      "admin.confirm_delete_post": "Delete post",
      "admin.confirm_delete_post_desc": "This action cannot be undone.",
      "admin.post_deleted": "Post deleted",
      "admin.comment_content": "Content",
      "admin.comment_author": "Author",
      "admin.comment_post": "Post",
      "admin.comment_date": "Date",
      "admin.comment_actions": "Actions",
      "admin.no_comments": "No comments found",
      "admin.confirm_delete_comment": "Delete this comment",
      "admin.confirm_delete_comment_desc": "This action cannot be undone.",
      "admin.comment_deleted": "Comment deleted",
      "admin.edit": "Edit",
      "admin.search_users": "Search users...",
      "admin.search": "Search",
      "admin.batch_delete": "Batch Delete",
      "admin.batch_ban": "Batch Ban",
      "admin.batch_unban": "Batch Unban",
      "admin.select_all": "Select All",
      "admin.confirm_batch_delete_posts": "Delete selected posts",
      "admin.confirm_batch_delete_posts_desc": "This will permanently delete all selected posts.",
      "admin.confirm_batch_ban": "Ban selected users",
      "admin.confirm_batch_unban": "Unban selected users",
      "admin.batch_deleted": "Selected posts deleted",
      "admin.batch_banned": "Selected users banned",
      "admin.batch_unbanned": "Selected users unbanned",
      "admin.no_selection": "Please select at least one item",
      "admin.trend_title": "30-Day Trend",
      "admin.trend_new_users": "New Users",
      "admin.trend_new_posts": "New Posts",
      "admin.trend_new_comments": "New Comments",
      "admin.trend_cumulative": "Cumulative",

      // Tags & Category pages
      "tags.title": "Tags",
      "tags.subtitle": "Browse posts by tag",
      "tags.empty_title": "No tags found",
      "tags.posts_count": "posts",
      "tags.all_tags": "All Tags",
      "category.title": "Categories",
      "category.subtitle": "Browse posts by category",
      "category.posts": "posts",
      "category.empty_title": "No categories found",

      // Post views
      "post.views": "views",

      // Nav
      "nav.tags": "Tags",
      "nav.categories": "Categories",

      // Sort & Feed
      "app.sort_latest": "Latest",
      "app.sort_popular": "Popular",
      "feed.title": "Following",
      "feed.empty_title": "No posts from people you follow",
      "feed.empty_desc": "Follow more users to see their posts here.",

      // Like
      "like.login_required": "Please login to like posts",

      // Comment reply
      "comments.reply": "Reply",

      // Profile - social
      "profile.follow": "Follow",
      "profile.following": "Following",
      "profile.followers": "Followers",
      "profile.following_stat": "Following",
      "profile.login_to_follow": "Please login to follow users",
      "profile.bio_empty": "No bio yet",
      "profile.edit_bio": "Edit Bio",
      "profile.bio_placeholder": "Write something about yourself...",
      "profile.save_bio": "Save",
      "profile.cancel_bio": "Cancel",
      "profile.bio_updated": "Bio updated",
      "profile.bio_too_long": "Bio must be 200 characters or less",
      "profile.avatar_updated": "Avatar updated",
      "profile.avatar_too_large": "Image must be under 2MB",
      "profile.avatar_invalid_type": "Please select an image file"
    },

    "zh-CN": {
      // App
      "app.title": "NirithyBlog",
      "app.search_placeholder": "搜索文章...",
      "app.filter_all": "全部",
      "app.new_post": "新建文章",
      "app.no_more_posts": "没有更多文章了",
      "app.loading_more": "加载更多...",

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
      "post.read_time": "分钟阅读",
      "post.toc": "目录",

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
      "editor.cover_image": "封面图 URL",
      "editor.cover_image_placeholder": "https://example.com/cover.jpg",

      // Dialog
      "dialog.delete_title": "删除文章",
      "dialog.delete_content": "确定要删除这篇文章吗？此操作不可撤销。",
      "dialog.cancel": "取消",
      "dialog.delete": "删除",
      "dialog.deleting": "删除中...",

      // Confirm
      "confirm.ok": "确定",
      "confirm.cancel": "取消",

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
      "auth.login_github": "使用 GitHub 登录",
      "auth.bind_github": "绑定 GitHub",
      "auth.unbind_github": "解绑 GitHub",
      "auth.unbind_confirm": "确定要解绑 GitHub 账号吗？",
      "auth.github_bound": "GitHub 账号绑定成功",
      "auth.github_unbound": "GitHub 账号已解绑",
      "auth.github_failed": "GitHub 认证失败",
      "auth.github_already_bound": "该 GitHub 账号已绑定其他用户",
      "auth.auth_required": "请先登录",
      "auth.invalid_state": "状态无效，请重试",
      "auth.token_exchange_failed": "GitHub Token 交换失败",
      "auth.github_user_failed": "获取 GitHub 用户信息失败",
      "auth.no_user_to_bind": "无用户可绑定，请先登录",
      "auth.user_not_found": "用户不存在",
      "auth.banned": "你的账号已被封禁",

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
      "comments.confirm_delete_desc": "此操作不可撤销。",
      "comments.posted": "评论发表成功！",
      "comments.deleted": "评论已删除",

      // Navigation
      "nav.home": "首页",
      "nav.profile": "个人主页",
      "nav.tags": "标签",
      "nav.admin": "管理后台",
      "nav.new_post": "新建文章",

      // Profile
      "profile.not_found": "用户不存在",
      "profile.admin_badge": "管理员",
      "profile.points": "积分",
      "profile.next_level": "下一级",
      "profile.posts": "文章",
      "profile.streak": "连续签到",
      "profile.status": "状态",
      "profile.joined": "加入时间",
      "profile.tab_posts": "文章",
      "profile.tab_comments": "评论",
      "profile.tab_points": "积分记录",
      "profile.no_posts": "暂无文章",
      "profile.no_comments": "暂无评论",
      "profile.no_points": "暂无积分记录",
      "profile.total_points": "总积分",

      // Admin
      "admin.title": "管理后台",
      "admin.no_access": "拒绝访问",
      "admin.no_access_desc": "需要管理员权限才能访问此页面。",
      "admin.tab_stats": "统计概览",
      "admin.tab_users": "用户管理",
      "admin.tab_posts": "文章管理",
      "admin.tab_comments": "评论管理",
      "admin.stat_users": "总用户数",
      "admin.stat_posts": "总文章数",
      "admin.stat_comments": "总评论数",
      "admin.stat_checkin_today": "今日签到",
      "admin.user_username": "用户名",
      "admin.user_level": "等级",
      "admin.user_points": "积分",
      "admin.user_posts": "文章数",
      "admin.user_role": "角色",
      "admin.user_status": "状态",
      "admin.user_actions": "操作",
      "admin.role_admin": "管理员",
      "admin.role_user": "普通用户",
      "admin.status_ok": "正常",
      "admin.status_banned": "已封禁",
      "admin.promote": "设为管理员",
      "admin.demote": "取消管理员",
      "admin.ban": "封禁",
      "admin.unban": "解封",
      "admin.banned": "已封禁",
      "admin.unbanned": "已解封",
      "admin.post_title": "标题",
      "admin.post_author": "作者",
      "admin.post_category": "分类",
      "admin.post_date": "日期",
      "admin.post_actions": "操作",
      "admin.delete": "删除",
      "admin.no_posts": "暂无文章",
      "admin.confirm_delete_post": "删除文章",
      "admin.confirm_delete_post_desc": "此操作不可撤销。",
      "admin.post_deleted": "文章已删除",
      "admin.comment_content": "内容",
      "admin.comment_author": "作者",
      "admin.comment_post": "所属文章",
      "admin.comment_date": "日期",
      "admin.comment_actions": "操作",
      "admin.no_comments": "暂无评论",
      "admin.confirm_delete_comment": "删除这条评论",
      "admin.confirm_delete_comment_desc": "此操作不可撤销。",
      "admin.comment_deleted": "评论已删除",
      "admin.edit": "编辑",
      "admin.search_users": "搜索用户...",
      "admin.search": "搜索",
      "admin.batch_delete": "批量删除",
      "admin.batch_ban": "批量封禁",
      "admin.batch_unban": "批量解封",
      "admin.select_all": "全选",
      "admin.confirm_batch_delete_posts": "删除选中文章",
      "admin.confirm_batch_delete_posts_desc": "将永久删除所有选中的文章。",
      "admin.confirm_batch_ban": "封禁选中用户",
      "admin.confirm_batch_unban": "解封选中用户",
      "admin.batch_deleted": "选中文章已删除",
      "admin.batch_banned": "选中用户已封禁",
      "admin.batch_unbanned": "选中用户已解封",
      "admin.no_selection": "请至少选择一项",
      "admin.trend_title": "30天趋势",
      "admin.trend_new_users": "新增用户",
      "admin.trend_new_posts": "新增文章",
      "admin.trend_new_comments": "新增评论",
      "admin.trend_cumulative": "累计",

      // Tags & Category pages
      "tags.title": "标签",
      "tags.subtitle": "按标签浏览文章",
      "tags.empty_title": "暂无标签",
      "tags.posts_count": "篇文章",
      "tags.all_tags": "全部标签",
      "category.title": "分类",
      "category.subtitle": "按分类浏览文章",
      "category.posts": "篇文章",
      "category.empty_title": "暂无分类",

      // Post views
      "post.views": "次浏览",

      // Nav
      "nav.tags": "标签",
      "nav.categories": "分类",

      // Sort & Feed
      "app.sort_latest": "最新",
      "app.sort_popular": "热门",
      "feed.title": "关注动态",
      "feed.empty_title": "暂无关注用户的文章",
      "feed.empty_desc": "关注更多用户，在这里看到他们的最新文章。",

      // Like
      "like.login_required": "请登录后再点赞",

      // Comment reply
      "comments.reply": "回复",

      // Profile - social
      "profile.follow": "关注",
      "profile.following": "已关注",
      "profile.followers": "粉丝",
      "profile.following_stat": "关注",
      "profile.login_to_follow": "请登录后再关注用户",
      "profile.bio_empty": "还没有个性签名",
      "profile.edit_bio": "编辑签名",
      "profile.bio_placeholder": "写点什么介绍一下自己...",
      "profile.save_bio": "保存",
      "profile.cancel_bio": "取消",
      "profile.bio_updated": "签名已更新",
      "profile.bio_too_long": "签名不能超过 200 字",
      "profile.avatar_updated": "头像已更新",
      "profile.avatar_too_large": "图片不能超过 2MB",
      "profile.avatar_invalid_type": "请选择图片文件"
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
