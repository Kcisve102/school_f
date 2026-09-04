import { Plus, X } from 'lucide-react';
import { PROFILE_LIMITS } from '../../../types';

/**
 * Describes one editable field on a resume entry. The editor is driven by these
 * rather than hard-coding four near-identical forms for experience, education,
 * projects and certifications — they differ only in their fields.
 */
export interface EntryField<T> {
  key: keyof T & string;
  label: string;
  /** `date` and `check` render differently; everything else is a text input. */
  kind?: 'text' | 'date' | 'detail' | 'check' | 'bullets';
  placeholder?: string;
  hint?: string;
  /** Half-width on desktop, so two short fields share a row. */
  half?: boolean;
}

interface ResumeSectionEditorProps<T> {
  label: string;
  addLabel: string;
  removeLabel: string;
  emptyLabel: string;
  items: T[];
  fields: EntryField<T>[];
  /** A blank entry, used when the learner adds one by hand. */
  blank: () => T;
  maxEntries: number;
  bulletPlaceholder?: string;
  onChange: (items: T[]) => void;
  disabled?: boolean;
}

/**
 * Add / edit / remove a list of structured resume entries.
 *
 * Used both by the intake review step and by the profile form directly, so a
 * learner who never runs the wizard — or who runs it and wants to correct it —
 * edits exactly the same way.
 */
export function ResumeSectionEditor<T extends Record<string, any>>({
  label,
  addLabel,
  removeLabel,
  emptyLabel,
  items,
  fields,
  blank,
  maxEntries,
  bulletPlaceholder,
  onChange,
  disabled = false,
}: ResumeSectionEditorProps<T>) {
  const atCapacity = items.length >= maxEntries;

  const update = (index: number, key: string, value: unknown) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-text-secondary">{label}</h3>
        <span className="text-[11px] text-text-muted tabular-nums">
          {items.length}/{maxEntries}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted mb-3">{emptyLabel}</p>
      ) : (
        <ul className="space-y-4 mb-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-lg border border-border bg-surface/50 p-4 relative"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`${removeLabel} ${index + 1}`}
                className="absolute top-2 right-2 flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-full text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>

              {/* min-w-0 on the grid children: without it a long value refuses
                  to shrink and pushes the card wider than a phone screen. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-10">
                {fields.map((field) => {
                  const value = item[field.key];

                  if (field.kind === 'check') {
                    return (
                      <label
                        key={field.key}
                        className="sm:col-span-2 flex items-center gap-2 min-h-[44px] cursor-pointer text-sm text-text-secondary"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => update(index, field.key, e.target.checked)}
                          disabled={disabled}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                        {field.label}
                      </label>
                    );
                  }

                  if (field.kind === 'bullets') {
                    const bullets: string[] = Array.isArray(value) ? value : [];
                    return (
                      <div key={field.key} className="sm:col-span-2 min-w-0">
                        <label className="block text-xs text-text-muted mb-1.5">
                          {field.label}
                        </label>
                        {bullets.map((bullet, b) => (
                          <div key={b} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) =>
                                update(
                                  index,
                                  field.key,
                                  bullets.map((x, i) => (i === b ? e.target.value : x))
                                )
                              }
                              maxLength={PROFILE_LIMITS.bulletLength}
                              disabled={disabled}
                              className="input flex-1 min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                update(
                                  index,
                                  field.key,
                                  bullets.filter((_, i) => i !== b)
                                )
                              }
                              disabled={disabled}
                              aria-label={removeLabel}
                              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg text-text-muted hover:text-error transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {bullets.length < PROFILE_LIMITS.bullets && (
                          <button
                            type="button"
                            onClick={() => update(index, field.key, [...bullets, ''])}
                            disabled={disabled}
                            className="inline-flex items-center gap-1.5 min-h-[44px] text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {bulletPlaceholder}
                          </button>
                        )}
                      </div>
                    );
                  }

                  const isDetail = field.kind === 'detail';
                  const maxLength = isDetail
                    ? PROFILE_LIMITS.detail
                    : field.kind === 'date'
                    ? PROFILE_LIMITS.dateText
                    : PROFILE_LIMITS.entryField;

                  return (
                    <div
                      key={field.key}
                      className={`min-w-0 ${field.half ? '' : 'sm:col-span-2'}`}
                    >
                      <label className="block text-xs text-text-muted mb-1.5">{field.label}</label>
                      {isDetail ? (
                        <textarea
                          value={(value as string) ?? ''}
                          onChange={(e) => update(index, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={maxLength}
                          disabled={disabled}
                          rows={2}
                          className="input w-full resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={(value as string) ?? ''}
                          onChange={(e) => update(index, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          maxLength={maxLength}
                          disabled={disabled}
                          className="input w-full"
                        />
                      )}
                      {field.hint && (
                        <p className="mt-1 text-[11px] text-text-muted">{field.hint}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onChange([...items, blank()])}
        disabled={disabled || atCapacity}
        className="btn btn-secondary min-h-[44px] disabled:opacity-50"
      >
        <Plus className="w-4 h-4 mr-1 inline" />
        {addLabel}
      </button>
    </div>
  );
}

export default ResumeSectionEditor;
