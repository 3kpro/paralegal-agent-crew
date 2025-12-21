"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Paperclip, 
  Command, 
  Send as SendIcon,
  Sparkles,
  ArrowUp
} from "lucide-react";
import dynamic from 'next/dynamic';

const AnalystCharts = dynamic(() => import('@/components/analyst/AnalystCharts'), { 
  loading: () => <div className="h-40 w-full flex items-center justify-center text-xs text-gray-500">Loading chart...</div>,
  ssr: false 
});

interface HelixChatInterfaceProps {
  initialMessages?: any[];
  initialSessionId?: string | null;
  user?: any;
}

export default function HelixChatInterface({ 
  initialMessages = [], 
  initialSessionId = null,
  user 
}: HelixChatInterfaceProps) {
  const pathname = usePathname();
  const [localInput, setLocalInput] = useState("");
  const [hasStarted, setHasStarted] = useState(initialMessages.length > 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [chatStatus, setChatStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [chatError, setChatError] = useState<string | null>(null);

  // Manual sendMessage implementation matching HelixWidget
  const sendMessage = async (text: string) => {
    setChatStatus('submitted');
    setChatError(null);
    
    // Optimistic Update
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
          context: { currentPath: pathname }
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      // Update session ID if available
      const serverSessionId = response.headers.get('X-Session-Id');
      if (serverSessionId && serverSessionId !== sessionId) {
        setSessionId(serverSessionId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';
      let currentAssistantId = (Date.now() + 1).toString();
      
      setChatStatus('streaming');

      // Add placeholder assistant message
      setMessages([...newMessages, { id: currentAssistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const data = JSON.parse(line.slice(2));
              assistantMessage += data;
              
              // Update the last message (assistant)
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx].role === 'assistant') {
                   updated[lastIdx] = { ...updated[lastIdx], content: assistantMessage };
                }
                return updated;
              });
            } catch (e) {
              console.error('Failed to parse stream chunk', e);
            }
          }
        }
      }
      setChatStatus('ready');
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'An error occurred');
      setChatStatus('error');
    }
  };

  const isLoading = chatStatus === 'submitted' || chatStatus === 'streaming';

  useEffect(() => {
    if (messages.length > 0 && !hasStarted) {
      setHasStarted(true);
    }
  }, [messages, hasStarted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!localInput.trim() || isLoading) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    const text = localInput;
    setLocalInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onFormSubmit();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col w-full h-full bg-[#09090b] text-gray-100 font-sans overflow-hidden ${
        hasStarted ? 'justify-between' : 'justify-center items-center'
      }`}
    >
      
      {/* Messages Area */}
      {hasStarted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-y-auto pb-48 pt-8"
        >
          <div className="max-w-3xl mx-auto w-full px-6 space-y-8">
            {messages.map((msg: any, idx) => (
              <div key={msg.id || idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`py-3 px-5 max-w-[85%] text-[15px] leading-7 ${
                  msg.role === 'assistant'
                    ? 'text-gray-200'
                    : 'bg-[#252528] rounded-2xl text-white'
                }`}>
                   {/* Simplified rendering for manual fetch */}
                   <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-gray-500 animate-pulse" />
                  </div>
                </div>
            )}
            
            {/* Error Message Display */}
            {status === 'error' as any || chatStatus === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span>Unable to connect to Helix. Please try again.</span>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </motion.div>
      )}

      {/* Input Container - Centers initially, then fixes to bottom */}
      <div 
        className={`fixed left-0 right-0 z-30 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center justify-center px-4 ${
          !hasStarted 
            ? "top-0 bottom-0" 
            : "bottom-8 top-auto"
        }`}
      >
        <div className={`w-full max-w-2xl transition-all duration-700 ${!hasStarted ? 'scale-100' : 'scale-100'}`}>
          {/* Centered Heading - Only visible when hasn't started */}
          <AnimatePresence>
            {!hasStarted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-medium tracking-tight text-white mb-2">
                  How can I help <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">today?</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Input Box */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-white/20">
            <div className="p-4">
              <textarea
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Helix a question..."
                rows={1}
                className="w-full bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 focus:outline-none resize-none text-base py-2 min-h-[50px] max-h-[200px]"
                style={{ lineHeight: '1.5' }}
              />
            </div>
            
            {/* Action Bar inside Input */}
            <div className="px-3 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Attach"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Commands"
                >
                  <Command className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => onFormSubmit()}
                disabled={!localInput.trim() || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  localInput.trim() && !isLoading
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                }`}
              >
                <SendIcon className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Buttons placeholder - explicitly empty as requested */}
          {!hasStarted && (
             <div className="h-10 w-full mt-6" /> 
          )}

        </div>
      </div>
    </motion.div>
  );
}
