import React, { useState, useEffect } from "react";
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
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Components ---

const Logo = ({ className = "w-8 h-8", variant = "default" }: { className?: string, variant?: "default" | "white" }) => (
  <img 
    src="/logo.png" // 請將您的 logo.png 放入 public 資料夾中
    alt="HENGBO TREND Logo"
    className={`inline-block object-contain ${variant === "white" ? "brightness-0 invert" : ""} ${className}`}
    referrerPolicy="no-referrer"
  />
);

const Navbar: React.FC<{ activeTab: string, setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "home", label: "首頁" },
    { id: "services", label: "專業服務" },
    { id: "cases", label: "精選案例" },
    { id: "about", label: "關於我們" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-primary flex justify-between items-center px-8 py-4 max-w-[1920px] mx-auto">
      <div 
        className="flex items-center gap-3 text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer"
        onClick={() => setActiveTab("home")}
      >
        <Logo className="w-10 h-10" />
        HENGBO TREND
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
          <span className="text-4xl font-black block">HENGBO TREND</span>
        </div>
        <p className="font-bold text-sm tracking-widest uppercase opacity-70 max-w-lg">
          © 2026 <Logo className="w-4 h-4 mx-1" variant="white" /> HENGBO TREND. ARCHITECTURAL PRECISION IN MOTION. SHARP EDGES. NO COMPROMISE.
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">Navigation</span>
          <button onClick={() => setActiveTab("about")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">隱私政策</button>
          <button onClick={() => setActiveTab("about")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">使用條款</button>
          <button onClick={() => setActiveTab("contact")} className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">聯繫我們</button>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">Connect</span>
          <a href="#" className="text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">新浪微博</a>
          <a href="#" className="text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest">領英</a>
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
          <h1 className="text-[clamp(4rem,10vw,8rem)] leading-[0.85] font-black text-primary uppercase tracking-tighter mb-12">
            Empowering<br/>
            <span className="text-secondary">Your Future</span>
          </h1>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:ml-[16.6%] bg-primary p-12 relative z-20 border-r-8 border-secondary">
          <p className="text-white text-4xl font-bold tracking-[0.2em] mb-8">助力企業，引領趨勢</p>
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
          <h2 className="text-7xl font-black uppercase tracking-tighter text-primary">Core<br/>Precision</h2>
          <div className="max-w-md text-right">
            <span className="font-black uppercase tracking-[0.3em] text-secondary block mb-4">Service Capabilities</span>
            <p className="font-bold text-muted">We don't just provide services; we engineer market dominance through architectural precision and data-driven planning.</p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-8 group bg-white brutalist-border p-12 hover:bg-primary hover:text-white snap-transition relative overflow-hidden">
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-20 snap-transition">
              <FileText size={240} />
            </div>
            <span className="text-secondary font-black text-2xl mb-8 block">01</span>
            <h3 className="text-5xl font-black mb-6 uppercase">企劃撰寫</h3>
            <p className="text-xl max-w-xl font-medium mb-8">Strategic documentation that secures investment and defines operational roadmaps with surgical accuracy.</p>
            <div className="w-16 h-2 bg-secondary"></div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-secondary p-12 text-white brutalist-border border-secondary relative">
            <span className="text-white/50 font-black text-2xl mb-8 block">02</span>
            <h3 className="text-4xl font-black mb-6 uppercase">補助申請</h3>
            <Rocket size={80} className="mb-8" />
            <p className="font-bold">Navigating regulatory landscapes to capture governmental growth opportunities.</p>
          </div>
          <div className="col-span-12 md:col-span-5 bg-white brutalist-border p-12 flex flex-col justify-between">
            <div>
              <span className="text-secondary font-black text-2xl mb-8 block">03</span>
              <h3 className="text-4xl font-black mb-6 uppercase">名片設計</h3>
              <p className="font-bold text-muted">Physical manifestations of corporate identity. Minimalist. Bold. Unforgettable.</p>
            </div>
            <div className="mt-12 flex items-center justify-center border-t-2 border-surface-container pt-12">
              <BadgeCheck size={120} className="text-primary" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 bg-primary text-white p-12 brutalist-border border-primary overflow-hidden relative">
            <div className="flex justify-between items-start">
              <div className="relative z-10">
                <span className="text-secondary font-black text-2xl mb-8 block">04</span>
                <h3 className="text-6xl font-black mb-6 uppercase leading-none">廣告<br/>投放</h3>
                <p className="text-xl max-w-sm opacity-80">High-impact distribution strategies using behavioral intelligence to disrupt market share.</p>
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
        <p className="font-black text-secondary tracking-[0.5em] mb-8 uppercase">Architecture in Motion</p>
        <blockquote className="text-[clamp(2.5rem,5vw,5rem)] font-black leading-tight text-primary uppercase italic">
          "WE DO NOT ADAPT TO THE FUTURE.<br/>
          WE <span className="text-secondary not-italic underline decoration-8 underline-offset-8">ARCHITECT</span> IT."
        </blockquote>
      </div>
    </section>

    {/* CTA */}
    <section className="px-8 py-0">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-0 brutalist-border">
        <div className="col-span-12 md:col-span-8 p-16 bg-surface-high">
          <h2 className="text-5xl font-black text-primary mb-8 uppercase">Ready for<br/>Transition?</h2>
          <p className="text-xl font-bold text-muted mb-12 max-w-lg">Our consultants are ready to deploy professional strategies for your next market expansion.</p>
          <div className="flex flex-col sm:flex-row gap-6">
            <input 
              className="bg-transparent border-b-4 border-primary p-4 font-black uppercase tracking-widest focus:outline-none focus:border-secondary w-full sm:w-80" 
              placeholder="YOUR@IDENTITY.COM" 
              type="email"
              value={ctaEmail}
              onChange={(e) => setCtaEmail(e.target.value)}
            />
            <button 
              onClick={handleSubscribe}
              disabled={ctaLoading}
              className={`bg-secondary text-white px-12 py-4 font-black uppercase tracking-widest hover:bg-primary snap-transition ${ctaLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {ctaLoading ? '提交中...' : 'Submit'}
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
        <h1 className="text-7xl md:text-9xl font-black text-primary leading-none tracking-tighter">
          SERVICES<br/><span className="text-secondary">ELITE</span>
        </h1>
      </div>
      <div className="max-w-2xl mt-8">
        <p className="text-xl font-bold text-muted border-l-8 border-primary pl-6">
          ARCHITECTURAL PRECISION IN BUSINESS GROWTH. WE DO NOT DECORATE; WE CONSTRUCT.
        </p>
      </div>
    </header>

    {[
      {
        id: "01",
        title: "企劃撰寫",
        icon: <FileText size={120} />,
        desc: "STRATEGIC DOCUMENTATION FOR MARKET DOMINANCE.",
        items: [
          { t: "品牌營運企劃", d: "深入市場洞察，構建具備高度執行力的商業運作藍圖。" },
          { t: "行銷活動策劃", d: "精準受眾分析，打造引爆市場討論度的病毒式傳播方案。" },
          { t: "融資計畫撰寫", d: "邏輯嚴密的財務預測與價值主張，吸引資本青睞。" },
          { t: "投標建議書", d: "專業技術規格與管理方案整合，提升競標勝率。" }
        ]
      },
      {
        id: "02",
        title: "補助申請",
        icon: <Rocket size={120} />,
        desc: "CAPITAL ACQUISITION THROUGH POLICY ALIGNMENT.",
        items: [
          { t: "SBIR/SIIR 專案", d: "中小企業創新研發補助，從技術到服務的全面合規申請。" },
          { t: "國發基金申請", d: "對接國家發展戰略，爭取高額股權投資或低利貸款。" },
          { t: "創業補助諮詢", d: "新創基地與天使投資媒合，降低初期創業風險與成本。" },
          { t: "研發抵減方案", d: "稅務合規優化，將研發投入轉化為實際的現金流優勢。" }
        ]
      },
      {
        id: "03",
        title: "名片設計",
        icon: <BadgeCheck size={120} />,
        desc: "IDENTITY ENCAPSULATED IN GEOMETRY.",
        items: [
          { t: "極簡主義名片", d: "剔除雜訊，僅保留最核心的品牌價值與專業度傳遞。" },
          { t: "工藝複合材質", d: "觸覺與視覺的雙重衝擊，提升初次見面的權威感。" },
          { t: "數位名片整合", d: "實體卡片結合 NFC/QR 技術，實現無縫社交與數據追蹤。" },
          { t: "品牌視覺延伸", d: "確保名片作為品牌第一線媒介，與企業識別系統完美契合。" }
        ]
      },
      {
        id: "04",
        title: "廣告投放",
        icon: <TrendingUp size={120} />,
        desc: "ALGORITHMIC PRECISION FOR CONVERSION.",
        items: [
          { t: "多平台矩陣投放", d: "Meta, Google, LinkedIn 跨平台聯動，覆蓋全網受眾。" },
          { t: "精準受眾建模", d: "利用大數據進行 Lookalike 建模，鎖定高價值潛在客戶。" },
          { t: "動態素材優化", d: "A/B Testing 持續測試，確保每一分廣告預算都轉化為效益。" },
          { t: "數據追蹤報告", d: "透明化的 ROI 分析，數據驅動決策，優化行銷閉環。" }
        ]
      }
    ].map((section, idx) => (
      <section key={section.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-0 relative group ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
        <div className={`lg:col-span-4 flex flex-col justify-start ${idx % 2 !== 0 ? 'lg:order-2 lg:items-end text-right' : ''}`}>
          <span className="text-[12rem] font-black leading-none text-secondary opacity-20 lg:opacity-100 snap-transition">{section.id}</span>
          <h2 className="text-5xl font-black text-primary -mt-20 relative z-10">{section.title}</h2>
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

    <section className="bg-primary py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-[12rem] md:text-[20rem] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">STRATEGY</h2>
        <h3 className="text-7xl md:text-9xl font-black text-white mb-12 tracking-tighter relative z-10 uppercase">Ready?</h3>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveTab("contact")}
            className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
          >
            GET IN TOUCH
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
      <h1 className="text-[12vw] md:text-[15vw] leading-[0.85] font-black text-primary tracking-tighter uppercase mb-4">
        SUCCESS<br/>STORIES
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-end border-t-4 border-primary pt-8">
        <p className="max-w-2xl text-xl font-bold uppercase tracking-tight">
          Architectural precision in visual storytelling. Transforming complex data into kinetic brand experiences.
        </p>
        <span className="text-secondary font-black text-6xl md:text-8xl">/012</span>
      </div>
    </section>

    <section className="px-4 md:px-8">
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        <div className="col-span-12 md:col-span-7 bg-surface-high brutalist-border group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-start">
            <Building2 size={120} className="group-hover:text-secondary snap-transition" />
            <div className="text-right">
              <div className="font-black tracking-widest uppercase mb-2 text-xs">Service: Structural Design</div>
              <div className="font-black tracking-widest uppercase text-xs">Year: 2024</div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">Metropolis Core Rebranding</h2>
            <div className="w-16 h-2 bg-secondary group-hover:bg-white snap-transition"></div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 bg-secondary brutalist-border border-primary group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-start text-white group-hover:text-primary">
            <Rocket size={120} className="group-hover:text-secondary snap-transition" />
            <div className="text-right">
              <div className="font-black tracking-widest uppercase text-xs">Service: Brand Launch</div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white group-hover:text-primary leading-none">Apex Venture Systems</h2>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-primary text-white brutalist-border group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px]">
          <div>
            <Network size={80} className="mb-8" />
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Digital Infrastructure Mapping</h2>
          </div>
          <p className="font-bold uppercase tracking-widest text-sm opacity-60 group-hover:opacity-100">Click to Expand Case Study</p>
        </div>

        <div className="col-span-12 md:col-span-8 bg-surface-low brutalist-border group cursor-pointer snap-transition hover:bg-secondary hover:text-white p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-10%] w-[400px] h-[400px] bg-primary opacity-5 group-hover:opacity-20 rotate-45 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row gap-8 z-10">
            <Layout size={120} />
            <div>
              <div className="font-black tracking-widest uppercase mb-4 text-secondary group-hover:text-white">Award Winning Project</div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight">Green Horizon 2030</h2>
              <p className="mt-4 max-w-md font-bold text-lg uppercase">Sustainable urban planning and visual identity for the future of city living.</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-tertiary text-white brutalist-border group cursor-pointer snap-transition hover:bg-primary p-8 flex flex-col justify-between min-h-[400px]">
          <Cpu size={80} />
          <h2 className="text-4xl font-black uppercase tracking-tighter">Precision Industrial Logic</h2>
        </div>

        <div className="col-span-12 md:col-span-6 brutalist-border group cursor-pointer p-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden bg-white">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between">
              <Eye size={80} className="text-primary" />
              <span className="text-secondary font-black text-3xl">NEW</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-primary">Immersive Retail Environments</h2>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-primary py-40 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-[12rem] md:text-[20rem] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">SUCCESS</h2>
        <h3 className="text-7xl md:text-9xl font-black text-white mb-12 tracking-tighter relative z-10 uppercase">Ready?</h3>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveTab("contact")}
            className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
          >
            GET IN TOUCH
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
        <div className="font-black uppercase tracking-[0.4em] text-secondary mb-4">OUR PHILOSOPHY</div>
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none text-primary uppercase relative">
          我們的使命<br/>
          <span className="text-stroke">與願景</span>
          <div className="absolute -top-12 -left-8 opacity-5 pointer-events-none select-none">
            <Logo className="w-[12rem] h-[12rem]" />
          </div>
        </h1>
        <div className="mt-12 max-w-2xl border-l-8 border-secondary pl-8">
          <p className="text-xl md:text-2xl font-bold text-ink leading-tight">
            超越建築的界限，用精確的動態美學重塑城市天際線。我們不僅是設計者，更是未來空間的策劃者。
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-24"></div>
    </section>

    <section className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="w-full md:w-1/2 bg-primary p-12 md:p-24 flex flex-col justify-between">
        <div>
          <h2 className="text-8xl font-black text-white tracking-tighter leading-none mb-12">ABOUT<br/>US</h2>
          <div className="w-24 h-2 bg-secondary mb-8"></div>
        </div>
        <div className="text-white opacity-20">
          <Building2 size={240} />
        </div>
      </div>
      <div className="w-full md:w-1/2 bg-white p-12 md:p-24 border-b-4 md:border-b-0 md:border-l-4 border-primary">
        <div className="space-y-12">
          <div>
            <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">亨波趨勢：精準的執行者</h3>
            <p className="text-lg leading-relaxed text-muted">
              創立於2022年，<Logo className="w-5 h-5 mx-1" />HENGBO TREND 代表了一股新銳力量。我們屏棄冗餘，回歸本質。每一個細節，都經過嚴密的計算與審核。
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-primary uppercase mb-6 tracking-tight">創新與卓越</h3>
            <p className="text-lg leading-relaxed text-muted">
              在快速變遷的環境中，我們專注提供高品質、高效能的解決方案，協助客戶精準撰寫企劃與計畫書，並順利申請各項政府與企業補助資源，同時透過專業的數位廣告投放與高品質網頁設計，幫助品牌有效曝光，提升市場競爭力。
            </p>
            </div>
          <div className="grid grid-cols-2 gap-8 pt-12">
            <div className="border-t-4 border-primary pt-4">
              <div className="text-4xl font-black text-secondary">50+</div>
              <div className="font-bold uppercase tracking-widest text-xs mt-2">大型專案項目</div>
            </div>
            <div className="border-t-4 border-primary pt-4">
              <div className="text-4xl font-black text-secondary">12</div>
              <div className="font-bold uppercase tracking-widest text-xs mt-2">國際設計獎項</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="px-8 py-32 bg-surface-high">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-primary uppercase mb-24 text-center tracking-tighter underline decoration-secondary decoration-8 underline-offset-8">Growth Strategy</h2>
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
        <h2 className="text-[12rem] md:text-[20rem] font-black text-white leading-none tracking-tighter mb-4 opacity-10 absolute pointer-events-none">READY?</h2>
        <h3 className="text-7xl md:text-9xl font-black text-white mb-12 tracking-tighter relative z-10 uppercase">Ready?</h3>
        <div className="relative z-10">
          <button 
            onClick={() => setActiveTab("contact")}
            className="bg-secondary text-white text-2xl font-black px-16 py-6 hover:bg-white hover:text-primary snap-transition flex items-center gap-4"
          >
            GET IN TOUCH
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
              <h1 className="text-8xl font-black text-primary uppercase tracking-tighter leading-none mb-12">
                聯繫<br/><span className="text-secondary">我們</span>
              </h1>
              <p className="text-xl font-bold text-muted mb-16 border-l-8 border-primary pl-6 uppercase tracking-tight">
                為您的企業轉型部署建築級解決方案。
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
                              className="w-full bg-white border-b-4 border-primary p-4 font-bold focus:outline-none focus:border-secondary snap-transition appearance-none"
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
                      <p className="text-xl font-bold text-muted max-w-md uppercase">我們已收到您的諮詢申請，我們的策略專家將在 24 小時內與您聯繫。</p>
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

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <AnimatePresence mode="wait">
        {activeTab === "home" && <HomeView key="home" setActiveTab={setActiveTab} />}
        {activeTab === "services" && <ServicesView key="services" setActiveTab={setActiveTab} />}
        {activeTab === "cases" && <CasesView key="cases" setActiveTab={setActiveTab} />}
        {activeTab === "about" && <AboutView key="about" setActiveTab={setActiveTab} />}
        {activeTab === "contact" && <ContactView key="contact" />}

      </AnimatePresence>

      <Footer setActiveTab={setActiveTab} />

      <AnimatePresence>
        {showScrollTop && (
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
