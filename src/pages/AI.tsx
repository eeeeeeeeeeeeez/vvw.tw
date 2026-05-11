import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, MessageSquare, Trash2, Send, Paperclip, 
  Sparkles, Bot, User, RefreshCw, Copy, Check, MoreVertical,
  X, Menu, Eye, EyeOff, Lock, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import { Message, ChatSession, SelectedFile } from "../types";
import { ADMIN_USERNAME, ADMIN_PASSWORD, SESSIONS_STORAGE_KEY } from "../constants";
import { Navbar } from "../components/Navbar";

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const AI: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((s: any) => ({
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
        content: "您好！我是亨波 AI 顧問。很高興為您服務，請問今天有什麼我可以幫您的嗎？",
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

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        let newTitle = s.title;
        if (s.title === "新對話" || s.title === "未命名對話") {
          const firstUserMsg = newMessages.find(m => m.role === "user");
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? "..." : "");
          }
        }
        return { ...s, messages: newMessages, title: newTitle, lastUpdated: new Date() };
      }
      return s;
    }));
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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
          fullText += `[Page ${i}]\n${textContent.items.map((item: any) => item.str).join(" ")}\n\n`;
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isTyping || !currentSessionId) return;

    let userMsg = input.trim() || (selectedFile ? `請分析這份檔案：${selectedFile.name}` : "");
    const currentFile = selectedFile;
    const userMsgId = `msg-${Date.now()}-u`;
    const aiMsgId = `msg-${Date.now()}-a`;

    const newUserMsg: Message = { role: "user", content: userMsg, id: userMsgId, timestamp: new Date() };
    const newAiMsg: Message = { role: "ai", content: "", id: aiMsgId, timestamp: new Date() };
    
    const updatedMessages = [...messages, newUserMsg, newAiMsg];
    updateSessionMessages(currentSessionId, updatedMessages);
    
    setInput("");
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-10),
          userMsg,
          fileData: currentFile ? {
            name: currentFile.name,
            type: currentFile.type,
            content: currentFile.content
          } : null
        })
      });

      if (!response.ok) throw new Error('伺服器回應錯誤');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') break;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  fullText += data.text;
                  setSessions(prev => prev.map(s => s.id === currentSessionId ? {
                    ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m)
                  } : s));
                }
              } catch (e) { /* 忽略不完整的 JSON */ }
            }
          }
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-surface-low px-6 pt-24 relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white border-2 border-primary shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] p-8 md:p-12">
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 bg-primary flex items-center justify-center mb-6 shadow-lg"><Lock className="w-12 h-12 text-white" /></div>
              <h2 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">亨波 AI 顧問</h2>
              <p className="text-muted font-bold text-sm uppercase tracking-widest">安全驗證 1.0.0-beta.2</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="font-black uppercase tracking-widest text-[10px] text-secondary">顧問帳號</label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} /><input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-surface-low border-2 border-primary/10 py-3 pl-10 font-bold focus:outline-none focus:border-primary" placeholder="Consultant ID" /></div>
              </div>
              <div className="space-y-2">
                <label className="font-black uppercase tracking-widest text-[10px] text-secondary">安全授權碼</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} /><input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-low border-2 border-primary/10 py-3 pl-10 pr-10 font-bold focus:outline-none focus:border-primary" placeholder="Access Key" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
              </div>
              {loginError && <div className="bg-secondary/10 border-l-4 border-secondary p-3 text-secondary font-bold text-xs uppercase">{loginError}</div>}
              <button className="w-full bg-primary text-white py-5 font-black uppercase tracking-[0.2em] text-lg shadow-lg hover:bg-secondary transition-all flex items-center justify-center gap-3">授權並進入 <ArrowRight size={20} /></button>
            </form>
            <div className="mt-8 pt-8 border-t-2 border-primary/10 flex justify-center">
              <p className="text-primary/40 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                還沒有顧問帳號嗎？
                <a 
                  href="https://lin.ee/ZegJcQj" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-secondary transition-colors underline underline-offset-4 decoration-2"
                >
                  取得帳號
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <Navbar />
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
              className="fixed md:relative inset-y-0 left-0 w-[280px] md:w-[320px] border-r-2 border-primary/10 flex flex-col bg-surface-low z-40 md:z-20 shadow-2xl md:shadow-none"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between md:hidden mb-4">
                  <span className="font-black text-primary uppercase tracking-tighter">對話列表</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-primary/5 rounded-lg"><X size={24} /></button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                  <input 
                    type="text" 
                    placeholder="搜尋對話..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-primary/10 py-3 pl-10 pr-4 font-bold focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <button 
                  onClick={createNewSession}
                  className="w-full bg-primary text-white py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary transition-all shadow-md"
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
                    className={`group flex items-center justify-between p-4 cursor-pointer rounded-lg transition-all ${
                      currentSessionId === s.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/5 text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={18} className={currentSessionId === s.id ? 'text-white' : 'text-secondary'} />
                      <span className="font-bold text-sm truncate">{s.title}</span>
                    </div>
                    <button 
                      onClick={(e) => deleteSession(s.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-opacity ${currentSessionId === s.id ? 'text-white' : 'text-primary/40'}`}
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
          <header className="h-16 border-b-2 border-primary/5 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-surface-low rounded-lg text-primary transition-colors">
                <Menu size={24} />
              </button>
              <h2 className="font-black text-primary uppercase tracking-tighter truncate max-w-[150px] sm:max-w-md text-sm md:text-base">
                {currentSession?.title || "亨波 AI 顧問"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => currentSessionId && deleteSession(currentSessionId, e)} 
                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" 
                title="刪除當前對話"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </header>

          <div ref={scrollRef} onScroll={handleScroll} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] md:max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'justify-end text-muted' : 'text-secondary'}`}>
                    {msg.role === 'user' ? <><User size={12} /> 使用者</> : <><Bot size={12} /> 亨波 AI 顧問</>}
                  </div>
                  <div className={`inline-block text-sm md:text-base font-bold leading-relaxed p-3 md:p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface-low text-primary rounded-tl-none border border-primary/5'
                  }`}>
                    {msg.role === 'user' ? <div className="whitespace-pre-wrap">{msg.content}</div> : (
                      <div className="markdown-content prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                    {msg.imageUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border-2 border-primary/10 bg-white">
                        <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto max-h-[400px] md:max-h-[500px] object-contain" />
                        <div className="p-3 bg-primary text-white text-[10px] font-black flex justify-between items-center">
                          <span>AI GENERATED CONCEPT</span>
                          <a href={msg.imageUrl} target="_blank" rel="noreferrer" className="underline hover:text-secondary">VIEW ORIGINAL</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-low p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-secondary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-secondary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-secondary rounded-full" />
                </div>
              </div>
            )}
          </div>

          <footer className="p-4 md:p-6 bg-white border-t-2 border-primary/5">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
              {selectedFile && (
                <div className="absolute bottom-full left-0 mb-4 p-3 bg-secondary text-white rounded-lg flex items-center gap-3 shadow-xl animate-in slide-in-from-bottom-2">
                  <Paperclip size={16} />
                  <span className="text-xs font-black truncate max-w-[150px] md:max-w-[200px]">{selectedFile.name}</span>
                  <button type="button" onClick={() => setSelectedFile(null)} className="hover:text-primary transition-colors"><X size={16} /></button>
                </div>
              )}
              <div className="flex items-end gap-2 md:gap-3 bg-surface-low p-2 rounded-2xl border-2 border-transparent focus-within:border-primary transition-all">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-primary/40 hover:text-primary transition-colors"><Paperclip size={24} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) { e.preventDefault(); handleSendMessage(e); } }}
                  placeholder="輸入訊息..."
                  className="flex-grow bg-transparent border-none focus:ring-0 py-3 font-bold text-primary resize-none max-h-32 custom-scrollbar text-sm md:text-base"
                  rows={1}
                />
                <button disabled={(!input.trim() && !selectedFile) || isTyping} className="p-2 md:p-3 bg-primary text-white rounded-xl hover:bg-secondary transition-all disabled:opacity-30 shadow-lg">
                  <Send size={24} />
                </button>
              </div>
            </form>
          </footer>
        </main>
      </div>
    </>
  );
};
