import { useEffect, useState } from "react";
import { BLOG_POSTS, BlogSection } from "../data/blogPosts";

// 前台顯示用的文章資料：內建文章使用 sections，後台發布的文章使用 Markdown content
export interface PublicPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  keywords: string[];
  excerpt: string;
  publishDate: string;
  updatedDate?: string;
  sections?: BlogSection[];
  content?: string;
}

export interface AdminPost extends PublicPost {
  id: string;
  status: "draft" | "published";
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostInput {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  content: string;
  status: "draft" | "published";
  publishDate: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (init.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    throw new ApiError("無法連線到伺服器", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new ApiError(data.error || `請求失敗（${res.status}）`, res.status);
  }
  return data as T;
}

// ------------------------------------------------------------------
// 公開：前台讀取
// ------------------------------------------------------------------
let remoteList: PublicPost[] | null = null;
let remoteInflight: Promise<PublicPost[]> | null = null;

function loadRemoteList(): Promise<PublicPost[]> {
  if (remoteList) return Promise.resolve(remoteList);
  if (!remoteInflight) {
    remoteInflight = request<{ posts: PublicPost[] }>("/api/blog")
      .then((r) => (remoteList = r.posts))
      .catch(() => (remoteList = []))
      .finally(() => (remoteInflight = null));
  }
  return remoteInflight;
}

/** 讓後台儲存後，前台下次進入知識庫時重新抓最新清單 */
export const invalidateBlogCache = () => {
  remoteList = null;
};

const mergePosts = (remote: PublicPost[]): PublicPost[] => {
  const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
  const all: PublicPost[] = [...remote.filter((p) => !staticSlugs.has(p.slug)), ...BLOG_POSTS];
  // 日期新的在前；同一天時後台文章排在內建文章前面（sort 為穩定排序）
  return all.sort((a, b) => (a.publishDate < b.publishDate ? 1 : a.publishDate > b.publishDate ? -1 : 0));
};

/** 內建文章 + 後台發布的文章（內建文章立即顯示，後台文章載入後補上） */
export function useBlogList() {
  const [posts, setPosts] = useState<PublicPost[]>(() => mergePosts(remoteList || []));
  const [loading, setLoading] = useState(remoteList === null);

  useEffect(() => {
    let alive = true;
    loadRemoteList().then((remote) => {
      if (!alive) return;
      setPosts(mergePosts(remote));
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { posts, loading };
}

/** 單篇文章：先找內建文章，找不到再向後端要 */
export function useBlogPost(slug?: string) {
  const staticPost = slug ? BLOG_POSTS.find((p) => p.slug === slug) : undefined;
  const [remote, setRemote] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(!staticPost && !!slug);

  useEffect(() => {
    if (staticPost || !slug) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    request<{ post: PublicPost }>(`/api/blog/post/${encodeURIComponent(slug)}`)
      .then((r) => alive && setRemote(r.post))
      .catch(() => alive && setRemote(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, staticPost]);

  return { post: (staticPost as PublicPost | undefined) || remote || undefined, loading };
}

// ------------------------------------------------------------------
// 後台
// ------------------------------------------------------------------
const TOKEN_KEY = "hengbo_admin_token";
export const tokenStore = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  },
  set: (t: string) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export const adminApi = {
  login: (password: string) =>
    request<{ token: string }>("/api/blog/login", { method: "POST", body: JSON.stringify({ password }) }),
  list: (token: string) => request<{ posts: AdminPost[] }>("/api/blog/admin/posts", {}, token),
  get: (token: string, id: string) => request<{ post: AdminPost }>(`/api/blog/admin/posts/${id}`, {}, token),
  create: (token: string, input: PostInput) =>
    request<{ post: AdminPost }>("/api/blog/admin/posts", { method: "POST", body: JSON.stringify(input) }, token),
  update: (token: string, id: string, input: PostInput) =>
    request<{ post: AdminPost }>(`/api/blog/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }, token),
  remove: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/blog/admin/posts/${id}`, { method: "DELETE" }, token),
};
