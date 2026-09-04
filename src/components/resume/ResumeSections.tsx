import React from 'react';
import {
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from '../../types';

/**
 * The learner-supplied sections, shared by all three layouts.
 *
 * These live here rather than in each layout because the markup is identical
 * and only the type scale differs — writing an experience entry three times
 * would guarantee the three drift apart. Sizes are passed in so Compact can
 * tighten without forking the markup.
 *
 * Colours are hard-coded for the same reason as the layouts themselves: the app
 * is a fixed dark theme, and inheriting it would print white text on white
 * paper.
 */

export interface EntryScale {
  /** Bold line: job title, qualification, project name. */
  title: number;
  /** Supporting line: employer, institution. */
  meta: number;
  /** Body copy and bullets. */
  body: number;
}

export const DEFAULT_SCALE: EntryScale = { title: 11, meta: 10, body: 10.5 };

const INK = '#111827';
const BODY = '#1f2937';
const MUTED = '#6b7280';

/**
 * Every entry avoids an internal page break. A job whose employer sits at the
 * foot of page one and whose duties sit at the top of page two reads as two
 * different jobs — to a person and to a resume parser alike.
 */
const entryStyle: React.CSSProperties = {
  marginBottom: '10px',
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

/** Joins the parts of a dateline, dropping the ones the learner never gave. */
function dateRange(start: string | null, end: string | null, current: boolean, presentLabel: string): string {
  const to = current ? presentLabel : end;
  if (start && to) return `${start} — ${to}`;
  return start || to || '';
}

export const ExperienceEntries: React.FC<{
  items: ResumeExperience[];
  presentLabel: string;
  scale?: EntryScale;
}> = ({ items, presentLabel, scale = DEFAULT_SCALE }) => (
  <>
    {items.map((item, i) => (
      <div key={`${item.employer}-${i}`} style={entryStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '10px',
          }}
        >
          <p style={{ fontSize: scale.title, fontWeight: 700, color: INK, margin: 0 }}>
            {item.role}
          </p>
          <p style={{ fontSize: scale.meta - 1, color: MUTED, margin: 0, whiteSpace: 'nowrap' }}>
            {dateRange(item.start, item.end, item.current, presentLabel)}
          </p>
        </div>
        <p style={{ fontSize: scale.meta, color: BODY, margin: '1px 0 0' }}>
          {item.employer}
          {item.location ? ` · ${item.location}` : ''}
        </p>
        {item.bullets.length > 0 && (
          <ul style={{ margin: '4px 0 0', paddingLeft: '15px' }}>
            {item.bullets.map((bullet, b) => (
              <li
                key={b}
                style={{ fontSize: scale.body, lineHeight: 1.5, color: BODY, marginBottom: '1px' }}
              >
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </>
);

export const EducationEntries: React.FC<{
  items: ResumeEducation[];
  scale?: EntryScale;
}> = ({ items, scale = DEFAULT_SCALE }) => (
  <>
    {items.map((item, i) => (
      <div key={`${item.credential}-${i}`} style={entryStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '10px',
          }}
        >
          <p style={{ fontSize: scale.title, fontWeight: 700, color: INK, margin: 0 }}>
            {item.credential}
          </p>
          <p style={{ fontSize: scale.meta - 1, color: MUTED, margin: 0, whiteSpace: 'nowrap' }}>
            {dateRange(item.start, item.end, false, '')}
          </p>
        </div>
        {(item.institution || item.location) && (
          <p style={{ fontSize: scale.meta, color: BODY, margin: '1px 0 0' }}>
            {[item.institution, item.location].filter(Boolean).join(' · ')}
          </p>
        )}
        {item.detail && (
          <p style={{ fontSize: scale.body, lineHeight: 1.5, color: BODY, margin: '3px 0 0' }}>
            {item.detail}
          </p>
        )}
      </div>
    ))}
  </>
);

export const ProjectEntries: React.FC<{
  items: ResumeProject[];
  scale?: EntryScale;
}> = ({ items, scale = DEFAULT_SCALE }) => (
  <>
    {items.map((item, i) => (
      <div key={`${item.name}-${i}`} style={entryStyle}>
        <p style={{ fontSize: scale.title, fontWeight: 700, color: INK, margin: 0 }}>{item.name}</p>
        {item.detail && (
          <p style={{ fontSize: scale.body, lineHeight: 1.5, color: BODY, margin: '2px 0 0' }}>
            {item.detail}
          </p>
        )}
        {item.link && (
          <p
            style={{
              fontSize: scale.meta - 1,
              color: MUTED,
              margin: '2px 0 0',
              wordBreak: 'break-word',
            }}
          >
            {item.link}
          </p>
        )}
      </div>
    ))}
  </>
);

export const CertificationEntries: React.FC<{
  items: ResumeCertification[];
  scale?: EntryScale;
}> = ({ items, scale = DEFAULT_SCALE }) => (
  <>
    {items.map((item, i) => (
      <div key={`${item.name}-${i}`} style={{ ...entryStyle, marginBottom: '5px' }}>
        <p style={{ fontSize: scale.body, color: BODY, margin: 0 }}>
          <span style={{ fontWeight: 700, color: INK }}>{item.name}</span>
          {item.issuer ? ` — ${item.issuer}` : ''}
          {item.issued ? ` (${item.issued})` : ''}
        </p>
      </div>
    ))}
  </>
);
