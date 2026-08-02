import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/* Windowed page numbers with first/last always visible and '...' for the gaps,
   so the control keeps a stable width no matter how many videos exist. */
const getPageItems = (currentPage: number, totalPages: number): (number | 'gap')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | 'gap')[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push('gap');
  for (let page = start; page <= end; page++) items.push(page);
  if (end < totalPages - 1) items.push('gap');

  items.push(totalPages);
  return items;
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const arrowClasses =
    'inline-flex items-center justify-center w-9 h-9 border border-border-subtle text-text-secondary transition-colors hover:text-text-primary hover:border-border disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-secondary disabled:hover:border-border-subtle focus:outline-none focus-visible:ring-1 focus-visible:ring-white';

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={arrowClasses}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {getPageItems(currentPage, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span
            key={`gap-${index}`}
            className="w-9 h-9 inline-flex items-center justify-center font-display text-xs text-text-muted"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`w-9 h-9 inline-flex items-center justify-center border font-display text-xs tabular-nums transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              item === currentPage
                ? 'border-text-primary text-text-primary'
                : 'border-border-subtle text-text-muted hover:text-text-primary hover:border-border'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={arrowClasses}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </nav>
  );
};

export default Pagination;
