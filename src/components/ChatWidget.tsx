import React, { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Smile, 
  Paperclip,
  ShieldCheck,
  Zap,
  Mic,
  MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Hi Sister! Welcome to BIG Support. How can we help you grow today?", sender: 'bot', time: 'Just now' }
  ]);
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newUserMsg = { id: Date.now(), text: message, sender: 'user', time: 'Just now' };
    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        text: "Thanks for reaching out! A mentor or support sister will be with you shortly. In the meantime, have you checked our Growth Academy?",
        sender: 'bot',
        time: 'Just now'
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] overflow-hidden rounded-3xl border border-border/60 bg-white dark:bg-slate-900 shadow-2xl shadow-primary/20 transition-colors"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-heading font-black">
                      B
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary bg-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Sister Support</h3>
                    <p className="flex items-center gap-1 text-[10px] text-white/70">
                      <Zap className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                      Typically replies in 5 mins
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    chat.sender === 'user' 
                      ? 'bg-secondary text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-800 text-primary dark:text-primary-foreground border border-border/40 rounded-bl-none'
                  }`}>
                    {chat.text}
                    <div className={`mt-1 text-[8px] ${chat.sender === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                      {chat.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-border/40 bg-white dark:bg-slate-900 p-3">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 py-2 border border-border/20">
                <button type="button" className="text-slate-400 hover:text-primary transition-colors">
                  <Smile className="h-4 w-4" />
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a sister anything..."
                  className="flex-grow bg-transparent text-xs outline-none dark:text-slate-200"
                />
                <button type="button" className="text-slate-400 hover:text-primary transition-colors">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button 
                  type="button" 
                  onClick={toggleListening}
                  className={`transition-colors ${isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-primary'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white shadow-md disabled:opacity-50 disabled:shadow-none hover:bg-secondary transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Safe & Secure Sisterhood Space
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:bg-secondary transition-colors relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white border-2 border-white dark:border-slate-900 animate-bounce">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
