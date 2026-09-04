import { Plus, X } from 'lucide-react';
import { PROFILE_LIMITS, ProfileLink } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { translations } from '../../../translations';

interface ContactFieldsEditorProps {
  phone: string;
  city: string;
  links: ProfileLink[];
  onPhoneChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onLinksChange: (links: ProfileLink[]) => void;
  linkError?: string;
  disabled?: boolean;
}

/**
 * Phone, city and links for the resume header.
 *
 * All three are optional and the hint says so. A learner who does not want a
 * phone number on a document they hand to strangers must be able to leave it
 * out without the form treating that as an incomplete profile.
 */
export const ContactFieldsEditor: React.FC<ContactFieldsEditorProps> = ({
  phone,
  city,
  links,
  onPhoneChange,
  onCityChange,
  onLinksChange,
  linkError,
  disabled = false,
}) => {
  const { language } = useLanguage();
  const t = translations[language].profile;

  const updateLink = (index: number, key: keyof ProfileLink, value: string) => {
    onLinksChange(links.map((link, i) => (i === index ? { ...link, [key]: value } : link)));
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-text-secondary mb-1">{t.sectionContact}</h3>
      <p className="text-xs text-text-muted mb-3">{t.contactHint}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="min-w-0">
          <label className="block text-xs text-text-muted mb-1.5">{t.fieldPhone}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            maxLength={PROFILE_LIMITS.phone}
            disabled={disabled}
            className="input w-full"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs text-text-muted mb-1.5">{t.fieldCity}</label>
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            maxLength={PROFILE_LIMITS.city}
            disabled={disabled}
            className="input w-full"
          />
        </div>
      </div>

      <label className="block text-xs text-text-muted mb-1.5">{t.fieldLinks}</label>
      {links.map((link, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={link.label}
            onChange={(e) => updateLink(index, 'label', e.target.value)}
            placeholder={t.fieldLinkLabel}
            maxLength={PROFILE_LIMITS.linkLabel}
            disabled={disabled}
            className="input w-full sm:w-32 flex-shrink-0"
          />
          <div className="flex gap-2 min-w-0 flex-1">
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              placeholder="https://"
              maxLength={PROFILE_LIMITS.linkUrl}
              disabled={disabled}
              className="input flex-1 min-w-0"
            />
            <button
              type="button"
              onClick={() => onLinksChange(links.filter((_, i) => i !== index))}
              disabled={disabled}
              aria-label={`${t.removeEntry}: ${link.label || link.url}`}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg text-text-muted hover:text-error transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {linkError && <p className="mt-1 mb-2 text-sm text-error">{linkError}</p>}

      {links.length < PROFILE_LIMITS.links && (
        <button
          type="button"
          onClick={() => onLinksChange([...links, { label: '', url: '' }])}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 min-h-[44px] text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.addLink}
        </button>
      )}
    </div>
  );
};

export default ContactFieldsEditor;
