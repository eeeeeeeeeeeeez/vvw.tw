import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Footer: React.FC = () => (
  <footer className="bg-primary border-t-4 border-secondary w-full px-6 md:px-8 py-12 md:py-24 mt-12 md:mt-24">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-white">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-4 mb-8">
          <Logo className="w-12 h-12" variant="white" />
          <span className="text-4xl font-black block">亨波趨勢</span>
        </div>
        <p className="font-bold text-sm tracking-widest uppercase opacity-85 max-w-lg leading-relaxed">
          © 2026 <Logo className="w-4 h-4 mx-1" variant="white" /> HENGBO TREND. MASTERING TRENDS, MAXIMIZING IMPACT.<br/>
          專業企劃、補助申請、品牌設計與廣告投放的一站式顧問夥伴。
        </p>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">導覽導航</span>
          <Link to="/services" className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">專業服務</Link>
          <Link to="/cases" className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">精選案例</Link>
          <Link to="/about" className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">關於我們</Link>
          <Link to="/contact" className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">聯繫我們</Link>
          <Link to="/ai" className="text-left text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">亨波 AI</Link>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-secondary font-black tracking-widest uppercase">社群連結</span>
          <a href="https://www.facebook.com/share/1H7nCUSiie/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">Facebook</a>
          <a href="https://lin.ee/XrjcRfb" target="_blank" rel="noopener noreferrer" className="text-surface-high hover:text-secondary snap-transition uppercase font-bold text-sm tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">LINE</a>
        </div>
      </div>
    </div>
  </footer>
);
