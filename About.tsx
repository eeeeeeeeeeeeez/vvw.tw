import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Building2, ArrowRight } from "lucide-react";
import { Logo } from "../components/Logo";

export const About: React.FC = () => {
  const navigate = useNavigate();
  return (
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
                  { title: "專業精準", desc: "以數據為核心，提供最具市場競爭力的專業建議。" },
                  { title: "高效執行", desc: "強調速度與品質的平衡，確保每一個專案都能如期達成目標。" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 border-2 border-primary/5 hover:border-secondary/20 snap-transition">
                    <div className="text-secondary font-black text-lg">0{i+1}</div>
                    <div>
                      <h4 className="font-black text-primary uppercase tracking-tighter mb-1">{item.title}</h4>
                      <p className="text-sm text-muted font-bold">{item.desc}</p>
                    </div>
                  </div>
                ))}
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
              onClick={() => navigate("/contact")}
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
};
