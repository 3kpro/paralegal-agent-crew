"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useHelix } from "@/context/HelixContext";


import dynamic from 'next/dynamic';
import {
  MagicWand,
  PaperPlaneRight as Send,
  User,
  Robot as Bot,
  X,
  CaretDown as ChevronDown,
  CornersOut as Maximize2,
  CornersIn as Minimize2,
  Eye,
  EyeSlash as EyeOff,
  SidebarSimple as PanelRight,
  ArrowSquareOut as ExternalLink,
  DotsSix as GripHorizontal,
  Copy,
  Check,
  Clock,
  Plus,
  Chat as MessageSquare,
  Trash as Trash2
} from "@phosphor-icons/react";

const AnalystCharts = dynamic(() => import('../analyst/AnalystCharts'), { 
  loading: () => <div className="h-40 w-full flex items-center justify-center text-xs text-gray-500">Loading chart...</div>,
  ssr: false 
});

interface HelixWidgetProps {
  subscriptionTier?: string;
  onSidebarChange?: (isOpen: boolean) => void;
}

const CopyToClipboard = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="absolute bottom-2 right-2 p-1.5 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-md transition-all opacity-0 group-hover:opacity-100"
      title="Copy to clipboard"
    >
      {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" weight="duotone" /> : <Copy className="w-3.5 h-3.5" weight="duotone" />}
    </button>
  );
};

export default function HelixWidget({ subscriptionTier = 'free', onSidebarChange }: HelixWidgetProps) {
  const pathname = usePathname();
  const { context: helixContext } = useHelix();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isSidePanel, setIsSidePanel] = useState(false); 
  const [isTransparent, setIsTransparent] = useState(false); 
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // Session is created by the server on first message
  // No need to initialize with a timestamp

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/helix/sessions');
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  };

  const loadSession = async (id: string) => {
    try {
      setChatStatus('submitted'); // Show loading
      const res = await fetch(`/api/helix/history?sessionId=${id}`);
      const data = await res.json();
      if (data.messages) {
        // Map DB messages to UI messages
        // DB: { role, content, ... }
        // UI: { id, role, content, toolData? }
        const uiMessages = data.messages.map((m: any) => ({
           id: m.id || Math.random().toString(),
           role: m.role,
           content: m.content
        }));
        setMessages(uiMessages);
        setSessionId(id);
        setShowHistory(false);
        setChatStatus('ready');
      }
    } catch (e) {
      console.error("Failed to load session", e);
      setChatStatus('ready');
    }
  };

  const startNewChat = () => {
    setSessionId(null); // Server will create new session on first message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm Helix. Ready for a new task?"
    }]);
    setShowHistory(false);
  };
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{startX: number, startY: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLocked = subscriptionTier !== 'pro' && subscriptionTier !== 'premium';

  // Manual chat implementation
  const [localInput, setLocalInput] = useState("");
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string, toolData?: any}>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm Helix, your AI marketing assistant.

I can help you:
✨ Navigate XELORA and learn features
📊 Analyze your campaign data
💡 Get strategic content advice
🎯 Understand viral scores

Try asking me anything like:
• "How do I create a campaign?"
• "What's my best performing content?"
• "Tips for increasing engagement"

What would you like to know?`
    }
  ]);
  const [chatStatus, setChatStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [chatError, setChatError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    setChatStatus('submitted');
    setChatError(null);
    const userMessage = { id: Date.now().toString(), role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/helix/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
          context: { ...helixContext, currentPath: pathname }
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Capture session ID from server response
      const serverSessionId = response.headers.get('X-Session-Id');
      if (serverSessionId && serverSessionId !== sessionId) {
        setSessionId(serverSessionId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';
      let pendingToolData: any = null;
      setChatStatus('streaming');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const data = JSON.parse(line.slice(2));
            assistantMessage += data;
            setMessages([...newMessages, { 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: assistantMessage,
                toolData: pendingToolData
            }]);
          } else if (line.startsWith('2:')) {
            try {
               pendingToolData = JSON.parse(line.slice(2));
            } catch (e) { console.error(e); }
          }
      }
      }
      setChatStatus('ready');
    } catch (err: any) {
      setChatError(err.message || 'An error occurred');
      setChatStatus('error');
    }
  };

  const isLoading = chatStatus === 'submitted' || chatStatus === 'streaming';


  // Notify parent layout about sidebar state
  useEffect(() => {
    if (onSidebarChange) {
      onSidebarChange(isOpen && isSidePanel);
    }
  }, [isSidePanel, isOpen, onSidebarChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSidePanel || isExpanded) return; 
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        setPosition({
          x: e.clientX - dragRef.current.startX,
          y: e.clientY - dragRef.current.startY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked && messages.length >= 7) {
      return;
    }
    if (!localInput.trim() || isLoading) return;

    const text = localInput;
    setLocalInput("");
    await sendMessage(text);
  };

  // Resizing Logic
  const [panelWidth, setPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const resize = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 320 && newWidth < 800) {
          setPanelWidth(newWidth);
        }
      }
    };

    const stopResizing = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
    }

    return () => {
       document.removeEventListener('mousemove', resize);
       document.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  if (pathname === '/helix') return null;

  return (
    <div 
      ref={sidebarRef}
      style={{ width: isSidePanel ? panelWidth : undefined }}
      className={`${
      isSidePanel 
        ? "relative z-40 shrink-0 h-screen bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-75 ease-out" 
        : "fixed z-[100] flex flex-col items-end pointer-events-none bottom-6 right-6"
    }`}>
      {/* Resize Handle */}
      {isSidePanel && isOpen && (
        <div
          onMouseDown={startResizing}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-coral-500/50 z-50 transition-colors"
        />
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: isSidePanel ? 0 : position.x,
              y: isSidePanel || isExpanded ? 0 : position.y
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            drag={!isSidePanel && !isExpanded}
            dragMomentum={false}
            onMouseDown={handleMouseDown}
            className={`pointer-events-auto border shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 ${
              isTransparent 
                ? "bg-gray-950/40 backdrop-blur-2xl border-gray-700/30" 
                : "bg-[#0a0a0b] border-gray-800/80"
            } ${
              isSidePanel
                ? "w-full h-full rounded-none border-0"
                : isExpanded
                  ? "fixed inset-4 bottom-24 right-6 w-auto h-auto rounded-3xl mb-4"
                  : "w-[420px] h-[650px] rounded-3xl mb-4 shadow-coral-500/5" + (isDragging ? " cursor-move" : " cursor-grab")
            }`}
          >
            {/* Ambient Background Glow */}
            {!isTransparent && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-coral-500/5 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-500/5 blur-[100px] rounded-full" />
              </div>
            )}
            {/* Header */}
            <div className={`p-4 border-b border-gray-800 flex flex-col gap-3 shrink-0 relative ${
              isTransparent ? "bg-gray-900/70 backdrop-blur" : "bg-gray-900/95 backdrop-blur"
            }`}>
              {/* Drag Handle Indicator */}
              {!isSidePanel && !isExpanded && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                  <GripHorizontal className="w-4 h-4 text-white" weight="duotone" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image 
                    src="/Helix_logo.png" 
                    alt="Helix" 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-contain filter hue-rotate-15 saturate-200 drop-shadow-[0_0_8px_rgba(255,87,34,0.8)]" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight">Helix <span className="text-coral-400">AI</span></h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLocked ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isLocked ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    </span>
                    {isLocked ? 'Free Edition' : `Active Assistant`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="/helix"
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Open dedicated Helix AI"
                >
                  <ExternalLink className="w-4 h-4" weight="duotone" />
                </a>
                <button
                  onClick={() => {
                    if (!showHistory) fetchSessions();
                    setShowHistory(!showHistory);
                  }}
                  className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                    showHistory ? "text-coral-500" : "text-gray-400 hover:text-white"
                  }`}
                  title="Chat History"
                >
                  <Clock className="w-4 h-4" weight="duotone" />
                </button>
                <button
                  onClick={() => {
                    setIsSidePanel(!isSidePanel);
                    if (!isSidePanel) {
                      setIsExpanded(false);
                      setPosition({ x: 0, y: 0 });
                    }
                  }}
                  className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                    isSidePanel ? "text-coral-500" : "text-gray-400 hover:text-white"
                  }`}
                  title="Toggle side panel"
                >
                  <PanelRight className="w-4 h-4" weight="duotone" />
                </button>
                <button
                  onClick={() => setIsTransparent(!isTransparent)}
                  className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                    isTransparent ? "text-coral-500" : "text-gray-400 hover:text-white"
                  }`}
                  title="Toggle transparency"
                >
                  {isTransparent ? <Eye className="w-4 h-4" weight="duotone" /> : <EyeOff className="w-4 h-4" weight="duotone" />}
                </button>
                <button
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                    if (!isExpanded) {
                      setIsSidePanel(false);
                      setPosition({ x: 0, y: 0 });
                    }
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Toggle fullscreen"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" weight="duotone" /> : <Maximize2 className="w-4 h-4" weight="duotone" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" weight="duotone" />
                </button>
              </div>
            </div>
          </div>

            {/* History Overlay */}
            <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 top-[60px] z-20 bg-[#0c0c0d]/95 backdrop-blur-md p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-coral-500" weight="duotone"/> History</h3>
                  <button 
                     onClick={startNewChat}
                     className="px-3 py-1.5 bg-coral-500 hover:bg-coral-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" weight="duotone" /> New Chat
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {sessions.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                       <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" weight="duotone" />
                       No history found
                    </div>
                  ) : (
                    sessions.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => loadSession(s.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          sessionId === s.id 
                            ? 'bg-coral-500/10 border-coral-500/30 text-white' 
                            : 'bg-gray-800/20 border-gray-800 hover:bg-gray-800/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-medium truncate mb-1">{s.snippet || 'New Conversation'}</div>
                        <div className="text-[10px] opacity-60 flex justify-between">
                            <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                            <span>{new Date(s.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Content Area */}
            {isLocked && messages.length >= 7 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-gray-500" weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Session Limit Reached</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-[280px]">
                  You've used your 7 free messages for this session. Close and reopen Helix to start fresh, or upgrade to Pro for unlimited AI assistance.
                </p>
                <a 
                  href="/settings" 
                  className="px-6 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Upgrade to Pro
                </a>
              </div>
            ) : (
              <>
                {/* Messages Container with Custom Scrollbar */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
                   {messages.map((msg, idx) => (
                     <div
                       key={msg.id || idx}
                       className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                     >
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                         msg.role === 'assistant'
                           ? 'bg-gray-800 border border-gray-700'
                           : 'bg-coral-500'
                       }`}>
                         {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-coral-400" weight="duotone" /> : <User className="w-4 h-4 text-white" weight="duotone" />}
                       </div>



                       <div className={`p-3.5 rounded-2xl max-w-[85%] text-[13px] whitespace-pre-wrap leading-relaxed relative ${
                         msg.role === 'assistant'
                           ? 'bg-gray-800/40 border border-gray-700/30 text-gray-200 shadow-sm backdrop-blur-sm shadow-black/20'
                           : 'bg-gradient-to-br from-coral-500 to-coral-600 text-white shadow-lg shadow-coral-500/20 border border-coral-400/20'
                       } group`}>
                         {(msg as any).toolData && (msg as any).toolData.data && (msg as any).toolData.data.length > 0 && (
                            <div className="mb-3 h-48 w-full bg-black/30 rounded-lg p-2 border border-white/5">
                              <AnalystCharts data={(msg as any).toolData.data} type={(msg as any).toolData.chartType || 'bar'} />
                            </div>
                         )}
                         <span className="block">
                           {(() => {
                              const rawContent = msg.content || ((msg as any).toolData?.explanation && !(msg as any).toolData?.data?.length ? (msg as any).toolData.explanation : '') || '';
                              // Parse ACTION tags: [ACTION:action_name|Label]
                              const actionRegex = /\[ACTION:([a-zA-Z0-9_]+)\|([^\]]+)\]/g;
                              const actions: {action: string, label: string}[] = [];
                              const cleanContent = rawContent.replace(actionRegex, (match: string, action: string, label: string) => {
                                actions.push({ action, label });
                                return ''; // Remove tag from text
                              });

                              return (
                                <>
                                  {cleanContent}
                                  {actions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {actions.map((act, i) => (
                                        <button
                                          key={i}
                                          onClick={() => {
                                            if (helixContext.actions && helixContext.actions[act.action]) {
                                              helixContext.actions[act.action]();
                                              // Optional: Add a system message saying action was clicked?
                                            } else {
                                              console.warn(`Action ${act.action} not found in context`, helixContext.actions);
                                            }
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/30 text-coral-300 text-xs rounded-lg transition-colors"
                                        >
                                          <MagicWand className="w-3 h-3" />
                                          {act.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </>
                              );
                           })()}
                           
                           {!msg.content && !(msg as any).toolData && (
                             <span className="flex items-center gap-2 text-gray-500 italic animate-pulse">
                               Helix is analyzing...
                             </span>
                           )}
                           {!msg.content && (msg as any).toolData?.explanation && (msg as any).toolData?.data?.length === 0 && (
                            <div className="mt-2 text-gray-400 italic">
                               (No matching records found in database)
                            </div>
                           )}
                         </span>
                         {msg.role === 'assistant' && <CopyToClipboard text={msg.content} />}
                       </div>
                     </div>
                   ))}
                  
                  {isLoading && messages.length > 0 && (messages[messages.length-1] as any).role === 'user' && (
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                           <MagicWand className="w-4 h-4 text-coral-400 animate-pulse" weight="duotone" />
                         </div>
                         <div className="bg-gray-800/50 border border-gray-700/50 p-3 rounded-2xl flex items-center gap-2 text-gray-400 text-sm">
                           <span className="w-1.5 h-1.5 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                           <span className="w-1.5 h-1.5 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                           <span className="w-1.5 h-1.5 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                     </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-5 border-t border-gray-800/50 shrink-0 relative z-10 ${
                  isTransparent ? "bg-gray-950/20 backdrop-blur-md" : "bg-[#0c0c0d]"
                }`}>
                  <form onSubmit={onFormSubmit} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-coral-500/0 via-coral-500/20 to-coral-500/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <input
                      type="text"
                      value={localInput}
                      onChange={(e) => setLocalInput(e.target.value)}
                      placeholder="Ask Helix anything..."
                      className="w-full bg-[#161618] border border-gray-800 rounded-xl py-3.5 pl-5 pr-14 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-coral-500/40 focus:ring-1 focus:ring-coral-500/20 transition-all relative"
                    />
                    <button
                      type="submit"
                      disabled={!localInput.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-coral-500 hover:bg-coral-400 text-white rounded-lg transition-all duration-300 shadow-lg shadow-coral-500/20 disabled:opacity-30 disabled:grayscale disabled:shadow-none hover:scale-105 active:scale-95"
                    >
                      <Send className="w-4 h-4" weight="duotone" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
        {!isSidePanel && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`pointer-events-auto w-16 h-16 flex items-center justify-center transition-all duration-500 ${
              isOpen 
                ? "bg-gray-900 text-gray-400 hover:text-white border border-gray-800 rounded-full shadow-2xl scale-90" 
                : "bg-transparent filter drop-shadow-[0_0_20px_rgba(255,87,34,0.4)] hover:drop-shadow-[0_0_30px_rgba(255,87,34,0.6)]"
            }`}
          >
            {isOpen ? (
                <ChevronDown className="w-6 h-6 animate-bounce-subtle" weight="duotone" />
            ) : (
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                    <div className="absolute inset-0 bg-coral-500/20 blur-xl rounded-full animate-pulse" />
                    <Image 
                      src="/Helix_logo.png" 
                      alt="Helix" 
                      width={48}
                      height={48}
                      className="object-contain animate-[spin_12s_linear_infinite] filter hue-rotate-15 saturate-200 relative z-10" 
                    />
                </div>
            )}
          </motion.button>
        )}
    </div>
  );
}
