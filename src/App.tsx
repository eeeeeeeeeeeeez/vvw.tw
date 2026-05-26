import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Image as ImageIcon, 
  FileText, 
  Paperclip,
  Trash2,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  file?: {
    name: string;
    type: string;
  };
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

interface FileData {
  name: string;
  type: string;
  content: string;
}

// --- Constants ---
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "henbo";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "henbo2026";
const SESSIONS_STORAGE_KEY = 'henbo_ai_sessions_v1';
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export default function App() {
  // --- State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const hydrated = parsed.map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(hydrated);
        if (hydrated.length > 0) {
          setCurrentSessionId(hydrated[0].id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
    
    const loggedIn = localStorage.getItem('henbo_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isTyping]);

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('henbo_logged_in', 'true');
      setLoginError("");
    } else {
      setLoginError("無效的帳號或授權碼");
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "新對話",
      messages: [],
      lastUpdated: new Date()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
    if (newSessions.length === 0) {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
    }
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        let title = s.title;
        if (title === "新對話" && messages.length > 0) {
          title = messages[0].content.slice(0, 20) + (messages[0].content.length > 20 ? "..." : "");
        }
        return { ...s, messages, title, lastUpdated: new Date() };
      }
      return s;
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("檔案大小不能超過 10MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isTyping || !currentSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      file: selectedFile ? { name: selectedFile.name, type: selectedFile.type } : undefined
    };

    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = {
      id: aiMsgId,
      role: 'model',
      content: "",
      timestamp: new Date()
    };

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const messages = currentSession.messages;
    const updatedMessages = [...messages, userMsg, newAiMsg];
    updateSessionMessages(currentSessionId, updatedMessages);
    
    const userMsgText = input;
    const currentFile = selectedFile;
    
    setInput("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsTyping(true);

    try {
      let fileData: FileData | null = null;
      if (currentFile) {
        const content = await readFileAsDataURL(currentFile);
        fileData = {
          name: currentFile.name,
          type: currentFile.type,
          content: content
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMsg: userMsgText,
          fileData: fileData
        })
      });

      if (!response.ok) throw new Error("伺服器回應錯誤");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("無法讀取回應串流");

      let fullText = "";
      const decoder = new TextDecoder();
      
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
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

      // Image generation post-processing
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

  if (!isLoggedIn) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-6 relative z-10 font-sans">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-white border-2 border-[#154212] shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-[#154212] flex items-center justify-center mb-6 shadow-lg"><Lock className="w-12 h-12 text-white" /></div>
            <h2 className="text-4xl font-black text-[#154212] uppercase tracking-tighter mb-2">亨波 AI 顧問</h2>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">安全驗證 1.1.0-search</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-[10px] text-gray-400">顧問帳號</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#154212]/40" size={16} /><input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 border-2 border-[#154212]/10 py-3 pl-10 font-bold focus:outline-none focus:border-[#154212]" placeholder="Consultant ID" /></div>
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase tracking-widest text-[10px] text-gray-400">安全授權碼</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#154212]/40" size={16} /><input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border-2 border-[#154212]/10 py-3 pl-10 pr-10 font-bold focus:outline-none focus:border-[#154212]" placeholder="Access Key" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#154212]/40">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
            </div>
            {loginError && <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-600 font-bold text-xs uppercase">{loginError}</div>}
            <button className="w-full bg-[#154212] text-white py-5 font-black uppercase tracking-[0.2em] text-lg shadow-lg hover:bg-[#1a5216] transition-all flex items-center justify-center gap-3">授權並進入 <ArrowRight size={20} /></button>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen bg-white font-sans text-[#154212]">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed md:relative z-50 w-80 h-full bg-[#f8f9fa] border-r-2 border-[#154212]/10 flex flex-col"
          >
            <div className="p-6 border-b-2 border-[#154212]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#154212] flex items-center justify-center text-white font-black text-xl">W</div>
                <h1 className="font-black text-xl tracking-tighter">亨波 AI</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-[#154212]/5 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-4">
              <button 
                onClick={createNewSession}
                className="w-full bg-[#154212] text-white py-4 px-6 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(21,66,18,0.2)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(21,66,18,0.2)] transition-all"
              >
                <Plus size={18} /> 新對話
              </button>
            </div>

            <div className="px-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#154212]/30" size={16} />
                <input 
                  type="text" 
                  placeholder="搜尋對話..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-[#154212]/10 py-2 pl-10 pr-4 font-bold text-sm focus:outline-none focus:border-[#154212]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {filteredSessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`group relative p-4 cursor-pointer transition-all border-2 ${currentSessionId === session.id ? 'bg-white border-[#154212] shadow-[4px_4px_0px_0px_rgba(21,66,18,1)]' : 'border-transparent hover:bg-[#154212]/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className={currentSessionId === session.id ? 'text-[#154212]' : 'text-[#154212]/40'} />
                    <div className="flex-1 overflow-hidden">
                      <p className={`font-black text-sm truncate ${currentSessionId === session.id ? 'text-[#154212]' : 'text-[#154212]/70'}`}>{session.title}</p>
                      <p className="text-[10px] font-bold text-[#154212]/30 uppercase tracking-widest mt-1">{session.lastUpdated.toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t-2 border-[#154212]/10 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#154212]/5 flex items-center justify-center rounded-full"><User size={20} className="text-[#154212]" /></div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tighter">專業顧問模式</p>
                  <p className="text-[10px] font-bold text-[#154212]/40 uppercase tracking-widest">v1.1.0-search</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b-2 border-[#154212]/10 flex items-center justify-between px-6 bg-white z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#154212]/5 rounded-full"><Menu size={24} /></button>
            )}
            <div>
              <h2 className="font-black text-lg tracking-tight flex items-center gap-2">
                {currentSession?.title || "亨波 AI 顧問"}
                <span className="bg-[#154212] text-white text-[10px] px-2 py-0.5 font-black uppercase tracking-widest">Beta</span>
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div> 系統在線</span>
                <span className="flex items-center gap-1 text-[10px] font-black text-[#154212]/40 uppercase tracking-widest"><Globe size={10} /> 實時搜尋已啟用</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#154212]/5 border border-[#154212]/10">
              <Zap size={14} className="text-[#154212]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Gemini 2.0 Flash</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#fdfdfd]">
          {currentSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
              <div className="w-24 h-24 bg-[#154212] flex items-center justify-center shadow-[12px_12px_0px_0px_rgba(21,66,18,0.1)] mb-4">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black tracking-tighter uppercase">您好！我是亨波 AI 顧問</h3>
                <p className="text-lg font-bold text-[#154212]/60 leading-relaxed">
                  我已整合 **Google 實時搜尋** 功能。您可以詢問關於 2026 年最新的科技趨勢、市場數據或任何需要查證的資訊。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-12">
                {[
                  "搜尋 2026 年 5 月的台灣科技新聞",
                  "分析台積電 2nm 製程的最新進度",
                  "整理 2026 年 AI 產業的發展重點",
                  "目前的市場利率與經濟指標"
                ].map((text, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(text)}
                    className="p-6 bg-white border-2 border-[#154212]/10 hover:border-[#154212] hover:shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{text}</span>
                      <ChevronRight size={18} className="text-[#154212]/20 group-hover:text-[#154212] transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10 pb-12">
              {currentSession?.messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'flex flex-col items-end' : 'flex gap-4'}`}>
                    {message.role === 'model' && (
                      <div className="w-10 h-10 bg-[#154212] flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg">W</div>
                    )}
                    <div className="space-y-3">
                      <div 
                        className={`p-6 ${
                          message.role === 'user' 
                            ? 'bg-[#154212] text-white shadow-[8px_8px_0px_0px_rgba(21,66,18,0.2)]' 
                            : 'bg-white border-2 border-[#154212]/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'text-white' : 'text-[#154212]'} font-bold leading-relaxed`}>
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className={line.startsWith('🔍') ? 'text-blue-600 animate-pulse flex items-center gap-2' : ''}>
                              {line}
                            </p>
                          ))}
                          {!message.content && isTyping && message.id === currentSession.messages[currentSession.messages.length - 1].id && (
                            <div className="flex gap-1 py-2">
                              <div className="w-2 h-2 bg-[#154212]/20 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-[#154212]/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                              <div className="w-2 h-2 bg-[#154212]/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                          )}
                        </div>
                        {message.imageUrl && (
                          <div className="mt-4 border-2 border-[#154212]/10">
                            <img src={message.imageUrl} alt="AI Generated" className="w-full h-auto" />
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${message.role === 'user' ? 'text-[#154212]/30' : 'text-[#154212]/30'}`}>
                        {message.role === 'user' ? '用戶' : '亨波 AI 顧問'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t-2 border-[#154212]/10 z-40">
          <div className="max-w-4xl mx-auto">
            {selectedFile && (
              <div className="mb-4 flex items-center gap-4 p-3 bg-[#154212]/5 border-2 border-[#154212] animate-in fade-in slide-in-from-bottom-2">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover border border-[#154212]/20" />
                ) : (
                  <div className="w-12 h-12 bg-white flex items-center justify-center border border-[#154212]/20"><FileText size={20} /></div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-black truncate">{selectedFile.name}</p>
                  <p className="text-[10px] font-bold text-[#154212]/40 uppercase tracking-widest">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => {setSelectedFile(null); setFilePreview(null);}} className="p-2 hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-4">
              <div className="flex-1 relative bg-[#f8f9fa] border-2 border-[#154212]/10 focus-within:border-[#154212] focus-within:shadow-[8px_8px_0px_0px_rgba(21,66,18,0.1)] transition-all">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="輸入訊息或詢問 2026 年最新趨勢..."
                  className="w-full bg-transparent p-4 pr-24 min-h-[60px] max-h-48 resize-none font-bold text-sm focus:outline-none"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[#154212]/40 hover:text-[#154212] transition-all"
                    title="上傳檔案"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-[#154212]/40 hover:text-[#154212] transition-all"
                    title="上傳圖片"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={(!input.trim() && !selectedFile) || isTyping}
                className={`h-[60px] w-[60px] flex items-center justify-center shadow-lg transition-all ${(!input.trim() && !selectedFile) || isTyping ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#154212] text-white hover:bg-[#1a5216] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(21,66,18,0.2)]'}`}
              >
                <Send size={24} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </form>
            <p className="mt-3 text-[10px] font-bold text-[#154212]/30 uppercase tracking-[0.2em] text-center">
              HENGBO TREND AI ADVISOR • POWERED BY GEMINI 2.0 FLASH & GOOGLE SEARCH
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
