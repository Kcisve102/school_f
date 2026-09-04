import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PROFILE_LIMITS } from '../../types';

interface StringListEditorProps {
  label: string;
  hint?: string;
  placeholder: string;
  addLabel: string;
  removeLabel: string;
  emptyLabel: string;
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Edits a list of short strings (skills, job titles) as removable chips with a
 * single add field.
 *
 * Entries are added on Enter as well as by button: this list is normally typed
 * out in one pass, and reaching for the mouse between every skill is the kind
 * of friction that leaves a profile half-filled.
 */
export const StringListEditor: React.FC<StringListEditorProps> = ({
  label,
  hint,
  placeholder,
  addLabel,
  removeLabel,
  emptyLabel,
  items,
  onChange,
  error,
  disabled = false,
}) => {
  const [draft, setDraft] = useState('');

  const atCapacity = items.length >= PROFILE_LIMITS.listItems;
  const trimmed = draft.trim();
  const canAdd =
    !disabled && trimmed.length > 0 && trimmed.length <= PROFILE_LIMITS.listItemLength && !atCapacity;

  const addItem = () => {
    if (!canAdd) return;
    // Silently ignore an exact duplicate rather than erroring — the learner
    // meant to add it, and a rejected keystroke reads as a broken field.
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setDraft('');
  };

  const removeItem = (index: number) => {
    if (disabled) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // This editor sits inside a form; Enter must add an entry, never submit.
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <label className="block text-sm font-medium text-text-secondary">{label}</label>
        <span className="text-[11px] text-text-muted tabular-nums">
          {items.length}/{PROFILE_LIMITS.listItems}
        </span>
      </div>
      {hint && <p className="text-xs text-text-muted mb-2">{hint}</p>}

      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-2 mb-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border pl-3 pr-1.5 py-1.5 text-sm text-text-primary"
            >
              <span className="max-w-[32ch] truncate">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={disabled}
                aria-label={`${removeLabel}: ${item}`}
                className="p-1 rounded-full text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted mb-3">{emptyLabel}</p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || atCapacity}
          maxLength={PROFILE_LIMITS.listItemLength}
          className="input flex-1"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!canAdd}
          className="btn btn-secondary flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1 inline" />
          {addLabel}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
};

export default StringListEditor;
