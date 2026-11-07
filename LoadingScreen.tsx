import React from "react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

export const LoadingScreen = () => (
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
