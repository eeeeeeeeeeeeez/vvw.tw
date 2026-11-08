import React from "react";
import { motion } from "motion/react";
import { FileText, Rocket, Palette, TrendingUp, Network, BadgeCheck } from "lucide-react";

export const Services: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="pt-24 brutalist-grid"
  >
    <section className="px-8 py-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-32">
          <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block">專業服務範疇</span>
          <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black tracking-tighter leading-none text-primary uppercase">
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
            <div key={idx} className="group bg-white brutalist-border p-12 hover:bg-primary hover:text-white snap-transition">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);
