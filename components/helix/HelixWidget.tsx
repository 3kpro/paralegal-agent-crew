"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

interface HelixWidgetProps {
  subscriptionTier?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: any[];
}

export default function HelixWidget({ subscriptionTier = 'free' }: HelixWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [isSidePanel, setIsSidePanel] = useState(false); 
  const [isTransparent, setIsTransparent] = useState(false); 
  const [messageCount, setMessageCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{startX: number, startY: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isLocked = subscriptionTier !== 'pro' && subscriptionTier !== 'premium';

  // Manual State Management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "I'm Helix. I'm here to help you build your brand. How can I assist you on this page?"
        }
      ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Helper to get text safe
  const getMessageText = (msg: Message) => {
    return msg.content || (msg.parts ? JSON.stringify(msg.parts) : "");
  };

  // Manual Send Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isLocked && messageCount >= 3) return;

    const userText = input.trim();
    setInput("");
    
    // 1. Optimistically add user message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };
    
    const newHistory = [...messages, newUserMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // 2. Fetch from backend
      const response = await fetch('/api/helix/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          sessionId: sessionId || undefined,
          context: { currentPath: pathname }
        })
      });

      if (!response.ok) throw new Error(response.statusText);
      
      // Update session ID if provided header
      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId) setSessionId(newSessionId);

      // 3. Handle Stream or Text Response
      // Note: Since we reverted backend to toTextStreamResponse, 
      // standard fetch reader is robust.
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error("No reader available");

      // Create placeholder assistant message
      const assistantId = "ai-" + Date.now();
      let assistantContent = "";
      
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: "" }
      ]);
      
      // Increment count
      if (isLocked) setMessageCount(c => c + 1);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        
        // Update the last message in state
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.id === assistantId) {
            last.content = assistantContent;
          }
          return updated;
        });
      }

    } catch (err) {
      console.error("Chat error:", err);
      // Optional: Add error message to chat
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className={`fixed z-40 flex flex-col items-end pointer-events-none ${
      isSidePanel ? "right-0 top-0 bottom-0 h-screen" : "bottom-6 right-6"
    }`}>
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
                ? "rounded-l-2xl w-[320px] h-full"
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-purple-600 flex items-center justify-center shadow-lg shadow-coral-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Helix AI</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLocked ? 'bg-amber-500' : 'bg-green-500'}`} />
                    {isLocked ? `Trial Mode (${3 - messageCount} left)` : `Online • ${pathname}`}
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
            {isLocked && messageCount >= 3 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-[250px]">
                  You've used your 3 free daily messages. Upgrade to Pro for unlimited AI strategy.
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
                        {msg.role === 'assistant' && !msg.content ? (
                           // Loading dots if empty
                           <span className="flex gap-1">
                             <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                             <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                             <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                           </span>
                        ) : getMessageText(msg)}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && messages.length > 0 && messages[messages.length-1].role !== 'assistant' && (
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
                  <form onSubmit={handleSend} className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isLocked ? `Ask Helix... (${3 - messageCount} left)` : "Ask Helix..."}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-coral-500/50 focus:ring-1 focus:ring-coral-500/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? "bg-gray-800 text-gray-400 hover:text-white border border-gray-700" 
            : "bg-gradient-to-br from-coral-500 to-purple-600 text-white hover:shadow-coral-500/25"
        }`}
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
