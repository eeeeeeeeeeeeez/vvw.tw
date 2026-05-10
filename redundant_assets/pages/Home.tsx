import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, Target, Zap, ShieldCheck, FileText, Rocket } from "lucide-react";
import { Logo } from "../components/Logo";

export const Home: React.FC = () => {
  const navigate = useNavigate();
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
              <div className="flex flex-col justify-center">
                <span className="text-white font-black text-xl tracking-widest">HENGBO TREND</span>
                <span className="text-white/60 font-bold text-xs uppercase tracking-[0.3em]">Strategic Consulting</span>
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
              { icon: <Target className="text-secondary" size={48} />, title: "精準策略", desc: "基於深度市場洞察與數據分析，為您的企業量身打造具備高度執行力的成長藍圖。" },
              { icon: <Zap className="text-secondary" size={48} />, title: "高效執行", desc: "從企劃撰寫到資源對接，我們強調速度與品質的平衡，確保每一個專案都能如期達成目標。" },
              { icon: <ShieldCheck className="text-secondary" size={48} />, title: "專業保障", desc: "擁有豐富的政府補助申請經驗與品牌行銷實績，是您在商場競爭中最堅實的後盾。" }
            ].map((item, i) => (
              <div key={i} className="p-8 border-4 border-primary hover:bg-surface-low transition-colors">
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="font-bold text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
              <p className="text-xl max-w-xl font-medium mb-8 leading-relaxed">從市場洞察到可執行藍圖，一份讓投資人與團隊都買單的企劃。我們專注於邏輯架構與商業價值的深度挖掘。</p>
              <div className="w-16 h-2 bg-secondary"></div>
            </div>
            <div className="col-span-12 md:col-span-4 bg-secondary p-12 text-white brutalist-border border-secondary relative">
              <span className="text-white/50 font-black text-2xl mb-8 block">02</span>
              <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-black mb-6 uppercase">補助申請</h3>
              <Rocket size={80} className="mb-8" />
              <p className="font-bold mb-8 leading-relaxed">對接政府資源，極大化研發與轉型動能。我們提供從資格評估到結案報告的全程專業輔導。</p>
              <button onClick={() => navigate("/services")} className="bg-white text-primary px-6 py-3 font-black uppercase tracking-widest hover:bg-primary hover:text-white snap-transition">了解更多</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-40 bg-white">
        <div className="max-w-4xl mx-auto text-center">
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
            <button 
              onClick={handleSubscribe}
              disabled={ctaLoading}
              className="bg-primary text-white px-12 py-6 font-black text-xl uppercase tracking-widest hover:bg-secondary snap-transition disabled:opacity-50"
            >
              {ctaLoading ? "處理中..." : "立即訂閱"}
            </button>
          </div>
          {ctaMsg && <p className="mt-4 font-black text-secondary uppercase tracking-widest">{ctaMsg}</p>}
        </div>
      </section>
    </motion.div>
  );
};
