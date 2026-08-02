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

  /*
    No panel chrome or heading — this renders inside a labelled tab. The
    conversation is capped so the composer stays reachable without scrolling to
    the bottom of the page; scrollRef still points at the scrolling element,
    which is what the auto-scroll depends on.
  */
  return (
    <div className="flex flex-col max-w-[80ch]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin space-y-5 min-h-[12rem] max-h-[46vh]"
      >
        {messages.length === 0 && !sending && (
          <p className="text-sm text-text-muted flex items-center gap-2">
            <MessageCircleQuestion className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t.emptyState}
          </p>
        )}

        {/* Speaker is carried by the label and indent rather than a bubble —
            two columns of filled rounded rectangles was the card grid again,
            one row per message. */}
        {messages.map((message, index) => (
          <div key={index} className="grid grid-cols-[4.5rem_1fr] gap-4 items-baseline">
            <span className="font-display text-[0.625rem] uppercase tracking-[0.2em] text-text-muted">
              {message.role === 'user' ? t.you : t.assistant}
            </span>
            <div
              className={`text-sm whitespace-pre-wrap leading-relaxed ${
                message.role === 'user' ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {message.role === 'assistant' ? (
                <AnswerText text={message.content} onSeek={onSeek} />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="grid grid-cols-[4.5rem_1fr] gap-4 items-baseline">
            <span className="font-display text-[0.625rem] uppercase tracking-[0.2em] text-text-muted">
              {t.assistant}
            </span>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-text-muted" />
              {t.thinking}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error mt-3">{error}</p>}

      {/* Composer as a single underlined row, matching the search field on
          categories rather than a filled input plus an accent button. */}
      <div className="flex items-center gap-3 mt-6 border-b border-border-subtle focus-within:border-text-primary transition-colors">
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
          className="flex-1 bg-transparent border-0 py-3 min-h-[44px] text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || input.trim().length === 0}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          aria-label={t.send}
        >
          <Send className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default LessonChatPanel;
