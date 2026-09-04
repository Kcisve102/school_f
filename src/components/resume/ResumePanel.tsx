import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import ResumeClassic from './ResumeClassic';
import ResumeSidebar from './ResumeSidebar';
import ResumeCompact from './ResumeCompact';
import { ResumeData, ResumeLabels, ResumeLayoutId, ResumeLayoutProps } from './resume.types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

/** An A4 sheet is 210mm wide; the preview scales that down to its column. */
const SHEET_WIDTH_MM = 210;
const MM_PER_PX = 96 / 25.4;
const SHEET_WIDTH_PX = SHEET_WIDTH_MM * MM_PER_PX;
/** A4 is 210 x 297mm. */
const A4_RATIO = 297 / 210;

const LAYOUTS: Record<ResumeLayoutId, React.FC<ResumeLayoutProps>> = {
  classic: ResumeClassic,
  sidebar: ResumeSidebar,
  compact: ResumeCompact,
};

interface ResumePanelProps {
  data: ResumeData;
}

/**
 * Layout picker plus a print-to-PDF download.
 *
 * Download goes through window.print() rather than a PDF library: it keeps the
 * text selectable and searchable, which is what employer ATS systems parse. A
 * canvas-rasterising library would produce an image of a resume that no parser
 * can read.
 */
export const ResumePanel: React.FC<ResumePanelProps> = ({ data }) => {
  const { language } = useLanguage();
  const t = translations[language].resume;

  const [layout, setLayout] = useState<ResumeLayoutId>('classic');
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(SHEET_WIDTH_PX * A4_RATIO);
  /* A resume with real work history runs past one page. The height is already
     measured for the preview, so the page count is free — and saying it up
     front beats the learner discovering it in the print dialog. */
  const [pages, setPages] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);

  // The sheet renders at true A4 width and is scaled to whatever the column
  // allows, so the preview stays faithful to the printed result.
  //
  // A transformed element still occupies its untransformed size, so the wrapper
  // has to reserve the scaled height explicitly. That height is measured rather
  // than assumed: a short resume does not fill a page, and reserving a full A4
  // for it leaves a large blank gap below the preview.
  useEffect(() => {
    const frame = frameRef.current;
    const scaler = scalerRef.current;
    if (!frame || !scaler) return;

    const fit = () => {
      const next = Math.min(1, frame.clientWidth / SHEET_WIDTH_PX);
      setScale(next);
      const contentHeight = Math.max(scaler.offsetHeight, SHEET_WIDTH_PX * A4_RATIO);
      setSheetHeight(contentHeight * next);
      setPages(Math.max(1, Math.round(contentHeight / (SHEET_WIDTH_PX * A4_RATIO))));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(frame);
    ro.observe(scaler);
    return () => ro.disconnect();
  }, [layout]);

  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  const Layout = LAYOUTS[layout];
  const labels: ResumeLabels = {
    contactEmail: t.contactEmail,
    contactPhone: t.contactPhone,
    contactLocation: t.contactLocation,
    sectionSummary: t.sectionSummary,
    sectionSkills: t.sectionSkills,
    sectionTargets: t.sectionTargets,
    sectionExperience: t.sectionExperience,
    sectionEducation: t.sectionEducation,
    sectionProjects: t.sectionProjects,
    sectionCertifications: t.sectionCertifications,
    present: t.present,
  };

  const options: { id: ResumeLayoutId; name: string; desc: string }[] = [
    { id: 'classic', name: t.layoutClassic, desc: t.layoutClassicDesc },
    { id: 'sidebar', name: t.layoutSidebar, desc: t.layoutSidebarDesc },
    { id: 'compact', name: t.layoutCompact, desc: t.layoutCompactDesc },
  ];

  return (
    <section className="mt-14 pt-10 border-t border-border">
      <div className="flex items-start gap-3 mb-1">
        <FileText className="w-5 h-5 flex-shrink-0 mt-0.5 text-text-muted" />
        <div>
          <h2 className="font-display text-lg text-text-primary leading-tight">{t.heading}</h2>
          <p className="text-sm text-text-secondary mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Layout picker */}
      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-text-secondary mb-2">{t.layoutLabel}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => {
            const active = layout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLayout(opt.id)}
                aria-pressed={active}
                className={`text-left rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                  active
                    ? 'border-text-primary bg-surface'
                    : 'border-border bg-surface/50 hover:border-border-hover'
                }`}
              >
                <span className="block text-sm text-text-primary">{opt.name}</span>
                <span className="block text-xs text-text-muted mt-0.5">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleDownload} className="btn btn-primary">
          <Download className="w-4 h-4 mr-2 inline" />
          {t.download}
        </button>
        <p className="text-xs text-text-muted max-w-[46ch]">{t.downloadHint}</p>
      </div>

      {/* Preview */}
      <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted mt-8 mb-3">
        {t.previewLabel}
        {pages > 1 && <span className="ml-2 normal-case tracking-normal">
          ({t.pageCount.replace('{count}', String(pages))})
        </span>}
      </p>
      <div ref={frameRef} className="overflow-hidden rounded-lg">
        {/* The wrapper reserves the scaled height; without it the untransformed
            sheet would leave a tall gap below the preview. */}
        <div style={{ height: sheetHeight }}>
          <div
            ref={scalerRef}
            className="resume-preview-scaler resume-print-root shadow-lg"
            style={{ transform: `scale(${scale})`, width: SHEET_WIDTH_PX }}
          >
            <Layout data={data} labels={labels} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumePanel;
