import React, { useState, useEffect, useRef } from "react";
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
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Constants ---
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 從環境變數讀取管理員帳密（應在 .env.local 中設定）
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "hengbo2026";

// --- Types ---
interface Message {
  role: "user" | "ai";
  content: string;
  id: string;
  timestamp: Date;
}

// --- Components ---

const Logo = ({ className = "w-8 h-8", variant = "default" }: { className?: string, variant?: "default" | "white" }) => (
  <img 
    src="/logo.png" 
    alt="HENGBO TREND Logo"
    className={`inline-block object-contain ${variant === "white" ? "brightness-0 invert" : ""} ${className}`}
    referrerPolicy="no-referrer"
  />
);

const LoadingScreen = () => (
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

const Navbar: React.FC<{ activeTab: string, setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "home", label: "首頁" },
    { id: "services", label: "專業服務" },
    { id: "cases", label: "精選案例" },
    { id: "about", label: "關於我們" },
    { id: "ai", label: "亨波 AI" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-primary flex justify-between items-center px-8 py-4 max-w-[1920px] mx-auto">
      <div 
        className="flex items-center gap-3 text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer"
        onClick={() => setActiveTab("home")}
      >
        <Logo className="w-10 h-10" />
        亨波趨勢
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

// 簡化版 Footer（保持原有風格）
const Footer: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <footer className="bg-primary border-t-4 border-secondary w-full px-8 py-24 mt-24">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-4 mb-8">
          <Logo className="w-12 h-12" variant="white" />
          <span className="text-4xl font-black block">亨波趨勢</span>
        </div>
        <p className="font-bold text-sm tracking-widest uppercase opacity-70 max-w-lg">
          © 2026 <Logo className="w-4 h-4 mx-1" variant="white" /> HENGBO TREND. MASTERING TRENDS, MAXIMIZING IMPACT.
        </p>
      </div>
    </div>
  </footer>
);

// 佔位符視圖（原有的 HomeView, ServicesView 等）
const HomeView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <div className="pt-24 min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-8 py-24">
      <h1 className="text-6xl font-black text-primary mb-8">亨波趨勢</h1>
      <p className="text-xl text-muted">企業諮詢與 AI 助手平台</p>
    </div>
  </div>
);

const ServicesView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <div className="pt-24 min-h-screen bg-white"><div className="max-w-7xl mx-auto px-8 py-24"><h1 className="text-6xl font-black text-primary">專業服務</h1></div></div>
);

const CasesView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <div className="pt-24 min-h-screen bg-white"><div className="max-w-7xl mx-auto px-8 py-24"><h1 className="text-6xl font-black text-primary">精選案例</h1></div></div>
);

const AboutView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <div className="pt-24 min-h-screen bg-white"><div className="max-w-7xl mx-auto px-8 py-24"><h1 className="text-6xl font-black text-primary">關於我們</h1></div></div>
);

const ContactView: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => (
  <div className="pt-24 min-h-screen bg-white"><div className="max-w-7xl mx-auto px-8 py-24"><h1 className="text-6xl font-black text-primary">聯絡我們</h1></div></div>
);

// ========== 改進的 AIView 組件 ==========
const AIView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 自動滾動到最新訊息
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 0);
    }
  }, [messages, shouldAutoScroll]);

  // 監聽滾動位置，判斷是否應該自動滾動
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setMessages([{ 
        role: "ai", 
        content: "您好！我是亨波 AI 助手。很高興為您服務，請問今天有什麼我可以幫您的嗎？",
        id: `msg-${Date.now()}`,
        timestamp: new Date()
      }]);
      setUsername("");
      setPassword("");
    } else {
      setLoginError("帳號或密碼錯誤，請重新輸入。");
    }
  };

  const generateMessageId = () => `msg-${Date.now()}-${Math.random()}`;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const userMessageId = generateMessageId();
    const aiMessageId = generateMessageId();
    
    setInput("");
    setMessages(prev => [...prev, { 
      role: "user", 
      content: userMsg, 
      id: userMessageId,
      timestamp: new Date()
    }]);
    setIsTyping(true);
    setStreamingMessageId(aiMessageId);

    try {
      // 建立 AI 回應的初始訊息
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "", 
        id: aiMessageId,
        timestamp: new Date()
      }]);

      // 使用串流 API 獲取回應
      const response = await genAI.models.generateContentStream({
        model: "gemini-4-31b-it",
        systemInstruction: "你是一位專業的『亨波 AI 助手』。請務必使用『繁體中文』直接回答使用者的問題。提供清晰、簡潔、有幫助的回答。",
        contents: [
          ...messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: [{ text: userMsg }] }
        ],
      });

      let fullText = "";

      // 逐塊接收回應並更新 UI
      for await (const chunk of response) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        
        // 更新訊息內容（串流效果）
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullText }
            : msg
        ));
      }

      setStreamingMessageId(null);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      const errorDetail = error?.message || "未知錯誤";
      const errorMessageId = generateMessageId();
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: `抱歉，目前 AI 服務暫時無法回應。請稍後重試。（錯誤代碼：${errorDetail}）`,
        id: errorMessageId,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setStreamingMessageId(null);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("確定要清除所有對話記錄嗎？")) {
      setMessages([{ 
        role: "ai", 
        content: "對話記錄已清除。請問有什麼我可以幫您的嗎？",
        id: generateMessageId(),
        timestamp: new Date()
      }]);
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isLoggedIn) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen flex items-center justify-center bg-surface-low px-8 pt-24"
      >
        <div className="w-full max-w-md bg-white brutalist-border-heavy p-12">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-primary flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">亨波 AI 登入</h2>
            <p className="text-muted font-bold mt-2">請輸入您的帳密以訪問 AI 助手</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-xs text-secondary">帳號</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input 
                  required
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface-low border-b-4 border-primary p-4 pl-12 font-bold focus:outline-none focus:border-secondary snap-transition" 
                  placeholder="Username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-xs text-secondary">密碼</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-low border-b-4 border-primary p-4 pl-12 font-bold focus:outline-none focus:border-secondary snap-transition" 
                  placeholder="Password"
                />
              </div>
            </div>

            {loginError && <p className="text-red-600 font-bold text-sm uppercase">{loginError}</p>}

            <button className="w-full bg-primary text-white py-6 font-black uppercase tracking-[0.3em] text-xl hover:bg-secondary snap-transition">
              進入系統
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pt-24 min-h-screen flex flex-col bg-white"
    >
      <header className="px-8 py-12 border-b-2 border-primary bg-surface-low sticky top-24 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-secondary p-3 text-white">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none">亨波 AI 助手</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-muted uppercase tracking-widest">系統已連線</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleClearChat}
              className="text-primary font-black uppercase tracking-widest border-b-2 border-primary hover:text-secondary hover:border-secondary snap-transition flex items-center gap-2"
              title="清除對話"
            >
              <Trash2 size={20} />
              <span className="hidden sm:inline">清除</span>
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-primary font-black uppercase tracking-widest border-b-2 border-primary hover:text-secondary hover:border-secondary snap-transition"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-hidden flex flex-col max-w-5xl w-full mx-auto px-8 py-12">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto space-y-8 pr-4 custom-scrollbar"
        >
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] py-4 group ${
                msg.role === 'user' 
                  ? 'text-right' 
                  : 'text-left'
              }`}>
                <div className={`flex items-center gap-2 mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">YOU</span>
                      <div className="w-6 h-6 bg-primary text-white flex items-center justify-center">
                        <User size={12} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-secondary text-white flex items-center justify-center">
                        <Sparkles size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">HENGBO AI</span>
                    </>
                  )}
                </div>
                <div className={`inline-block text-lg font-bold leading-relaxed tracking-tight ${
                  msg.role === 'user' ? 'text-primary bg-surface-low rounded px-4 py-2' : 'text-primary'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-content prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto my-2">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-200 px-2 py-1 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          table: ({node, ...props}) => (
                            <table className="border-collapse border border-gray-300 my-2 w-full" {...props} />
                          ),
                          th: ({node, ...props}) => (
                            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="border border-gray-300 px-3 py-2" {...props} />
                          ),
                          a: ({node, ...props}) => (
                            <a className="text-secondary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                
                {/* 複製按鈕 */}
                {msg.role === 'ai' && msg.content && (
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-muted hover:text-primary flex items-center gap-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={14} /> 已複製
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> 複製
                      </>
                    )}
                  </button>
                )}
                
                {msg.role === 'ai' && <div className="w-12 h-1 bg-secondary mt-6 opacity-30" />}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start py-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-secondary/20 flex items-center justify-center animate-pulse">
                  <Sparkles size={12} className="text-secondary" />
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-12 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white brutalist-border-heavy p-8 pr-24 font-bold text-xl focus:outline-none focus:border-secondary snap-transition"
            placeholder="請輸入您的問題..."
            disabled={isTyping}
          />
          <button 
            disabled={isTyping || !input.trim()}
            className="absolute right-4
