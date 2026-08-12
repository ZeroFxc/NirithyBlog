/**
 * NirithyBlog - Cloudflare Worker
 * API + R2 storage for blog posts, users, comments, check-in, points, levels
 */

// ===== Types =====

interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  category: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  points: number;
  createdAt: string;
  lastCheckin: string | null;
  checkinStreak: number;
}

interface UserPublic {
  id: string;
  username: string;
  points: number;
  level: number;
  levelTitle: string;
  nextLevelPoints: number;
  progressToNext: number;
  createdAt: string;
  checkinStreak: number;
  lastCheckin: string | null;
  checkedInToday: boolean;
}

interface Comment {
  id: string;
  postSlug: string;
  userId: string;
  username: string;
  userLevel: number;
  content: string;
  createdAt: string;
}

interface CheckinRecord {
  date: string;
  points: number;
  streak: number;
}

interface PointsLog {
  action: string;
  points: number;
  description: string;
  createdAt: string;
}

interface Env {
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  BLOG_TITLE: string;
  BLOG_DESCRIPTION: string;
  JWT_SECRET: string;
}

// ===== Constants =====

const POSTS_PREFIX = "posts/";
const USERS_PREFIX = "users/";
const USERNAMES_PREFIX = "usernames/";
const COMMENTS_PREFIX = "comments/";
const CHECKIN_PREFIX = "checkin/";
const POINTS_PREFIX = "points/";

const PBKDF2_ITERATIONS = 100000;
const TOKEN_EXPIRY_HOURS = 72;

const POINTS_CHECKIN = 5;
const POINTS_POST = 10;
const POINTS_COMMENT = 2;
const POINTS_STREAK_BONUS_CAP = 20;

const LEVELS = [
  { level: 1, min: 0, titleEn: "Newbie", titleZh: "新手" },
  { level: 2, min: 50, titleEn: "Apprentice", titleZh: "学徒" },
  { level: 3, min: 150, titleEn: "Active", titleZh: "活跃" },
  { level: 4, min: 300, titleEn: "Skilled", titleZh: "熟练" },
  { level: 5, min: 500, titleEn: "Veteran", titleZh: "资深" },
  { level: 6, min: 800, titleEn: "Expert", titleZh: "专家" },
  { level: 7, min: 1200, titleEn: "Master", titleZh: "大师" },
  { level: 8, min: 1800, titleEn: "Diamond", titleZh: "钻石" },
  { level: 9, min: 2500, titleEn: "Legend", titleZh: "传奇" },
  { level: 10, min: 3500, titleEn: "Mythic", titleZh: "神话" },
];

// ===== Helpers =====

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
  return slug || `post-${Date.now()}`;
}

function generateId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
  );
}

function getLevelInfo(points: number): {
  level: number;
  titleEn: string;
  titleZh: string;
  nextLevelPoints: number;
  progressToNext: number;
} {
  let current = LEVELS[0];
  let next: typeof LEVELS[0] | null = null;

  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
    } else {
      break;
    }
  }

  const nextLevelPoints = next ? next.min : current.min;
  const progressToNext = next
    ? Math.round(((points - current.min) / (next.min - current.min)) * 100)
    : 100;

  return {
    level: current.level,
    titleEn: current.titleEn,
    titleZh: current.titleZh,
    nextLevelPoints,
    progressToNext,
  };
}

function toUserPublic(user: User): UserPublic {
  const levelInfo = getLevelInfo(user.points);
  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = user.lastCheckin === today;

  return {
    id: user.id,
    username: user.username,
    points: user.points,
    level: levelInfo.level,
    levelTitle: levelInfo.titleEn,
    nextLevelPoints: levelInfo.nextLevelPoints,
    progressToNext: levelInfo.progressToNext,
    createdAt: user.createdAt,
    checkinStreak: user.checkinStreak,
    lastCheckin: user.lastCheckin,
    checkedInToday,
  };
}

// ===== Crypto =====

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr));
}

async function generateToken(user: User, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId: user.id,
    username: user.username,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 3600 * 1000,
  };

  const enc = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "");
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(
    /=/g,
    ""
  );

  return `${data}.${sigB64}`;
}

async function verifyToken(
  token: string,
  secret: string
): Promise<{ userId: string; username: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(data)
    );
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp && Date.now() > payload.exp) return null;

    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

async function getAuthUser(
  request: Request,
  env: Env
): Promise<User | null> {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;

  const token = auth.substring(7);
  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) return null;

  const obj = await env.BUCKET.get(`${USERS_PREFIX}${payload.userId}.json`);
  if (!obj) return null;
  return (await obj.json()) as User;
}

// ===== R2 Storage: Users =====

async function getUserByUsername(
  username: string,
  env: Env
): Promise<User | null> {
  const nameObj = await env.BUCKET.get(
    `${USERNAMES_PREFIX}${username.toLowerCase()}.json`
  );
  if (!nameObj) return null;
  const { userId } = (await nameObj.json()) as { userId: string };
  const obj = await env.BUCKET.get(`${USERS_PREFIX}${userId}.json`);
  if (!obj) return null;
  return (await obj.json()) as User;
}

async function saveUser(user: User, env: Env): Promise<void> {
  await env.BUCKET.put(
    `${USERS_PREFIX}${user.id}.json`,
    JSON.stringify(user, null, 2),
    { httpMetadata: { contentType: "application/json" } }
  );
  await env.BUCKET.put(
    `${USERNAMES_PREFIX}${user.username.toLowerCase()}.json`,
    JSON.stringify({ userId: user.id }),
    { httpMetadata: { contentType: "application/json" } }
  );
}

async function addPointsLog(
  userId: string,
  action: string,
  points: number,
  description: string,
  env: Env
): Promise<void> {
  const log: PointsLog = {
    action,
    points,
    description,
    createdAt: new Date().toISOString(),
  };
  await env.BUCKET.put(
    `${POINTS_PREFIX}${userId}/${Date.now()}.json`,
    JSON.stringify(log, null, 2),
    { httpMetadata: { contentType: "application/json" } }
  );
}

// ===== R2 Storage: Posts =====

async function listPosts(env: Env): Promise<PostSummary[]> {
  const listed = await env.BUCKET.list({ prefix: POSTS_PREFIX });
  const posts: PostSummary[] = [];

  for (const item of listed.objects) {
    if (!item.key.endsWith(".json")) continue;
    const obj = await env.BUCKET.get(item.key);
    if (!obj) continue;
    const post = (await obj.json()) as Post;
    posts.push({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      tags: post.tags || [],
      category: post.category || "Uncategorized",
      authorId: post.authorId || "",
      authorName: post.authorName || "",
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  }

  posts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return posts;
}

async function getPost(slug: string, env: Env): Promise<Post | null> {
  const obj = await env.BUCKET.get(`${POSTS_PREFIX}${slug}.json`);
  if (!obj) return null;
  return (await obj.json()) as Post;
}

async function savePost(post: Post, env: Env): Promise<void> {
  await env.BUCKET.put(
    `${POSTS_PREFIX}${post.slug}.json`,
    JSON.stringify(post, null, 2),
    { httpMetadata: { contentType: "application/json" } }
  );
}

async function deletePost(slug: string, env: Env): Promise<void> {
  await env.BUCKET.delete(`${POSTS_PREFIX}${slug}.json`);
  // Also delete comments for this post
  const comments = await env.BUCKET.list({
    prefix: `${COMMENTS_PREFIX}${slug}/`,
  });
  for (const item of comments.objects) {
    await env.BUCKET.delete(item.key);
  }
}

// ===== R2 Storage: Comments =====

async function listComments(
  postSlug: string,
  env: Env
): Promise<Comment[]> {
  const listed = await env.BUCKET.list({
    prefix: `${COMMENTS_PREFIX}${postSlug}/`,
  });
  const comments: Comment[] = [];

  for (const item of listed.objects) {
    if (!item.key.endsWith(".json")) continue;
    const obj = await env.BUCKET.get(item.key);
    if (!obj) continue;
    comments.push((await obj.json()) as Comment);
  }

  comments.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return comments;
}

async function saveComment(comment: Comment, env: Env): Promise<void> {
  await env.BUCKET.put(
    `${COMMENTS_PREFIX}${comment.postSlug}/${comment.id}.json`,
    JSON.stringify(comment, null, 2),
    { httpMetadata: { contentType: "application/json" } }
  );
}

async function deleteComment(
  postSlug: string,
  commentId: string,
  env: Env
): Promise<void> {
  await env.BUCKET.delete(
    `${COMMENTS_PREFIX}${postSlug}/${commentId}.json`
  );
}

async function getComment(
  postSlug: string,
  commentId: string,
  env: Env
): Promise<Comment | null> {
  const obj = await env.BUCKET.get(
    `${COMMENTS_PREFIX}${postSlug}/${commentId}.json`
  );
  if (!obj) return null;
  return (await obj.json()) as Comment;
}

// ===== Auth Handlers =====

async function handleRegister(
  request: Request,
  env: Env
): Promise<Response> {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const username = (body.username || "").trim();
  const password = body.password || "";

  if (username.length < 2 || username.length > 20) {
    return json({ error: "Username must be 2-20 characters" }, 400);
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return json({ error: "Username can only contain letters, numbers, underscores, and Chinese characters" }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Password must be at least 6 characters" }, 400);
  }

  const existing = await getUserByUsername(username, env);
  if (existing) {
    return json({ error: "Username already taken" }, 409);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const now = new Date().toISOString();
  const user: User = {
    id: generateId(),
    username,
    passwordHash,
    salt,
    points: 0,
    createdAt: now,
    lastCheckin: null,
    checkinStreak: 0,
  };

  await saveUser(user, env);

  const token = await generateToken(user, env.JWT_SECRET);
  return json({ token, user: toUserPublic(user) }, 201);
}

async function handleLogin(
  request: Request,
  env: Env
): Promise<Response> {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const username = (body.username || "").trim();
  const password = body.password || "";

  if (!username || !password) {
    return json({ error: "Username and password are required" }, 400);
  }

  const user = await getUserByUsername(username, env);
  if (!user) {
    return json({ error: "Invalid username or password" }, 401);
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return json({ error: "Invalid username or password" }, 401);
  }

  const token = await generateToken(user, env.JWT_SECRET);
  return json({ token, user: toUserPublic(user) });
}

async function handleMe(user: User): Promise<Response> {
  return json({ user: toUserPublic(user) });
}

// ===== Check-in Handler =====

async function handleCheckin(
  user: User,
  env: Env
): Promise<Response> {
  const today = new Date().toISOString().split("T")[0];

  if (user.lastCheckin === today) {
    return json({ error: "Already checked in today" }, 400);
  }

  // Calculate streak
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];
  let streak = 1;
  if (user.lastCheckin === yesterday) {
    streak = user.checkinStreak + 1;
  }

  // Calculate points
  let pointsEarned = POINTS_CHECKIN;
  const streakBonus = Math.min(streak - 1, POINTS_STREAK_BONUS_CAP);
  pointsEarned += streakBonus;

  // Update user
  user.lastCheckin = today;
  user.checkinStreak = streak;
  user.points += pointsEarned;
  await saveUser(user, env);

  // Save check-in record
  const record: CheckinRecord = {
    date: today,
    points: pointsEarned,
    streak,
  };
  await env.BUCKET.put(
    `${CHECKIN_PREFIX}${user.id}/${today}.json`,
    JSON.stringify(record, null, 2),
    { httpMetadata: { contentType: "application/json" } }
  );

  // Points log
  await addPointsLog(
    user.id,
    "checkin",
    pointsEarned,
    `Daily check-in (streak: ${streak})`,
    env
  );

  return json({
    success: true,
    points: pointsEarned,
    streak,
    totalPoints: user.points,
    user: toUserPublic(user),
  });
}

async function handleCheckinStatus(
  user: User,
  env: Env
): Promise<Response> {
  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = user.lastCheckin === today;

  // Get recent check-in history (last 30 days)
  const listed = await env.BUCKET.list({
    prefix: `${CHECKIN_PREFIX}${user.id}/`,
    limit: 30,
  });
  const history: CheckinRecord[] = [];
  for (const item of listed.objects) {
    if (!item.key.endsWith(".json")) continue;
    const obj = await env.BUCKET.get(item.key);
    if (!obj) continue;
    history.push((await obj.json()) as CheckinRecord);
  }

  return json({
    checkedInToday,
    streak: user.checkinStreak,
    lastCheckin: user.lastCheckin,
    history,
  });
}

// ===== Points Log Handler =====

async function handlePointsLog(
  user: User,
  env: Env
): Promise<Response> {
  const listed = await env.BUCKET.list({
    prefix: `${POINTS_PREFIX}${user.id}/`,
    limit: 50,
  });
  const logs: PointsLog[] = [];
  for (const item of listed.objects) {
    if (!item.key.endsWith(".json")) continue;
    const obj = await env.BUCKET.get(item.key);
    if (!obj) continue;
    logs.push((await obj.json()) as PointsLog);
  }
  logs.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return json({ logs, totalPoints: user.points });
}

// ===== Comment Handlers =====

async function handleListComments(
  postSlug: string,
  env: Env
): Promise<Response> {
  const comments = await listComments(postSlug, env);
  return json({ comments, total: comments.length });
}

async function handleCreateComment(
  postSlug: string,
  request: Request,
  user: User,
  env: Env
): Promise<Response> {
  // Verify post exists
  const post = await getPost(postSlug, env);
  if (!post) {
    return json({ error: "Post not found" }, 404);
  }

  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const content = (body.content || "").trim();
  if (!content) {
    return json({ error: "Comment content is required" }, 400);
  }
  if (content.length > 500) {
    return json({ error: "Comment must be 500 characters or less" }, 400);
  }

  const levelInfo = getLevelInfo(user.points);
  const comment: Comment = {
    id: generateId(),
    postSlug,
    userId: user.id,
    username: user.username,
    userLevel: levelInfo.level,
    content,
    createdAt: new Date().toISOString(),
  };

  await saveComment(comment, env);

  // Award points
  user.points += POINTS_COMMENT;
  await saveUser(user, env);
  await addPointsLog(
    user.id,
    "comment",
    POINTS_COMMENT,
    `Commented on "${post.title}"`,
    env
  );

  return json({ comment }, 201);
}

async function handleDeleteComment(
  postSlug: string,
  commentId: string,
  user: User,
  env: Env
): Promise<Response> {
  const comment = await getComment(postSlug, commentId, env);
  if (!comment) {
    return json({ error: "Comment not found" }, 404);
  }

  if (comment.userId !== user.id) {
    return json({ error: "You can only delete your own comments" }, 403);
  }

  await deleteComment(postSlug, commentId, env);
  return json({ success: true });
}

// ===== Post Handlers =====

async function handleListPosts(env: Env): Promise<Response> {
  const posts = await listPosts(env);
  return json({ posts, total: posts.length });
}

async function handleGetPost(
  slug: string,
  env: Env
): Promise<Response> {
  const post = await getPost(slug, env);
  if (!post) {
    return json({ error: "Post not found", slug }, 404);
  }
  return json({ post });
}

async function handleCreatePost(
  request: Request,
  user: User,
  env: Env
): Promise<Response> {
  let body: Partial<Post>;
  try {
    body = (await request.json()) as Partial<Post>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.title || body.title.trim().length === 0) {
    return json({ error: "Title is required" }, 400);
  }

  const slug = body.slug || generateSlug(body.title);

  const existing = await getPost(slug, env);
  if (existing) {
    return json({ error: "A post with this slug already exists", slug }, 409);
  }

  const now = new Date().toISOString();
  const post: Post = {
    slug,
    title: body.title.trim(),
    content: body.content || "",
    excerpt:
      body.excerpt ||
      (body.content
        ? body.content.substring(0, 150).replace(/\n/g, " ") + "..."
        : ""),
    tags: body.tags || [],
    category: body.category || "Uncategorized",
    authorId: user.id,
    authorName: user.username,
    createdAt: now,
    updatedAt: now,
  };

  await savePost(post, env);

  // Award points
  user.points += POINTS_POST;
  await saveUser(user, env);
  await addPointsLog(
    user.id,
    "post",
    POINTS_POST,
    `Created post "${post.title}"`,
    env
  );

  return json({ post }, 201);
}

async function handleUpdatePost(
  slug: string,
  request: Request,
  user: User,
  env: Env
): Promise<Response> {
  const existing = await getPost(slug, env);
  if (!existing) {
    return json({ error: "Post not found", slug }, 404);
  }

  // Only author can edit
  if (existing.authorId !== user.id) {
    return json({ error: "You can only edit your own posts" }, 403);
  }

  let body: Partial<Post>;
  try {
    body = (await request.json()) as Partial<Post>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const updated: Post = {
    ...existing,
    title: body.title ?? existing.title,
    content: body.content ?? existing.content,
    excerpt: body.excerpt ?? existing.excerpt,
    tags: body.tags ?? existing.tags,
    category: body.category ?? existing.category,
    updatedAt: new Date().toISOString(),
  };

  if (body.slug && body.slug !== slug) {
    await deletePost(slug, env);
    updated.slug = body.slug;
  }

  await savePost(updated, env);
  return json({ post: updated });
}

async function handleDeletePost(
  slug: string,
  user: User,
  env: Env
): Promise<Response> {
  const existing = await getPost(slug, env);
  if (!existing) {
    return json({ error: "Post not found", slug }, 404);
  }

  if (existing.authorId !== user.id) {
    return json({ error: "You can only delete your own posts" }, 403);
  }

  await deletePost(slug, env);
  return json({ success: true, slug });
}

async function handleListTags(env: Env): Promise<Response> {
  const posts = await listPosts(env);
  const tagSet = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.set(tag, (tagSet.get(tag) || 0) + 1);
    }
  }

  const tags = Array.from(tagSet.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return json({ tags });
}

async function handleListCategories(env: Env): Promise<Response> {
  const posts = await listPosts(env);
  const catSet = new Map<string, number>();

  for (const post of posts) {
    const cat = post.category || "Uncategorized";
    catSet.set(cat, (catSet.get(cat) || 0) + 1);
  }

  const categories = Array.from(catSet.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return json({ categories });
}

async function handleBlogInfo(env: Env): Promise<Response> {
  const posts = await listPosts(env);
  const tagSet = new Set<string>();
  const catSet = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) tagSet.add(tag);
    catSet.add(post.category);
  }

  return json({
    title: env.BLOG_TITLE || "NirithyBlog",
    description:
      env.BLOG_DESCRIPTION ||
      "NirithyBlog on Cloudflare Workers + R2",
    postCount: posts.length,
    tagCount: tagSet.size,
    categoryCount: catSet.size,
  });
}

// ===== Router =====

async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const method = request.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ===== Public routes =====

  if (path === "/info" && method === "GET") {
    return handleBlogInfo(env);
  }

  if (path === "/tags" && method === "GET") {
    return handleListTags(env);
  }

  if (path === "/categories" && method === "GET") {
    return handleListCategories(env);
  }

  // Posts list (public)
  if (path === "/posts" && method === "GET") {
    return handleListPosts(env);
  }

  // Auth routes
  if (path === "/auth/register" && method === "POST") {
    return handleRegister(request, env);
  }

  if (path === "/auth/login" && method === "POST") {
    return handleLogin(request, env);
  }

  // ===== Auth required routes =====

  if (path === "/auth/me" && method === "GET") {
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: "Not authenticated" }, 401);
    return handleMe(user);
  }

  if (path === "/checkin" && method === "POST") {
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: "Not authenticated" }, 401);
    return handleCheckin(user, env);
  }

  if (path === "/checkin/status" && method === "GET") {
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: "Not authenticated" }, 401);
    return handleCheckinStatus(user, env);
  }

  if (path === "/points/log" && method === "GET") {
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: "Not authenticated" }, 401);
    return handlePointsLog(user, env);
  }

  // Create post (auth required)
  if (path === "/posts" && method === "POST") {
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: "Login required to create posts" }, 401);
    return handleCreatePost(request, user, env);
  }

  // Post CRUD by slug
  const slugMatch = path.match(/^\/posts\/([^/]+)$/);
  if (slugMatch) {
    const slug = decodeURIComponent(slugMatch[1]);

    if (method === "GET") return handleGetPost(slug, env);

    if (method === "PUT") {
      const user = await getAuthUser(request, env);
      if (!user) return json({ error: "Login required" }, 401);
      return handleUpdatePost(slug, request, user, env);
    }

    if (method === "DELETE") {
      const user = await getAuthUser(request, env);
      if (!user) return json({ error: "Login required" }, 401);
      return handleDeletePost(slug, user, env);
    }
  }

  // Comments routes
  const commentsMatch = path.match(/^\/posts\/([^/]+)\/comments$/);
  if (commentsMatch) {
    const postSlug = decodeURIComponent(commentsMatch[1]);

    if (method === "GET") return handleListComments(postSlug, env);

    if (method === "POST") {
      const user = await getAuthUser(request, env);
      if (!user)
        return json({ error: "Login required to comment" }, 401);
      return handleCreateComment(postSlug, request, user, env);
    }
  }

  // Delete comment
  const commentDeleteMatch = path.match(
    /^\/posts\/([^/]+)\/comments\/([^/]+)$/
  );
  if (commentDeleteMatch && method === "DELETE") {
    const postSlug = decodeURIComponent(commentDeleteMatch[1]);
    const commentId = decodeURIComponent(commentDeleteMatch[2]);
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: "Login required" }, 401);
    return handleDeleteComment(postSlug, commentId, user, env);
  }

  return json({ error: "Endpoint not found", path, method }, 404);
}

// ===== Worker Entry =====

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleAPI(request, env);
      } catch (err) {
        console.error("API Error:", err);
        const message =
          err instanceof Error ? err.message : "Internal server error";
        return json({ error: message }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
