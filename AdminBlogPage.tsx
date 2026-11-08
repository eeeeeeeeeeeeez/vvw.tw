import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  AdminPost,
  ApiError,
  PostInput,
  adminApi,
  invalidateBlogCache,
  tokenStore,
} from "./blogApi";
import BlogMarkdown from "./BlogMarkdown";
import { formatBlogDate } from "../data/blogPosts";

const inputCls =
  "w-full bg-surface-low rounded-2xl py-3 px-5 font-medium text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30";
const labelCls = "block text-xs font-semibold tracking-wide text-secondary mb-2";
const primaryBtn =
  "bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-secondary snap-transition press-feedback disabled:opacity-50";
const ghostBtn =
  "bg-surface-low text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-white snap-transition press-feedback disabled:opacity-50";

const todayTaipei = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date()
  );

const newSlug = () => `post-${todayTaipei().replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6)}`;

const emptyForm = (): PostInput => ({
  slug: newSlug(),
  title: "",
  category: "廣告投放",
  excerpt: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  content: "",
  status: "draft",
  publishDate: "",
});

const toForm = (p: AdminPost): PostInput => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt,
  metaTitle: p.metaTitle,
  metaDescription: p.metaDescription,
  keywords: p.keywords.join("、"),
  content: p.content,
  status: p.status,
  publishDate: p.publishDate,
});

const CONTENT_PLACEHOLDER = `## 小標題

這裡寫段落內容。**粗體**、[連結](https://example.com) 都可以使用。

- 條列項目一
- 條列項目二

### 次標題

1. 步驟一
2. 步驟二

![圖片說明](https://圖片網址)`;

const AdminBlogPage: React.FC = () => {
  const [token, setToken] = useState(tokenStore.get());
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [listError, setListError] = useState("");
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<PostInput>(emptyForm());
  const [showPreview, setShowPreview] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken("");
    setPosts([]);
    setEditingId(null);
  }, []);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        setLoginError("登入已過期，請重新登入");
        return;
      }
      setNotice({ type: "error", text: err instanceof Error ? err.message : "發生未知錯誤" });
    },
    [logout]
  );

  const loadList = useCallback(async () => {
    if (!token) return;
    try {
      setListError("");
      const r = await adminApi.list(token);
      setPosts(r.posts);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return handleError(err);
      setListError(err instanceof Error ? err.message : "讀取失敗");
    }
  }, [token, handleError]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const r = await adminApi.login(password);
      tokenStore.set(r.token);
      setToken(r.token);
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "登入失敗");
    } finally {
      setBusy(false);
    }
  };

  const startNew = () => {
    setForm(emptyForm());
    setEditingId("new");
    setShowPreview(false);
    setNotice(null);
  };

  const startEdit = async (id: string) => {
    setBusy(true);
    setNotice(null);
    try {
      const r = await adminApi.get(token, id);
      setForm(toForm(r.post));
      setEditingId(id);
      setShowPreview(false);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const save = async (status: "draft" | "published") => {
    setBusy(true);
    setNotice(null);
    const payload: PostInput = {
      ...form,
      status,
      metaTitle: form.metaTitle.trim() || (form.title.trim() ? `${form.title.trim()}｜亨波趨勢` : ""),
      metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
    };
    try {
      const r = editingId === "new" ? await adminApi.create(token, payload) : await adminApi.update(token, editingId!, payload);
      invalidateBlogCache();
      setForm(toForm(r.post));
      setEditingId(r.post.id);
      setNotice({ type: "ok", text: status === "published" ? "已發布！文章已經出現在知識庫。" : "草稿已儲存。" });
      loadList();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!editingId || editingId === "new") return;
    if (!window.confirm(`確定要刪除「${form.title || "這篇文章"}」嗎？刪除後無法復原。`)) return;
    setBusy(true);
    try {
      await adminApi.remove(token, editingId);
      invalidateBlogCache();
      setEditingId(null);
      setNotice({ type: "ok", text: "文章已刪除。" });
      loadList();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof PostInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const wrap = (children: React.ReactNode) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 soft-dot-grid min-h-screen">
      <section className="px-6 md:px-8 py-16">
        <div className="max-w-5xl mx-auto">{children}</div>
      </section>
    </motion.div>
  );

  // ---------------- 登入 ----------------
  if (!token) {
    return wrap(
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-md p-10">
        <span className="font-semibold tracking-wide text-secondary mb-3 block">文章管理後台</span>
        <h1 className="text-3xl font-semibold text-primary mb-8">管理員登入</h1>
        <form onSubmit={login} className="space-y-5">
          <div>
            <label className={labelCls} htmlFor="admin-pw">密碼</label>
            <input
              id="admin-pw"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          {loginError && <p className="text-sm font-semibold text-red-600" role="alert">{loginError}</p>}
          <button type="submit" disabled={busy || !password} className={`${primaryBtn} w-full`}>
            {busy ? "登入中…" : "登入"}
          </button>
        </form>
      </div>
    );
  }

  // ---------------- 編輯器 ----------------
  if (editingId) {
    const isNew = editingId === "new";
    return wrap(
      <div className="bg-white rounded-3xl shadow-md p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-semibold tracking-wide text-secondary block mb-1">{isNew ? "新增文章" : "編輯文章"}</span>
            <h1 className="text-2xl md:text-3xl font-semibold text-primary">{form.title || "（尚未輸入標題）"}</h1>
          </div>
          <button onClick={() => { setEditingId(null); setNotice(null); }} className={ghostBtn}>← 返回列表</button>
        </div>

        {notice && (
          <p
            role="status"
            className={`mb-6 rounded-2xl px-5 py-3 text-sm font-semibold ${notice.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {notice.text}
          </p>
        )}

        <div className="space-y-6">
          <div>
            <label className={labelCls} htmlFor="f-title">標題</label>
            <input id="f-title" value={form.title} onChange={set("title")} className={inputCls} placeholder="例如：Meta 廣告投放預算怎麼分配？" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls} htmlFor="f-slug">網址代稱（/blog/…）</label>
              <input id="f-slug" value={form.slug} onChange={set("slug")} className={inputCls} placeholder="meta-ads-budget" />
              <p className="text-xs text-muted font-medium mt-2">僅限小寫英文、數字與連字號，建議用英文關鍵字，已發布後不要再改。</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="f-cat">分類</label>
              <input id="f-cat" value={form.category} onChange={set("category")} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="f-excerpt">摘要（顯示在知識庫卡片，{form.excerpt.length}/300）</label>
            <textarea id="f-excerpt" rows={3} maxLength={300} value={form.excerpt} onChange={set("excerpt")} className={inputCls} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`${labelCls} mb-0`} htmlFor="f-content">內文（支援 Markdown）</label>
              <button type="button" onClick={() => setShowPreview((v) => !v)} className="text-xs font-semibold text-secondary hover:opacity-70">
                {showPreview ? "回到編輯" : "預覽排版"}
              </button>
            </div>
            {showPreview ? (
              <div className="bg-surface-low rounded-2xl p-6 md:p-8 min-h-[24rem]">
                {form.content.trim() ? <BlogMarkdown content={form.content} /> : <p className="text-muted font-medium">還沒有內容。</p>}
              </div>
            ) : (
              <textarea
                id="f-content"
                rows={20}
                value={form.content}
                onChange={set("content")}
                className={`${inputCls} font-mono text-sm leading-relaxed`}
                placeholder={CONTENT_PLACEHOLDER}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls} htmlFor="f-mt">SEO 標題（留空會自動使用「標題｜亨波趨勢」）</label>
              <input id="f-mt" value={form.metaTitle} onChange={set("metaTitle")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="f-date">發布日期（留空會在發布時使用今天）</label>
              <input id="f-date" type="date" value={form.publishDate} onChange={set("publishDate")} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="f-md">SEO 描述（留空會自動使用摘要）</label>
            <textarea id="f-md" rows={2} maxLength={300} value={form.metaDescription} onChange={set("metaDescription")} className={inputCls} />
          </div>

          <div>
            <label className={labelCls} htmlFor="f-kw">關鍵字（用頓號或逗號分隔）</label>
            <input id="f-kw" value={form.keywords} onChange={set("keywords")} className={inputCls} placeholder="廣告投放、Meta 廣告、預算規劃" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-10 pt-8 border-t border-primary/10">
          <button onClick={() => save("published")} disabled={busy} className={primaryBtn}>
            {busy ? "處理中…" : form.status === "published" ? "更新並發布" : "發布"}
          </button>
          <button onClick={() => save("draft")} disabled={busy} className={ghostBtn}>
            {form.status === "published" ? "改為草稿（下架）" : "儲存草稿"}
          </button>
          {!isNew && form.status === "published" && (
            <Link to={`/blog/${form.slug}`} className="text-sm font-semibold text-secondary hover:opacity-70 px-2">查看文章 →</Link>
          )}
          {!isNew && (
            <button onClick={remove} disabled={busy} className="ml-auto text-sm font-semibold text-red-600 hover:opacity-70 px-2 disabled:opacity-50">
              刪除文章
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------------- 文章列表 ----------------
  return wrap(
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <span className="font-semibold tracking-wide text-secondary block mb-1">文章管理後台</span>
          <h1 className="text-3xl md:text-4xl font-semibold text-primary">知識庫文章</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={startNew} className={primaryBtn}>＋ 新增文章</button>
          <button onClick={logout} className={ghostBtn}>登出</button>
        </div>
      </div>

      {notice && (
        <p role="status" className={`mb-6 rounded-2xl px-5 py-3 text-sm font-semibold ${notice.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {notice.text}
        </p>
      )}
      {listError && <p className="mb-6 rounded-2xl px-5 py-3 text-sm font-semibold bg-red-50 text-red-700" role="alert">{listError}</p>}

      <div className="bg-white rounded-3xl shadow-md divide-y divide-primary/10">
        {posts.length === 0 && !listError && (
          <p className="p-10 text-muted font-medium">還沒有用後台發布的文章，點右上角「新增文章」開始。（內建的 5 篇文章不會出現在這裡。）</p>
        )}
        {posts.map((p) => (
          <button
            key={p.id}
            onClick={() => startEdit(p.id)}
            disabled={busy}
            className="w-full text-left p-6 md:p-8 flex flex-wrap items-center gap-4 hover:bg-surface-low snap-transition first:rounded-t-3xl last:rounded-b-3xl"
          >
            <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${p.status === "published" ? "bg-green-50 text-green-700" : "bg-surface-low text-muted"}`}>
              {p.status === "published" ? "已發布" : "草稿"}
            </span>
            <span className="flex-grow font-semibold text-primary text-lg">{p.title}</span>
            <span className="text-xs font-semibold text-muted">
              {p.publishDate ? formatBlogDate(p.updatedDate || p.publishDate) : "未設定日期"}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

export default AdminBlogPage;
