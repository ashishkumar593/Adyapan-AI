"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Heart, MessageCircle, Eye, Clock, Tag, Send, ArrowLeft, Search, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getDiceBearUrl } from "@/lib/avatar";
import { useTheme } from "@/hooks/useTheme";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { AnimatedSkeleton, EmptyState } from "@/components/ui/PremiumComponents";

const CARD = (isDark: boolean) => ({
  background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.85)",
  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
  backdropFilter: "blur(20px)" as const,
});

const BLOG_CATEGORIES = ["All", "General", "Technology", "Career", "Study Tips", "Project", "Opinion", "Tutorial", "Experience"];

export function BlogView() {
  const theme = useTheme();
  const isDark = theme === "dark";
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<"list" | "create" | "read">("list");
  const [activeBlog, setActiveBlog] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [myBlogs, setMyBlogs] = useState<any[]>([]);
  const [showMyBlogs, setShowMyBlogs] = useState(false);

  const fetchBlogs = useCallback(async (p = 1, cat = "All", q = "") => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: "12" });
      if (cat !== "All") params.set("category", cat);
      if (q) params.set("q", q);
      const res = await api.get(`/blog?${params}`);
      if (res.data.success) { setBlogs(res.data.blogs); setTotalPages(res.data.pages); }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBlogs(page, category, search); }, [page, category, search, fetchBlogs]);

  const fetchMyBlogs = async () => {
    try {
      const res = await api.get("/blog/my/blogs");
      if (res.data.success) setMyBlogs(res.data.blogs);
    } catch { /* */ }
  };

  const openBlog = async (id: string) => {
    try {
      const [blogRes, commentsRes] = await Promise.all([
        api.get(`/blog/${id}`),
        api.get(`/blog/${id}/comments`),
      ]);
      if (blogRes.data.success) { setActiveBlog(blogRes.data.blog); setView("read"); }
      if (commentsRes.data.success) setComments(commentsRes.data.comments);
    } catch { toast.error("Failed to load blog"); }
  };

  const toggleLike = async (id: string) => {
    try {
      const res = await api.post(`/blog/${id}/like`);
      if (res.data.success) {
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, likedByMe: res.data.liked, _count: { ...b._count, likes: b._count.likes + (res.data.liked ? 1 : -1) } } : b));
        if (activeBlog?.id === id) setActiveBlog((prev: any) => ({ ...prev, likedByMe: res.data.liked, _count: { ...prev._count, likes: prev._count.likes + (res.data.liked ? 1 : -1) } }));
      }
    } catch { toast.error("Failed"); }
  };

  const addComment = async () => {
    if (!commentInput.trim() || !activeBlog) return;
    try {
      const res = await api.post(`/blog/${activeBlog.id}/comments`, { content: commentInput.trim() });
      if (res.data.success) { setComments(prev => [res.data.comment, ...prev]); setCommentInput(""); toast.success("Comment added!"); }
    } catch { toast.error("Failed to add comment"); }
  };

  const pc = CARD(isDark);
  const txt = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  // Blog detail view
  if (view === "read" && activeBlog) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-3xl mx-auto min-h-screen">
        <button onClick={() => { setView("list"); setActiveBlog(null); }}
          className="flex items-center gap-2 text-xs font-bold" style={{ color: "#f59e0b" }}>
          <ArrowLeft size={14} /> Back to Blogs
        </button>

        <div className="rounded-2xl overflow-hidden" style={pc}>
          {activeBlog.coverImage && <img src={activeBlog.coverImage} alt="" className="w-full h-48 object-cover" />}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{activeBlog.category}</span>
              {activeBlog.tags?.map((t: string) => <span key={t} className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: muted }}>{t}</span>)}
            </div>
            <h1 className={`text-xl font-extrabold mb-3 ${txt}`}>{activeBlog.title}</h1>
            <div className="flex items-center gap-4 text-[10px]" style={{ color: muted }}>
              <span className="flex items-center gap-1"><Clock size={10} />{new Date(activeBlog.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Eye size={10} />{activeBlog.views} views</span>
              <button onClick={() => toggleLike(activeBlog.id)} className="flex items-center gap-1 transition-colors" style={{ color: activeBlog.likedByMe ? "#ef4444" : undefined }}>
                <Heart size={10} fill={activeBlog.likedByMe ? "#ef4444" : "none"} />{activeBlog._count?.likes || 0}
              </button>
              <span className="flex items-center gap-1"><MessageCircle size={10} />{comments.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={pc}>
          <div className="prose prose-sm max-w-none text-xs leading-relaxed whitespace-pre-wrap" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "#334155" }}>
            {activeBlog.content}
          </div>
        </div>

        {/* Comments */}
        <div className="rounded-2xl p-5" style={pc}>
          <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2" style={{ color: "#f59e0b" }}><MessageCircle size={14} /> Comments ({comments.length})</h3>
          <div className="flex gap-2 mb-4">
            <input value={commentInput} onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addComment(); }}
              placeholder="Add a comment..." className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold outline-none"
              style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, color: isDark ? "#fff" : "#0f172a" }} />
            <button onClick={addComment} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)" }}>
              <Send size={13} className="text-white" />
            </button>
          </div>
          <div className="space-y-3">
            {comments.map((c: any) => (
              <div key={c.id} className="p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${border}` }}>
                <p className="text-[10px] font-bold" style={{ color: muted }}>{c.userId.slice(0, 8)}... · {new Date(c.createdAt).toLocaleDateString()}</p>
                <p className="text-[11px] mt-1" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}>{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Create blog view
  if (view === "create") {
    return <CreateBlogView onBack={() => setView("list")} onCreated={() => { setView("list"); fetchBlogs(); }} />;
  }

  // Blog list
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-extrabold ${txt}`}>Community Blog</h1>
          <p className="text-xs mt-0.5" style={{ color: muted }}>Share your knowledge and experiences</p>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => { await fetchMyBlogs(); setShowMyBlogs(!showMyBlogs); }}
            className="px-3 py-2 rounded-xl text-[10px] font-bold" style={{ ...pc, color: muted }}>
            My Blogs
          </button>
          <button onClick={() => setView("create")} className="px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#000" }}>
            <Plus size={12} /> Write Blog
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: muted }} />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search blogs..." className="w-full pl-9 pr-4 py-3 rounded-xl text-xs font-bold outline-none"
          style={{ ...pc, color: isDark ? "#fff" : "#0f172a" }} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {BLOG_CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all"
            style={{
              background: category === c ? "rgba(245,158,11,0.15)" : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"),
              color: category === c ? "#f59e0b" : muted,
              border: `1px solid ${category === c ? "rgba(245,158,11,0.3)" : border}`,
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* My Blogs dropdown */}
      <AnimatePresence>
        {showMyBlogs && myBlogs.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="rounded-2xl p-4" style={pc}>
              <h3 className="text-xs font-extrabold mb-3" style={{ color: "#f59e0b" }}>My Blogs</h3>
              <div className="space-y-2">
                {myBlogs.map(b => (
                  <button key={b.id} onClick={() => openBlog(b.id)}
                    className="flex items-center justify-between w-full p-2.5 rounded-lg text-left" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                    <span className={`text-[11px] font-bold ${txt}`}>{b.title}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: b.published ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: b.published ? "#10b981" : "#f59e0b" }}>
                      {b.published ? "Published" : "Draft"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <AnimatedSkeleton key={i} type="card" className="h-52 rounded-2xl" />)}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState title="No blogs found" description="Be the first to share your knowledge!" illustration={<BookOpen className="w-8 h-8" />} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog: any, i: number) => (
            <motion.div key={blog.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl overflow-hidden cursor-pointer" style={pc}
              onClick={() => openBlog(blog.id)}>
              {blog.coverImage && <img src={blog.coverImage} alt="" className="w-full h-32 object-cover" />}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{blog.category}</span>
                </div>
                <h3 className={`text-sm font-extrabold line-clamp-2 mb-2 ${txt}`}>{blog.title}</h3>
                <p className="text-[10px] leading-relaxed line-clamp-2 mb-3" style={{ color: muted }}>{stripMarkdown(blog.summary || blog.content.slice(0, 150))}</p>
                <div className="flex items-center gap-3 text-[9px]" style={{ color: muted }}>
                  <span className="flex items-center gap-1"><Clock size={9} />{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye size={9} />{blog.views}</span>
                  <span className="flex items-center gap-1"><Heart size={9} />{blog._count?.likes || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={9} />{blog._count?.comments || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="w-8 h-8 rounded-lg text-[10px] font-bold"
              style={{ background: page === i + 1 ? "rgba(245,158,11,0.15)" : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"), color: page === i + 1 ? "#f59e0b" : muted }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CreateBlogView({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const pc = CARD(isDark);
  const txt = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  const inputStyle = { background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, color: isDark ? "#fff" : "#0f172a" };

  const publish = async (published: boolean) => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content required"); return; }
    published ? setPublishing(true) : setSavingDraft(true);
    try {
      const res = await api.post("/blog", {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim() || content.slice(0, 200).trim(),
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        published,
      });
      if (res.data.success) { toast.success(published ? "Blog published!" : "Draft saved!"); onCreated(); }
    } catch { toast.error("Failed to save"); }
    finally { setPublishing(false); setSavingDraft(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-3xl mx-auto min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold" style={{ color: "#f59e0b" }}>
        <ArrowLeft size={14} /> Back
      </button>

      <h1 className={`text-xl font-extrabold ${txt}`}>Write a Blog Post</h1>

      <div className="rounded-2xl p-5 space-y-4" style={pc}>
        <div>
          <label className="text-[10px] font-bold block mb-1.5" style={{ color: muted }}>Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Your blog title..."
            className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none" style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold block mb-1.5" style={{ color: muted }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none appearance-none"
              style={{ ...inputStyle, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.5)"}' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
              {BLOG_CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold block mb-1.5" style={{ color: muted }}>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="react, javascript, tips"
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none" style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold block mb-1.5" style={{ color: muted }}>Summary</label>
          <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief summary (optional, auto-generated if empty)"
            className="w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none" style={inputStyle} />
        </div>

        <div>
          <label className="text-[10px] font-bold block mb-1.5" style={{ color: muted }}>Content *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your blog content here... Markdown is supported."
            rows={12} className="w-full px-4 py-3 rounded-xl text-xs font-mono leading-relaxed outline-none resize-none"
            style={{ ...inputStyle, minHeight: 250 }} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => publish(false)} disabled={savingDraft}
            className="px-5 py-2.5 rounded-xl text-[11px] font-bold disabled:opacity-40"
            style={{ ...pc, color: muted }}>
            {savingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => publish(true)} disabled={publishing}
            className="px-5 py-2.5 rounded-xl text-[11px] font-bold disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#000" }}>
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
