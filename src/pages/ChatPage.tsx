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
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[68ch]`}>
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
  <div className="h-full flex flex-col justify-center px-6 sm:px-10 py-12">
    <div className="w-full max-w-[1100px]">
      <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.2,0,0,1) both' }}>
        <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
          {t.emptyDesc}
        </p>
        <h2 className="font-display font-medium text-text-primary text-[clamp(1.5rem,4vw,2.75rem)] leading-[1] tracking-[-0.03em]">
          {t.emptyTitle}
        </h2>
      </div>

      {/* Prompts as a numbered list rather than a card grid — the rows share
          one left edge with the heading, and each prompt's text can run to its
          natural length instead of being clamped to a uniform cell. */}
      <div
        className="mt-10 sm:mt-14 border-t border-border-subtle"
        style={{ animation: 'fadeUp 0.4s 0.08s cubic-bezier(0.2,0,0,1) both' }}
      >
        <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted py-5">
          {t.suggestedHeading}
        </p>
        {t.suggestedPrompts.map((p, i) => (
          <button
            key={p.label}
            onClick={() => onPrompt(p.text)}
            className="group w-full text-left grid grid-cols-[2rem_1fr] sm:grid-cols-[3rem_10rem_1fr] gap-x-4 gap-y-1 items-baseline border-t border-border-subtle py-5 transition-colors hover:bg-surface/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <span className="font-display text-xs text-text-muted tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-display text-sm text-text-primary tracking-[-0.01em]">
              {p.label}
            </span>
            <span className="col-start-2 sm:col-start-3 text-sm text-text-secondary leading-relaxed">
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

      {/*
        The frame used `calc(100vh - 64px)`, which counted the header but not
        the footer, so the column ran 93px past the viewport. The page then
        scrolled, carrying this bar — and the clear-chat button in it — up
        under the sticky header where it could not be tapped at all.

        Subtracting both, in dynamic viewport units so mobile browser chrome
        is tracked as it hides and shows.
      */}
      <div
        className="flex flex-col bg-page-gradient min-h-0"
        style={{ height: 'calc(100dvh - var(--header-h, 64px) - var(--footer-h, 0px))' }}
      >

        {/* ── Top bar ── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface">
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
            <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
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
                  <div className="flex flex-col items-start max-w-[68ch]">
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
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
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
