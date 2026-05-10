import React from "react";
import { motion } from "motion/react";
import { Building2, Palette, Network, Layout } from "lucide-react";

export const Cases: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-24 brutalist-grid"
    >
      <section className="px-8 py-32">
        <div className="max-w-7xl mx-auto mb-24">
          <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block">實戰成果展示</span>
          <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black tracking-tighter leading-none text-primary uppercase">
            精選<br/>
            <span className="text-stroke">成功案例</span>
          </h1>
        </div>

        <section className="px-4 md:px-8">
          <div className="grid grid-cols-12 gap-4 md:gap-8">
            {/* Case 1 */}
            <div className="col-span-12 md:col-span-7 bg-surface-high brutalist-border group cursor-pointer snap-transition hover:bg-primary hover:text-white p-8 flex flex-col justify-between min-h-[450px]">
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
                    <p className="font-bold text-xl leading-relaxed">成功協助對接種子輪投資，並撰寫完整的商業計畫書與技術架構說明。</p>
                    <p className="font-black text-3xl">募資總額突破 2,000 萬</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </motion.div>
  );
};
