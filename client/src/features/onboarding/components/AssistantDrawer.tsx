import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, User, RefreshCw, Trash2 } from 'lucide-react';
import { useAssistantStore } from '../store/assistant-store';
import { useT, useLocale } from '@/lib/i18n';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

export const AssistantDrawer = () => {
  const t = useT();
  const { isRtl } = useLocale();
  const { 
    isOpen, 
    closeAssistant, 
    messages, 
    currentPrompt, 
    setPrompt, 
    addMessage, 
    clearMessages 
  } = useAssistantStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!currentPrompt.trim()) return;
    
    const userMsg = currentPrompt;
    addMessage('user', userMsg);
    setPrompt('');

    // Mock AI response for now
    setTimeout(() => {
      addMessage('assistant', `I'm analyzing your request about: "${userMsg}". Based on your recent business signals, I recommend reviewing your recurring software subscriptions to optimize cash flow.`);
    }, 1000);
  };

  const slideFrom = isRtl ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAssistant}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 end-0 z-[70] w-full max-w-md bg-surface shadow-2xl border-s border-outline/30 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline/30 bg-surface-lowest">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t('assistant.title')}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted font-medium">
                      {t('assistant.status.online')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="tertiary" 
                  size="sm" 
                  onClick={clearMessages}
                  className="rounded-full p-2 text-ink-muted hover:text-danger"
                  title={t('assistant.clear')}
                >
                  <Trash2 size={16} />
                </Button>
                <Button 
                  variant="tertiary" 
                  size="sm" 
                  onClick={closeAssistant} 
                  className="rounded-full p-2"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Chat History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="h-16 w-16 rounded-2xl bg-surface-high flex items-center justify-center text-primary-container mb-4">
                    <Sparkles size={28} strokeWidth={1.2} />
                  </div>
                  <h4 className="text-base font-semibold text-ink">{t('assistant.empty.title')}</h4>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {t('assistant.empty.subtitle')}
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      'flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      msg.role === 'user' 
                        ? 'bg-surface-high text-ink-muted' 
                        : 'bg-primary-container/10 text-primary-container'
                    )}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={cn(
                      'max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary rounded-te-none'
                        : 'bg-surface-lowest border border-outline/20 text-ink rounded-ts-none shadow-sm'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-outline/30 bg-surface-lowest">
              <div className="relative group">
                <textarea
                  ref={inputRef}
                  value={currentPrompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t('assistant.input.placeholder')}
                  className={cn(
                    'w-full bg-surface border border-outline/30 rounded-2xl p-4 pe-14',
                    'text-sm text-ink placeholder:text-ink-muted/50',
                    'resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                    'transition-all duration-200 shadow-inner'
                  )}
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!currentPrompt.trim()}
                  className={cn(
                    'absolute end-3 bottom-3 h-9 w-9 rounded-xl flex items-center justify-center transition-all',
                    currentPrompt.trim()
                      ? 'bg-primary text-on-primary shadow-glow hover:scale-105 active:scale-95'
                      : 'bg-surface-high text-ink-muted cursor-not-allowed'
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-3 text-[10px] text-center text-ink-muted/50">
                {t('assistant.disclaimer')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
