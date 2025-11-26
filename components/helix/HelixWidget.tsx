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
  Minimize2
} from "lucide-react";

export default function HelixWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Full screen mode
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "I'm Helix. I'm here to help you build your brand. How can I assist you on this page?" }
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/helix/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          context: {
            currentPath: pathname
          }
        })
      });

      if (!response.ok) throw new Error("Failed to connect to Helix");

      const data = await response.json();
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error("Helix Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize. My connection is unstable. Please check your configuration." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`pointer-events-auto bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 ${
              isExpanded 
                ? "fixed inset-4 bottom-24 right-6 w-auto h-auto" 
                : "w-[400px] h-[600px]"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-purple-600 flex items-center justify-center shadow-lg shadow-coral-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Helix AI</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online • {pathname}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

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
                  </div>
                </div>
              ))}
              
              {loading && (
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
            <div className="p-4 border-t border-gray-800 bg-gray-900 shrink-0">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Helix..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-coral-500/50 focus:ring-1 focus:ring-coral-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-coral-500 hover:bg-coral-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-coral-500"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
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
