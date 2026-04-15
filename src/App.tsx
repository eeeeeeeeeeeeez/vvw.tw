import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Menu, 
  X, 
  ArrowRight, 
  Building2, 
  FileText, 
  BadgeCheck, 
  TrendingUp, 
  Rocket, 
  Network, 
  Layout, 
  Cpu, 
  Eye,
  EyeOff,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  HelpCircle,
  BarChart3,
  Globe,
  Leaf,
  Lock,
  User,
  Bot,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Paperclip,
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Target,
  Zap,
  ShieldCheck,
  Clock,
  ChevronDown,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import JSZip from "jszip";

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- Constants ---
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || ""; 
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 從環境變數讀取管理員帳密
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "hengbo2026";

// --- Types ---
interface Message {
  role: "user" | "ai";
  content: string;
  id: string;
  timestamp: Date;
  imageUrl?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
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
    transition={{ duration: 0.8, ease: "easeInOut" }}
    className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.5, 
        repeat: Infinity, 
        repeatType: "reverse",
        ease: "easeInOut" 
      }}
      className="mb-8"
    >
      <Logo className="w-24 h-24" variant="white" />
    </motion.div>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: 200 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="h-1 bg-secondary"
    />
    <span className="text-white font-black tracking-[0.5em] mt-4 uppercase text-sm">HENGBO TREND</span>
  </motion.div>
);

const Navbar: React.FC<{ activeTab: string, setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
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
        className="flex items-center gap-3 text-xl md:text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer"
        onClick={() => handleTabClick("home")}
      >
        <Logo className="w-8 h-8 md:w-10 md:h-10" />
        亨波趨勢
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`font-black uppercase tracking-tighter px-2 py-1 snap-transition ${
              activeTab === tab.id 
                ? "text-secondary border-b-2 border-secondary" 
                : "text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => handleTabClick("contact")}
          className="hidden sm:block bg-primary text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-secondary snap-transition text-sm"
        >
          立即諮詢
        </button>
        
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
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`text-left py-4 px-6 font-black uppercase tracking-widest text-lg border-2 ${
                    activeTab === tab.id 
                      ? "bg-primary text-white border-primary" 
                      : "text-primary border-transparent hover:border-primary/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button 
                onClick={() => handleTabClick("contact")}
                className="w-full bg-secondary text-white py-5 font-black uppercase tracking-[0.2em] text-lg shadow-lg"
              >
                立即諮詢
              </button>
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
        <p className="font-bold text-sm tracking-widest uppercase opacity-70 max-w-lg leading-relaxed">
          © 2026 <Logo className="w-4 h-4 mx-1" variant="white" /> HENGBO TREND. MASTERING TRENDS, MAXIMIZING IMPACT.<br/>
          專業企劃、補助申請、品牌設計與廣告投放的一站式顧問夥伴。
        </p>
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
        <div className="absolute -right-20 top-0 opacity-5 pointer-events-none select-none">
          <Logo className="w-[40rem] h-[40rem]" />
        </div>
        
        <div className="col-span-12 md:col-span-10 z-10">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="bg-primary text-white px-4 py-1 font-black uppercase tracking-[0.3em] text-sm">EST. 2022</span>
              <div className="h-[2px] w-24 bg-primary"></div>
            </div>
            <h1 className="text-[clamp(4rem,15vw,12rem)] font-black leading-[0.85] tracking-tighter text-primary uppercase mb-12">
              Mastering<br/>
              <span className="text-secondary">Trends</span><br/>
              Impact
            </h1>
            <div className="max-w-2xl">
              <p className="text-2xl md:text-3xl font-bold text-ink leading-tight mb-12">
                專業企劃、補助申請、品牌設計與廣告投放。<br/>
                我們不只是顧問，更是您在商業戰場上的戰略夥伴。
              </p>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={() => setActiveTab("contact")}
                  className="bg-primary text-white px-10 py-6 text-xl font-black uppercase tracking-widest hover:bg-secondary snap-transition flex items-center gap-4 shadow-[8px_8px_0px_0px_rgba(187,0,20,1)]"
                >
                  立即啟動專案
                  <ArrowRight size={24} />
                </button>
                <button 
                  onClick={() => setActiveTab("services")}
                  className="bg-white border-4 border-primary text-primary px-10 py-6 text-xl font-black uppercase tracking-widest hover:bg-surface-low snap-transition"
                >
                  探索服務
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Marquee */}
    <div className="bg-secondary border-y-4 border-primary py-6 overflow-hidden flex whitespace-nowrap">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-12 animate-marquee">
          <span className="text-white text-4xl font-black uppercase tracking-tighter">Professional Strategy</span>
          <Rocket className="text-white" size={40} />
          <span className="text-white text-4xl font-black uppercase tracking-tighter">Brand Growth</span>
          <TrendingUp className="text-white" size={40} />
          <span className="text-white text-4xl font-black uppercase tracking-tighter">Government Grants</span>
          <BadgeCheck className="text-white" size={40} />
          <span className="text-white text-4xl font-black uppercase tracking-tighter">AI Consulting</span>
          <Cpu className="text-white" size={40} />
        </div>
      ))}
    </div>

    {/* Features */}
    <section className="px-8 py-32 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-primary">
          {[
            { icon: <FileText size={48} />, title: "專業企劃撰寫", desc: "從市場洞察到邏輯架構，為您量身打造具備高度說服力的商業企劃與融資計畫。" },
            { icon: <BadgeCheck size={48} />, title: "政府補助申請", desc: "精準對接各類補助政策，提供一站式申請服務，極大化企業獲取外部資源的機率。" },
            { icon: <Palette size={48} />, title: "品牌視覺設計", desc: "打破平庸，透過極具衝擊力的視覺語言，建立鮮明的品牌識別與市場競爭力。" }
          ].map((f, i) => (
            <div key={i} className={`p-12 group hover:bg-primary hover:text-white snap-transition ${i < 2 ? "md:border-r-4 border-primary" : ""} ${i > 0 ? "border-t-4 md:border-t-0 border-primary" : ""}`}>
              <div className="text-secondary group-hover:text-white mb-8 snap-transition">{f.icon}</div>
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">{f.title}</h3>
              <p className="font-bold text-lg leading-relaxed opacity-70 group-hover:opacity-100">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="px-8 py-32 bg-surface-low">
      <div className="max-w-5xl mx-auto bg-white brutalist-border-heavy p-12 md:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary -translate-y-16 translate-x-16 rotate-45"></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-primary uppercase tracking-tighter mb-8">訂閱趨勢洞察</h2>
          <p className="text-xl font-bold mb-12 max-w-xl">獲取最新的市場分析、補助資訊與品牌成長策略。每週一次，絕無垃圾郵件。</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="您的電子郵件地址" 
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              className="flex-1 bg-surface-low border-4 border-primary px-8 py-5 font-bold text-lg focus:outline-none focus:bg-white snap-transition"
            />
            <button 
              onClick={handleSubscribe}
              disabled={ctaLoading}
              className="bg-primary text-white px-12 py-5 font-black uppercase tracking-widest hover:bg-secondary disabled:opacity-50 snap-transition text-lg"
            >
              {ctaLoading ? "處理中..." : "立即訂閱"}
            </button>
          </div>
          {ctaMsg && <p className="mt-4 font-black text-secondary uppercase tracking-widest text-sm">{ctaMsg}</p>}
        </div>
      </div>
    </section>
  </motion.div>
  );
};

const ServicesView = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <h1 className="text-[clamp(4rem,12vw,10rem)] font-black text-primary leading-none tracking-tighter uppercase mb-8">
            Our<br/>
            <span className="text-secondary">Expertise</span>
          </h1>
          <div className="w-32 h-4 bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {[
            {
              id: "01",
              title: "專業企劃與計畫書撰寫",
              desc: "我們深諳商業邏輯與溝通藝術。無論是創業計畫、融資簡報還是標案企劃，我們都能將您的核心價值轉化為極具說服力的文字與數據。",
              tags: ["商業計畫書", "融資簡報", "標案企劃", "營運策略"],
              icon: <FileText size={64} />
            },
            {
              id: "02",
              title: "政府補助與資源對接",
              desc: "專精於 SBIR、SIIR、CITD 等各類政府補助專案。從資格評估、計畫書撰寫到結案輔導，協助企業有效降低研發與轉型成本。",
              tags: ["SBIR/SIIR", "數位轉型補助", "研發投抵", "創業貸款"],
              icon: <BadgeCheck size={64} />
            },
            {
              id: "03",
              title: "品牌視覺與 CIS 建立",
              desc: "拒絕套版，堅持原創。我們透過極具衝擊力的視覺語言，為品牌建立獨一無二的識別系統，讓您的企業在市場中脫穎而出。",
              tags: ["標誌設計", "視覺識別系統", "包裝設計", "網站視覺"],
              icon: <Palette size={64} />
            },
            {
              id: "04",
              title: "數位廣告與精準投放",
              desc: "以數據為核心，執行跨平台的廣告策略。透過持續的 A/B 測試與動態優化，極大化每一分廣告預算的轉換效益。",
              tags: ["Meta Ads", "Google Ads", "數據分析", "成效優化"],
              icon: <TrendingUp size={64} />
            }
          ].map((s) => (
            <div key={s.id} className="group bg-white brutalist-border-heavy p-12 flex flex-col md:flex-row gap-12 hover:bg-primary hover:text-white snap-transition">
              <div className="flex flex-col justify-between">
                <span className="text-6xl font-black text-secondary group-hover:text-white opacity-20 group-hover:opacity-100 snap-transition">{s.id}</span>
                <div className="text-secondary group-hover:text-white snap-transition hidden md:block">{s.icon}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-4xl font-black uppercase tracking-tight mb-8">{s.title}</h3>
                <p className="text-xl font-bold leading-relaxed mb-10 opacity-70 group-hover:opacity-100">{s.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {s.tags.map(t => (
                    <span key={t} className="border-2 border-primary group-hover:border-white px-4 py-1 font-black text-sm uppercase tracking-widest">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <div className="w-16 h-16 bg-secondary flex items-center justify-center group-hover:bg-white group-hover:text-primary snap-transition">
                  <ArrowRight size={32} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);

const CasesView = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div>
            <h1 className="text-[clamp(4rem,12vw,10rem)] font-black text-primary leading-none tracking-tighter uppercase">Selected<br/>Works</h1>
            <div className="w-48 h-4 bg-secondary mt-8"></div>
          </div>
          <p className="max-w-md text-xl font-bold text-muted uppercase tracking-widest leading-tight">
            我們與各領域的領先企業合作，透過專業諮詢實現實質性的增長與突破。
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Case 1 */}
          <div className="col-span-12 md:col-span-7 bg-white brutalist-border border-primary group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[450px]">
            <div className="flex justify-between items-start">
              <Building2 size={120} className="group-hover:text-secondary snap-transition" />
              <div className="text-right">
                <div className="font-black tracking-widest uppercase mb-2 text-xs">產業: 傳統製造業</div>
                <div className="font-black tracking-widest uppercase text-xs">服務: 補助申請與轉型顧問</div>
              </div>
            </div>
            <div>
              <h2 className="text-[clamp(2rem,6vw,3.75rem)] font-black uppercase tracking-tighter leading-none mb-4">傳統機械廠數位升級</h2>
              <div className="space-y-4 mb-6 opacity-0 group-hover:opacity-100 snap-transition">
                <p className="font-bold text-sm leading-relaxed">挑戰：面臨數位轉型瓶頸，缺乏自動化數據追蹤系統。</p>
                <p className="font-bold text-sm leading-relaxed">方案：協助申請政府數位轉型補助，並導入智慧生產監控系統。</p>
                <p className="font-black text-secondary group-hover:text-white text-lg">量化成果：獲得 50 萬元補助，生產效率提升 30%。</p>
              </div>
              <div className="w-16 h-2 bg-secondary group-hover:bg-white snap-transition"></div>
            </div>
          </div>

          {/* Case 2 */}
          <div className="col-span-12 md:col-span-5 bg-secondary brutalist-border border-primary group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[450px]">
            <div className="flex justify-between items-start text-white group-hover:text-primary">
              <Palette size={120} className="group-hover:text-secondary snap-transition" />
              <div className="text-right">
                <div className="font-black tracking-widest uppercase text-xs">產業: 新創美妝品牌</div>
                <div className="font-black tracking-widest uppercase text-xs">服務: 品牌設計與廣告投放</div>
              </div>
            </div>
            <div>
              <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-black uppercase tracking-tighter text-white group-hover:text-primary leading-none mb-6">DTC 品牌視覺重塑</h2>
              <div className="space-y-4 mb-6 opacity-0 group-hover:opacity-100 snap-transition">
                <p className="font-bold text-sm leading-relaxed">挑戰：品牌知名度侷限於本地，視覺形象過於傳統。</p>
                <p className="font-bold text-sm leading-relaxed">方案：重新定義品牌視覺語言 (CIS)，並執行跨國精準廣告投放。</p>
                <p className="font-black text-white group-hover:text-secondary text-lg">量化成果：廣告 ROI 提升至 4.8，品牌溢價提升 40%。</p>
              </div>
            </div>
          </div>

          {/* Case 3 */}
          <div className="col-span-12 md:col-span-4 bg-primary text-white brutalist-border group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px]">
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
          </div>

          {/* Case 4 */}
          <div className="col-span-12 md:col-span-8 bg-surface-low brutalist-border group cursor-pointer snap-transition hover:bg-secondary hover:text-white p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
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
          </div>
        </div>
      </div>
    </section>

    <section className="bg-primary py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-[clamp(5rem,20vw,20rem)] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">SUCCESS</h2>
        <h3 className="text-[clamp(3rem,12vw,6rem)] font-black text-white mb-12 tracking-tighter relative z-10 uppercase">想要了解更多？</h3>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveTab("contact")}
            className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
          >
            與我們聯繫
            <ArrowRight size={32} />
          </button>
        </div>
      </div>
    </section>
  </motion.div>
);

const AboutView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="relative px-8 py-32 overflow-hidden bg-surface-low border-b-4 border-primary">
      <div className="max-w-7xl mx-auto relative z-10">
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
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-24"></div>
    </section>

    <section className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-1/2 bg-primary p-12 md:p-24 flex flex-col justify-between">
        <div>
          <h2 className="text-[clamp(4rem,12vw,8rem)] font-black text-white tracking-tighter leading-none mb-12">關於<br/>我們</h2>
          <div className="w-24 h-2 bg-secondary mb-8"></div>
          <p className="text-white/60 font-bold text-lg uppercase tracking-[0.2em]">HENGBO TREND CONSULTING</p>
        </div>
        <div className="text-white opacity-20">
          <Building2 size={240} />
        </div>
      </div>
      <div className="w-full md:w-1/2 bg-white p-12 md:p-24 border-b-4 md:border-b-0 md:border-l-4 border-primary">
        <div className="space-y-12">
          <div>
            <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">亨波趨勢：細節的執行者</h3>
            <p className="text-lg leading-relaxed text-muted font-medium">
              我們創立於2022年，代表市場上的一股新銳力量。我們摒棄冗餘，回歸本質。讓每一個細節，都經過嚴密的計畫與審核。我們相信，卓越的策略來自於對細節的極致追求。
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">創新與卓越</h3>
            <p className="text-lg leading-relaxed text-muted font-medium">
              在快速變遷的環境中，我們專注提供高品質、高效能的解決方案，協助客戶精準撰寫企劃與計畫書，並順利申請各項政府與企業補助資源，同時透過專業的數位廣告投放與高品質品牌設計，幫助品牌有效曝光，提升市場競爭力。
            </p>
          </div>
          
          {/* Core Values */}
          <div className="pt-8 border-t-2 border-primary/10">
            <h3 className="text-xl font-black text-secondary uppercase mb-6 tracking-widest">我們的承諾</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "誠信透明", desc: "所有服務流程與收費標準公開透明，建立長期的信任夥伴關係。" },
                { title: "結果導向", desc: "我們關注最終的量化成果，確保每一分投入都能產生實質價值。" },
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

          <div className="grid grid-cols-2 gap-8 pt-12">
            <div className="border-t-4 border-primary pt-4">
              <div className="text-4xl font-black text-secondary">100+</div>
              <div className="font-bold uppercase tracking-widest text-xs mt-2">累計諮詢客戶</div>
            </div>
            <div className="border-t-4 border-primary pt-4">
              <div className="text-4xl font-black text-secondary">85%</div>
              <div className="font-bold uppercase tracking-widest text-xs mt-2">補助申請過件率</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="px-8 py-32 bg-surface-high">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(2.5rem,8vw,3.75rem)] font-black text-primary uppercase mb-24 text-center tracking-tighter underline decoration-secondary decoration-8 underline-offset-8">成長策略</h2>
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-primary hidden md:block"></div>
          
          {[
            { year: "2024", title: "從邏輯架構到品牌轉型", desc: "強調數據洞察與故事行銷的完美結合，為企業建立具市場競爭力的核心價值。", side: "left" },
            { year: "2025", title: "政策鏈結與資源整合開發", desc: "透過專業計畫書編製與專業諮詢，協助單位跨越財務門檻，實現公共服務與社會影響力。", side: "right" },
            { year: "2026", title: "數據驅動與精準觸及", desc: "整合多社群平台資源與動態優化技術，在碎片的數位環境中精準捕捉目標客群與商機。", side: "left" }
          ].map((item, idx) => (
            <div key={item.year} className="relative flex flex-col md:flex-row items-center mb-32 group">
              <div className={`w-full md:w-1/2 ${item.side === "right" ? "md:order-2 md:pl-16" : "md:pr-16 text-right"}`}>
                <div className={`inline-block bg-primary text-white text-3xl font-black px-6 py-2 mb-6 group-hover:bg-secondary snap-transition`}>{item.year}</div>
                <h3 className="text-3xl font-black text-primary uppercase mb-4 tracking-tight">{item.title}</h3>
                <p className="text-lg font-bold text-muted leading-relaxed">{item.desc}</p>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-primary rounded-full z-10 hidden md:block group-hover:bg-secondary snap-transition"></div>
              <div className="w-full md:w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);

const ContactView = () => {
  const [formData, setFormData] = useState({ name: "", organization: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setFormData({ name: "", organization: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(json.error || "提交失敗");
      }
    } catch {
      setStatus("error");
      setErrorMsg("伺服器連線失敗");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-24 brutalist-grid min-h-screen"
    >
      <section className="px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h1 className="text-[clamp(4rem,12vw,10rem)] font-black text-primary leading-none tracking-tighter uppercase mb-12">
                Let's<br/>
                <span className="text-secondary">Talk</span>
              </h1>
              <div className="space-y-12">
                <div className="flex gap-6 items-start">
                  <div className="bg-primary text-white p-4 brutalist-border"><Mail size={32} /></div>
                  <div>
                    <span className="font-black uppercase tracking-widest text-sm text-secondary block mb-2">電子郵件</span>
                    <a href="mailto:contact@hengbo.tw" className="text-2xl font-black text-primary hover:text-secondary snap-transition">contact@hengbo.tw</a>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-primary text-white p-4 brutalist-border"><Phone size={32} /></div>
                  <div>
                    <span className="font-black uppercase tracking-widest text-sm text-secondary block mb-2">聯繫電話</span>
                    <span className="text-2xl font-black text-primary">02-2345-6789</span>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-primary text-white p-4 brutalist-border"><MapPin size={32} /></div>
                  <div>
                    <span className="font-black uppercase tracking-widest text-sm text-secondary block mb-2">辦公地點</span>
                    <span className="text-2xl font-black text-primary uppercase">Taipei, Taiwan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white brutalist-border-heavy p-8 md:p-12">
              {status === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-24 h-24 bg-primary text-white flex items-center justify-center rounded-full mb-8"><Check size={48} /></div>
                  <h2 className="text-4xl font-black text-primary uppercase mb-4">提交成功</h2>
                  <p className="text-xl font-bold text-muted mb-8">我們已收到您的訊息，顧問將於 24 小時內與您聯繫。</p>
                  <button onClick={() => setStatus("idle")} className="bg-secondary text-white px-12 py-4 font-black uppercase tracking-widest hover:bg-primary snap-transition">再次提交</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-black uppercase tracking-widest text-xs text-primary">您的姓名 *</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-low border-4 border-primary p-4 font-bold focus:outline-none focus:bg-white snap-transition" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-black uppercase tracking-widest text-xs text-primary">公司 / 組織</label>
                      <input type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="w-full bg-surface-low border-4 border-primary p-4 font-bold focus:outline-none focus:bg-white snap-transition" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-black uppercase tracking-widest text-xs text-primary">電子郵件 *</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-low border-4 border-primary p-4 font-bold focus:outline-none focus:bg-white snap-transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-black uppercase tracking-widest text-xs text-primary">諮詢主旨 *</label>
                    <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-surface-low border-4 border-primary p-4 font-bold focus:outline-none focus:bg-white snap-transition">
                      <option value="">請選擇諮詢項目</option>
                      <option value="補助申請">政府補助申請諮詢</option>
                      <option value="企劃撰寫">專業企劃/計畫書撰寫</option>
                      <option value="品牌設計">品牌視覺/CIS 設計</option>
                      <option value="廣告投放">數位廣告投放合作</option>
                      <option value="其他">其他合作洽談</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-black uppercase tracking-widest text-xs text-primary">詳細訊息 *</label>
                    <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-surface-low border-4 border-primary p-4 font-bold focus:outline-none focus:bg-white snap-transition" placeholder="請描述您的需求..." />
                  </div>
                  {status === "error" && <div className="bg-secondary/10 border-l-4 border-secondary p-4 text-secondary font-bold uppercase text-sm">{errorMsg}</div>}
                  <button disabled={status === "loading"} className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl shadow-[8px_8px_0px_0px_rgba(187,0,20,1)] hover:bg-secondary disabled:opacity-50 snap-transition flex items-center justify-center gap-4">
                    {status === "loading" ? "提交中..." : "發送諮詢請求"}
                    <Send size={24} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const AIView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string, content: string, type: string } | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const SESSIONS_STORAGE_KEY = "hengbo_ai_sessions_v1";

  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((s: any) => ({
            ...s,
            lastUpdated: new Date(s.lastUpdated),
            messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          }));
          setSessions(parsed);
          if (parsed.length > 0) {
            setCurrentSessionId(parsed[0].id);
          } else {
            createNewSession();
          }
        } catch (e) {
          console.error("Failed to load sessions", e);
          createNewSession();
        }
      } else {
        createNewSession();
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && sessions.length > 0) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isLoggedIn]);

  const createNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "新對話",
      messages: [{ 
        role: "ai", 
        content: "您好！我是亨波 AI 顧問。很高興為您服務，請問今天有什麼我可以幫您的嗎？",
        id: `msg-${Date.now()}`,
        timestamp: new Date()
      }],
      lastUpdated: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
    return newId;
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("至少需保留一個對話。");
      return;
    }
    if (window.confirm("確定要刪除此對話嗎？")) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
      }
    }
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        let newTitle = s.title;
        if (s.title === "新對話" || s.title === "未命名對話") {
          const firstUserMsg = newMessages.find(m => m.role === "user");
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? "..." : "");
          }
        }
        return { ...s, messages: newMessages, title: newTitle, lastUpdated: new Date() };
      }
      return s;
    }));
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 0);
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setUsername("");
      setPassword("");
    } else {
      setLoginError("帳號或密碼錯誤。");
    }
  };

  const parsePptx = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      let fullText = "";
      
      const slideFiles = Object.keys(zip.files).filter(name => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"));
      
      slideFiles.sort((a, b) => {
        const matchA = a.match(/\d+/);
        const matchB = b.match(/\d+/);
        const numA = parseInt(matchA ? matchA[0] : "0");
        const numB = parseInt(matchB ? matchB[0] : "0");
        return numA - numB;
      });

      for (let i = 0; i < slideFiles.length; i++) {
        const fileObj = zip.file(slideFiles[i]);
        if (fileObj) {
          const content = await fileObj.async("string");
          const matches = content.match(/<a:t>([^<]*)<\/a:t>/g);
          if (matches) {
            const slideText = matches.map(m => m.replace(/<a:t>|<\/a:t>/g, "")).join(" ");
            fullText += `[Slide ${i + 1}]\n${slideText}\n\n`;
          }
        }
      }
      return fullText || "無法從投影片中提取文字。";
    } catch (e) {
      console.error("PPTX 解析失敗", e);
      throw new Error("PPTX 解析失敗");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("檔案需小於 10MB。");
      return;
    }

    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        const numPages = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += `[Page ${i}]\n${textContent.items.map((item: any) => item.str).join(" ")}\n\n`;
        }
        setSelectedFile({ name: file.name, content: fullText, type: file.type });
      } catch (e) { alert("PDF 解析失敗。"); }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedFile({ name: file.name, content: ev.target?.result as string, type: file.type });
      reader.readAsDataURL(file);
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        setSelectedFile({ name: file.name, content: result.value, type: file.type });
      } catch (e) { alert("Word 解析失敗。"); }
    } else if (file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || file.name.endsWith(".pptx")) {
      try {
        const text = await parsePptx(file);
        setSelectedFile({ name: file.name, content: text, type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
      } catch (e) { alert("PowerPoint 解析失敗。"); }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedFile({ name: file.name, content: ev.target?.result as string, type: file.type });
      reader.readAsText(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isTyping || !currentSessionId) return;

    let userMsg = input.trim() || (selectedFile ? `請分析這份檔案：${selectedFile.name}` : "");
    const currentFile = selectedFile;
    const userMsgId = `msg-${Date.now()}-u`;
    const aiMsgId = `msg-${Date.now()}-a`;

    const newUserMsg: Message = { role: "user", content: userMsg, id: userMsgId, timestamp: new Date() };
    const newAiMsg: Message = { role: "ai", content: "", id: aiMsgId, timestamp: new Date() };
    
    const updatedMessages = [...messages, newUserMsg, newAiMsg];
    updateSessionMessages(currentSessionId, updatedMessages);
    
    setInput("");
    setSelectedFile(null);
    setIsTyping(true);

    try {
      let aiPromptParts: any[] = [];
      if (currentFile && currentFile.type.startsWith('image/')) {
        aiPromptParts.push({ inlineData: { data: currentFile.content.split(',')[1], mimeType: currentFile.type } });
        aiPromptParts.push({ text: userMsg });
      } else if (currentFile) {
        aiPromptParts.push({ text: `檔案內容 (${currentFile.name})：\n${currentFile.content.substring(0, 50000)}\n\n問題：${userMsg}` });
      } else {
        aiPromptParts.push({ text: userMsg });
      }

      const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);
      const response = await genAI.models.generateContentStream({
        model: "gemma-4-31b-it",
        systemInstruction: `你是一位專業且充滿洞察力的『亨波 AI 顧問』，代表「亨波趨勢 (HENGBO TREND)」。
你的核心特質：
1. **專業顧問風範**：語氣專業、穩重且富有啟發性。
2. **繁體中文專家**：務必使用優雅、精準的『繁體中文』。
3. **數據與趨勢驅動**：強調數據支持與精準規劃。
4. **品牌忠誠度**：引導至 https://vvw-tw.vercel.app/。
${isImageRequest ? '要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`,
        contents: [
          ...messages.slice(-10).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
          { role: "user", parts: aiPromptParts }
        ],
      });

      let fullText = "";
      for await (const chunk of response) {
        fullText += chunk.text || "";
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
          ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m)
        } : s));
      }

      const imgMatch = fullText.match(/\[IMAGE_GEN:\s*(.*?)\]/);
      if (imgMatch) {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgMatch[1].trim())}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*1000000)}`;
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
          ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: fullText.replace(/\[IMAGE_GEN:.*?\]/, "").trim(), imageUrl } : m)
        } : s));
      }
    } catch (e: any) {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? {
        ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: `錯誤：${e.message || "服務異常"}` } : m)
      } : s));
    } finally {
      setIsTyping(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isLoggedIn) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-surface-low px-6 pt-24 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white border-2 border-primary shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-primary flex items-center justify-center mb-6 shadow-lg"><Lock className="w-12 h-12 text-white" /></div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">亨波 AI 顧問</h2>
            <p className="text-muted font-bold text-sm uppercase tracking-widest">安全驗證 1.0.0-beta.2</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-[10px] text-secondary">顧問帳號</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} /><input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-surface-low border-2 border-primary/10 py-3 pl-10 font-bold focus:outline-none focus:border-primary" placeholder="Consultant ID" /></div>
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-[10px] text-secondary">安全授權碼</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} /><input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-low border-2 border-primary/10 py-3 pl-10 pr-10 font-bold focus:outline-none focus:border-primary" placeholder="Access Key" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
            </div>
            {loginError && <div className="bg-secondary/10 border-l-4 border-secondary p-3 text-secondary font-bold text-xs uppercase">{loginError}</div>}
            <button className="w-full bg-primary text-white py-5 font-black uppercase tracking-[0.2em] text-lg shadow-lg hover:bg-secondary transition-all flex items-center justify-center gap-3">授權並進入 <ArrowRight size={20} /></button>
          </form>
          <div className="mt-8 pt-8 border-t-2 border-primary/10 flex justify-center">
            <p className="text-primary/40 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12} /> 端對端加密連線中</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-low pt-24 overflow-hidden relative z-10">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-white border-r-2 border-primary flex flex-col z-20 absolute md:relative h-[calc(100vh-6rem)]"
          >
            <div className="p-4 border-b-2 border-primary/10">
              <button 
                onClick={createNewSession}
                className="w-full bg-primary text-white py-3 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-secondary snap-transition"
              >
                <Plus size={18} /> 開啟新諮詢
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                <input 
                  type="text" 
                  placeholder="搜尋對話內容..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-low border-2 border-primary/10 py-2 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredSessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    if (window.innerWidth <= 768) setIsSidebarOpen(false);
                  }}
                  className={`p-4 cursor-pointer border-b border-primary/5 flex items-center justify-between group snap-transition ${currentSessionId === session.id ? "bg-primary text-white" : "hover:bg-surface-high"}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={18} className={currentSessionId === session.id ? "text-white" : "text-primary/40"} />
                    <div className="overflow-hidden">
                      <p className="font-black text-sm truncate uppercase tracking-tight">{session.title}</p>
                      <p className={`text-[10px] font-bold uppercase opacity-60 ${currentSessionId === session.id ? "text-white" : "text-primary"}`}>{session.lastUpdated.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 hover:text-secondary snap-transition ${currentSessionId === session.id ? "text-white" : "text-primary/40"}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Chat Header */}
        <div className="h-16 border-b-2 border-primary flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-primary hover:bg-surface-low rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h3 className="font-black text-primary uppercase tracking-tighter truncate max-w-[200px] md:max-w-md">
                {currentSession?.title || "亨波 AI 顧問"}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">顧問連線中</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 text-primary/40 hover:text-primary snap-transition"><HelpCircle size={20} /></button>
             <button className="p-2 text-primary/40 hover:text-primary snap-transition"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-surface-low"
        >
          {messages.map((msg, idx) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center brutalist-border ${msg.role === "user" ? "bg-secondary text-white" : "bg-primary text-white"}`}>
                  {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="space-y-2">
                  <div className={`p-5 brutalist-border shadow-[4px_4px_0px_0px_rgba(21,66,18,1)] ${msg.role === "user" ? "bg-white" : "bg-white"}`}>
                    <div className="markdown-content font-bold leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.imageUrl && (
                      <div className="mt-4 border-2 border-primary overflow-hidden">
                        <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto" />
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/40 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.role === "ai" && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(msg.content); alert("已複製到剪貼簿"); }}
                        className="hover:text-primary snap-transition flex items-center gap-1"
                      >
                        <Copy size={10} /> 複製
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center brutalist-border bg-primary text-white">
                  <Bot size={20} />
                </div>
                <div className="p-5 brutalist-border bg-white shadow-[4px_4px_0px_0px_rgba(21,66,18,1)] flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t-2 border-primary bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto space-y-4">
            {selectedFile && (
              <div className="flex items-center gap-3 bg-surface-low p-3 brutalist-border inline-flex">
                <FileText size={16} className="text-secondary" />
                <span className="text-xs font-black uppercase truncate max-w-[200px]">{selectedFile.name}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-primary/40 hover:text-secondary"><X size={16} /></button>
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedFile ? "針對檔案內容提問..." : "輸入訊息諮詢 AI 顧問..."}
                  className="w-full bg-surface-low border-4 border-primary p-5 font-bold text-lg focus:outline-none focus:bg-white snap-transition pr-12"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-secondary snap-transition"
                >
                  <Paperclip size={24} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.pptx,.txt,image/*"
                />
              </div>
              <button 
                type="submit"
                disabled={(!input.trim() && !selectedFile) || isTyping}
                className="bg-primary text-white px-8 py-5 font-black uppercase tracking-widest hover:bg-secondary disabled:opacity-50 snap-transition flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(187,0,20,1)]"
              >
                發送 <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] text-center">
              HENGBO AI MAY PROVIDE INACCURATE INFO. VERIFY IMPORTANT DATA.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary selection:text-white">
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      {!isLoading && (
        <>
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="max-w-[1920px] mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === "home" && <HomeView key="home" setActiveTab={setActiveTab} />}
              {activeTab === "services" && <ServicesView key="services" />}
              {activeTab === "cases" && <CasesView key="cases" />}
              {activeTab === "about" && <AboutView key="about" setActiveTab={setActiveTab} />}
              {activeTab === "contact" && <ContactView key="contact" />}
              {activeTab === "ai" && <AIView key="ai" />}
            </AnimatePresence>
          </main>
          {activeTab !== "ai" && <Footer setActiveTab={setActiveTab} />}
        </>
      )}
    </div>
  );
}
