import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, X, ArrowRight, Building2, Target, Zap, ShieldCheck, 
  FileText, Rocket, Palette, TrendingUp, Network, BadgeCheck, 
  Check, Mail, Phone, MapPin, ChevronDown, Send, User, Bot,
  Search, Plus, Trash2, Layout, Image as ImageIcon, FileCode,
  MessageSquare, LogIn, Eye, EyeOff, Paperclip, Loader2
} from "lucide-react";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- Constants ---
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
const genAI = new GoogleGenAI(GEMINI_API_KEY);
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "hengbo2026";

// --- Types ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  file?: {
    name: string;
    type: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

// --- Components ---

const Logo = ({ className = "w-8 h-8", variant = "default" }: { className?: string, variant?: "default" | "white" }) => (
  <img 
    src="/logo.png" 
    alt="HENGBO TREND Logo"
    className={`inline-block object-contain ${variant === "white" ? "brightness-0 invert" : ""} ${className}`}
    referrerPolicy="no-referrer"
  />
);

const LoadingScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center"
  >
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0]
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="mb-8"
    >
      <Logo className="w-32 h-32" variant="white" />
    </motion.div>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: "200px" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="h-1 bg-secondary"
    />
    <span className="text-white font-black tracking-[0.5em] mt-4 uppercase text-xs">Hengbo Trend</span>
  </motion.div>
);

// --- Animation Components ---

const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; direction?: "up" | "down" | "left" | "right" }> = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration: 0.8, delay, ease: [0.215, 0.61, 0.355, 1] }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

const Counter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({ value, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalFrames = duration * 60;
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentCount = Math.round(end * (1 - Math.pow(1 - progress, 3))); // Ease out cubic
        setCount(currentCount);

        if (frame === totalFrames) clearInterval(timer);
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Navbar: React.FC<{ activeTab: string; setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const tabs = [
    { id: "home", label: "首頁" },
    { id: "services", label: "專業服務" },
    { id: "cases", label: "精選案例" },
    { id: "about", label: "關於我們" },
    { id: "ai", label: "亨波 AI" },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-primary flex justify-between items-center px-6 md:px-8 py-4 max-w-[1920px] mx-auto">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => handleTabClick("home")}
      >
        <Logo className="w-8 h-8 md:w-10 md:h-10" />
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-primary uppercase">亨波趨勢</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Hengbo Trend</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative font-black uppercase tracking-widest text-sm snap-transition hover:text-secondary ${
              activeTab === tab.id ? "text-secondary" : "text-primary"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-underline"
                className="absolute -bottom-1 left-0 right-0 h-1 bg-secondary" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTabClick("contact")}
          className="hidden sm:block bg-primary text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-secondary snap-transition text-sm"
        >
          立即諮詢
        </motion.button>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-primary hover:bg-surface-low rounded-lg transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b-4 border-primary shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ x: 10 }}
                  onClick={() => handleTabClick(tab.id)}
                  className={`text-left py-4 px-6 font-black uppercase tracking-widest text-lg border-2 ${
                    activeTab === tab.id 
                      ? "bg-primary text-white border-primary" 
                      : "text-primary border-transparent hover:border-primary/10"
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <footer className="bg-primary border-t-4 border-secondary w-full px-8 py-24 mt-24">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-4 mb-8">
          <Logo className="w-12 h-12" variant="white" />
          <span className="text-4xl font-black block">亨波趨勢</span>
        </div>
        <div className="font-bold text-sm tracking-widest uppercase opacity-70 max-w-lg leading-relaxed">
          <p className="mb-4">© 2026 <Logo className="w-4 h-4 mx-1" variant="white" /> HENGBO TREND. MASTERING TRENDS, MAXIMIZING IMPACT.</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-secondary" />
              <span>tvivl.tw@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-secondary" />
              <span>+886-0966-748-817</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">導覽導航</span>
          <button onClick={() => { setActiveTab("services"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">專業服務</button>
          <button onClick={() => { setActiveTab("cases"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">精選案例</button>
          <button onClick={() => { setActiveTab("about"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">關於我們</button>
          <button onClick={() => { setActiveTab("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">聯繫我們</button>
          <button onClick={() => { setActiveTab("ai"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">亨波 AI</button>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">社群連結</span>
          <a href="https://www.facebook.com/share/1H7nCUSiie/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">Facebook</a>
          <a href="https://lin.ee/XrjcRfb" target="_blank" rel="noopener noreferrer" className="text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">LINE</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const HomeView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => {
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaMsg, setCtaMsg] = useState("");
  const [ctaLoading, setCtaLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!ctaEmail) return;
    setCtaLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ctaEmail }),
      });
      const json = await res.json();
      setCtaMsg(json.message || (json.success ? "訂閱成功！" : json.error));
      if (json.success) setCtaEmail("");
    } catch { setCtaMsg("訂閱失敗，請稍後再試"); }
    setCtaLoading(false);
    setTimeout(() => setCtaMsg(""), 4000);
  };

  return (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="brutalist-grid min-h-screen"
  >
    {/* Hero */}
    <section className="relative px-8 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-0 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute -right-20 top-0 pointer-events-none select-none"
        >
          <Building2 size={600} className="text-primary" />
        </motion.div>
        <div className="col-span-12 lg:col-span-10 z-10">
          <motion.h1 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-[clamp(3rem,12vw,8rem)] leading-[0.85] font-black text-primary uppercase tracking-tighter mb-12"
          >
            賦能企業<br/>
            <span className="text-secondary">築造未來</span>
          </motion.h1>
        </div>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="col-span-12 lg:col-span-6 lg:ml-[16.6%] bg-primary p-12 relative z-20 border-r-8 border-secondary"
        >
          <p className="text-white text-[clamp(1.5rem,5vw,2.25rem)] font-bold tracking-[0.2em] mb-8">助力企業，引領趨勢</p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-1 bg-secondary mb-8" 
          />
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-white flex items-center justify-center brutalist-border">
              <Logo className="w-16 h-16" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-white font-black text-xl tracking-widest">HENGBO TREND</span>
              <span className="text-white/60 font-bold text-xs uppercase tracking-[0.3em]">Strategic Consulting</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Why Choose Us */}
    <section className="px-8 py-32 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <Target className="text-secondary" size={48} />, title: "精準策略", desc: "基於深度市場洞察與數據分析，為您的企業量身打造具備高度執行力的成長藍圖。" },
            { icon: <Zap className="text-secondary" size={48} />, title: "高效執行", desc: "從企劃撰寫到資源對接，我們強調速度與品質的平衡，確保每一個專案都能如期達成目標。" },
            { icon: <ShieldCheck className="text-secondary" size={48} />, title: "專業保障", desc: "擁有豐富的政府補助申請經驗與品牌行銷實績，是您在商場競爭中最堅實的後盾。" }
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.2}>
              <motion.div 
                whileHover={{ y: -10, borderColor: "#ff3e00" }}
                className="p-8 border-4 border-primary hover:bg-surface-low transition-all duration-300 h-full"
              >
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="font-bold text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Bento Grid */}
    <section className="px-8 py-32 bg-surface-low border-t-2 border-primary">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <h2 className="text-[clamp(3rem,10vw,4.5rem)] font-black uppercase tracking-tighter text-primary">策略<br/>精準度</h2>
            <div className="max-w-md text-right">
              <span className="font-black uppercase tracking-[0.3em] text-secondary block mb-4">核心服務能力</span>
              <p className="font-bold text-muted">我們不只提供服務；我們透過數據驅動的精準規劃，協助您在市場競爭中取得絕對優勢。</p>
            </div>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-8">
            <ScrollReveal direction="right">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="group bg-white brutalist-border p-12 hover:bg-primary hover:text-white snap-transition relative overflow-hidden h-full"
              >
                <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-20 snap-transition">
                  <FileText size={240} />
                </div>
                <span className="text-secondary font-black text-2xl mb-8 block">01</span>
                <h3 className="text-[clamp(2rem,6vw,3rem)] font-black mb-6 uppercase">企劃撰寫</h3>
                <p className="text-xl max-w-xl font-medium mb-8 leading-relaxed">從市場洞察到可執行藍圖，一份讓投資人與團隊都買單的企劃。我們專注於邏輯架構與商業價值的深度挖掘。</p>
                <div className="w-16 h-2 bg-secondary"></div>
              </motion.div>
            </ScrollReveal>
          </div>
          <div className="col-span-12 md:col-span-4">
            <ScrollReveal direction="left">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-secondary p-12 text-white brutalist-border border-secondary relative h-full"
              >
                <span className="text-white/50 font-black text-2xl mb-8 block">02</span>
                <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-black mb-6 uppercase">補助申請</h3>
                <Rocket size={80} className="mb-8" />
                <p className="font-bold mb-8 leading-relaxed">對接政府資源，極大化研發與轉型動能。我們提供從資格評估到結案報告的全程專業輔導。</p>
                <button onClick={() => setActiveTab("services")} className="bg-white text-primary px-6 py-3 font-black uppercase tracking-widest hover:bg-primary hover:text-white snap-transition">了解更多</button>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="px-8 py-40 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-primary uppercase tracking-tighter mb-12">
            準備好<br/>
            <span className="text-secondary">引領趨勢</span>了嗎？
          </h2>
          <p className="text-xl font-bold text-muted mb-12 uppercase tracking-widest">訂閱我們的趨勢週報，獲取最新的市場洞察與補助資訊。</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" 
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              placeholder="您的電子郵件" 
              className="flex-grow bg-surface-low border-4 border-primary p-6 font-black text-xl focus:outline-none focus:bg-white snap-transition"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubscribe}
              disabled={ctaLoading}
              className="bg-primary text-white px-12 py-6 font-black text-xl uppercase tracking-widest hover:bg-secondary snap-transition disabled:opacity-50"
            >
              {ctaLoading ? "處理中..." : "立即訂閱"}
            </motion.button>
          </div>
          {ctaMsg && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 font-black text-secondary uppercase tracking-widest">{ctaMsg}</motion.p>}
        </ScrollReveal>
      </div>
    </section>
  </motion.div>
  );
};

const ServicesView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="px-8 py-32">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-32">
            <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block">專業服務範疇</span>
            <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black tracking-tighter leading-none text-primary uppercase">
              全方位<br/>
              <span className="text-stroke">顧問解決方案</span>
            </h1>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {[
            { 
              icon: <FileText size={64} />, 
              title: "企劃撰寫", 
              desc: "包含商業計畫書 (BP)、融資企劃、品牌策略規劃等，為您的願景建立堅實的執行框架。",
              features: ["市場深度調研", "財務預測模型", "競爭優勢分析"],
              process: ["需求訪談", "架構設計", "初稿撰寫", "優化調整", "最終交付"]
            },
            { 
              icon: <Rocket size={64} />, 
              title: "補助申請", 
              desc: "對接 SBIR、SIIR、CITD 等政府專案，從資格評估到結案報告，全程專業輔導。",
              features: ["專案適配評估", "計畫書優化撰寫", "審查簡報輔導"],
              process: ["資格審查", "計畫撰寫", "送件申請", "審查輔導", "結案報支"]
            },
            { 
              icon: <Palette size={64} />, 
              title: "品牌設計", 
              desc: "讓品牌不只被看到，更被記住與喜愛。將品牌靈魂轉化為視覺語彙，建立專業形象。",
              features: ["視覺識別 (CIS)", "應用系統設計", "品牌故事轉化"],
              process: ["品牌診斷", "視覺探索", "設計執行", "規範建立", "應用落地"]
            },
            { 
              icon: <TrendingUp size={64} />, 
              title: "廣告投放", 
              desc: "基於數據洞察的精準投放策略，極大化 Meta、Google、TikTok 等平台的轉型效益。",
              features: ["受眾精準定位", "素材創意優化", "轉化率追蹤分析"],
              process: ["目標設定", "受眾分析", "素材製作", "投放測試", "數據優化"]
            },
            { 
              icon: <Network size={64} />, 
              title: "資源對接", 
              desc: "協助企業對接創投、產業鏈上下游及政府資源，建立強大的成長生態系。",
              features: ["創投媒合引薦", "跨界合作規劃", "政策資源整合"],
              process: ["資源盤點", "需求對接", "媒合洽談", "合作落地", "持續追蹤"]
            }
          ].map((service, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.1}>
              <motion.div 
                whileHover={{ x: 10, borderColor: "#ff3e00" }}
                className="group bg-white brutalist-border p-12 hover:bg-primary hover:text-white snap-transition h-full"
              >
                <div className="text-secondary group-hover:text-white mb-8 snap-transition">{service.icon}</div>
                <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{service.title}</h3>
                <p className="text-xl font-bold mb-8 opacity-70 group-hover:opacity-100 leading-relaxed">{service.desc}</p>
                
                <div className="mb-8">
                  <span className="font-black text-xs uppercase tracking-widest text-secondary group-hover:text-white/60 mb-4 block">核心優勢</span>
                  <ul className="space-y-4">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 font-black text-sm uppercase tracking-widest">
                        <BadgeCheck size={20} className="text-secondary group-hover:text-white" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-black text-xs uppercase tracking-widest text-secondary group-hover:text-white/60 mb-4 block">服務流程</span>
                  <div className="flex flex-wrap gap-2">
                    {service.process.map((p, i) => (
                      <span key={i} className="px-3 py-1 border-2 border-primary/10 group-hover:border-white/20 text-[10px] font-black uppercase tracking-tighter">
                        {i + 1}. {p}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);

const CasesView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => {
  return (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="px-8 py-32">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto mb-24">
          <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block">實戰成果展示</span>
          <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black tracking-tighter leading-none text-primary uppercase">
            精選<br/>
            <span className="text-stroke">成功案例</span>
          </h1>
        </div>
      </ScrollReveal>

      <section className="px-4 md:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Case 1 */}
          <div className="col-span-12 md:col-span-7">
            <ScrollReveal direction="right">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="bg-surface-high brutalist-border group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[450px] h-full"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-black tracking-widest uppercase mb-4 text-secondary group-hover:text-white">企劃撰寫 / 補助申請</div>
                    <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter leading-none">智慧製造轉型計畫</h2>
                  </div>
                  <ArrowRight size={48} className="group-hover:translate-x-4 snap-transition" />
                </div>
                <div className="mt-12 space-y-6">
                  <p className="text-xl font-bold leading-relaxed opacity-70 group-hover:opacity-100">協助傳統製造業導入 AI 視覺檢測系統，並成功申請 SIIR 補助。</p>
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-4xl font-black text-secondary group-hover:text-white">300萬+</div>
                      <div className="font-bold uppercase tracking-widest text-xs">政府資助達成</div>
                    </div>
                    <div className="w-px h-12 bg-primary/10 group-hover:bg-white/20"></div>
                    <div>
                      <div className="text-4xl font-black text-secondary group-hover:text-white">40%</div>
                      <div className="font-bold uppercase tracking-widest text-xs">產能效率提升</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Case 2 */}
          <div className="col-span-12 md:col-span-5">
            <ScrollReveal direction="left">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="bg-white brutalist-border group cursor-pointer snap-transition hover:bg-secondary hover:text-white p-8 flex flex-col justify-between min-h-[450px] h-full"
              >
                <div className="flex justify-between items-start">
                  <Palette size={64} />
                  <div className="text-right">
                    <div className="font-black tracking-widest uppercase mb-2 text-primary group-hover:text-white">品牌設計 / 廣告投放</div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">DTC 品牌視覺重塑</h2>
                  </div>
                </div>
                <div className="mt-12 space-y-4">
                  <p className="font-bold text-sm leading-relaxed">方案：重新定義品牌視覺語言 (CIS)，並執行跨國精準廣告投放。</p>
                  <p className="font-black text-white group-hover:text-secondary text-lg">量化成果：廣告 ROI 提升至 4.8，品牌溢價提升 40%。</p>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Case 3 */}
          <div className="col-span-12 md:col-span-4">
            <ScrollReveal direction="right">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="bg-primary text-white brutalist-border group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px] h-full"
              >
                <div>
                  <Network size={80} className="mb-8" />
                  <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter leading-none">連鎖餐飲集團 ESG 規劃</h2>
                  <div className="mt-6 space-y-4 opacity-60 group-hover:opacity-100">
                    <p className="font-bold text-sm">協助企業對接淨零轉型政策，規劃減碳路徑並申請相關補助。</p>
                    <p className="font-black text-secondary text-xl">獲取 80 萬元資助</p>
                  </div>
                </div>
                <p className="font-bold uppercase tracking-widest text-xs opacity-60 group-hover:opacity-100 border-t border-white/20 pt-4">
                  「專業且精準，讓我們在轉型路上少走許多冤枉路。」
                </p>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Case 4 */}
          <div className="col-span-12 md:col-span-8">
            <ScrollReveal direction="left">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="bg-surface-low brutalist-border group cursor-pointer snap-transition hover:bg-secondary hover:text-white p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden h-full"
              >
                <div className="absolute right-[-10%] top-[-10%] w-[400px] h-[400px] bg-primary opacity-5 group-hover:opacity-20 rotate-45 pointer-events-none"></div>
                <div className="flex flex-col md:flex-row gap-8 z-10">
                  <Layout size={120} />
                  <div>
                    <div className="font-black tracking-widest uppercase mb-4 text-secondary group-hover:text-white">融資專案</div>
                    <h2 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black uppercase tracking-tighter leading-tight">AI 醫療新創融資計畫</h2>
                    <div className="mt-6 space-y-4">
                      <p className="font-bold text-lg leading-relaxed">協助撰寫具備高度說服力的融資企劃書，並進行路演輔導。</p>
                      <div className="flex items-center gap-4">
                        <div className="bg-primary text-white px-4 py-2 font-black text-2xl group-hover:bg-white group-hover:text-secondary">1,500 萬</div>
                        <span className="font-black uppercase tracking-widest text-sm">天使輪投資達成</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </section>

    <section className="bg-primary py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-[clamp(5rem,20vw,20rem)] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">SUCCESS</h2>
        <ScrollReveal>
          <h3 className="text-[clamp(3rem,12vw,6rem)] font-black text-white mb-12 tracking-tighter relative z-10 uppercase">想要了解更多？</h3>
          <div className="relative z-10">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("contact")}
              className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
            >
              與我們聯繫
              <ArrowRight size={32} />
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </motion.div>
  );
};

const AboutView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="relative px-8 py-32 overflow-hidden bg-surface-low border-b-4 border-primary">
      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal direction="right">
          <div className="font-black uppercase tracking-[0.4em] text-secondary mb-4">核心理念</div>
          <h1 className="text-[clamp(3rem,10vw,6rem)] font-black tracking-tighter leading-none text-primary uppercase relative">
            我們的使命<br/>
            <span className="text-stroke">與願景</span>
            <div className="absolute -top-12 -left-8 opacity-5 pointer-events-none select-none">
              <Logo className="w-[12rem] h-[12rem]" />
            </div>
          </h1>
          <div className="mt-12 max-w-2xl border-l-8 border-secondary pl-8">
            <p className="text-xl md:text-2xl font-bold text-ink leading-tight">
              透過精準的企劃力與資源整合，協助企業對接政府補助並極大化廣告效益，讓優質品牌在趨勢中穩健成長。
            </p>
          </div>
        </ScrollReveal>
      </div>
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-24" 
      />
    </section>

    <section className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-1/2 bg-primary p-12 md:p-24 flex flex-col justify-between">
        <ScrollReveal direction="right">
          <div>
            <h2 className="text-[clamp(4rem,12vw,8rem)] font-black text-white tracking-tighter leading-none mb-12">關於<br/>我們</h2>
            <div className="w-24 h-2 bg-secondary mb-8"></div>
            <p className="text-white/60 font-bold text-lg uppercase tracking-[0.2em]">HENGBO TREND CONSULTING</p>
          </div>
          <div className="text-white opacity-20 mt-12">
            <Building2 size={240} />
          </div>
        </ScrollReveal>
      </div>
      <div className="w-full md:w-1/2 bg-white p-12 md:p-24 border-b-4 md:border-b-0 md:border-l-4 border-primary">
        <div className="space-y-12">
          <ScrollReveal>
            <div>
              <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">亨波趨勢：細節的執行者</h3>
              <p className="text-lg leading-relaxed text-muted font-medium">
                我們創立於2022年，代表市場上的一股新銳力量。我們摒棄冗餘，回歸本質。讓每一個細節，都經過嚴密的計畫與審核。我們相信，卓越的策略來自於對細節的極致追求。
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div>
              <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">創新與卓越</h3>
              <p className="text-lg leading-relaxed text-muted font-medium">
                在快速變遷的環境中，我們專注提供高品質、高效能的解決方案，協助客戶精準撰寫企劃與計畫書，並順利申請各項政府與企業補助資源，同時透過專業的數位廣告投放與高品質品牌設計，幫助品牌有效曝光，提升市場競爭力。
              </p>
            </div>
          </ScrollReveal>
          
          {/* Core Values */}
          <ScrollReveal delay={0.4}>
            <div className="pt-8 border-t-2 border-primary/10">
              <h3 className="text-xl font-black text-secondary uppercase mb-6 tracking-widest">我們的承諾</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: "誠信透明", desc: "所有服務流程與收費標準公開透明，建立長期的信任夥伴關係。" },
                  { title: "持續創新", desc: "不斷優化顧問方法論，確保客戶始終站在市場趨勢的最前線。" }
                ].map((v, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-primary text-white p-1 rounded"><Check size={16} /></div>
                    <div>
                      <span className="font-black text-primary block text-sm uppercase">{v.title}</span>
                      <p className="text-xs text-muted font-bold">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 gap-8 pt-12">
            <div className="border-t-4 border-primary pt-4">
              <div className="text-4xl font-black text-secondary">
                <Counter value={100} suffix="+" />
              </div>
              <div className="font-bold uppercase tracking-widest text-xs mt-2">累計諮詢客戶</div>
            </div>
            <div className="border-t-4 border-primary pt-4">
              <div className="text-4xl font-black text-secondary">
                <Counter value={85} suffix="%" />
              </div>
              <div className="font-bold uppercase tracking-widest text-xs mt-2">補助申請過件率</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="px-8 py-32 bg-surface-high">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className="text-[clamp(2.5rem,8vw,3.75rem)] font-black text-primary uppercase mb-24 text-center tracking-tighter underline decoration-secondary decoration-8 underline-offset-8">成長策略</h2>
        </ScrollReveal>
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-primary hidden md:block"></div>
          
          {[
            { year: "2024", title: "從邏輯架構到品牌轉型", desc: "強調數據洞察與故事行銷的完美結合，為企業建立具市場競爭力的核心價值。", side: "left" },
            { year: "2025", title: "政策鏈結與資源整合開發", desc: "透過專業計畫書編製與專業諮詢，協助單位跨越財務門檻，實現公共服務與社會影響力。", side: "right" },
            { year: "2026", title: "數據驅動與精準觸及", desc: "整合多社群平台資源與動態優化技術，在碎片的數位環境中精準捕捉目標客群與商機。", side: "left" }
          ].map((item, idx) => (
            <ScrollReveal key={item.year} direction={item.side === "left" ? "right" : "left"} delay={idx * 0.2}>
              <div className="relative flex flex-col md:flex-row items-center mb-32 group">
                <div className={`w-full md:w-1/2 ${item.side === 'left' ? 'md:pr-16 text-right order-2 md:order-1' : 'order-2 md:order-1'}`}>
                  {item.side === 'left' && (
                    <motion.div 
                      whileHover={{ x: -10 }}
                      className="bg-primary text-white p-8 inline-block w-full text-left md:text-right border-b-8 border-secondary"
                    >
                      <h4 className="text-2xl font-black mb-2">{item.title}</h4>
                      <p className="opacity-80 font-bold text-sm">{item.desc}</p>
                    </motion.div>
                  )}
                </div>
                <motion.div 
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className={`z-10 bg-secondary text-white w-24 h-24 flex items-center justify-center font-black text-2xl order-1 md:order-2 mb-8 md:mb-0 ${item.side === 'right' ? 'bg-primary' : ''}`}
                >
                  {item.year}
                </motion.div>
                <div className={`w-full md:w-1/2 ${item.side === 'right' ? 'md:pl-16 order-3' : 'order-3'}`}>
                  {item.side === 'right' && (
                    <motion.div 
                      whileHover={{ x: 10 }}
                      className="bg-white brutalist-border-heavy p-8 inline-block w-full border-b-8 border-secondary"
                    >
                      <h4 className="text-2xl font-black text-primary mb-2">{item.title}</h4>
                      <p className="text-muted font-bold text-sm">{item.desc}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);

const ContactView: React.FC = () => {
  const [formState, setFormState] = useState({
    name: "",
    org: "",
    email: "",
    subject: "企劃撰寫諮詢",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const json = await res.json();
      if (json.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(json.error || "提交失敗，請稍後再試");
      }
    } catch {
      setSubmitError("網絡錯誤，請檢查您的連線");
    }
    setIsSubmitting(false);
  };

  const faqs = [
    { q: "諮詢服務如何收費？", a: "我們的初步諮詢是免費的。後續服務會根據專案規模、複雜度及所需資源進行報價，通常分為「專案制」或「顧問月費制」。" },
    { q: "政府補助申請的成功率高嗎？", a: "我們擁有超過 85% 的平均過件率。在正式簽約前，我們會進行嚴格的資格評估，若評估過件機率較低，我們會誠實告知並提供優化建議。" },
    { q: "一個企劃案通常需要多久時間？", a: "視複雜度而定，一般的商業企劃書約需 2-3 週；政府補助計畫書則建議在截止日前 4-6 週開始準備，以確保內容品質與完整性。" },
    { q: "你們提供哪些產業的顧問服務？", a: "我們服務的產業涵蓋智慧製造、餐飲連鎖、生技醫療、數位行銷及新創科技等。只要有成長需求與轉型願景，我們都能提供專業協助。" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-24 brutalist-grid"
    >
      <section className="px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <ScrollReveal direction="right">
              <div>
                <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block">聯繫我們</span>
                <h1 className="text-[clamp(3.5rem,10vw,6rem)] font-black tracking-tighter leading-none text-primary uppercase mb-12">
                  開啟您的<br/>
                  <span className="text-stroke">趨勢之旅</span>
                </h1>
                <div className="space-y-8 mb-12">
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-primary text-white flex items-center justify-center group-hover:bg-secondary snap-transition">
                      <Mail size={32} />
                    </div>
                    <div>
                      <span className="block font-black uppercase text-xs tracking-widest text-secondary">電子郵件</span>
                      <span className="text-xl font-bold">tvivl.tw@gmail.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-primary text-white flex items-center justify-center group-hover:bg-secondary snap-transition">
                      <Phone size={32} />
                    </div>
                    <div>
                      <span className="block font-black uppercase text-xs tracking-widest text-secondary">諮詢專線</span>
                      <span className="text-xl font-bold">+886-0966-748-817</span>
                    </div>
                  </div>
                </div>
                

              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="bg-white brutalist-border p-8 md:p-12">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="font-black uppercase tracking-widest text-xs text-secondary">您的姓名</label>
                        <input 
                          required
                          type="text" 
                          value={formState.name}
                          onChange={(e) => setFormState({...formState, name: e.target.value})}
                          className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition"
                          placeholder="王小明"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-black uppercase tracking-widest text-xs text-secondary">公司/組織</label>
                        <input 
                          type="text" 
                          value={formState.org}
                          onChange={(e) => setFormState({...formState, org: e.target.value})}
                          className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition"
                          placeholder="亨波趨勢有限公司"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-black uppercase tracking-widest text-xs text-secondary">電子郵件</label>
                      <input 
                        required
                        type="email" 
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition"
                        placeholder="ming@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-black uppercase tracking-widest text-xs text-secondary">諮詢主題</label>
                      <select 
                        value={formState.subject}
                        onChange={(e) => setFormState({...formState, subject: e.target.value})}
                        className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition appearance-none"
                      >
                        <option>企劃撰寫諮詢</option>
                        <option>政府補助申請</option>
                        <option>品牌設計諮詢</option>
                        <option>廣告投放策略</option>
                        <option>資源對接媒合</option>
                        <option>其他合作洽談</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-black uppercase tracking-widest text-xs text-secondary">訊息內容</label>
                      <textarea 
                        required
                        rows={6}
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition resize-none"
                        placeholder="請描述您的需求..."
                      ></textarea>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl hover:bg-secondary snap-transition flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isSubmitting ? "提交中..." : "發送諮詢請求"}
                      <ArrowRight size={24} />
                    </motion.button>
                    {submitError && <p className="text-red-600 font-bold text-center mt-4">{submitError}</p>}
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 bg-secondary text-white flex items-center justify-center mx-auto mb-8 rounded-full">
                      <BadgeCheck size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-primary uppercase mb-4">提交成功</h2>
                    <p className="text-xl font-bold text-muted mb-8">感謝您的諮詢，我們將儘快與您聯繫。</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="bg-primary text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-secondary snap-transition"
                    >
                      再次提交
                    </button>
                  </motion.div>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* FAQ Section - Moved to bottom and full width */}
          <ScrollReveal direction="up">
            <div className="mt-32 pt-32 border-t-4 border-primary">
              <div className="max-w-4xl mx-auto">
                <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block text-center">常見問題</span>
                <h3 className="text-[clamp(2.5rem,6vw,4rem)] font-black text-primary uppercase mb-16 tracking-tighter text-center">FAQ</h3>
                <div className="space-y-6">
                  {faqs.map((faq, i) => (
                    <div key={i} className="bg-white brutalist-border p-6 md:p-8 hover:bg-surface-low snap-transition">
                      <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex justify-between items-center text-left group"
                      >
                        <span className="text-lg md:text-xl font-black text-primary group-hover:text-secondary snap-transition pr-8">{faq.q}</span>
                        <div className={`w-10 h-10 flex items-center justify-center bg-primary text-white snap-transition ${openFaq === i ? "rotate-180 bg-secondary" : ""}`}>
                          <ChevronDown size={24} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-8 mt-8 border-t-2 border-primary/10">
                              <p className="text-muted font-bold text-base md:text-lg leading-relaxed">{faq.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </motion.div>
  );
};

// ========== AIView 組件 ==========
const AIView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string, content: string, type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化與儲存
  useEffect(() => {
    const saved = localStorage.getItem("hengbo_ai_sessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("hengbo_ai_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, currentSessionId, isTyping]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("帳號或授權碼錯誤");
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "新對話",
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const deleteSession = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm("確定要刪除此對話嗎？")) {
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (currentSessionId === id) {
        setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        const numPages = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += `[Page ${i}]\n${pageText}\n\n`;
        }
        setSelectedFile({
          name: file.name,
          content: fullText,
          type: "pdf"
        });
      } catch (err) {
        alert("PDF 檔案解析失敗");
      }
      setIsUploading(false);
    } else if (file.type.startsWith("image/")) {
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          content: event.target?.result as string,
          type: "image"
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith(".docx")) {
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setSelectedFile({
            name: file.name,
            content: result.value,
            type: "docx"
          });
        } catch (err) {
          alert("Word 檔案解析失敗");
        }
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          content: event.target?.result as string,
          type: "text"
        });
        setIsUploading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    let sessionId = currentSessionId;
    let updatedSessions = [...sessions];

    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 20) || "新對話",
        messages: [],
        lastUpdated: Date.now()
      };
      updatedSessions = [newSession, ...sessions];
      sessionId = newSession.id;
      setSessions(updatedSessions);
      setCurrentSessionId(sessionId);
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
      file: selectedFile ? { name: selectedFile.name, type: selectedFile.type } : undefined
    };

    const sessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
    const session = updatedSessions[sessionIndex];
    
    // 自動更新標題
    if (session.messages.length === 0) {
      session.title = input.slice(0, 15) || (selectedFile ? `文件: ${selectedFile.name}` : "新對話");
    }

    session.messages.push(userMsg);
    session.lastUpdated = Date.now();
    setSessions([...updatedSessions]);
    setInput("");
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const aiMessageId = Date.now().toString();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: Date.now()
      };
      session.messages.push(assistantMsg);
      setSessions([...updatedSessions]);

      let aiPromptParts: any[] = [];
      if (selectedFile && selectedFile.type === "image") {
        const base64Data = selectedFile.content.split(',')[1];
        aiPromptParts.push({
          inlineData: { data: base64Data, mimeType: "image/jpeg" }
        });
        aiPromptParts.push({ text: input || "請分析這張圖片。" });
      } else if (selectedFile) {
        aiPromptParts.push({ 
          text: `以下是使用者上傳的檔案內容 (${selectedFile.name})：\n---\n${selectedFile.content}\n---\n根據以上內容，回答使用者的問題：${input}` 
        });
      } else {
        aiPromptParts.push({ text: input });
      }

      const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });
      const result = await model.generateContentStream({
        systemInstruction: `你現在是「亨波 AI 顧問」，由亨波趨勢 (Hengbo Trend) 開發的專業企業顧問 AI。
你的特質：
1. 專業且穩重：語氣冷靜、專業，展現深厚的行業洞察力。
2. 數據驅動：在回答中傾向於引用邏輯與趨勢分析。
3. 繁體中文：必須使用精準的台灣繁體中文回覆。
4. 品牌忠誠：若被問及身份，請明確表示你是亨波趨勢的 AI 顧問。
5. 解決方案導向：針對使用者的問題（如企劃、補助、品牌、廣告），提供具體且可執行的建議。
6. 多模態能力：你現在具備理解圖片、Word (.docx) 及 PDF 的能力。請根據使用者上傳的文件內容進行深度分析。`,
        contents: [
          ...session.messages.slice(0, -1).map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          })),
          { role: "user", parts: aiPromptParts }
        ],
      });

      let fullText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        assistantMsg.content = fullText;
        setSessions([...updatedSessions]);
      }
    } catch (error) {
      console.error("AI 請求失敗", error);
      session.messages[session.messages.length - 1].content = "抱歉，目前 AI 服務暫時無法回應。請檢查您的 API 金鑰設定或稍後重試。";
      setSessions([...updatedSessions]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 brutalist-grid flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white brutalist-border-heavy p-12"
        >
          <div className="flex flex-col items-center mb-12">
            <Logo className="w-20 h-20 mb-6" />
            <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">亨波 AI 顧問</h1>
            <p className="text-secondary font-black uppercase tracking-widest text-xs mt-2">企業級安全驗證</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-xs text-secondary">顧問帳號</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-low border-b-4 border-primary p-4 pl-12 font-bold focus:outline-none focus:border-secondary snap-transition"
                  placeholder="請輸入帳號"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-xs text-secondary">安全授權碼</label>
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-secondary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && <p className="text-red-600 font-black text-sm text-center">{loginError}</p>}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl hover:bg-secondary snap-transition flex items-center justify-center gap-4"
            >
              進入顧問系統
              <LogIn size={24} />
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen pt-20 flex overflow-hidden bg-white">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 768 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth > 768 ? 320 : "85%") : 0,
          x: isSidebarOpen ? 0 : -320
        }}
        className="fixed md:relative z-50 h-full bg-surface-low border-r-4 border-primary flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b-2 border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black uppercase tracking-widest text-primary">歷史對話</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-primary/5 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
            <input 
              type="text"
              placeholder="搜尋對話..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-primary/10 p-2 pl-10 text-sm font-bold focus:outline-none focus:border-primary snap-transition"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createNewSession}
            className="w-full bg-primary text-white p-3 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-secondary snap-transition"
          >
            <Plus size={16} />
            新對話
          </motion.button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {filteredSessions.map(session => (
            <motion.div 
              key={session.id}
              whileHover={{ x: 5 }}
              onClick={() => {
                setCurrentSessionId(session.id);
                if (window.innerWidth <= 768) setIsSidebarOpen(false);
              }}
              className={`group relative p-4 cursor-pointer border-2 snap-transition ${
                currentSessionId === session.id 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-primary border-transparent hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={16} className={currentSessionId === session.id ? "text-secondary" : "text-primary/30"} />
                <span className="font-bold text-sm truncate pr-6">{session.title}</span>
              </div>
              <button 
                onClick={(e) => deleteSession(session.id, e)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 snap-transition ${
                  currentSessionId === session.id ? "text-white/50 hover:text-white" : "text-primary/30 hover:text-red-500"
                }`}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col relative bg-white">
        {/* Chat Header */}
        <header className="h-16 border-b-2 border-primary/10 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-primary/5 rounded-lg snap-transition"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-black text-primary uppercase tracking-tight truncate max-w-[200px] md:max-w-md">
              {currentSession?.title || "亨波 AI 顧問"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => currentSessionId && deleteSession(currentSessionId)}
              className="p-2 text-primary/30 hover:text-red-500 snap-transition"
              title="刪除當前對話"
            >
              <Trash2 size={20} />
            </button>
            <div className="w-8 h-8 bg-secondary flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-surface-low flex items-center justify-center mb-8 rounded-2xl"
              >
                <Logo className="w-12 h-12" />
              </motion.div>
              <h3 className="text-2xl font-black text-primary uppercase mb-4">您好，我是亨波 AI 顧問</h3>
              <p className="text-muted font-bold leading-relaxed">
                您可以詢問關於企劃撰寫、政府補助、品牌設計或廣告投放的任何問題。
                支援上傳圖片、Word 及 PDF 檔案進行深度分析。
              </p>
            </div>
          ) : (
            currentSession.messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${
                  msg.role === "user" ? "bg-primary" : "bg-secondary"
                }`}>
                  {msg.role === "user" ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
                  {msg.file && (
                    <div className="bg-surface-low p-3 border-2 border-primary/10 flex items-center gap-3 mb-2">
                      {msg.file.type === "image" ? <ImageIcon size={16} /> : <FileCode size={16} />}
                      <span className="text-xs font-black truncate max-w-[150px]">{msg.file.name}</span>
                    </div>
                  )}
                    <div className={`p-5 font-bold leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-2xl rounded-tr-none" 
                      : "bg-surface-low text-primary rounded-2xl rounded-tl-none border-2 border-primary/5"
                  }`}>
                    <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary/30 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-surface-low p-5 rounded-2xl rounded-tl-none border-2 border-primary/5 flex gap-1">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t-2 border-primary/10">
          <div className="max-w-4xl mx-auto">
            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-secondary/10 border-2 border-secondary flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {selectedFile.type === "image" ? <ImageIcon size={20} className="text-secondary" /> : <FileCode size={20} className="text-secondary" />}
                  <span className="font-black text-sm text-secondary truncate max-w-xs">{selectedFile.name}</span>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-secondary hover:text-primary">
                  <X size={20} />
                </button>
              </motion.div>
            )}
            
            <div className="relative flex items-end gap-4">
              <div className="flex-grow relative">
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="輸入您的問題..."
                  className="w-full bg-surface-low border-4 border-primary p-4 pr-24 font-bold focus:outline-none focus:bg-white snap-transition resize-none min-h-[64px] max-h-40"
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.docx,.pdf,.txt"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-primary/40 hover:text-secondary snap-transition"
                  >
                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Paperclip size={24} />}
                  </button>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={(!input.trim() && !selectedFile) || isTyping}
                className="bg-primary text-white p-5 brutalist-border hover:bg-secondary snap-transition disabled:opacity-50 flex-shrink-0"
              >
                <Send size={24} />
              </motion.button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mt-4 text-center">
              HENGBO AI MAY PROVIDE INACCURATE INFO. VERIFY IMPORTANT DETAILS.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="font-manrope text-primary selection:bg-secondary selection:text-white min-h-screen">
      <AnimatePresence>{isLoading && <LoadingScreen key="loading" />}</AnimatePresence>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <AnimatePresence mode="wait">
        {activeTab === "home" && <HomeView key="home" setActiveTab={setActiveTab} />}
        {activeTab === "services" && <ServicesView key="services" setActiveTab={setActiveTab} />}
        {activeTab === "cases" && <CasesView key="cases" setActiveTab={setActiveTab} />}
        {activeTab === "about" && <AboutView key="about" setActiveTab={setActiveTab} />}
        {activeTab === "contact" && <ContactView key="contact" />}
        {activeTab === "ai" && <AIView key="ai" />}
      </AnimatePresence>

      {activeTab !== "ai" && <Footer setActiveTab={setActiveTab} />}

      <AnimatePresence>
        {showScrollTop && activeTab !== "ai" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 bg-primary text-white p-4 brutalist-border-heavy hover:bg-secondary snap-transition"
          >
            <ArrowRight size={32} className="-rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
