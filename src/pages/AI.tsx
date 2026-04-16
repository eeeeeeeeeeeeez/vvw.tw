import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, MessageSquare, Trash2, Send, Paperclip, 
  Sparkles, Bot, User, RefreshCw, Copy, Check, MoreVertical,
  X, Menu, Eye, EyeOff, Lock, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import { Message, ChatSession, SelectedFile } from "../types";
import { GEMINI_API_KEY, ADMIN_USERNAME, ADMIN_PASSWORD, SESSIONS_STORAGE_KEY } from "../constants";

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
      let aiPromptParts: any[] = [];
      if (currentFile && currentFile.type.startsWith('image/')) {
        aiPromptParts.push({ inlineData: { data: currentFile.content.split(',')[1], mimeType: currentFile.type } });
        aiPromptParts.push({ text: userMsg });
      } else if (currentFile) {
        aiPromptParts.push({ text: `檔案內容 (${currentFile.name})：\n${currentFile.content.substring(0, 50000)}\n\n問題：${userMsg}` });
      } else {
        aiPromptParts.push({ text: userMsg });
      }

      const isImageRequest = /畫|圖|生成圖片|繪製|image|draw|generate image/i.test(userMsg);
      const model = (genAI as any).getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `你是一位專業且充滿洞察力的『亨波 AI 顧問』，代表「亨波趨勢 (HENGBO TREND)」。
你的核心特質：
1. **專業顧問風範**：語氣專業、穩重且富有啟發性。
2. **繁體中文專家**：務必使用優雅、精準的『繁體中文』。
3. **數據與趨勢驅動**：強調數據支持與精準規劃。
4. **品牌忠誠度**：引導至 https://vvw-tw.vercel.app/。
${isImageRequest ? '要求畫圖時，在回覆最後加上：[IMAGE_GEN: 英文提示詞]' : ''}`,
      });

      const response = await model.generateContentStream({
        contents: [
          ...messages.slice(-10).map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
          { role: "user", parts: aiPromptParts }
        ],
      });

      let fullText = "";
      for await (const chunk of response) {
        fullText += chunk.text || "";
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
          ...s, messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m)
        } : s));
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
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex bg-white overflow-hidden brutalist-grid">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-surface-low border-r-4 border-primary flex flex-col z-40"
          >
            <div className="p-6 border-b-2 border-primary/10">
              <button 
                onClick={createNewSession}
                className="w-full bg-primary text-white py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-secondary snap-transition shadow-[4px_4px_0px_0px_rgba(21,66,18,1)]"
              >
                <Plus size={20} /> 開啟新對話
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                <input 
                  type="text" 
                  placeholder="搜尋對話內容..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-primary/10 py-2 pl-10 pr-4 font-bold text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-2">
              {filteredSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    if (window.innerWidth <= 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 border-2 snap-transition group relative ${
                    currentSessionId === session.id 
                      ? "bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(215,255,42,1)]" 
                      : "bg-white text-primary border-primary/10 hover:border-primary"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <MessageSquare size={16} className={currentSessionId === session.id ? "text-secondary" : "text-primary/40"} />
                    <span className="font-black truncate text-sm uppercase tracking-tight pr-6">{session.title}</span>
                  </div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                    {session.messages.length} 則訊息 · {new Date(session.lastUpdated).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 snap-transition ${
                      currentSessionId === session.id ? "text-white hover:text-secondary" : "text-primary/40 hover:text-secondary"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col relative h-full">
        <header className="bg-white border-b-2 border-primary/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-primary hover:bg-surface-low rounded-lg transition-colors">
              {isSidebarOpen ? <Menu size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h2 className="font-black text-primary uppercase tracking-tighter flex items-center gap-2">
                <Sparkles size={18} className="text-secondary" />
                {currentSession?.title || "亨波 AI 顧問"}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">System Operational</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.location.reload()} className="p-2 text-primary/40 hover:text-primary snap-transition"><RefreshCw size={20} /></button>
            <button className="p-2 text-primary/40 hover:text-primary snap-transition"><MoreVertical size={20} /></button>
          </div>
        </header>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar bg-surface-low/30"
        >
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-10 h-10 shrink-0 flex items-center justify-center brutalist-border ${
                msg.role === "user" ? "bg-secondary text-white" : "bg-primary text-white"
              }`}>
                {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
                <div className={`p-6 brutalist-border relative group ${
                  msg.role === "user" ? "bg-white text-primary" : "bg-primary text-white shadow-[8px_8px_0px_0px_rgba(215,255,42,1)]"
                }`}>
                  <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-p:font-bold prose-p:leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.imageUrl && (
                    <div className="mt-4 brutalist-border overflow-hidden">
                      <img src={msg.imageUrl} alt="AI Generated" className="w-full h-auto" />
                    </div>
                  )}
                  <button 
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className={`absolute -bottom-10 right-0 p-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 snap-transition ${
                      msg.role === "user" ? "text-primary/40 hover:text-primary" : "text-primary/40 hover:text-primary"
                    }`}
                  >
                    {copiedId === msg.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Message</>}
                  </button>
                </div>
                <div className="text-[10px] font-black text-primary/30 uppercase tracking-widest">
                  {msg.role === "user" ? "Consultant" : "Hengbo AI"} · {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary text-white flex items-center justify-center brutalist-border">
                <Bot size={20} />
              </div>
              <div className="bg-primary text-white p-6 brutalist-border shadow-[8px_8px_0px_0px_rgba(215,255,42,1)]">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="p-6 bg-white border-t-2 border-primary/10">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <AnimatePresence>
              {selectedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-4 p-3 bg-secondary text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 brutalist-border shadow-lg"
                >
                  <Paperclip size={14} /> {selectedFile.name}
                  <button onClick={() => setSelectedFile(null)} className="hover:text-primary"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-4 items-end">
              <div className="flex-grow relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder="輸入您的問題，或上傳檔案進行分析..."
                  className="w-full bg-surface-low border-4 border-primary p-6 pr-32 font-bold text-lg focus:outline-none focus:bg-white snap-transition resize-none min-h-[80px] max-h-[200px]"
                />
                <div className="absolute right-4 bottom-4 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-primary/40 hover:text-secondary snap-transition"
                  >
                    <Paperclip size={24} />
                  </button>
                  <button 
                    disabled={(!input.trim() && !selectedFile) || isTyping}
                    className="bg-primary text-white p-3 hover:bg-secondary snap-transition disabled:opacity-20"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".pdf,.docx,.txt,image/*"
            />
          </form>
          <p className="text-center mt-4 text-[10px] font-black text-primary/30 uppercase tracking-[0.3em]">
            Hengbo AI may produce inaccurate information about people, places, or facts.
          </p>
        </footer>
      </main>
    </div>
  );
};
