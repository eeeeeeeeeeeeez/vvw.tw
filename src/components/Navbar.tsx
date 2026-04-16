import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "./Logo";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const tabs = [
    { path: "/", label: "首頁" },
    { path: "/services", label: "專業服務" },
    { path: "/cases", label: "精選案例" },
    { path: "/about", label: "關於我們" },
    { path: "/ai", label: "亨波 AI" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-primary flex justify-between items-center px-6 md:px-8 py-4 max-w-[1920px] mx-auto">
      <Link 
        to="/"
        className="flex items-center gap-3 text-xl md:text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Logo className="w-8 h-8 md:w-10 md:h-10" />
        亨波趨勢
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-12">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`font-black uppercase tracking-tighter px-2 py-1 snap-transition ${
              isActive(tab.path) 
                ? "text-secondary border-b-2 border-secondary" 
                : "text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="/contact"
          className="hidden sm:block bg-primary text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-secondary snap-transition text-sm"
        >
          立即諮詢
        </Link>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-primary hover:bg-surface-low rounded-lg transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b-4 border-primary shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-left py-4 px-6 font-black uppercase tracking-widest text-lg border-2 ${
                    isActive(tab.path) 
                      ? "bg-primary text-white border-primary" 
                      : "text-primary border-transparent hover:border-primary/10"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
              <Link 
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="w-full bg-secondary text-white py-5 font-black uppercase tracking-[0.2em] text-lg shadow-lg text-center"
              >
                立即諮詢
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
