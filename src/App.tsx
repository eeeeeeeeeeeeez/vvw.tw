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
 role: "user"| "ai";
 content: string;
 id: string;
 timestamp: Date;
 imageUrl?: string;
}

interface SessionDocument {
 name: string;
 content: string;
 type: string;
}

interface ChatSession {
 id: string;
 title: string;
 messages: Message[];
 lastUpdated: Date;
 // 此對話中曾上傳過的「文字類」檔案（PDF/Word/純文字），會持續存在於對話上下文中，
 // 不會因為只有第一輪的 prompt 帶到而在後續追問時「被遺忘」。圖片檔不放這裡（見下方說明）。
 documents?: SessionDocument[];
}

// --- Components ---

const Logo = ({ className = "w-8 h-8", variant = "default"}: { className?: string, variant?: "default"| "white"}) => (
 <img 
 src="/logo.png"
 alt="HENGBO TREND Logo"
 className={`inline-block object-contain ${variant === "white"? "brightness-0 invert": ""} ${className}`}
 referrerPolicy="no-referrer"
 />
);

const LoadingScreen = () => (
 <motion.div 
 initial={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.8, ease: "easeInOut"}}
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
 <Logo className="w-24 h-24" variant="white"/>
 </motion.div>
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: 200 }}
 transition={{ duration: 1.5, ease: "easeInOut"}}
 className="h-1 bg-secondary"
 />
 <span className="text-white font-semibold tracking-[0.5em] mt-4 text-sm">HENGBO TREND</span>
 </motion.div>
);

const Navbar: React.FC<{ activeTab: string, setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
 const [isOpen, setIsOpen] = useState(false);
 const tabs = [
 { id: "home", label: "首頁"},
 { id: "services", label: "專業服務"},
 { id: "cases", label: "精選案例"},
 { id: "about", label: "關於我們"},
 { id: "ai", label: "亨波AI"},
 ];

 const handleTabClick = (id: string) => {
 setActiveTab(id);
 setIsOpen(false);
 window.scrollTo({ top: 0, behavior: "smooth"});
 };

 return (
 <nav className="fixed top-0 left-0 right-0 z-50 glass-surface flex justify-between items-center px-6 md:px-8 py-3 max-w-[1920px] mx-auto">
 <div 
 className="flex items-center gap-3 text-xl md:text-2xl font-semibold type-headline text-primary cursor-pointer press-feedback"
 onClick={() => handleTabClick("home")}
 >
 <Logo className="w-8 h-8 md:w-10 md:h-10"/>
 亨波趨勢
 </div>

 {/* Desktop Menu */}
 <div className="hidden md:flex items-center gap-2 bg-black/[0.03] rounded-full p-1">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => handleTabClick(tab.id)}
 className={`font-medium px-4 py-2 rounded-full text-sm snap-transition press-feedback ${
 activeTab === tab.id 
 ? "bg-white text-primary shadow-sm"
 : "text-muted hover:text-primary"
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-3">
 <button 
 onClick={() => handleTabClick("contact")}
 className="hidden sm:block bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark snap-transition press-feedback text-sm"
 >
 立即諮詢
 </button>
 
 {/* Mobile Menu Toggle */}
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className="md:hidden p-2 text-primary hover:bg-black/5 rounded-full press-feedback"
 >
 {isOpen ? <X size={26} /> : <Menu size={26} />}
 </button>
 </div>

 {/* Mobile Menu Overlay */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -12, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -12, scale: 0.98 }}
 transition={{ type: "spring", damping: 26, stiffness: 300 }}
 className="absolute top-[calc(100%+8px)] left-3 right-3 glass-surface rounded-3xl shadow-2xl md:hidden overflow-hidden"
 >
 <div className="flex flex-col p-3 gap-1">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => handleTabClick(tab.id)}
 className={`text-left py-3.5 px-5 rounded-2xl font-medium text-base press-feedback ${
 activeTab === tab.id 
 ? "bg-primary text-white"
 : "text-primary hover:bg-black/5"
 }`}
 >
 {tab.label}
 </button>
 ))}
 <button 
 onClick={() => handleTabClick("contact")}
 className="w-full bg-secondary text-white py-4 rounded-2xl font-medium mt-1 press-feedback"
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

// 合作夥伴 LOGO 清單 —— 檔案請放到 /public/partners/ 資料夾，命名需與此陣列一致
const PARTNER_LOGOS = Array.from({ length: 10 }, (_, i) => ({
 name: `合作夥伴 ${i + 1}`,
 src: `/partners/partner-${String(i + 1).padStart(2, "0")}.png`,
}));

const Footer: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
 <footer className="bg-primary rounded-t-[40px] w-full pt-16 pb-24 mt-24">
 <div className="max-w-7xl mx-auto px-8">
 <div className="flex items-center gap-4 mb-8">
 <span className="text-secondary font-semibold tracking-wide text-xs">合作夥伴</span>
 <div className="flex-grow h-px bg-white/10"/>
 </div>
 <div className="partner-marquee-wrap overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
 <div className="partner-marquee-track items-center">
 {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((partner, i) => (
 <div key={`${partner.name}-${i}`} className="shrink-0 w-[150px] h-20 mx-3 bg-white rounded-2xl flex items-center justify-center p-4">
 <img
 src={partner.src}
 alt={partner.name}
 loading="lazy"
 className="max-h-full max-w-full object-contain"
 />
 </div>
 ))}
 </div>
 </div>
 </div>
 <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-white mt-16 pt-16 border-t border-white/10">
 <div className="col-span-1 md:col-span-2">
 <div className="flex items-center gap-4 mb-8">
 <Logo className="w-12 h-12" variant="white"/>
 <span className="text-4xl font-semibold block">亨波趨勢</span>
 </div>
 <p className="font-bold text-sm tracking-wide opacity-70 max-w-lg leading-relaxed">
 © 2026 <Logo className="w-4 h-4 mx-1" variant="white"/> HENGBO TREND. MASTERING TRENDS, MAXIMIZING IMPACT.<br/>
 專業企劃、補助申請、品牌設計與廣告投放的一站式顧問夥伴。
 </p>
 </div>
 <div className="flex flex-col gap-8">
 <div className="flex flex-col gap-4">
 <span className="text-secondary font-semibold tracking-wide ">導覽導航</span>
 <button onClick={() => { setActiveTab("services"); window.scrollTo({ top: 0, behavior: "smooth"}); }} className="text-left text-surface-high hover:text-secondary snap-transition font-bold text-sm tracking-wide">專業服務</button>
 <button onClick={() => { setActiveTab("cases"); window.scrollTo({ top: 0, behavior: "smooth"}); }} className="text-left text-surface-high hover:text-secondary snap-transition font-bold text-sm tracking-wide">精選案例</button>
 <button onClick={() => { setActiveTab("about"); window.scrollTo({ top: 0, behavior: "smooth"}); }} className="text-left text-surface-high hover:text-secondary snap-transition font-bold text-sm tracking-wide">關於我們</button>
 <button onClick={() => { setActiveTab("contact"); window.scrollTo({ top: 0, behavior: "smooth"}); }} className="text-left text-surface-high hover:text-secondary snap-transition font-bold text-sm tracking-wide">聯繫我們</button>
 </div>
 <div className="flex flex-col gap-4">
 <span className="text-secondary font-semibold tracking-wide ">社群連結</span>
 <a href="https://www.facebook.com/share/1H7nCUSiie/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-surface-high hover:text-secondary snap-transition font-bold text-sm tracking-wide">Facebook</a>
 <a href="https://lin.ee/XrjcRfb" target="_blank" rel="noopener noreferrer" className="text-surface-high hover:text-secondary snap-transition font-bold text-sm tracking-wide">LINE</a>
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
 headers: { "Content-Type": "application/json"},
 body: JSON.stringify({ email: ctaEmail }),
 });
 const json = await res.json();
 setCtaMsg(json.message || (json.success ? "訂閱成功！": json.error));
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
 className="soft-dot-grid min-h-screen"
 >
 {/* Hero */}
 <section className="relative px-8 py-24 overflow-hidden">
 <div className="max-w-7xl mx-auto grid grid-cols-12 gap-0 relative">
 <div className="absolute -right-20 top-0 opacity-5 pointer-events-none select-none">
 <Building2 size={600} className="text-primary"/>
 </div>
 <div className="col-span-12 lg:col-span-10 z-10">
 <h1 className="text-[clamp(3rem,12vw,7rem)] type-display font-semibold text-primary mb-12">
 賦能企業<br/>
 <span className="text-secondary">築造未來</span>
 </h1>
 </div>
 <div className="col-span-12 lg:col-span-6 lg:ml-[16.6%] bg-primary p-12 relative z-20 rounded-[32px] shadow-xl">
 <p className="text-white text-[clamp(1.5rem,5vw,2.25rem)] font-bold tracking-wide mb-8">助力企業，引領趨勢</p>
 <div className="w-full h-1 bg-secondary mb-8"></div>
 <div className="flex gap-4">
 <div className="w-24 h-24 bg-white flex items-center justify-center rounded-3xl shadow-md soft-card-hover">
 <Logo className="w-16 h-16"/>
 </div>
 <div className="flex flex-col justify-center">
 <span className="text-white font-semibold text-xl tracking-wide">HENGBO TREND</span>
 <span className="text-white/60 font-bold text-xs tracking-wide">Strategic Consulting</span>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Why Choose Us */}
 <section className="px-8 py-32 bg-white">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
 {[
 { icon: <Target className="text-secondary" size={48} />, title: "精準策略", desc: "基於深度市場洞察與數據分析，為您的企業量身打造具備高度執行力的成長藍圖。"},
 { icon: <Zap className="text-secondary" size={48} />, title: "高效執行", desc: "從企劃撰寫到資源對接，我們強調速度與品質的平衡，確保每一個專案都能如期達成目標。"},
 { icon: <ShieldCheck className="text-secondary" size={48} />, title: "專業保障", desc: "擁有豐富的政府補助申請經驗與品牌行銷實績，是您在商場競爭中最堅實的後盾。"}
 ].map((item, i) => (
 <div key={i} className="p-8 rounded-3xl bg-surface-low soft-card-hover press-feedback">
 <div className="mb-6">{item.icon}</div>
 <h3 className="text-2xl font-semibold text-primary mb-4 tracking-tight">{item.title}</h3>
 <p className="font-bold text-muted leading-relaxed">{item.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Bento Grid */}
 <section className="px-8 py-32 bg-surface-low">
 <div className="max-w-7xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
 <h2 className="text-[clamp(3rem,10vw,4.5rem)] font-semibold tracking-tight text-primary">策略<br/>精準度</h2>
 <div className="max-w-md text-right">
 <span className="font-semibold tracking-wide text-secondary block mb-4">核心服務能力</span>
 <p className="font-bold text-muted">我們不只提供服務；我們透過數據驅動的精準規劃，協助您在市場競爭中取得絕對優勢。</p>
 </div>
 </div>
 <div className="grid grid-cols-12 gap-8">
 <div className="col-span-12 md:col-span-8 group bg-white rounded-3xl shadow-md soft-card-hover p-12 hover:bg-primary hover:text-white snap-transition relative overflow-hidden">
 <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-20 snap-transition">
 <FileText size={240} />
 </div>
 <span className="text-secondary font-semibold text-2xl mb-8 block">01</span>
 <h3 className="text-[clamp(2rem,6vw,3rem)] font-semibold mb-6 ">企劃撰寫</h3>
 <p className="text-xl max-w-xl font-medium mb-8 leading-relaxed">從市場洞察到可執行藍圖，一份讓投資人與團隊都買單的企劃。我們專注於邏輯架構與商業價值的深度挖掘。</p>
 <div className="w-16 h-2 bg-secondary"></div>
 </div>
 <div className="col-span-12 md:col-span-4 bg-secondary p-12 text-white rounded-3xl shadow-md soft-card-hover border-secondary relative">
 <span className="text-white/50 font-semibold text-2xl mb-8 block">02</span>
 <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-semibold mb-6 ">補助申請</h3>
 <Rocket size={80} className="mb-8"/>
 <p className="font-bold mb-8 leading-relaxed">對接政府資源，極大化研發與轉型動能。我們提供從資格評估到結案報告的全程專業輔導。</p>
 <button onClick={() => setActiveTab("services")} className="bg-white text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-white snap-transition press-feedback">了解更多</button>
 </div>
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="px-8 py-40 bg-white">
 <div className="max-w-4xl mx-auto text-center">
 <h2 className="text-[clamp(2.5rem,8vw,5rem)] font-semibold text-primary tracking-tight mb-12">
 準備好<br/>
 <span className="text-secondary">引領趨勢</span>了嗎？
 </h2>
 <p className="text-xl font-bold text-muted mb-12 tracking-wide">訂閱我們的趨勢週報，獲取最新的市場洞察與補助資訊。</p>
 <div className="flex flex-col md:flex-row gap-4">
 <input 
 type="email"
 value={ctaEmail}
 onChange={(e) => setCtaEmail(e.target.value)}
 placeholder="您的電子郵件"
 className="flex-grow bg-white rounded-2xl border border-surface-high p-6 font-semibold text-xl focus:outline-none focus:border-primary snap-transition"
 />
 <button 
 onClick={handleSubscribe}
 disabled={ctaLoading}
 className="bg-primary text-white px-12 py-6 rounded-full font-medium text-xl hover:bg-primary-dark snap-transition press-feedback disabled:opacity-50"
 >
 {ctaLoading ? "處理中...": "立即訂閱"}
 </button>
 </div>
 {ctaMsg && <p className="mt-4 font-semibold text-secondary tracking-wide">{ctaMsg}</p>}
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
 className="pt-24 soft-dot-grid"
 >
 <section className="px-8 py-32">
 <div className="max-w-7xl mx-auto">
 <div className="mb-32">
 <span className="font-semibold tracking-wide text-secondary mb-4 block">專業服務範疇</span>
 <h1 className="text-[clamp(3.5rem,12vw,8rem)] type-display font-semibold text-primary ">
 全方位<br/>
 <span className="text-stroke">顧問解決方案</span>
 </h1>
 </div>

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
 <div key={idx} className="group bg-white rounded-3xl shadow-md soft-card-hover p-12 hover:bg-primary hover:text-white snap-transition">
 <div className="text-secondary group-hover:text-white mb-8 snap-transition">{service.icon}</div>
 <h3 className="text-4xl type-headline font-semibold mb-6">{service.title}</h3>
 <p className="text-xl font-bold mb-8 opacity-70 group-hover:opacity-100 leading-relaxed">{service.desc}</p>
 
 <div className="mb-8">
 <span className="font-semibold text-xs tracking-wide text-secondary group-hover:text-white/60 mb-4 block">核心優勢</span>
 <ul className="space-y-4">
 {service.features.map((f, i) => (
 <li key={i} className="flex items-center gap-3 font-semibold text-sm tracking-wide">
 <BadgeCheck size={20} className="text-secondary group-hover:text-white"/>
 {f}
 </li>
 ))}
 </ul>
 </div>

 <div>
 <span className="font-semibold text-xs tracking-wide text-secondary group-hover:text-white/60 mb-4 block">服務流程</span>
 <div className="flex flex-wrap gap-2">
 {service.process.map((p, i) => (
 <span key={i} className="px-3 py-1 rounded-full border border-primary/15 group-hover:border-white/20 text-[10px] font-semibold">
 {i + 1}. {p}
 </span>
 ))}
 </div>
 </div>
 </div>
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
 className="pt-24 soft-dot-grid"
 >
 <section className="px-8 py-32">
 <div className="max-w-7xl mx-auto mb-24">
 <span className="font-semibold tracking-wide text-secondary mb-4 block">實戰成果展示</span>
 <h1 className="text-[clamp(3.5rem,12vw,8rem)] type-display font-semibold text-primary ">
 精選<br/>
 <span className="text-stroke">成功案例</span>
 </h1>
 </div>

 <section className="px-4 md:px-8">
 <div className="grid grid-cols-12 gap-4 md:gap-8">
 {/* Case 1 */}
 <div className="col-span-12 md:col-span-7 bg-surface-high rounded-3xl shadow-md soft-card-hover group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[450px]">
 <div className="flex justify-between items-start">
 <Building2 size={120} className="group-hover:text-secondary snap-transition"/>
 <div className="text-right">
 <div className="font-semibold tracking-wide mb-2 text-xs">產業: 傳統製造業</div>
 <div className="font-semibold tracking-wide text-xs">服務: 補助申請與轉型顧問</div>
 </div>
 </div>
 <div>
 <h2 className="text-[clamp(2rem,6vw,3.75rem)] type-display font-semibold mb-4">傳統機械廠數位升級</h2>
 <div className="space-y-4 mb-6 md:opacity-0 md:group-hover:opacity-100 snap-transition">
 <p className="font-bold text-sm leading-relaxed">挑戰：面臨數位轉型瓶頸，缺乏自動化數據追蹤系統。</p>
 <p className="font-bold text-sm leading-relaxed">方案：協助申請政府數位轉型補助，並導入智慧生產監控系統。</p>
 <p className="font-semibold text-secondary group-hover:text-white text-lg">量化成果：獲得 50 萬元補助，生產效率提升 30%。</p>
 </div>
 <div className="w-16 h-2 bg-secondary group-hover:bg-white snap-transition"></div>
 </div>
 </div>

 {/* Case 2 */}
 <div className="col-span-12 md:col-span-5 bg-secondary rounded-3xl shadow-md soft-card-hover border-primary group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[450px]">
 <div className="flex justify-between items-start text-white group-hover:text-primary">
 <Palette size={120} className="group-hover:text-secondary snap-transition"/>
 <div className="text-right">
 <div className="font-semibold tracking-wide text-xs">產業: 新創美妝品牌</div>
 <div className="font-semibold tracking-wide text-xs">服務: 品牌設計與廣告投放</div>
 </div>
 </div>
 <div>
 <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-semibold tracking-tight text-white group-hover:text-primary leading-none mb-6">DTC 品牌視覺重塑</h2>
 <div className="space-y-4 mb-6 md:opacity-0 md:group-hover:opacity-100 snap-transition">
 <p className="font-bold text-sm leading-relaxed">挑戰：品牌知名度侷限於本地，視覺形象過於傳統。</p>
 <p className="font-bold text-sm leading-relaxed">方案：重新定義品牌視覺語言 (CIS)，並執行跨國精準廣告投放。</p>
 <p className="font-semibold text-white group-hover:text-secondary text-lg">量化成果：廣告 ROI 提升至 4.8，品牌溢價提升 40%。</p>
 </div>
 </div>
 </div>

 {/* Case 3 */}
 <div className="col-span-12 md:col-span-4 bg-primary text-white rounded-3xl shadow-md soft-card-hover group cursor-pointer snap-transition hover:bg-white hover:text-primary p-8 flex flex-col justify-between min-h-[500px]">
 <div>
 <Network size={80} className="mb-8"/>
 <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] type-display font-semibold">連鎖餐飲集團 ESG 規劃</h2>
 <div className="mt-6 space-y-4 opacity-60 group-hover:opacity-100">
 <p className="font-bold text-sm">協助企業對接淨零轉型政策，規劃減碳路徑並申請相關補助。</p>
 <p className="font-semibold text-secondary text-xl">獲取 80 萬元資助</p>
 </div>
 </div>
 <p className="font-bold tracking-wide text-xs opacity-60 group-hover:opacity-100 border-t border-white/20 pt-4">
 「專業且精準，讓我們在轉型路上少走許多冤枉路。」
 </p>
 </div>

 {/* Case 4 */}
 <div className="col-span-12 md:col-span-8 bg-surface-low rounded-3xl shadow-md soft-card-hover group cursor-pointer snap-transition hover:bg-secondary hover:text-white p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
 <div className="absolute right-[-10%] top-[-10%] w-[400px] h-[400px] bg-primary opacity-5 group-hover:opacity-20 rotate-45 pointer-events-none"></div>
 <div className="flex flex-col md:flex-row gap-8 z-10">
 <Layout size={120} />
 <div>
 <div className="font-semibold tracking-wide mb-4 text-secondary group-hover:text-white">融資專案</div>
 <h2 className="text-[clamp(2.5rem,8vw,4.5rem)] type-display font-semibold">AI 醫療新創融資計畫</h2>
 <div className="mt-6 space-y-4">
 <p className="font-bold text-lg leading-relaxed">協助撰寫具備高度說服力的融資企劃書，並進行路演輔導。</p>
 <div className="flex items-center gap-4">
 <div className="bg-primary text-white px-4 py-2 font-semibold text-2xl group-hover:bg-white group-hover:text-secondary">1,500 萬</div>
 <span className="font-semibold tracking-wide text-sm">天使輪投資達成</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 </section>

 <section className="bg-primary py-40 px-8 relative overflow-hidden">
 <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
 <h2 className="text-[clamp(5rem,20vw,20rem)] font-semibold text-white leading-none tracking-tight mb-4 opacity-10 absolute pointer-events-none">SUCCESS</h2>
 <h3 className="text-[clamp(3rem,12vw,6rem)] font-semibold text-white mb-12 tracking-tight relative z-10 ">想要了解更多？</h3>
 <div className="relative z-10">
 <button 
 onClick={() => setActiveTab("contact")}
 className="bg-secondary text-white text-2xl font-medium px-16 py-6 rounded-full hover:bg-white hover:text-primary snap-transition press-feedback flex items-center gap-4"
 >
 與我們聯繫
 <ArrowRight size={32} />
 </button>
 </div>
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
 className="pt-24 soft-dot-grid"
 >
 <section className="relative px-8 py-32 overflow-hidden bg-surface-low">
 <div className="max-w-7xl mx-auto relative z-10">
 <div className="font-semibold tracking-wide text-secondary mb-4">核心理念</div>
 <h1 className="text-[clamp(3rem,10vw,6rem)] type-display font-semibold text-primary relative">
 我們的使命<br/>
 <span className="text-stroke">與願景</span>
 <div className="absolute -top-12 -left-8 opacity-5 pointer-events-none select-none">
 <Logo className="w-[12rem] h-[12rem]"/>
 </div>
 </h1>
 <div className="mt-12 max-w-2xl border-l-2 border-secondary/50 pl-8">
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
 <h2 className="text-[clamp(4rem,12vw,8rem)] font-semibold text-white type-display mb-12">關於<br/>我們</h2>
 <div className="w-24 h-2 bg-secondary mb-8"></div>
 <p className="text-white/60 font-bold text-lg tracking-wide">HENGBO TREND CONSULTING</p>
 </div>
 <div className="text-white opacity-20">
 <Building2 size={240} />
 </div>
 </div>
 <div className="w-full md:w-1/2 bg-white p-12 md:p-24">
 <div className="space-y-12">
 <div>
 <h3 className="text-3xl font-semibold text-primary mb-6 tracking-tight">亨波趨勢：細節的執行者</h3>
 <p className="text-lg leading-relaxed text-muted font-medium">
 我們創立於2022年，代表市場上的一股新銳力量。我們摒棄冗餘，回歸本質。讓每一個細節，都經過嚴密的計畫與審核。我們相信，卓越的策略來自於對細節的極致追求。
 </p>
 </div>
 <div>
 <h3 className="text-3xl font-semibold text-primary mb-6 tracking-tight">創新與卓越</h3>
 <p className="text-lg leading-relaxed text-muted font-medium">
 在快速變遷的環境中，我們專注提供高品質、高效能的解決方案，協助客戶精準撰寫企劃與計畫書，並順利申請各項政府與企業補助資源，同時透過專業的數位廣告投放與高品質品牌設計，幫助品牌有效曝光，提升市場競爭力。
 </p>
 </div>
 
 {/* Core Values */}
 <div className="pt-8 border-t border-surface-high">
 <h3 className="text-xl font-semibold text-secondary mb-6 tracking-wide">我們的承諾</h3>
 <div className="grid grid-cols-1 gap-4">
 {[
 { title: "誠信透明", desc: "所有服務流程與收費標準公開透明，建立長期的信任夥伴關係。"},
 { title: "結果導向", desc: "我們關注最終的量化成果，確保每一分投入都能產生實質價值。"},
 { title: "持續創新", desc: "不斷優化顧問方法論，確保客戶始終站在市場趨勢的最前線。"}
 ].map((v, i) => (
 <div key={i} className="flex gap-4 items-start">
 <div className="bg-primary text-white p-1 rounded"><Check size={16} /></div>
 <div>
 <span className="font-semibold text-primary block text-sm ">{v.title}</span>
 <p className="text-xs text-muted font-bold">{v.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-8 pt-12">
 <div className="border-t border-surface-high pt-4">
 <div className="text-4xl font-semibold text-secondary">100+</div>
 <div className="font-bold tracking-wide text-xs mt-2">累計諮詢客戶</div>
 </div>
 <div className="border-t border-surface-high pt-4">
 <div className="text-4xl font-semibold text-secondary">85%</div>
 <div className="font-bold tracking-wide text-xs mt-2">補助申請過件率</div>
 </div>
 </div>
 </div>
 </div>
 </section>

 <section className="px-8 py-32 bg-surface-high">
 <div className="max-w-7xl mx-auto">
 <h2 className="text-[clamp(2.5rem,8vw,3.75rem)] type-headline font-semibold text-primary mb-24 text-center">成長策略</h2>
 <div className="relative flex flex-col gap-0">
 <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-primary hidden md:block"></div>
 
 {[
 { year: "2024", title: "從邏輯架構到品牌轉型", desc: "強調數據洞察與故事行銷的完美結合，為企業建立具市場競爭力的核心價值。", side: "left"},
 { year: "2025", title: "政策鏈結與資源整合開發", desc: "透過專業計畫書編製與專業諮詢，協助單位跨越財務門檻，實現公共服務與社會影響力。", side: "right"},
 { year: "2026", title: "數據驅動與精準觸及", desc: "整合多社群平台資源與動態優化技術，在碎片的數位環境中精準捕捉目標客群與商機。", side: "left"}
 ].map((item, idx) => (
 <div key={item.year} className="relative flex flex-col md:flex-row items-center mb-32 group">
 <div className={`w-full md:w-1/2 ${item.side === 'left' ? 'md:pr-16 text-right order-2 md:order-1' : 'order-2 md:order-1'}`}>
 {item.side === 'left' && (
 <div className="bg-primary text-white p-8 rounded-3xl inline-block w-full text-left md:text-right">
 <h4 className="text-2xl font-semibold mb-2">{item.title}</h4>
 <p className="opacity-80 font-bold text-sm">{item.desc}</p>
 </div>
 )}
 </div>
 <div className={`z-10 bg-secondary text-white w-24 h-24 flex items-center justify-center font-semibold text-2xl order-1 md:order-2 mb-8 md:mb-0 ${item.side === 'right' ? 'bg-primary' : ''}`}>
 {item.year}
 </div>
 <div className={`w-full md:w-1/2 ${item.side === 'right' ? 'md:pl-16 order-3' : 'order-3'}`}>
 {item.side === 'right' && (
 <div className="bg-white rounded-[28px] shadow-xl p-8 inline-block w-full">
 <h4 className="text-2xl font-semibold text-primary mb-2">{item.title}</h4>
 <p className="text-muted font-bold text-sm">{item.desc}</p>
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
 <h2 className="text-[clamp(5rem,20vw,20rem)] font-semibold text-white leading-none tracking-tight mb-4 opacity-10 absolute pointer-events-none">GO!</h2>
 <h3 className="text-[clamp(3rem,12vw,6rem)] font-semibold text-white mb-12 tracking-tight relative z-10 ">準備好了嗎？</h3>
 <div className="relative z-10">
 <button 
 onClick={() => setActiveTab("contact")}
 className="bg-secondary text-white text-2xl font-medium px-16 py-6 rounded-full hover:bg-white hover:text-primary snap-transition press-feedback flex items-center gap-4"
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
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 setSubmitError("");
 
 try {
 const res = await fetch("/api/contact", {
 method: "POST",
 headers: { "Content-Type": "application/json"},
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
 setFormState({ name: "", org: "", email: "", subject: "企劃撰寫諮詢", message: ""});
 } else {
 setSubmitError(json.error || "提交失敗，請稍後再試");
 }
 } catch {
 setSubmitError("無法連接伺服器，請檢查網絡連接");
 }
 setIsSubmitting(false);
 };

 const faqs = [
 { q: "諮詢服務是如何收費的？", a: "我們的初步諮詢是免費的。具體專案收費會根據企劃複雜度、補助申請規模或廣告預算而定，我們會在提供正式報價單前與您詳細討論。"},
 { q: "補助申請的成功率高嗎？", a: "我們擁有超過 85% 的補助申請過件率。在正式接案前，我們會先進行資格評估，若過件機率較低，我們會誠實告知並提供優化建議。"},
 { q: "企劃撰寫通常需要多久時間？", a: "一般商業企劃書約需 2-3 週，政府補助計畫書則視專案規模約需 4-6 週。我們會根據您的時程需求進行調整。"},
 { q: "你們支援哪些廣告平台？", a: "我們支援 Meta (FB/IG)、Google Ads、TikTok、LINE Ads 等主流平台，並提供跨平台的整合投放策略。"}
 ];

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
 <h1 className="text-[clamp(4rem,12vw,8rem)] font-semibold text-primary type-display mb-12">
 聯繫<br/><span className="text-secondary">我們</span>
 </h1>
 <p className="text-xl font-bold text-muted mb-16 border-l-2 border-primary/40 pl-6 tracking-tight">
 為您的企業提供 world-class 的解決方案。
 </p>

 <div className="space-y-12 mb-24">
 <div className="flex items-start gap-6 group">
 <div className="bg-primary p-4 rounded-2xl text-white group-hover:bg-secondary snap-transition">
 <Phone size={32} />
 </div>
 <div>
 <h3 className="font-semibold tracking-wide text-secondary mb-2">直連電話</h3>
 <p className="text-xl font-bold text-primary">+886-0966-748-817</p>
 <p className="text-muted font-medium">週一至週五：09:00 - 18:00</p>
 </div>
 </div>

 <div className="flex items-start gap-6 group">
 <div className="bg-primary p-4 rounded-2xl text-white group-hover:bg-secondary snap-transition">
 <Mail size={32} />
 </div>
 <div>
 <h3 className="font-semibold tracking-wide text-secondary mb-2">電子郵件</h3>
 <p className="text-xl font-bold text-primary">1@grv.ccwu.cc</p>
 <p className="text-muted font-medium">24/7 全天候運營支持</p>
 </div>
 </div>
 </div>

 {/* FAQ Section */}
 <div className="space-y-6">
 <h3 className="text-2xl font-semibold text-primary tracking-tight mb-8">常見問題 FAQ</h3>
 {faqs.map((faq, i) => (
 <div key={i} className="border-b border-surface-high pb-4">
 <button 
 onClick={() => setOpenFaq(openFaq === i ? null : i)}
 className="w-full flex justify-between items-center text-left group"
 >
 <span className="font-semibold text-primary group-hover:text-secondary transition-colors text-sm">{faq.q}</span>
 <ChevronDown size={20} className={`text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
 </button>
 <AnimatePresence>
 {openFaq === i && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <p className="pt-4 text-sm font-bold text-muted leading-relaxed">{faq.a}</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </div>
 </div>

 <div className="lg:col-span-7">
 <div className="bg-surface-low rounded-[28px] shadow-xl p-12 relative overflow-hidden">
 <AnimatePresence mode="wait">
 {!isSubmitted ? (
 <motion.div
 key="form"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 >
 <h2 className="text-4xl font-semibold text-primary mb-12 tracking-tight">諮詢申請</h2>
 <form className="space-y-8" onSubmit={handleSubmit}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-2">
 <label className="font-semibold tracking-wide text-xs text-secondary">姓名</label>
 <input 
 required
 type="text"
 value={formState.name}
 onChange={(e) => setFormState({...formState, name: e.target.value})}
 className="w-full bg-surface-low rounded-2xl border border-surface-high p-4 font-bold focus:outline-none focus:border-primary focus:bg-white snap-transition"
 placeholder="您的姓名"
 />
 </div>
 <div className="space-y-2">
 <label className="font-semibold tracking-wide text-xs text-secondary">公司/機構</label>
 <input 
 type="text"
 value={formState.org}
 onChange={(e) => setFormState({...formState, org: e.target.value})}
 className="w-full bg-surface-low rounded-2xl border border-surface-high p-4 font-bold focus:outline-none focus:border-primary focus:bg-white snap-transition"
 placeholder="公司名稱"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="font-semibold tracking-wide text-xs text-secondary">電子郵件</label>
 <input 
 required
 type="email"
 value={formState.email}
 onChange={(e) => setFormState({...formState, email: e.target.value})}
 className="w-full bg-surface-low rounded-2xl border border-surface-high p-4 font-bold focus:outline-none focus:border-primary focus:bg-white snap-transition"
 placeholder="email@example.com"
 />
 </div>
 <div className="space-y-2">
 <label className="font-semibold tracking-wide text-xs text-secondary">諮詢主題</label>
 <select 
 value={formState.subject}
 onChange={(e) => setFormState({...formState, subject: e.target.value})}
 className="w-full bg-surface-low rounded-2xl border border-surface-high p-4 font-bold focus:outline-none focus:border-primary focus:bg-white snap-transition appearance-none"
 >
 <option>企劃撰寫諮詢</option>
 <option>補助申請諮詢</option>
 <option>品牌設計諮詢</option>
 <option>廣告投放諮詢</option>
 <option>其他合作洽談</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="font-semibold tracking-wide text-xs text-secondary">訊息內容</label>
 <textarea 
 required
 rows={4}
 value={formState.message}
 onChange={(e) => setFormState({...formState, message: e.target.value})}
 className="w-full bg-surface-low rounded-2xl border border-surface-high p-4 font-bold focus:outline-none focus:border-primary focus:bg-white snap-transition resize-none"
 placeholder="請描述您的需求..."
 ></textarea>
 </div>
 <button 
 disabled={isSubmitting}
 className="w-full bg-primary text-white py-6 rounded-full font-medium text-xl hover:bg-primary-dark snap-transition press-feedback flex items-center justify-center gap-4 disabled:opacity-50"
 >
 {isSubmitting ? "提交中...": "發送諮詢請求"}
 <ArrowRight size={24} />
 </button>
 {submitError && <p className="text-red-600 font-bold text-center mt-4">{submitError}</p>}
 </form>
 </motion.div>
 ) : (
 <motion.div
 key="success"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-12"
 >
 <div className="w-24 h-24 bg-secondary text-white flex items-center justify-center mx-auto mb-8 rounded-full">
 <BadgeCheck size={48} />
 </div>
 <h2 className="text-4xl font-semibold text-primary mb-4">提交成功</h2>
 <p className="text-xl font-bold text-muted mb-8">感謝您的諮詢，我們將儘快與您聯繫。</p>
 <button 
 onClick={() => setIsSubmitted(false)}
 className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary-dark snap-transition press-feedback"
 >
 返回表單
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
 const fileInputRef = useRef<HTMLInputElement>(null);
 const scrollRef = useRef<HTMLDivElement>(null);
 const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
 const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

 const handleCopyMessage = async (id: string, content: string) => {
 try {
 await navigator.clipboard.writeText(content);
 } catch {
 // Fallback for environments without Clipboard API permission
 const textarea = document.createElement('textarea');
 textarea.value = content;
 textarea.style.position = 'fixed';
 textarea.style.opacity = '0';
 document.body.appendChild(textarea);
 textarea.select();
 document.execCommand('copy');
 document.body.removeChild(textarea);
 }
 setCopiedMessageId(id);
 setTimeout(() => setCopiedMessageId((current) => (current === id ? null : current)), 1500);
 };

 // AI 模型切換：'flash' = 一般 Gemini 3.5 Flash 對話（低延遲、支援圖片上傳分析）
 // 'antigravity' = Antigravity Agent（Pre-GA 預覽版，會啟動沙盒環境，延遲較高，不支援圖片分析）
 const [aiModel, setAiModel] = useState<"flash"| "antigravity">("flash");
 // 記錄每個對話 session 對應的 Antigravity interaction/environment id，讓多輪對話能延續上下文
 const antigravityStateRef = useRef<Record<string, { interactionId?: string; environmentId?: string }>>({});

 const SESSIONS_STORAGE_KEY = "hengbo_ai_sessions_v2";

 const currentSession = useMemo(() => 
 sessions.find(s => s.id === currentSessionId) || null
 , [sessions, currentSessionId]);

 const messages = currentSession?.messages || [];

 useEffect(() => {
 if (isLoggedIn) {
 const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
 if (savedSessions) {
 try {
 const parsed = JSON.parse(savedSessions).map((s: any) => ({
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
 content: "您好！我是Hengbo AI很高興為您服務，請問今天有什麼我可以幫您的嗎？",
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

 useEffect(() => {
 if (shouldAutoScroll && scrollRef.current) {
 setTimeout(() => {
 scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth"});
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
 fullText += `[Page ${i}]\n${textContent.items.map((item: any) => item.str).join("")}\n\n`;
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
 } else {
 const reader = new FileReader();
 reader.onload = (ev) => setSelectedFile({ name: file.name, content: ev.target?.result as string, type: file.type });
 reader.readAsText(file);
 }
 };

 // 依「字元數」概估 token 預算，動態決定要帶幾則歷史訊息，取代原本固定 slice(-10)。
 // 訊息內容短就多帶一點，內容長就少帶一點；但無論如何至少保留最近 4 則，避免話題斷得太突然。
 const MAX_HISTORY_CHARS = 12000;
 const MIN_HISTORY_MESSAGES = 4;
 const buildHistoryWindow = (allMessages: Message[]): Message[] => {
 const windowed: Message[] = [];
 let totalChars = 0;
 for (let i = allMessages.length - 1; i >= 0; i--) {
 const m = allMessages[i];
 totalChars += m.content.length;
 if (totalChars > MAX_HISTORY_CHARS && windowed.length >= MIN_HISTORY_MESSAGES) break;
 windowed.unshift(m);
 }
 return windowed;
 };

 // 把此對話中「文字類」檔案（PDF/Word/純文字）的內容組成一段可放進 systemInstruction 的文字，
 // 讓 AI 在後續追問時仍看得到先前上傳過的檔案，而不是只有上傳當下那一輪看得到。
 const DOC_CHAR_CAP = 50000; // 單一檔案最多帶入的字元數
 const MAX_DOCS_IN_CONTEXT = 3; // 最多同時保留幾份檔案在上下文中，避免多次上傳把 token 撐爆
 const buildDocumentsContext = (docs: SessionDocument[]): string => {
 if (!docs.length) return "";
 const recentDocs = docs.slice(-MAX_DOCS_IN_CONTEXT);
 return recentDocs
 .map(d => `【檔案：${d.name}】\n${d.content.substring(0, DOC_CHAR_CAP)}`)
 .join("\n\n---\n\n");
 };

 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault();
 if ((!input.trim() && !selectedFile) || isTyping || !currentSessionId) return;

 let userMsg = input.trim() || (selectedFile ? `請分析這份檔案：${selectedFile.name}` : "");
 const currentFile = selectedFile;
 const isTextFile = !!currentFile && !currentFile.type.startsWith('image/');
 const userMsgId = `msg-${Date.now()}-u`;
 const aiMsgId = `msg-${Date.now()}-a`;

 const newUserMsg: Message = { role: "user", content: userMsg, id: userMsgId, timestamp: new Date() };
 const newAiMsg: Message = { role: "ai", content: "", id: aiMsgId, timestamp: new Date() };
 
 const updatedMessages = [...messages, newUserMsg, newAiMsg];

 // 文字類檔案（非圖片）在送出當下就併入 session.documents，之後每一輪都會自動帶入上下文，
 // 不會只有上傳的那一輪看得到內容。同名檔案重新上傳時取代舊的內容。
 const existingDocuments = currentSession?.documents || [];
 const updatedDocuments = isTextFile
 ? [...existingDocuments.filter(d => d.name !== currentFile!.name), { name: currentFile!.name, content: currentFile!.content, type: currentFile!.type }]
 : existingDocuments;

 setSessions(prev => prev.map(s => s.id === currentSessionId ? {
 ...s,
 messages: updatedMessages,
 documents: updatedDocuments,
 title: (s.title === "新對話"|| s.title === "未命名對話")
 ? (userMsg.substring(0, 20) + (userMsg.length > 20 ? "...": ""))
 : s.title,
 lastUpdated: new Date(),
 } : s));
 
 // Antigravity Agent（Pre-GA）目前無正式文件支援圖片分析，先擋掉並提示改用 Flash 模型
 if (aiModel === "antigravity"&& currentFile && currentFile.type.startsWith('image/')) {
 setSessions(prev => prev.map(s => s.id === currentSessionId ? {
 ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: "Agent 模式（預覽版）目前不支援圖片分析，請切換回「Flash 模式」再上傳圖片。"} : m)
 } : s));
 setInput("");
 setSelectedFile(null);
 return;
 }

 setInput("");
 setSelectedFile(null);
 setIsTyping(true);

 const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);
 const documentsContext = buildDocumentsContext(updatedDocuments);
 const systemInstruction = `你是「亨波趨勢 (HENGBO TREND)」網站上的客服顧問助手，服務對象是正在諮詢的真實客戶。
回覆風格：
1. **直接回答**：使用者的每一則訊息都是在跟你對話，不是新對話的開場，絕對不要在回覆中重新自我介紹、複述你的身分或職稱（例如「我是Hengbo AI顧問」「身為專業顧問」之類的開場白），開場自我介紹只在對話一開始出現過一次，之後每次回覆都直接切入內容即可。
2. **語氣自然專業**：像真人顧問一樣簡潔、務實地回答，不需要每句話都強調自己的專業性或角色定位。
3. **繁體中文**：使用清楚、精準的『繁體中文』。
4. **視情況引導**：只有在使用者的問題確實適合進一步諮詢或需要更多資訊時，才自然地提及可至 https://vvw-tw.vercel.app/ 或聯繫頁面了解更多，不要每則回覆都硬塞這句話。
${isImageRequest ? '要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}${documentsContext ? `

以下是使用者在此對話中上傳過的檔案內容。即使使用者之後的提問沒有重新附上檔案，也可能是在針對這些內容追問，請一併參考：

${documentsContext}` : ''}`;

 try {
 let fullText = "";

 if (aiModel === "antigravity") {
 // --- Antigravity Agent（Pre-GA 預覽）：走 Interactions API，會啟動沙盒環境，延遲較高 ---
 const sessionState = antigravityStateRef.current[currentSessionId] || {};
 // 文字類檔案的內容已經併入 systemInstruction 的 documentsContext，這裡不用再重複帶一次完整內容，
 // 只需提示模型「剛剛新增了這份檔案」即可，避免同一份內容被重複計入 token。
 const agentInput = isTextFile
 ? `（已上傳檔案：${currentFile!.name}，內容請參考系統指示中提供的檔案上下文）\n\n問題：${userMsg}`
 : userMsg;

 const interaction: any = await (genAI as any).interactions.create({
 agent: "antigravity-preview-05-2026",
 input: agentInput,
 system_instruction: systemInstruction,
 // 有前一輪就延續對話與沙盒環境，否則開一個新的沙盒
 ...(sessionState.interactionId
 ? { previous_interaction_id: sessionState.interactionId, environment: sessionState.environmentId }
 : { environment: "remote"}),
 });

 // 目前 streaming 事件格式尚未有完整正式文件，先以非串流方式取得完整回覆，避免解析錯誤
 fullText = interaction.output_text || "";
 antigravityStateRef.current[currentSessionId] = {
 interactionId: interaction.id,
 environmentId: interaction.environment_id,
 };

 setSessions(prev => prev.map(s => s.id === currentSessionId ? {
 ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m)
 } : s));
 } else {
 // --- 一般模式：Gemini 3.5 Flash，走標準 generateContentStream，逐字串流 ---
 let aiPromptParts: any[] = [];
 if (currentFile && currentFile.type.startsWith('image/')) {
 // 圖片無法放進純文字的 documentsContext，仍需在當輪以 inlineData 附上
 aiPromptParts.push({ inlineData: { data: currentFile.content.split(',')[1], mimeType: currentFile.type } });
 aiPromptParts.push({ text: userMsg });
 } else if (isTextFile) {
 // 文字類檔案的內容已經併入 systemInstruction 的 documentsContext，這裡不重複帶入完整內容，
 // 只需標註「這輪新上傳了這份檔案」，避免同一份內容被重複計入 token
 aiPromptParts.push({ text: `（已上傳檔案：${currentFile!.name}，內容請參考系統指示中提供的檔案上下文）\n\n${userMsg}` });
 } else {
 aiPromptParts.push({ text: userMsg });
 }

 const response = await genAI.models.generateContentStream({
 model: "gemini-3.5-flash-lite",
 systemInstruction,
 contents: [
 ...buildHistoryWindow(messages).map(m => ({ role: m.role === "user"? "user": "model", parts: [{ text: m.content }] })),
 { role: "user", parts: aiPromptParts }
 ],
 });

 for await (const chunk of response) {
 fullText += chunk.text || "";
 setSessions(prev => prev.map(s => s.id === currentSessionId ? {
 ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m)
 } : s));
 }
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
 <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-primary/5 p-8 md:p-10">
 <div className="flex flex-col items-center mb-8">
 <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-5"><i className="fa-solid fa-disease text-3xl text-primary" aria-hidden="true"></i></div>
 <h2 className="text-2xl font-bold text-ink mb-1.5">Hengbo AI</h2>
 <p className="text-muted text-sm">By Google</p>
 </div>
 <form onSubmit={handleLogin} className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-primary/60">顧問帳號</label>
 <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" size={16} /><input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-surface-low rounded-xl py-3 pl-10 pr-4 font-medium text-ink ring-1 ring-transparent focus:outline-none focus:ring-primary/30 transition-all" placeholder="Consultant ID"/></div>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-primary/60">安全授權碼</label>
 <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/30" size={16} /><input required type={showPassword ? "text": "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-low rounded-xl py-3 pl-10 pr-10 font-medium text-ink ring-1 ring-transparent focus:outline-none focus:ring-primary/30 transition-all" placeholder="Access Key"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary/60 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
 </div>
 {loginError && <div className="bg-secondary/5 rounded-xl p-3 text-secondary font-medium text-xs">{loginError}</div>}
 <button className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold hover:bg-secondary transition-all flex items-center justify-center gap-2 mt-2">授權並進入 <ArrowRight size={18} /></button>
 </form>
 <div className="mt-6 pt-6 border-t border-primary/5 flex justify-center">
 <p className="text-primary/40 text-xs flex items-center gap-1.5">
 還沒有顧問帳號嗎？
 <a 
 href="https://lin.ee/ZegJcQj"
 target="_blank"
 rel="noopener noreferrer"
 className="text-primary hover:text-secondary transition-colors font-medium"
 >
 取得帳號
 </a>
 </p>
 </div>
 </motion.div>
 </motion.div>
 );
 }

 return (
 <div className="pt-20 md:pt-24 h-screen flex bg-white overflow-hidden relative">
 <AnimatePresence>
 {isSidebarOpen && window.innerWidth <= 768 && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsSidebarOpen(false)}
 className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-30 md:hidden"
 />
 )}
 </AnimatePresence>

 <AnimatePresence initial={false}>
 {isSidebarOpen && (
 <motion.aside 
 initial={{ x: -320, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 exit={{ x: -320, opacity: 0 }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed md:relative inset-y-0 left-0 w-[280px] md:w-[320px] border-r border-surface-high flex flex-col bg-surface-low z-40 md:z-20 shadow-2xl md:shadow-none"
 >
 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between md:hidden mb-4">
 <span className="font-semibold text-primary tracking-tight">對話列表</span>
 <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-primary/5 rounded-lg"><X size={24} /></button>
 </div>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
 <input 
 type="text"
 placeholder="搜尋對話..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white rounded-full border border-surface-high py-3 pl-10 pr-4 font-bold focus:outline-none focus:border-primary text-sm"
 />
 </div>
 <button 
 onClick={createNewSession}
 className="w-full bg-primary text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md press-feedback"
 >
 <Plus size={20} /> 新對話
 </button>
 </div>
 
 <div className="flex-grow overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
 {filteredSessions.map(s => (
 <div 
 key={s.id}
 onClick={() => {
 setCurrentSessionId(s.id);
 if (window.innerWidth <= 768) setIsSidebarOpen(false);
 }}
 className={`group flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all ${
 currentSessionId === s.id ? 'bg-primary/5 text-primary' : 'hover:bg-primary/5 text-primary/70'
 }`}
 >
 <div className="flex items-center gap-3 overflow-hidden">
 <MessageSquare size={16} className={currentSessionId === s.id ? 'text-primary' : 'text-primary/30'} />
 <span className={`text-sm truncate ${currentSessionId === s.id ? 'font-bold' : 'font-medium'}`}>{s.title}</span>
 </div>
 <button 
 onClick={(e) => deleteSession(s.id, e)}
 className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:bg-primary/10 rounded-md text-primary/40 transition-opacity"
 >
 <Trash2 size={14} />
 </button>
 </div>
 ))}
 </div>
 </motion.aside>
 )}
 </AnimatePresence>

 <main className="flex-grow flex flex-col relative min-w-0 w-full">
 <header className="h-16 border-b border-surface-high/70 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
 <div className="flex items-center gap-3 md:gap-4">
 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-surface-low rounded-lg text-primary transition-colors">
 <Menu size={24} />
 </button>
 <h2 className="font-semibold text-primary tracking-tight truncate max-w-[150px] sm:max-w-md text-sm md:text-base">
 {currentSession?.title || "Hengbo AI"}
 </h2>
 </div>
 <div className="flex items-center gap-2 md:gap-3">
 <div className="flex items-center bg-surface-low rounded-lg p-1 text-[10px] sm:text-xs font-semibold tracking-wide" title="切換 AI 模型">
 <button
 onClick={() => setAiModel("flash")}
 className={`px-2 sm:px-3 py-1.5 rounded-md transition-colors ${aiModel === "flash"? "bg-primary text-white": "text-primary/50 hover:text-primary"}`}
 >
 Flash
 </button>
 <button
 onClick={() => setAiModel("antigravity")}
 className={`px-2 sm:px-3 py-1.5 rounded-md transition-colors ${aiModel === "antigravity"? "bg-secondary text-white": "text-primary/50 hover:text-primary"}`}
 >
 Agent
 </button>
 </div>
 <button 
 onClick={(e) => currentSessionId && deleteSession(currentSessionId, e)} 
 className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
 title="刪除當前對話"
 >
 <Trash2 size={20} />
 </button>
 </div>
 </header>

 <div ref={scrollRef} onScroll={handleScroll} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6 custom-scrollbar bg-white">
 {messages.map((msg) => (
 <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`group flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
 <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center overflow-hidden ${msg.role === 'user' ? 'bg-surface-high' : 'bg-surface-low'}`}>
 {msg.role === 'user' ? <User size={14} className="text-primary/50"/> : <i className="fa-solid fa-disease text-sm text-primary" aria-hidden="true"></i>}
 </div>
 <div className={`max-w-[82%] md:max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
 <div className={`text-sm md:text-[15px] font-medium leading-relaxed px-4 py-2.5 ${
 msg.role === 'user'
 ? 'bg-primary text-white rounded-2xl rounded-br-md'
 : 'bg-surface-low text-ink rounded-2xl rounded-bl-md'
 }`}>
 {msg.role === 'user' ? <div className="whitespace-pre-wrap">{msg.content}</div> : (
 <div className="markdown-content prose prose-sm max-w-none">
 <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
 </div>
 )}
 {msg.imageUrl && (
 <div className="mt-3 rounded-xl overflow-hidden border border-primary/10 bg-white">
 <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto max-h-[400px] md:max-h-[500px] object-contain"/>
 <div className="p-2.5 bg-surface-high text-primary text-[10px] font-bold flex justify-between items-center">
 <span>AI GENERATED CONCEPT</span>
 <a href={msg.imageUrl} target="_blank" rel="noreferrer" className="underline hover:text-secondary">VIEW ORIGINAL</a>
 </div>
 </div>
 )}
 </div>
 <button
 type="button"
 onClick={() => handleCopyMessage(msg.id, msg.content)}
 className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-primary/35 hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity focus:opacity-100"
 title="複製訊息"
 >
 {copiedMessageId === msg.id ? (
 <><Check size={12} className="text-secondary"/> 已複製</>
 ) : (
 <><Copy size={12} /> 複製</>
 )}
 </button>
 </div>
 </motion.div>
 ))}
 {isTyping && (
 <div className="flex items-end gap-2.5">
 <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-surface-low overflow-hidden">
 <i className="fa-solid fa-disease text-sm text-primary" aria-hidden="true"></i>
 </div>
 <div className="bg-surface-low px-4 py-3.5 rounded-2xl rounded-bl-md flex gap-1.5">
 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-muted rounded-full"/>
 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted rounded-full"/>
 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted rounded-full"/>
 </div>
 </div>
 )}
 </div>

 <footer className="p-4 md:p-6 bg-white border-t border-primary/10 pb-safe">
 <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
 {selectedFile && (
 <div className="absolute bottom-full left-0 mb-3 p-2.5 pl-3 bg-surface-low rounded-xl flex items-center gap-2.5 border border-primary/10 animate-in slide-in-from-bottom-2">
 <Paperclip size={14} className="text-primary/50"/>
 <span className="text-xs font-medium text-primary truncate max-w-[150px] md:max-w-[200px]">{selectedFile.name}</span>
 <button type="button" onClick={() => setSelectedFile(null)} className="text-primary/40 hover:text-secondary transition-colors"><X size={14} /></button>
 </div>
 )}
 <div className="flex items-end gap-2 bg-surface-low p-1.5 rounded-3xl ring-1 ring-transparent focus-within:ring-primary/30 transition-all">
 <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-primary/40 hover:text-primary transition-colors"><Paperclip size={20} /></button>
 <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden"/>
 <textarea 
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) { e.preventDefault(); handleSendMessage(e); } }}
 placeholder="輸入訊息..."
 className="flex-grow bg-transparent border-none focus:ring-0 py-2.5 font-medium text-ink resize-none max-h-32 custom-scrollbar text-sm md:text-base placeholder:text-primary/30"
 rows={1}
 />
 <button disabled={(!input.trim() && !selectedFile) || isTyping} className="shrink-0 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-secondary transition-all disabled:opacity-30">
 <Send size={18} />
 </button>
 </div>
 </form>
 </footer>
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
 window.scrollTo({ top: 0, behavior: "smooth"});
 };

 return (
 <div className="font-manrope text-primary selection:bg-secondary selection:text-white min-h-screen">
 <AnimatePresence>{isLoading && <LoadingScreen key="loading"/>}</AnimatePresence>
 
 <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
 
 <AnimatePresence mode="wait">
 {activeTab === "home"&& <HomeView key="home" setActiveTab={setActiveTab} />}
 {activeTab === "services"&& <ServicesView key="services" setActiveTab={setActiveTab} />}
 {activeTab === "cases"&& <CasesView key="cases" setActiveTab={setActiveTab} />}
 {activeTab === "about"&& <AboutView key="about" setActiveTab={setActiveTab} />}
 {activeTab === "contact"&& <ContactView key="contact"/>}
 {activeTab === "ai"&& <AIView key="ai"/>}
 </AnimatePresence>

 {activeTab !== "ai"&& <Footer setActiveTab={setActiveTab} />}

 <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3 pb-safe">
 <AnimatePresence>
 {showScrollTop && activeTab !== "ai"&& (
 <motion.button
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.5 }}
 onClick={scrollToTop}
 className="bg-primary text-white p-3.5 md:p-4 rounded-[28px] shadow-xl hover:bg-secondary snap-transition"
 >
 <ArrowRight size={24} className="-rotate-90 md:hidden"/>
 <ArrowRight size={32} className="-rotate-90 hidden md:block"/>
 </motion.button>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}
