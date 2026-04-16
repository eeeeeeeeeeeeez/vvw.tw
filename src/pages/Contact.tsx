import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, Check } from "lucide-react";

export const Contact: React.FC = () => {
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
        body: JSON.stringify({
          name: formState.name,
          organization: formState.org,
          email: formState.email,
          subject: formState.subject,
          message: formState.message
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsSubmitted(true);
        setFormState({ name: "", org: "", email: "", subject: "企劃撰寫諮詢", message: "" });
      } else {
        setSubmitError(json.error || "提交失敗，請檢查資料格式。");
      }
    } catch {
      setSubmitError("網路異常，請稍後再試。");
    }
    setIsSubmitting(false);
  };

  const faqs = [
    { q: "諮詢需要費用嗎？", a: "首次諮詢與需求評估完全免費。我們會先了解您的現狀，再提供初步建議。" },
    { q: "補助申請過件率高嗎？", a: "我們會先進行資格預審，只有在符合條件且具備競爭力的情況下才建議送件。目前我們的過件率維持在 85% 以上。" },
    { q: "企劃撰寫需要多久時間？", a: "視專案複雜度而定，一般商業計畫書約需 10-14 個工作天，政府補助計畫書則建議預留 3-4 週進行深度規劃。" }
  ];

  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-xl w-full bg-white brutalist-border p-12 text-center">
          <div className="w-24 h-24 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Check size={48} />
          </div>
          <h2 className="text-4xl font-black text-primary uppercase tracking-tighter mb-4">訊息已送出！</h2>
          <p className="text-muted font-bold mb-12">感謝您的諮詢。我們的顧問將在 24 小時內與您聯繫。</p>
          <button onClick={() => setIsSubmitted(false)} className="bg-primary text-white px-12 py-5 font-black uppercase tracking-widest hover:bg-secondary snap-transition">再次提交</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 brutalist-grid">
      <section className="px-8 py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <div className="mb-16">
              <span className="font-black uppercase tracking-[0.4em] text-secondary mb-4 block">聯繫我們</span>
              <h1 className="text-[clamp(3.5rem,10vw,6rem)] font-black tracking-tighter leading-none text-primary uppercase">
                啟動您的<br/>
                <span className="text-stroke">成長計畫</span>
              </h1>
            </div>

            <div className="space-y-12 mb-24">
              <div className="flex gap-8 group">
                <div className="w-16 h-16 bg-primary text-white flex items-center justify-center brutalist-border group-hover:bg-secondary snap-transition shrink-0"><Mail size={32} /></div>
                <div>
                  <span className="font-black uppercase tracking-widest text-xs text-secondary mb-2 block">電子郵件</span>
                  <a href="mailto:service@hengbo.trend" className="text-2xl font-black text-primary hover:text-secondary snap-transition">service@hengbo.trend</a>
                </div>
              </div>
              <div className="flex gap-8 group">
                <div className="w-16 h-16 bg-primary text-white flex items-center justify-center brutalist-border group-hover:bg-secondary snap-transition shrink-0"><Phone size={32} /></div>
                <div>
                  <span className="font-black uppercase tracking-widest text-xs text-secondary mb-2 block">諮詢專線</span>
                  <a href="tel:0212345678" className="text-2xl font-black text-primary hover:text-secondary snap-transition">02-1234-5678</a>
                </div>
              </div>
              <div className="flex gap-8 group">
                <div className="w-16 h-16 bg-primary text-white flex items-center justify-center brutalist-border group-hover:bg-secondary snap-transition shrink-0"><MapPin size={32} /></div>
                <div>
                  <span className="font-black uppercase tracking-widest text-xs text-secondary mb-2 block">公司地址</span>
                  <p className="text-2xl font-black text-primary">台北市信義區忠孝東路五段 1 號</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-high p-8 border-l-8 border-primary">
              <h3 className="text-xl font-black text-primary uppercase mb-8 flex items-center gap-3"><HelpCircle className="text-secondary" /> 常見問題</h3>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b-2 border-primary/5 pb-4">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center text-left py-2 group">
                      <span className="font-black text-primary group-hover:text-secondary snap-transition">{faq.q}</span>
                      <ChevronDown size={20} className={`snap-transition ${openFaq === i ? "rotate-180 text-secondary" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="text-sm font-bold text-muted pt-4 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white brutalist-border-heavy p-8 md:p-12 relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary -z-10"></div>
            <h2 className="text-3xl font-black text-primary uppercase mb-12 tracking-tight">立即填寫諮詢表單</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="font-black uppercase tracking-widest text-[10px] text-secondary">您的姓名 *</label>
                  <input required type="text" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="w-full bg-surface-low border-2 border-primary/10 py-4 px-6 font-bold focus:outline-none focus:border-primary snap-transition" placeholder="姓名" />
                </div>
                <div className="space-y-2">
                  <label className="font-black uppercase tracking-widest text-[10px] text-secondary">所屬組織</label>
                  <input type="text" value={formState.org} onChange={(e) => setFormState({...formState, org: e.target.value})} className="w-full bg-surface-low border-2 border-primary/10 py-4 px-6 font-bold focus:outline-none focus:border-primary snap-transition" placeholder="公司或機構名稱" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase tracking-widest text-[10px] text-secondary">電子郵件 *</label>
                <input required type="email" value={formState.email} onChange={(e) => setFormState({...formState, email: e.target.value})} className="w-full bg-surface-low border-2 border-primary/10 py-4 px-6 font-bold focus:outline-none focus:border-primary snap-transition" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase tracking-widest text-[10px] text-secondary">諮詢項目 *</label>
                <select value={formState.subject} onChange={(e) => setFormState({...formState, subject: e.target.value})} className="w-full bg-surface-low border-2 border-primary/10 py-4 px-6 font-bold focus:outline-none focus:border-primary snap-transition appearance-none">
                  <option>企劃撰寫諮詢</option>
                  <option>補助申請輔導</option>
                  <option>品牌設計規劃</option>
                  <option>廣告投放策略</option>
                  <option>其他合作需求</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase tracking-widest text-[10px] text-secondary">需求說明 *</label>
                <textarea required rows={5} value={formState.message} onChange={(e) => setFormState({...formState, message: e.target.value})} className="w-full bg-surface-low border-2 border-primary/10 py-4 px-6 font-bold focus:outline-none focus:border-primary snap-transition resize-none" placeholder="請簡單描述您的需求..."></textarea>
              </div>
              
              {submitError && <p className="text-secondary font-black text-sm uppercase tracking-widest">{submitError}</p>}
              
              <button disabled={isSubmitting} className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.2em] text-xl shadow-lg hover:bg-secondary snap-transition flex items-center justify-center gap-4 disabled:opacity-50">
                {isSubmitting ? "傳送中..." : "送出諮詢表單"}
                <Send size={24} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
