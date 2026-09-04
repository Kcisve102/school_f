import React, { useState } from 'react';
import { Check, Loader2, Unlink } from 'lucide-react';
import toast from 'react-hot-toast';
import freelancerService, { FreelancerStatus } from '../../services/freelancer.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface FreelancerAccountBarProps {
  status: FreelancerStatus;
  /** Called after a successful disconnect so the surface can clear its jobs. */
  onDisconnected: () => void;
}

/**
 * Which account is linked, and the way to unlink it.
 *
 * Shown wherever jobs are — the connect panel is replaced by listings once an
 * account is linked, so without this there is nowhere left to disconnect from.
 */
export const FreelancerAccountBar: React.FC<FreelancerAccountBarProps> = ({
  status,
  onDisconnected,
}) => {
  const { language } = useLanguage();
  const t = translations[language].freelancer;
  const [working, setWorking] = useState(false);

  const handleDisconnect = async () => {
    setWorking(true);
    try {
      await freelancerService.disconnect();
      toast.success(t.disconnected);
      onDisconnected();
    } catch {
      toast.error(t.disconnectFailed);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-border-subtle">
      <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
        <Check className="w-3.5 h-3.5" />
        {status.freelancerUsername
          ? t.connectedAs.replace('{username}', status.freelancerUsername)
          : t.connected}
      </span>
      <button
        onClick={handleDisconnect}
        disabled={working}
        className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1 text-xs text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded disabled:opacity-50"
      >
        {working ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Unlink className="w-3.5 h-3.5" />
        )}
        {t.disconnect}
      </button>
    </div>
  );
};

export default FreelancerAccountBar;
