import React, { useEffect, useRef, useState } from 'react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import chatService, { ChatMessage } from '../../services/chat.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface LessonChatPanelProps {
  videoId: number;
  /** Jump the player to a timestamp cited in an answer. */
  onSeek?: (seconds: number) => void;
}

/** Matches "3:20" or "1:02:33" so cited timestamps become clickable. */
const TIMESTAMP_PATTERN = /(\d{1,2}:\d{2}(?::\d{2})?)/g;

function timestampToSeconds(stamp: string): number {
  const parts = stamp.split(':').map(Number);
  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
}

/**
 * The assistant is told to cite times like "（提到于 3:20）". Rendering those as
 * buttons turns an answer into a way back into the video, which is the point of
 * grounding it in the transcript in the first place.
 */
const AnswerText: React.FC<{ text: string; onSeek?: (s: number) => void }> = ({
  text,
  onSeek,
}) => {
  if (!onSeek) return <>{text}</>;

  const parts = text.split(TIMESTAMP_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        TIMESTAMP_PATTERN.test(part) && i % 2 === 1 ? (
          <button
            key={i}
            type="button"
            onClick={() => onSeek(timestampToSeconds(part))}
            className="text-accent underline underline-offset-2 hover:text-accent-dark"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const LessonChatPanel: React.FC<LessonChatPanelProps> = ({
  videoId,
  onSeek,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = translations[language].lessonChat;

  // Conversations are stored server-side, so a refresh or a trip to the quiz
  // and back returns to the same thread.
  useEffect(() => {
    let cancelled = false;
    chatService
      .getThread(videoId)
      .then((thread) => {
        if (!cancelled) setMessages(thread);
      })
      .catch((err) => console.error('Failed to load chat thread:', err));
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, sending]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || sending) return;

    setError('');
    setSending(true);
    setInput('');
    // Show the question immediately; the server persists both turns.
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    try {
      const { response } = await chatService.sendMessage(question, videoId);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setError(err.response?.data?.message || t.failed);
      // Drop the optimistic question so the thread matches what was stored.
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setSending(false);
    }
  };

  return (
    /* Owns its height rather than capping at a fixed 320px: the panel sits in
       the video page's right rail, so it can size to the viewport the way the
       transcript does. scrollRef still points at the scrolling element, which
       is what the auto-scroll depends on. */
    <div className="border border-border flex flex-col max-h-[60vh]">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border-subtle flex-shrink-0">
        <MessageCircleQuestion className="w-3.5 h-3.5 text-text-muted" />
        <h3 className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted">{t.heading}</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-5 py-4">
        {messages.length === 0 && !sending && (
          <p className="text-sm text-text-muted">{t.emptyState}</p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-surface-secondary border border-border-hover text-text-primary'
                : 'bg-surface-secondary text-text-secondary'
            }`}
          >
            {message.role === 'assistant' ? (
              <AnswerText text={message.content} onSeek={onSeek} />
            ) : (
              message.content
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-sm text-text-muted p-3">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-text-muted" />
            {t.thinking}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error px-5 pb-2 flex-shrink-0">{error}</p>}

      {/* Docked: the message well above scrolls, this row stays put. */}
      <div className="flex gap-2 px-5 py-4 border-t border-border-subtle flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          maxLength={2000}
          placeholder={t.placeholder}
          disabled={sending}
          className="flex-1 px-3 py-3 min-h-[44px] bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || input.trim().length === 0}
          className="px-4 min-h-[44px] min-w-[44px] flex items-center justify-center bg-accent text-bg-primary rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.send}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LessonChatPanel;
