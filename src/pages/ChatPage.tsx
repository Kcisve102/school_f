import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, ChevronDown } from 'lucide-react';
import { chatService, ChatMessage } from '../services/chat.service';
import LogoMark from '../components/common/Logo';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingDots: React.FC = () => (
  <span className="inline-flex items-center gap-1 py-1" aria-label="typing">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-accent"
        style={{
          animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </span>
);

// ─── Message renderer ─────────────────────────────────────────────────────────
type ChatTranslations = typeof translations['en']['chat'] | typeof translations['zh']['chat'] | typeof translations['bo']['chat'];

interface MessageRowProps {
  message: ChatMessage;
  isLast: boolean;
  t: ChatTranslations;
}

const MessageRow: React.FC<MessageRowProps> = ({ message, isLast, t }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'msgSlideIn 0.25s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      {/* Avatar column */}
      {!isUser && (
        <div className="flex-shrink-0 flex flex-col items-center pt-1">
          <div className="w-7 h-7 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center">
            <LogoMark size={16} />
          </div>
          {!isLast && (
            <div className="flex-1 w-px bg-border mt-2" style={{ minHeight: 12 }} />
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 px-1">
          {isUser ? t.you : t.aiAssistant}
        </span>
        <div
          className={`rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-accent text-bg-primary rounded-tr-none'
              : 'bg-surface border border-border text-text-primary rounded-tl-none'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  onPrompt: (text: string) => void;
  t: ChatTranslations;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onPrompt, t }) => (
  <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
    <div
      className="mb-6"
      style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
        <LogoMark size={32} />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-1">{t.emptyTitle}</h2>
      <p className="text-sm text-text-muted max-w-xs">
        {t.emptyDesc}
      </p>
    </div>

    {/* Suggested prompts */}
    <div
      className="w-full max-w-lg"
      style={{ animation: 'fadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <p className="text-xs text-text-muted uppercase tracking-widest mb-3 text-left">{t.suggestedHeading}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {t.suggestedPrompts.map((p) => (
          <button
            key={p.label}
            onClick={() => onPrompt(p.text)}
            className="group text-left px-4 py-3 rounded-lg border border-border bg-surface hover:border-accent/40 hover:bg-surface-secondary transition-all duration-150"
          >
            <span className="block text-xs font-semibold text-accent mb-0.5 group-hover:text-accent-dark transition-colors">
              {p.label}
            </span>
            <span className="block text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {p.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].chat;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Scroll helpers ──
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      requestAnimationFrame(() => scrollToBottom());
    }
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // The conversation is persisted, so restore it instead of starting blank
  // after every refresh.
  useEffect(() => {
    let cancelled = false;
    chatService
      .getThread()
      .then((thread) => {
        if (!cancelled) setMessages(thread);
      })
      .catch((err) => console.error('Failed to load chat thread:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 120);
  };

  // ── Send ──
  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // History now lives server-side, keyed on the session user.
      const response = await chatService.sendMessage(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch {
      toast.error(t.sendFailed);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t.errorResponse },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClear = async () => {
    setMessages([]);
    // Also clear it server-side, or the conversation returns on next load.
    try {
      await chatService.clearThread();
    } catch (err) {
      console.error('Failed to clear chat thread:', err);
    }
    toast.success(t.chatCleared);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const charCount = inputValue.length;
  const charLimit = 1000;

  return (
    <>
      {/* Keyframe injections */}
      <style>{`
        @keyframes typingPulse {
          0%, 60%, 100% { opacity: 0.2; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col bg-page-gradient" style={{ height: 'calc(100vh - 64px)' }}>

        {/* ── Top bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-text-primary">{t.onlineStatus}</span>
            <span className="hidden sm:inline text-xs text-text-muted">{t.poweredBy}</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-error transition-colors px-2 py-1 rounded hover:bg-error/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearChat}</span>
            </button>
          )}
        </div>

        {/* ── Messages ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {messages.length === 0 ? (
            <EmptyState onPrompt={(text) => handleSendMessage(text)} t={t} />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
              {messages.map((msg, i) => (
                <MessageRow
                  key={i}
                  message={msg}
                  isLast={i === messages.length - 1}
                  t={t}
                />
              ))}

              {isLoading && (
                <div
                  className="flex gap-3"
                  style={{ animation: 'msgSlideIn 0.25s cubic-bezier(0.22,1,0.36,1) both' }}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center mt-5">
                    <LogoMark size={16} />
                  </div>
                  <div className="flex flex-col items-start max-w-[75%]">
                    <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 px-1">
                      {t.aiAssistant}
                    </span>
                    <div className="bg-surface border border-border rounded-lg rounded-tl-none px-4 py-3">
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom pill */}
        {showScrollBtn && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={() => scrollToBottom()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface border border-border shadow-md text-text-secondary hover:text-text-primary transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              {t.scrollToBottom}
            </button>
          </div>
        )}

        {/* ── Input dock ── */}
        <div className="flex-shrink-0 border-t border-border bg-surface px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className={`flex gap-2 items-end rounded-xl border transition-colors ${
              inputValue ? 'border-accent/40 bg-surface-secondary' : 'border-border bg-surface-secondary'
            } focus-within:border-accent/60`}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={t.sendPlaceholder}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none resize-none leading-relaxed"
                rows={1}
                maxLength={charLimit}
                disabled={isLoading}
                style={{ minHeight: 44, maxHeight: 140 }}
              />

              <div className="flex items-end gap-1 pr-2 pb-2">
                {charCount > charLimit * 0.7 && (
                  <span className={`text-[10px] tabular-nums ${charCount >= charLimit ? 'text-error' : 'text-text-muted'}`}>
                    {charCount}/{charLimit}
                  </span>
                )}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label={t.sendAriaLabel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent text-bg-primary disabled:bg-surface-hover disabled:text-text-muted transition-all hover:bg-accent-dark active:scale-95 disabled:scale-100"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-text-muted mt-2 text-center">
              {t.disclaimer}
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default ChatPage;
