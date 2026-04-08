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
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenerativeAI } from "@google/genai";

// --- Constants ---
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || (process.env.GEMINI_API_KEY as string) || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
              <BadgeCheck size={120} className="text-primary" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 bg-primary text-white p-12 brutalist-border border-primary overflow-hidden relative">
            <div className="flex justify-between items-start">
              <div className="relative z-10">
                <span className="text-secondary font-black text-2xl mb-8 block">04</span>
                <h3 className="text-[clamp(2.5rem,8vw,3.75rem)] font-black mb-6 uppercase leading-none">廣告<br/>投放</h3>
                <p className="text-xl max-w-sm opacity-80">每一分錢都花在刀口上，數據說話的精準行銷。</p>
              </div>
              <div className="hidden lg:block rotate-12 opacity-30">
                <TrendingUp size={300} />
              </div>
            </div>
            <div className="mt-12 grid grid-cols-4 gap-2">
              <div className="h-1 bg-secondary w-full"></div>
              <div className="h-1 bg-secondary w-full opacity-50"></div>
              <div className="h-1 bg-secondary w-full opacity-25"></div>
              <div className="h-1 bg-secondary w-full opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Quote */}
    <section className="px-8 py-32 bg-white">
      <div className="max-w-7xl mx-auto border-l-8 border-primary pl-12">
        <p className="font-black text-secondary tracking-[0.5em] mb-8 uppercase">行動中的架構美學</p>
        <blockquote className="text-[clamp(2rem,6vw,5rem)] font-black leading-tight text-primary uppercase italic">
          "我們不只是適應未來。<br/>
          我們 <span className="text-secondary not-italic underline decoration-8 underline-offset-8">築造</span> 它。"
        </blockquote>
      </div>
    </section>

    {/* Newsletter */}
    <section className="px-8 py-32 bg-surface-low border-y-2 border-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="col-span-8 bg-white brutalist-border-heavy p-12 md:p-24">
          <h2 className="text-[clamp(2.5rem,8vw,3.75rem)] font-black text-primary uppercase mb-8 tracking-tighter">掌握趨勢</h2>
          <p className="text-xl font-bold text-muted mb-12 max-w-md">訂閱我們的電子報，第一時間獲取最新的市場洞察與補助政策資訊。</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="您的電子郵件" 
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
              className="flex-grow bg-surface-low border-b-4 border-primary p-6 font-bold focus:outline-none focus:border-secondary snap-transition"
            />
            <button 
              onClick={handleSubscribe}
              disabled={ctaLoading}
              className="bg-primary text-white px-12 py-6 font-black uppercase tracking-widest hover:bg-secondary snap-transition"
            >
              {ctaLoading ? "處理中..." : "立即訂閱"}
            </button>
          </div>
          {ctaMsg && <p className="mt-4 font-bold text-secondary text-sm uppercase tracking-widest">{ctaMsg}</p>}
        </div>
        <div className="hidden md:flex col-span-4 bg-primary items-center justify-center overflow-hidden">
          <TrendingUp size={200} className="text-white/10 -rotate-12" />
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
    className="pt-24 px-8 max-w-7xl mx-auto space-y-32 pb-32"
  >
    <header className="py-12">
      <div className="relative inline-block mb-4">
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-secondary opacity-20 -z-10"></div>
        <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black text-primary leading-none tracking-tighter">
          核心<br/><span className="text-secondary">服務</span>
        </h1>
      </div>
      <div className="max-w-2xl mt-8">
        <p className="text-xl font-bold text-muted border-l-8 border-primary pl-6">
          我們不只是裝飾品牌，我們是在構築成長。每一項決策都具備建築師般的嚴謹與精確。
        </p>
      </div>
    </header>

    {[
      {
        id: "01",
        title: "企劃撰寫",
        icon: <FileText size={120} />,
        desc: "從市場洞察到可執行藍圖，一份讓投資人與團隊都買單的企劃。",
        items: [
          { t: "為何需要", d: "許多企業有好想法，卻卡在「寫不出讓人看懂、願意投資的計畫」。" },
          { t: "我們如何做", d: "產業分析、SWOT、競爭者 benchmarking、財務預測、執行 roadmap。" },
          { t: "量化成果", d: "已協助 50+ 家企業成功申請補助 / 獲得融資 / 內部團隊對齊。" },
          { t: "投標建議書", d: "專業技術規格與管理方案整合，提升競標勝率。" }
        ]
      },
      {
        id: "02",
        title: "補助申請",
        icon: <Rocket size={120} />,
        desc: "精準對接政府資源，幫企業省錢又加速成長。",
        items: [
          { t: "涵蓋補助", d: "SBIR、SIIR、A+ 創新研發、淨零轉型、數位轉型、地方創生等。" },
          { t: "成功率提升", d: "熟悉審核重點、文件準備、報告撰寫，大幅降低退件風險。" },
          { t: "案例數據", d: "過去協助客戶平均獲得 45 萬元補助，最高單件突破 200 萬。" },
          { t: "研發抵減", d: "稅務合規優化，將研發投入轉化為實際的現金流優勢。" }
        ]
      },
      {
        id: "03",
        title: "品牌設計",
        icon: <BadgeCheck size={120} />,
        desc: "讓品牌不只被看到，更被記住與喜愛。",
        items: [
          { t: "視覺識別 (CIS)", d: "Logo、標準字、配色系統，建立統一且專業的品牌形象。" },
          { t: "應用系統", d: "名片、包裝、網站、實體空間視覺整合，強化觸點體驗。" },
          { t: "品牌故事", d: "將品牌靈魂轉化為視覺語彙。簡潔、大膽、令人難忘。" },
          { t: "轉化銷售力", d: "透過設計提升溢價空間與客戶信任度，直接驅動業務成長。" }
        ]
      },
      {
        id: "04",
        title: "廣告投放",
        icon: <TrendingUp size={120} />,
        desc: "每一分錢都花在刀口上，數據說話的精準行銷。",
        items: [
          { t: "多平台矩陣", d: "Google / Meta / TikTok / LINE 等平台全方位投放策略。" },
          { t: "數據建模", d: "受眾建模、A/B 測試、ROI 追蹤，確保廣告投放精準度。" },
          { t: "整合行銷", d: "結合品牌設計與企劃內容，打造高轉化的行銷漏斗。" },
          { t: "數據報告", d: "透明化的 ROI 分析，數據驅動決策，優化行銷閉環。" }
        ]
      },
      {
        id: "05",
        title: "擴展服務",
        icon: <BarChart3 size={120} />,
        desc: "全方位商業諮詢，助力企業數位與綠色轉型。",
        items: [
          { t: "市場趨勢調研", d: "深入挖掘潛在商機，為企業提供前瞻性的決策依據。" },
          { t: "數位轉型顧問", d: "從流程優化到工具導入，協助企業完成數位化升級。" },
          { t: "ESG 永續策略", d: "規劃淨零轉型路徑，對接國際供應鏈綠色要求。" },
          { t: "地方創生規劃", d: "結合在地特色與商業邏輯，打造可持續發展的地域品牌。" }
        ]
      }
    ].map((section, idx) => (
      <section key={section.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-0 relative group ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
        <div className={`lg:col-span-4 flex flex-col justify-start ${idx % 2 !== 0 ? 'lg:order-2 lg:items-end text-right' : ''}`}>
          <span className="text-[clamp(6rem,15vw,12rem)] font-black leading-none text-secondary opacity-20 lg:opacity-100 snap-transition">{section.id}</span>
          <h2 className="text-[clamp(2.5rem,8vw,3rem)] font-black text-primary -mt-12 lg:-mt-20 relative z-10">{section.title}</h2>
          <div className="mt-8 text-muted">
            {section.icon}
          </div>
        </div>
        <div className={`lg:col-span-8 bg-white brutalist-border-heavy p-12 mt-12 lg:mt-0 relative overflow-hidden ${idx % 2 !== 0 ? 'lg:order-1' : ''}`}>
          <div className="space-y-8 relative z-10">
            <p className="text-2xl font-bold tracking-tight text-primary uppercase">{section.desc}</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-4 h-4 bg-secondary mt-2 shrink-0"></span>
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-widest text-primary">{item.t}</h4>
                    <p className="text-muted mt-2">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ))}

    {/* FAQ Section */}
    <section className="bg-surface-low p-12 md:p-24 brutalist-border-heavy">
      <h2 className="text-5xl font-black text-primary uppercase mb-16 tracking-tighter text-center">常見問題 FAQ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {[
          { q: "補助申請需要多久？", a: "視計畫類別而定，通常從送件到審核通過約需 3-6 個月，我們會全程追蹤進度。" },
          { q: "費用如何計算？", a: "我們採取「顧問費 + 成功報酬」的靈活模式，確保雙方目標一致。" },
          { q: "可以只做單一服務嗎？", a: "當然可以。無論是單純的企劃撰寫或品牌設計，我們都能提供專業支援。" },
          { q: "補助申請保證成功嗎？", a: "我們無法保證 100% 成功，但透過我們的專業輔導，過件率通常可提升 80% 以上。" }
        ].map((faq, i) => (
          <div key={i} className="bg-white p-8 brutalist-border hover:border-secondary snap-transition">
            <h4 className="font-black text-xl text-primary mb-4 flex items-center gap-2">
              <HelpCircle className="text-secondary" /> {faq.q}
            </h4>
            <p className="text-muted font-bold">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-primary py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-[clamp(5rem,20vw,20rem)] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">GO!</h2>
        <h3 className="text-[clamp(3rem,12vw,6rem)] font-black text-white mb-12 tracking-tighter relative z-10 uppercase">準備好了嗎？</h3>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveTab("contact")}
            className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
          >
            立即開始
            <ArrowRight size={32} />
          </button>
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
    className="pt-24 pb-32"
  >
    <section className="px-8 py-16 md:py-32">
      <h1 className="text-[clamp(4rem,15vw,12rem)] leading-[0.85] font-black text-primary tracking-tighter uppercase mb-4">
        精選<br/>案例
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-end border-t-4 border-primary pt-8">
        <p className="max-w-2xl text-xl font-bold uppercase tracking-tight">
          我們將複雜的數據轉化為具備生命力的品牌體驗，在每一個細節中追求極致。
        </p>
        <span className="text-secondary font-black text-[clamp(4rem,10vw,8rem)]">/05</span>
      </div>
    </section>

    <section className="px-4 md:px-8">
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        {/* Case 1 */}
        <div className="col-span-12 md:col-span-7 bg-surface-high brutalist-border group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-start">
            <Building2 size={120} className="group-hover:text-secondary snap-transition" />
            <div className="text-right">
              <div className="font-black tracking-widest uppercase mb-2 text-xs">產業: 台灣中部製造業</div>
              <div className="font-black tracking-widest uppercase text-xs">服務: 補助申請與轉型顧問</div>
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(2rem,6vw,3.75rem)] font-black uppercase tracking-tighter leading-none mb-4">傳統機械廠數位升級</h2>
            <p className="font-bold mb-4 opacity-0 group-hover:opacity-100 snap-transition">量化成果：補助申請成功，獲得 50 萬元，生產效率提升 30%。</p>
            <div className="w-16 h-2 bg-secondary group-hover:bg-white snap-transition"></div>
          </div>
        </div>

        {/* Case 2 */}
        <div className="col-span-12 md:col-span-5 bg-secondary brutalist-border border-primary group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-start text-white group-hover:text-primary">
            <Rocket size={120} className="group-hover:text-secondary snap-transition" />
            <div className="text-right">
              <div className="font-black tracking-widest uppercase text-xs">產業: 新創美妝品牌</div>
              <div className="font-black tracking-widest uppercase text-xs">服務: 品牌設計與廣告投放</div>
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-black uppercase tracking-tighter text-white group-hover:text-primary leading-none">DTC 品牌全球化策略</h2>
            <p className="font-bold mb-4 text-white group-hover:text-primary opacity-0 group-hover:opacity-100 snap-transition">量化成果：廣告 ROI 從 1.2 提升至 4.8，品牌認知度提升 65%。</p>
          </div>
        </div>

        {/* Case 3 */}
        <div className="col-span-12 md:col-span-4 bg-primary text-white brutalist-border group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px]">
          <div>
            <Network size={80} className="mb-8" />
            <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter leading-none">連鎖餐飲集團 ESG 規劃</h2>
            <p className="mt-4 font-bold opacity-60 group-hover:opacity-100">量化成果：成功對接政府淨零轉型補助，獲取 80 萬元資助。</p>
          </div>
          <p className="font-bold uppercase tracking-widest text-sm opacity-60 group-hover:opacity-100">「專業且精準，讓我們在轉型路上少走許多冤枉路。」</p>
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

        {/* Case 5 */}
        <div className="col-span-12 md:col-span-12 brutalist-border group cursor-pointer p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden bg-white hover:bg-primary hover:text-white snap-transition">
          <div className="relative z-10 flex flex-col md:flex-row h-full justify-between items-center">
            <div className="flex items-center gap-8">
              <Globe size={80} className="text-secondary" />
              <div>
                <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-black uppercase tracking-tighter">跨境電商整合行銷</h2>
                <p className="font-bold mt-2">量化成果：單月業績突破 300 萬，獲取客戶成本降低 40%。</p>
              </div>
            </div>
            <span className="text-secondary font-black text-3xl mt-8 md:mt-0">ROI 5.5x</span>
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
        </div>
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
          <div>
            <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">創新與卓越</h3>
            <p className="text-lg leading-relaxed text-muted">
              在快速變遷的環境中，我們專注提供高品質、高效能的解決方案，協助客戶精準撰寫企劃與計畫書，並順利申請各項政府與企業補助資源，同時透過專業的數位廣告投放與高品質品牌設計，幫助品牌有效曝光，提升市場競爭力。
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
              <div className={`w-full md:w-1/2 ${item.side === 'left' ? 'md:pr-16 text-right order-2 md:order-1' : 'order-2 md:order-1'}`}>
                {item.side === 'left' && (
                  <div className="bg-primary text-white p-8 inline-block w-full text-left md:text-right border-b-8 border-secondary">
                    <h4 className="text-2xl font-black mb-2">{item.title}</h4>
                    <p className="opacity-80">{item.desc}</p>
                  </div>
                )}
              </div>
              <div className={`z-10 bg-secondary text-white w-24 h-24 flex items-center justify-center font-black text-2xl order-1 md:order-2 mb-8 md:mb-0 ${item.side === 'right' ? 'bg-primary' : ''}`}>
                {item.year}
              </div>
              <div className={`w-full md:w-1/2 ${item.side === 'right' ? 'md:pl-16 order-3' : 'order-3'}`}>
                {item.side === 'right' && (
                  <div className="bg-white brutalist-border-heavy p-8 inline-block w-full border-b-8 border-secondary">
                    <h4 className="text-2xl font-black text-primary mb-2">{item.title}</h4>
                    <p className="text-muted">{item.desc}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-primary py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-[clamp(5rem,20vw,20rem)] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">GO!</h2>
        <h3 className="text-[clamp(3rem,12vw,6rem)] font-black text-white mb-12 tracking-tighter relative z-10 uppercase">準備好了嗎？</h3>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveTab("contact")}
            className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
          >
            立即開始
            <ArrowRight size={32} />
          </button>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          organization: formState.org,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsSubmitted(true);
        setFormState({ name: "", org: "", email: "", subject: "企劃撰寫諮詢", message: "" });
      } else {
        setSubmitError(json.error || "提交失敗，請稍後再試");
      }
    } catch {
      setSubmitError("無法連接伺服器，請檢查網絡連接");
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-24 pb-32"
    >
      <section className="px-8 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <h1 className="text-[clamp(4rem,12vw,8rem)] font-black text-primary uppercase tracking-tighter leading-none mb-12">
                聯繫<br/><span className="text-secondary">我們</span>
              </h1>
              <p className="text-xl font-bold text-muted mb-16 border-l-8 border-primary pl-6 uppercase tracking-tight">
                為您的企業提供 world-class 的解決方案。
              </p>

              <div className="space-y-12">
                <div className="flex items-start gap-6 group">
                  <div className="bg-primary p-4 text-white group-hover:bg-secondary snap-transition">
                    <Phone size={32} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-secondary mb-2">直連電話</h3>
                    <p className="text-xl font-bold text-primary">+886-0966-748-817</p>
                    <p className="text-muted font-medium">週一至週五：09:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="bg-primary p-4 text-white group-hover:bg-secondary snap-transition">
                    <Mail size={32} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-secondary mb-2">電子郵件</h3>
                    <p className="text-xl font-bold text-primary">tvivl.tw@gmail.com</p>
                    <p className="text-muted font-medium">24/7 全天候運營支持</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-surface-low brutalist-border-heavy p-12 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <h2 className="text-4xl font-black text-primary uppercase mb-12 tracking-tight">諮詢申請</h2>
                      <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="font-black uppercase tracking-widest text-xs text-secondary">姓名</label>
                            <input 
                              required
                              type="text" 
                              value={formState.name}
                              onChange={(e) => setFormState({...formState, name: e.target.value})}
                              className="w-full bg-white border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition" 
                              placeholder="您的姓名"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-black uppercase tracking-widest text-xs text-secondary">公司/機構</label>
                            <input 
                              type="text" 
                              value={formState.org}
                              onChange={(e) => setFormState({...formState, org: e.target.value})}
                              className="w-full bg-white border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition" 
                              placeholder="您的公司名稱"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="font-black uppercase tracking-widest text-xs text-secondary">電子郵件地址</label>
                            <input 
                              required
                              type="email" 
                              value={formState.email}
                              onChange={(e) => setFormState({...formState, email: e.target.value})}
                              className="w-full bg-white border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition" 
                              placeholder="您的電子郵件"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-black uppercase tracking-widest text-xs text-secondary">諮詢主題</label>
                            <select 
                              value={formState.subject}
                              onChange={(e) => setFormState({...formState, subject: e.target.value})}
                              className="w-full bg-white border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition"
                            >
                              <option>企劃撰寫諮詢</option>
                              <option>補助申請專案</option>
                              <option>品牌識別設計</option>
                              <option>廣告投放優化</option>
                              <option>其他合作提案</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="font-black uppercase tracking-widest text-xs text-secondary">訊息內容</label>
                          <textarea 
                            required
                            rows={6}
                            value={formState.message}
                            onChange={(e) => setFormState({...formState, message: e.target.value})}
                            className="w-full bg-white border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition resize-none" 
                            placeholder="請描述您的需求與目標..."
                          ></textarea>
                        </div>

                        <button 
                          disabled={isSubmitting}
                          className={`w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl hover:bg-secondary snap-transition flex items-center justify-center gap-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? "傳輸中..." : "發送訊息"}
                          <Send size={24} className={isSubmitting ? "animate-pulse" : ""} />
                        </button>
                        {submitError && <p className="mt-4 text-red-600 font-bold text-sm uppercase tracking-widest bg-red-50 p-4 border-l-4 border-red-500">{submitError}</p>}
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-24 text-center"
                    >
                      <div className="w-24 h-24 bg-secondary text-white flex items-center justify-center mb-8">
                        <BadgeCheck size={64} />
                      </div>
                      <h2 className="text-5xl font-black text-primary uppercase mb-4 tracking-tighter">訊息發送成功</h2>
                      <p className="text-xl font-bold text-muted max-w-md uppercase">我們已收到您的諮詢申請，我們的業務專員將在 24 小時內與您聯繫。</p>
                      <button 
                        onClick={() => setIsSubmitted(false)}
                        className="mt-12 text-secondary font-black uppercase tracking-widest border-b-4 border-secondary hover:text-primary hover:border-primary snap-transition"
                      >
                        再次發送訊息
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const AIView: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 帳號密碼驗證邏輯
    if (username === "admin" && password === "hengbo2026") {
      setIsLoggedIn(true);
      setMessages([{ role: "ai", content: "您好！我是亨波 AI 助手。很高興為您服務，請問今天有什麼我可以幫您的嗎？" }]);
    } else {
      setLoginError("帳號或密碼錯誤，請重新輸入。");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      });

      const result = await chat.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: "ai", content: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "抱歉，目前 AI 服務暫時無法回應。請檢查 API Key 配置或稍後再試。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen flex items-center justify-center bg-surface-low px-8"
      >
        <div className="w-full max-w-md bg-white brutalist-border-heavy p-12">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-primary flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">亨波 AI 登入</h2>
            <p className="text-muted font-bold mt-2">請輸入您的憑據以訪問 AI 助手</p>
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
      <header className="px-8 py-12 border-b-2 border-primary bg-surface-low">
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
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="text-primary font-black uppercase tracking-widest border-b-2 border-primary hover:text-secondary hover:border-secondary snap-transition"
          >
            登出
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-hidden flex flex-col max-w-5xl w-full mx-auto px-8 py-12">
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto space-y-8 pr-4 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-6 brutalist-border ${
                msg.role === 'user' 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-surface-low text-primary border-primary'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} className="text-secondary" />}
                  <span className="text-xs font-black uppercase tracking-widest">
                    {msg.role === 'user' ? 'You' : 'Hengbo AI'}
                  </span>
                </div>
                <p className="font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-surface-low p-6 brutalist-border border-primary">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-secondary animate-bounce"></div>
                  <div className="w-2 h-2 bg-secondary animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-secondary animate-bounce [animation-delay:0.4s]"></div>
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
