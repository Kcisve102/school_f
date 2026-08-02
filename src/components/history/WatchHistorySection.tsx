import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { WatchHistoryItem } from '../../types';
import historyService from '../../services/history.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';
import HistoryRow from './HistoryRow';
import HistoryEmptyState from './HistoryEmptyState';
import { getWatchState } from './WatchProgress';

const PAGE_SIZE = 10;

type HistoryFilter = 'all' | 'in-progress' | 'completed' | 'quizzed';
type HistorySort = 'recent' | 'progress';

/**
 * Watch history — the list only.
 *
 * Reviewing an attempt is a separate page (`/attempt/:id`). It was briefly a rail
 * beside this list, which inverted the shapes: the review is the tall, wide object
 * and the list is the short one, so the rail overflowed while the list sat half
 * empty. The list now takes the full width and the review gets a page.
 *
 * `GET /history` returns every row unpaginated, so search, filter, sort and paging
 * are all client-side over the one payload — filter first, then slice, so the pager
 * follows the results rather than the raw set.
 */
export const WatchHistorySection: React.FC = () => {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [sort, setSort] = useState<HistorySort>('recent');
  const [page, setPage] = useState(1);

  const { language } = useLanguage();
  const t = translations[language].history;

  useEffect(() => {
    historyService
      .getHistory()
      .then(setItems)
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matched = items.filter(({ video, positionSeconds, completed, attempts }) => {
      if (q) {
        const inTitle = video.title.toLowerCase().includes(q);
        const inDescription = video.description?.toLowerCase().includes(q) ?? false;
        if (!inTitle && !inDescription) return false;
      }

      switch (filter) {
        case 'in-progress':
          return !completed && positionSeconds > 0;
        case 'completed':
          return completed;
        case 'quizzed':
          return attempts.length > 0;
        default:
          return true;
      }
    });

    if (sort === 'recent') {
      // The server already sorts by watchedAt DESC, with quiz-only rows last.
      return matched;
    }

    return [...matched].sort((a, b) => {
      const ap = getWatchState(a.positionSeconds, a.completed, a.video.duration).percent;
      const bp = getWatchState(b.positionSeconds, b.completed, b.video.duration).percent;
      return bp - ap;
    });
  }, [items, query, filter, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // A narrowed search or a new filter can leave the current page past the end of
  // the results; step back rather than render an empty list.
  useEffect(() => {
    setPage(1);
  }, [query, filter, sort]);

  useScrollReveal(undefined, [loading, filter, sort, page, filtered.length]);

  if (loading) {
    return <Loader text={t.loading} />;
  }

  const filterTabs: Array<[HistoryFilter, string]> = [
    ['all', t.filterAll],
    ['in-progress', t.filterInProgress],
    ['completed', t.filterCompleted],
    ['quizzed', t.filterQuizzed],
  ];

  const sortTabs: Array<[HistorySort, string]> = [
    ['recent', t.sortRecent],
    ['progress', t.sortProgress],
  ];

  return (
    <div className="reveal-up">
      <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
        {t.eyebrow}
      </p>
      <h2 className="font-display font-medium text-text-primary text-[clamp(1.25rem,3vw,2rem)] leading-[1] tracking-[-0.03em] mb-10">
        {t.title}
      </h2>

      {items.length === 0 ? (
        <HistoryEmptyState variant="empty" />
      ) : (
        <div className="min-w-0">
          {/* Search, filter and sort act on what is directly below them, so they
              share one utility row rather than a rail. */}
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 mb-8">
            <div className="relative flex-1 min-w-[16rem] max-w-md">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-0 border-b border-border-subtle pl-7 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-6">
              {sortTabs.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  aria-pressed={sort === key}
                  className={`min-h-[44px] font-display text-[0.625rem] uppercase tracking-[0.15em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    sort === key ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-2 border-b border-border-subtle">
            {filterTabs.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`relative pt-2 pb-4 min-h-[44px] font-display text-xs uppercase tracking-[0.15em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                  filter === key
                    ? 'text-text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <HistoryEmptyState variant="no-matches" />
          ) : (
            <>
              <div className="border-t border-border-subtle">
                {paged.map((item) => (
                  <HistoryRow key={item.video.id} item={item} />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
                <p className="font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted tabular-nums">
                  {(page - 1) * PAGE_SIZE + 1}&ndash;
                  {Math.min(page * PAGE_SIZE, filtered.length)} {t.of} {filtered.length}
                </p>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchHistorySection;
