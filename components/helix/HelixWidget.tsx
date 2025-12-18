"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// useChat removed

import dynamic from 'next/dynamic';
import {
  Sparkles,
  Send,
  User,
  Bot,
  X,
  ChevronDown,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  PanelRight
} from "lucide-react";

const AnalystCharts = dynamic(() => import('../analyst/AnalystCharts'), { 
  loading: () => <div className="h-40 w-full flex items-center justify-center text-xs text-gray-500">Loading chart...</div>,
  ssr: false 
});

interface HelixWidgetProps {
  subscriptionTier?: string;
  onSidebarChange?: (isOpen: boolean) => void;
}

export default function HelixWidget({ subscriptionTier = 'free', onSidebarChange }: HelixWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isSidePanel, setIsSidePanel] = useState(false); 
  const [isTransparent, setIsTransparent] = useState(false); 
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{startX: number, startY: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isLocked = subscriptionTier !== 'pro' && subscriptionTier !== 'premium';

  // Use AI SDK
  // Manual Input State to fix typing issues
  const [localInput, setLocalInput] = useState("");

  // Use AI SDK
  // Manual Chat State
  const [messages, setMessages] = useState<any[]>([
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
  const [isLoading, setIsLoading] = useState(false);

  const append = async (newMsg: { role: string, content: string }, options?: { body?: any }) => {
    setIsLoading(true);
    const userMsg = { ...newMsg, id: Date.now().toString() };
    const newMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/helix/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: options?.body?.sessionId || sessionId,
          context: options?.body?.context || { currentPath: pathname }
        })
      });
      
      const sid = response.headers.get('X-Session-Id');
      if (sid) setSessionId(sid);

      const assistantMsgId = (Date.now() + 1).toString();
      // Optimistic update
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Helix API Error:', response.status, errorText);
        let niceError = "I encountered an error connecting to the server.";
        try {
           const json = JSON.parse(errorText);
           if (json.error) niceError = `Error: ${json.error.message || json.error}`;
        } catch (e) {
           niceError = `Error ${response.status}: ${errorText.substring(0, 100)}`;
        }
        
        setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: niceError } : m
        ));
        return;
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        assistantContent += text;
        
        setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: assistantContent } : m
        ));
      }
      return assistantMsgId;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked && messages.length >= 7) return; 
    if (!localInput.trim() || isLoading) return;

    const userMessage = localInput;
    setLocalInput(""); // Clear immediately
    
    await append({
      role: 'user',
      content: userMessage
    }, {
      body: {
        sessionId,
        context: { currentPath: pathname }
      }
    });
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
            className={`pointer-events-auto border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isTransparent ? "bg-gray-900/70 backdrop-blur-xl border-gray-800/50" : "bg-gray-900 border-gray-800"
            } ${
              isSidePanel
                ? "w-full h-full rounded-none border-0"
                : isExpanded
                  ? "fixed inset-4 bottom-24 right-6 w-auto h-auto rounded-2xl mb-4"
                  : "w-[400px] h-[600px] rounded-2xl mb-4" + (isDragging ? " cursor-move" : " cursor-grab")
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b border-gray-800 flex items-center justify-between shrink-0 ${
              isTransparent ? "bg-gray-900/70 backdrop-blur" : "bg-gray-900/95 backdrop-blur"
            }`}>
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
                  <h3 className="font-bold text-white text-sm">Helix AI</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLocked ? 'bg-amber-500' : 'bg-green-500'}`} />
                    {isLocked ? 'Trial Mode' : `Online • ${pathname}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
                  <PanelRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsTransparent(!isTransparent)}
                  className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${
                    isTransparent ? "text-coral-500" : "text-gray-400 hover:text-white"
                  }`}
                  title="Toggle transparency"
                >
                  {isTransparent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            {isLocked && messages.length >= 7 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-gray-500" />
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
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'assistant' 
                          ? 'bg-gray-800 border border-gray-700' 
                          : 'bg-coral-500'
                      }`}>
                        {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-coral-400" /> : <User className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className={`p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'assistant'
                          ? 'bg-gray-800/50 border border-gray-700/50 text-gray-300'
                          : 'bg-coral-500 text-white shadow-lg shadow-coral-500/10'
                      }`}>
                        {msg.content}
                        
                        {/* Tool Invocations (Charts) */}
                        {msg.toolInvocations?.map((toolInvocation: any) => {
                          const { toolName, toolCallId, state } = toolInvocation;
                          if (state === 'result') {
                            const { result } = toolInvocation;
                            
                            if (toolName === 'query_analytics' && result.chartType && result.chartType !== 'table') {
                              return (
                                <div key={toolCallId} className="mt-4 w-full h-[250px] bg-gray-900 border border-gray-700 rounded-xl p-2 relative overflow-hidden">
                                   <div className="absolute top-2 left-2 text-[10px] uppercase text-gray-500 font-bold tracking-wider z-10">
                                     {result.chartType}
                                   </div>
                                   <AnalystCharts data={result.data} type={result.chartType} />
                                </div>
                              );
                            }
                            if (toolName === 'update_brand_dna') {
                                return (
                                    <div key={toolCallId} className="mt-2 p-2 bg-green-900/20 border border-green-900 rounded text-green-200 text-xs flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Brand DNA Updated Successfully
                                    </div>
                                )
                            }
                          }
                          return (
                             <div key={toolCallId} className="mt-2 text-xs text-gray-500 italic flex items-center gap-2">
                               <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                               Processing request...
                             </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && messages[messages.length-1].role === 'user' && (
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                           <Sparkles className="w-4 h-4 text-coral-400 animate-pulse" />
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

                {/* Input */}
                <div className={`p-4 border-t border-gray-800 shrink-0 ${
                  isTransparent ? "bg-gray-900/70 backdrop-blur" : "bg-gray-900"
                }`}>
                  <form onSubmit={onSubmit} className="relative">
                    <input
                      type="text"
                      value={localInput}
                      onChange={(e) => setLocalInput(e.target.value)}
                      placeholder={isLocked ? "Ask Helix..." : "Ask Helix..."}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-coral-500/50 focus:ring-1 focus:ring-coral-500/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!localInput.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-coral-500 hover:bg-coral-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-coral-500"
                    >
                      <Send className="w-4 h-4" />
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
            className={`pointer-events-auto w-16 h-16 flex items-center justify-center transition-all duration-300 ${
              isOpen 
                ? "bg-gray-800 text-gray-400 hover:text-white border border-gray-700 rounded-full shadow-2xl" 
                : "bg-transparent filter drop-shadow-[0_0_15px_rgba(255,87,34,0.6)] hover:drop-shadow-[0_0_25px_rgba(255,87,34,0.8)]"
            }`}
          >
            {isOpen ? (
                <ChevronDown className="w-6 h-6" />
            ) : (
                <div className="relative w-full h-full p-2">
                    <Image 
                      src="/Helix_logo.png" 
                      alt="Helix" 
                      fill
                      className="object-contain animate-[spin_10s_linear_infinite] filter hue-rotate-15 saturate-200" 
                    />
                </div>
            )}
          </motion.button>
        )}
    </div>
  );
}
