import React, { useState, useEffect, useRef } from "react";
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
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Constants ---
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 從環境變數讀取管理員帳密（應在 .env.local 中設定）
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "hengbo2026";

// --- Types ---
interface Message {
  role: "user" | "ai";
  content: string;
  id: string;
  timestamp: Date;
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
  const tabs = [
    { id: "home", label: "首頁" },
    { id: "services", label: "專業服務" },
    { id: "cases", label: "精選案例" },
    { id: "about", label: "關於我們" },
    { id: "ai", label: "亨波 AI" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-primary flex justify-between items-center px-8 py-4 max-w-[1920px] mx-auto">
      <div 
        className="flex items-center gap-3 text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer"
        onClick={() => setActiveTab("home")}
      >
        <Logo className="w-10 h-10" />
        亨波趨勢
      </div>
      <div className="hidden md:flex items-center gap-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
      <button 
        onClick={() => setActiveTab("contact")}
        className="bg-primary text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-secondary snap-transition"
      >
        立即諮詢
      </button>
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
        <p className="font-bold text-sm tracking-widest uppercase opacity-70 max-w-lg">
          © 2026 <Logo className="w-4 h-4 mx-1" variant="white" /> HENGBO TREND. MASTERING TRENDS, MAXIMIZING IMPACT.
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">導覽導航</span>
          <button onClick={() => setActiveTab("services")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">專業服務</button>
          <button onClick={() => setActiveTab("cases")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">精選案例</button>
          <button onClick={() => setActiveTab("about")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">關於我們</button>
          <button onClick={() => setActiveTab("contact")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">聯繫我們</button>
          <button onClick={() => setActiveTab("ai")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">亨波 AI</button>
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
          <Building2 size={600} className="text-primary" />
        </div>
        <div className="col-span-12 lg:col-span-10 z-10">
          <h1 className="text-[clamp(3rem,12vw,8rem)] leading-[0.85] font-black text-primary uppercase tracking-tighter mb-12">
            賦能企業<br/>
            <span className="text-secondary">築造未來</span>
          </h1>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:ml-[16.6%] bg-primary p-12 relative z-20 border-r-8 border-secondary">
          <p className="text-white text-[clamp(1.5rem,5vw,2.25rem)] font-bold tracking-[0.2em] mb-8">助力企業，引領趨勢</p>
          <div className="w-full h-1 bg-secondary mb-8"></div>
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-white flex items-center justify-center brutalist-border">
              <Logo className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Bento Grid */}
    <section className="px-8 py-32 bg-surface-low border-t-2 border-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <h2 className="text-[clamp(3rem,10vw,4.5rem)] font-black uppercase tracking-tighter text-primary">策略<br/>精準度</h2>
          <div className="max-w-md text-right">
            <span className="font-black uppercase tracking-[0.3em] text-secondary block mb-4">核心服務能力</span>
            <p className="font-bold text-muted">我們不只提供服務；我們透過數據驅動的精準規劃，協助您在市場競爭中取得絕對優勢。</p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-8 group bg-white brutalist-border p-12 hover:bg-primary hover:text-white snap-transition relative overflow-hidden">
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-20 snap-transition">
              <FileText size={240} />
            </div>
            <span className="text-secondary font-black text-2xl mb-8 block">01</span>
            <h3 className="text-[clamp(2rem,6vw,3rem)] font-black mb-6 uppercase">企劃撰寫</h3>
            <p className="text-xl max-w-xl font-medium mb-8">從市場洞察到可執行藍圖，一份讓投資人與團隊都買單的企劃。</p>
            <div className="w-16 h-2 bg-secondary"></div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-secondary p-12 text-white brutalist-border border-secondary relative">
            <span className="text-white/50 font-black text-2xl mb-8 block">02</span>
            <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-black mb-6 uppercase">補助申請</h3>
            <Rocket size={80} className="mb-8" />
            <p className="font-bold">精準對接政府資源，幫企業省錢又加速成長。</p>
          </div>
          <div className="col-span-12 md:col-span-5 bg-white brutalist-border p-12 flex flex-col justify-between">
            <div>
              <span className="text-secondary font-black text-2xl mb-8 block">03</span>
              <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-black mb-6 uppercase">品牌設計</h3>
              <p className="font-bold text-muted">讓品牌不只被看到，更被記住與喜愛。</p>
            </div>
            <div className="mt-12 flex items-center justify-center border-t-2 border-surface-container pt-12">
              <BadgeCheck size={80} className="text-primary" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 bg-primary p-12 text-white brutalist-border flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <TrendingUp size={300} />
            </div>
            <div>
              <span className="text-secondary font-black text-2xl mb-8 block">04</span>
              <h3 className="text-[clamp(2rem,6vw,3rem)] font-black mb-6 uppercase">廣告投放</h3>
              <p className="text-xl max-w-md font-medium">不浪費每一分預算，讓流量轉化為實質業績。</p>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <div className="px-4 py-2 bg-white text-primary font-black text-sm uppercase">Google Ads</div>
              <div className="px-4 py-2 bg-white text-primary font-black text-sm uppercase">Meta Ads</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Newsletter */}
    <section className="px-8 py-32 bg-white">
      <div className="max-w-7xl mx-auto border-8 border-primary p-12 md:p-24 relative">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-secondary brutalist-border flex items-center justify-center text-white">
          <Mail size={48} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[clamp(2.5rem,8vw,4rem)] font-black uppercase tracking-tighter leading-none mb-8">掌握<br/>趨勢脈動</h2>
            <p className="text-xl font-bold text-muted uppercase tracking-widest">訂閱我們的電子報，獲取最新的市場洞察與補助資訊。</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-0">
              <input 
                type="email" 
                placeholder="YOUR@EMAIL.COM" 
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                className="flex-grow bg-surface-low border-4 border-primary p-6 font-black text-xl focus:outline-none focus:bg-white snap-transition"
              />
              <button 
                onClick={handleSubscribe}
                disabled={ctaLoading}
                className="bg-primary text-white px-12 py-6 font-black text-xl uppercase hover:bg-secondary snap-transition disabled:opacity-50"
              >
                {ctaLoading ? "處理中..." : "立即訂閱"}
              </button>
            </div>
            {ctaMsg && <p className="font-black uppercase text-sm tracking-widest text-secondary">{ctaMsg}</p>}
          </div>
        </div>
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
        <h1 className="text-[clamp(4rem,15vw,10rem)] font-black text-primary leading-none tracking-tighter mb-24 uppercase">
          專業<br/><span className="text-secondary">服務</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { 
              title: "企劃撰寫", 
              icon: <FileText size={64} />, 
              desc: "從創業計畫到融資簡報，我們為您建構最具說服力的商業邏輯。",
              features: ["創業計畫書", "融資企劃", "營運計畫優化"]
            },
            { 
              title: "補助申請", 
              icon: <Rocket size={64} />, 
              desc: "精準對接政府資源，協助企業獲取研發、轉型與創業補助。",
              features: ["SBIR/SIIR 申請", "地方創生計畫", "淨零轉型補助"]
            },
            { 
              title: "品牌設計", 
              icon: <Layout size={64} />, 
              desc: "打造具備市場辨識度的視覺系統，讓品牌價值深入人心。",
              features: ["VI 視覺識別", "包裝設計", "網頁介面設計"]
            },
            { 
              title: "廣告投放", 
              icon: <TrendingUp size={64} />, 
              desc: "數據驅動的精準行銷，極大化每一分廣告預算的轉換效益。",
              features: ["Google/Meta 廣告", "SEO 優化", "社群整合行銷"]
            }
          ].map((s, i) => (
            <div key={i} className="bg-white brutalist-border-heavy p-12 hover:bg-primary hover:text-white snap-transition group">
              <div className="text-secondary group-hover:text-white mb-8">{s.icon}</div>
              <h3 className="text-4xl font-black mb-6 uppercase">{s.title}</h3>
              <p className="text-xl font-bold mb-8 opacity-70">{s.desc}</p>
              <ul className="space-y-4">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 font-black uppercase tracking-widest text-sm">
                    <div className="w-2 h-2 bg-secondary"></div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);

const CasesView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="px-8 py-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <h1 className="text-[clamp(4rem,12vw,8rem)] font-black text-primary leading-none tracking-tighter uppercase">精選<br/>案例</h1>
          <div className="max-w-md text-right">
            <p className="font-bold text-xl text-muted uppercase tracking-widest">實戰經驗，數據說話。我們協助各產業客戶實現突破性成長。</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Case 1 */}
          <div className="col-span-12 md:col-span-7 bg-white brutalist-border group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[500px]">
            <div className="flex justify-between items-start">
              <div className="bg-secondary text-white px-4 py-2 font-black text-sm uppercase">科技產業</div>
              <ChevronRight size={48} className="opacity-0 group-hover:opacity-100 snap-transition" />
            </div>
            <div>
              <h2 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black uppercase tracking-tighter leading-tight">智慧製造<br/>轉型計畫</h2>
              <p className="mt-6 text-xl font-bold opacity-60 group-hover:opacity-100">量化成果：成功申請 200 萬政府補助，生產效率提升 35%。</p>
            </div>
          </div>

          {/* Case 2 */}
          <div className="col-span-12 md:col-span-5 bg-secondary text-white brutalist-border border-secondary group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px]">
            <div className="flex justify-between items-start">
              <div className="bg-white text-primary px-4 py-2 font-black text-sm uppercase">零售電商</div>
              <ChevronRight size={48} className="opacity-0 group-hover:opacity-100 snap-transition" />
            </div>
            <div>
              <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-black uppercase tracking-tighter leading-tight">DTC 品牌<br/>全球化策略</h2>
              <p className="mt-6 text-lg font-bold opacity-70 group-hover:opacity-100">量化成果：廣告 ROI 從 1.2 提升至 4.8，品牌認知度提升 65%。</p>
            </div>
          </div>

          {/* Case 3 */}
          <div className="col-span-12 md:col-span-4 bg-primary text-white brutalist-border group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px]">
            <Network size={80} className="mb-8" />
            <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter leading-none">連鎖餐飲集團 ESG 規劃</h2>
            <p className="mt-4 font-bold opacity-60 group-hover:opacity-100">量化成果：成功對接政府淨零轉型補助，獲取 80 萬元資助。</p>
          </div>

          {/* Case 4 */}
          <div className="col-span-12 md:col-span-8 bg-surface-low brutalist-border group cursor-pointer snap-transition hover:bg-secondary hover:text-white p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-[400px] h-[400px] bg-primary opacity-5 group-hover:opacity-20 rotate-45 pointer-events-none"></div>
            <div className="flex flex-col md:flex-row gap-8 z-10">
              <Layout size={120} />
              <div>
                <div className="font-black tracking-widest uppercase mb-4 text-secondary group-hover:text-white">融資專案</div>
                <h2 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black uppercase tracking-tighter leading-tight">AI 醫療新創融資計畫</h2>
                <p className="mt-4 max-w-md font-bold text-lg uppercase">量化成果：協助撰寫融資企劃書，成功獲得天使輪 1,500 萬投資。</p>
              </div>
            </div>
          </div>
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
        </h1>
        <div className="mt-12 max-w-2xl border-l-8 border-secondary pl-8">
          <p className="text-xl md:text-2xl font-bold text-ink leading-tight">
            透過精準的企劃力與資源整合，協助企業對接政府補助並極大化廣告效益，讓優質品牌在趨勢中穩健成長。
          </p>
        </div>
      </div>
    </section>

    <section className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-1/2 bg-primary p-12 md:p-24 flex flex-col justify-between">
        <h2 className="text-[clamp(4rem,12vw,8rem)] font-black text-white tracking-tighter leading-none mb-12">關於<br/>我們</h2>
        <div className="text-white opacity-20">
          <Building2 size={240} />
        </div>
      </div>
      <div className="w-full md:w-1/2 bg-white p-12 md:p-24 border-b-4 md:border-b-0 md:border-l-4 border-primary">
        <div className="space-y-12">
          <div>
            <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">亨波趨勢：細節的執行者</h3>
            <p className="text-lg leading-relaxed text-muted">
              我們創立於2022年，代表市場上的一股新銳力量。我們摒棄冗餘，回歸本質。讓每一個細節，都經過嚴密的計畫與審核。
            </p>
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
  </motion.div>
);

const ContactView: React.FC = () => {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const json = await res.json();
      setStatus(json.success ? "訊息已成功送出！我們會盡快與您聯繫。" : json.error);
      if (json.success) setFormState({ name: "", email: "", subject: "", message: "" });
    } catch { setStatus("送出失敗，請稍後再試。"); }
    setLoading(false);
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pt-24 min-h-screen brutalist-grid flex items-center justify-center px-8"
    >
      <div className="max-w-4xl w-full bg-white brutalist-border-heavy p-12 md:p-24">
        <h2 className="text-[clamp(3rem,10vw,5rem)] font-black text-primary uppercase tracking-tighter mb-12 leading-none">聯繫<br/>我們</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input 
              required
              placeholder="您的姓名" 
              value={formState.name}
              onChange={(e) => setFormState({...formState, name: e.target.value})}
              className="bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition" 
            />
            <input 
              required
              type="email"
              placeholder="電子郵件" 
              value={formState.email}
              onChange={(e) => setFormState({...formState, email: e.target.value})}
              className="bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition" 
            />
          </div>
          <input 
            required
            placeholder="主旨" 
            value={formState.subject}
            onChange={(e) => setFormState({...formState, subject: e.target.value})}
            className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition" 
          />
          <textarea 
            required
            rows={4}
            placeholder="您的訊息..." 
            value={formState.message}
            onChange={(e) => setFormState({...formState, message: e.target.value})}
            className="w-full bg-surface-low border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition"
          ></textarea>
          <button 
            disabled={loading}
            className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl hover:bg-secondary snap-transition disabled:opacity-50"
          >
            {loading ? "傳送中..." : "立即送出"}
          </button>
          {status && <p className="font-black uppercase text-center tracking-widest text-secondary">{status}</p>}
        </form>
      </div>
    </motion.div>
  );
};

// ========== 改進的 AIView 組件 ==========
const AIView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 自動滾動到最新訊息
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 0);
    }
  }, [messages, shouldAutoScroll]);

  // 監聽滾動位置，判斷是否應該自動滾動
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setMessages([{ 
        role: "ai", 
        content: "您好！我是亨波 AI 助手。很高興為您服務，請問今天有什麼我可以幫您的嗎？",
        id: `msg-${Date.now()}`,
        timestamp: new Date()
      }]);
      setUsername("");
      setPassword("");
    } else {
      setLoginError("帳號或密碼錯誤，請重新輸入。");
    }
  };

  const generateMessageId = () => `msg-${Date.now()}-${Math.random()}`;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const userMessageId = generateMessageId();
    const aiMessageId = generateMessageId();
    
    setInput("");
    setMessages(prev => [...prev, { 
      role: "user", 
      content: userMsg, 
      id: userMessageId,
      timestamp: new Date()
    }]);
    setIsTyping(true);
    setStreamingMessageId(aiMessageId);

    try {
      // 建立 AI 回應的初始訊息
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "", 
        id: aiMessageId,
        timestamp: new Date()
      }]);

      // 使用串流 API 獲取回應
      const response = await genAI.models.generateContentStream({
        model: "gemini-4-31b-it",
        systemInstruction: "你是一位專業的『亨波 AI 助手』。請務必使用『繁體中文』直接回答使用者的問題。提供清晰、簡潔、有幫助的回答。",
        contents: [
          ...messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: [{ text: userMsg }] }
        ],
      });

      let fullText = "";

      // 逐塊接收回應並更新 UI
      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        
        // 更新訊息內容（串流效果）
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullText }
            : msg
        ));
      }

      setStreamingMessageId(null);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      const errorDetail = error?.message || "未知錯誤";
      const errorMessageId = generateMessageId();
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: `抱歉，目前 AI 服務暫時無法回應。請稍後重試。（錯誤代碼：${errorDetail}）`,
        id: errorMessageId,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setStreamingMessageId(null);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("確定要清除所有對話記錄嗎？")) {
      setMessages([{ 
        role: "ai", 
        content: "對話記錄已清除。請問有什麼我可以幫您的嗎？",
        id: generateMessageId(),
        timestamp: new Date()
      }]);
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isLoggedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen flex items-center justify-center bg-surface-low px-8 pt-24"
      >
        <div className="w-full max-w-md bg-white brutalist-border-heavy p-12">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-primary flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">亨波 AI 登入</h2>
            <p className="text-muted font-bold mt-2">請輸入您的帳密以訪問 AI 助手</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-xs text-secondary">帳號</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input 
                  required
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-low border-b-4 border-primary p-4 pl-12 font-bold focus:outline-none focus:border-secondary snap-transition" 
                  placeholder="Username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-xs text-secondary">密碼</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-low border-b-4 border-primary p-4 pl-12 font-bold focus:outline-none focus:border-secondary snap-transition" 
                  placeholder="Password"
                />
              </div>
            </div>

            {loginError && <p className="text-red-600 font-bold text-sm uppercase">{loginError}</p>}

            <button className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl hover:bg-secondary snap-transition">
              進入系統
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pt-24 min-h-screen flex flex-col bg-white"
    >
      <header className="px-8 py-12 border-b-2 border-primary bg-surface-low sticky top-24 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-secondary p-3 text-white">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none">亨波 AI 助手</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-muted uppercase tracking-widest">系統已連線</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleClearChat}
              className="text-primary font-black uppercase tracking-widest border-b-2 border-primary hover:text-secondary hover:border-secondary snap-transition flex items-center gap-2"
              title="清除對話"
            >
              <Trash2 size={20} />
              <span className="hidden sm:inline">清除</span>
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-primary font-black uppercase tracking-widest border-b-2 border-primary hover:text-secondary hover:border-secondary snap-transition"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-hidden flex flex-col max-w-5xl w-full mx-auto px-8 py-12">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto space-y-8 pr-4 custom-scrollbar"
        >
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] py-4 group ${
                msg.role === 'user' 
                  ? 'text-right' 
                  : 'text-left'
              }`}>
                <div className={`flex items-center gap-2 mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">YOU</span>
                      <div className="w-6 h-6 bg-primary text-white flex items-center justify-center">
                        <User size={12} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-secondary text-white flex items-center justify-center">
                        <Sparkles size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">HENGBO AI</span>
                    </>
                  )}
                </div>
                <div className={`inline-block text-lg font-bold leading-relaxed tracking-tight ${
                  msg.role === 'user' ? 'text-primary bg-surface-low rounded px-4 py-2' : 'text-primary'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-content prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto my-2">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-200 px-2 py-1 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          table: ({node, ...props}) => (
                            <table className="border-collapse border border-gray-300 my-2 w-full" {...props} />
                          ),
                          th: ({node, ...props}) => (
                            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="border border-gray-300 px-3 py-2" {...props} />
                          ),
                          a: ({node, ...props}) => (
                            <a className="text-secondary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                
                {/* 複製按鈕 */}
                {msg.role === 'ai' && msg.content && (
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-muted hover:text-primary flex items-center gap-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={14} /> 已複製
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> 複製
                      </>
                    )}
                  </button>
                )}
                
                {msg.role === 'ai' && <div className="w-12 h-1 bg-secondary mt-6 opacity-30" />}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start py-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-secondary/20 flex items-center justify-center animate-pulse">
                  <Sparkles size={12} className="text-secondary" />
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-12 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white brutalist-border-heavy p-8 pr-24 font-bold text-xl focus:outline-none focus:border-secondary snap-transition"
            placeholder="請輸入您的問題..."
            disabled={isTyping}
          />
          <button 
            disabled={isTyping || !input.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white p-4 hover:bg-secondary snap-transition disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </main>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
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
    <div className="min-h-screen">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <AnimatePresence mode="wait">
        {activeTab === "home" && <HomeView key="home" setActiveTab={setActiveTab} />}
        {activeTab === "services" && <ServicesView key="services" setActiveTab={setActiveTab} />}
        {activeTab === "cases" && <CasesView key="cases" setActiveTab={setActiveTab} />}
        {activeTab === "about" && <AboutView key="about" setActiveTab={setActiveTab} />}
        {activeTab === "ai" && <AIView key="ai" />}
        {activeTab === "contact" && <ContactView key="contact" />}

      </AnimatePresence>

      {activeTab !== "ai" && <Footer setActiveTab={setActiveTab} />}

      <AnimatePresence>
        {showScrollTop && activeTab !== "ai" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
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
