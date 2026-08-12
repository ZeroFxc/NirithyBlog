/**
 * MD3 Blog - Cloudflare Worker
 * API + R2 storage for blog posts
 */

// ===== Types =====

interface Post {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Env {
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  BLOG_TITLE: string;
  BLOG_DESCRIPTION: string;
}

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===== R2 Storage Layer =====

const POSTS_PREFIX = "posts/";

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
}

// ===== API Handlers =====

function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

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

  // Check if slug already exists
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
      body.content?.substring(0, 150).replace(/\n/g, " ") + "..." ||
      "",
    tags: body.tags || [],
    category: body.category || "Uncategorized",
    createdAt: now,
    updatedAt: now,
  };

  await savePost(post, env);
  return json({ post }, 201);
}

async function handleUpdatePost(
  slug: string,
  request: Request,
  env: Env
): Promise<Response> {
  const existing = await getPost(slug, env);
  if (!existing) {
    return json({ error: "Post not found", slug }, 404);
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

  // If slug changed, delete old and create new
  if (body.slug && body.slug !== slug) {
    await deletePost(slug, env);
    updated.slug = body.slug;
  }

  await savePost(updated, env);
  return json({ post: updated });
}

async function handleDeletePost(
  slug: string,
  env: Env
): Promise<Response> {
  const existing = await getPost(slug, env);
  if (!existing) {
    return json({ error: "Post not found", slug }, 404);
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
    title: env.BLOG_TITLE || "MD3 Blog",
    description:
      env.BLOG_DESCRIPTION ||
      "Material Design 3 Blog on Cloudflare Workers + R2",
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

  // CORS preflight
  if (method === "OPTIONS") {
    return handleOptions();
  }

  // GET /info - blog info
  if (path === "/info" && method === "GET") {
    return handleBlogInfo(env);
  }

  // GET /tags
  if (path === "/tags" && method === "GET") {
    return handleListTags(env);
  }

  // GET /categories
  if (path === "/categories" && method === "GET") {
    return handleListCategories(env);
  }

  // /posts
  if (path === "/posts") {
    if (method === "GET") return handleListPosts(env);
    if (method === "POST") return handleCreatePost(request, env);
  }

  // /posts/:slug
  const slugMatch = path.match(/^\/posts\/([^/]+)$/);
  if (slugMatch) {
    const slug = decodeURIComponent(slugMatch[1]);
    if (method === "GET") return handleGetPost(slug, env);
    if (method === "PUT") return handleUpdatePost(slug, request, env);
    if (method === "DELETE") return handleDeletePost(slug, env);
  }

  return json({ error: "Endpoint not found", path, method }, 404);
}

// ===== Worker Entry =====

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API routes
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

    // Static assets
    return env.ASSETS.fetch(request);
  },
};
