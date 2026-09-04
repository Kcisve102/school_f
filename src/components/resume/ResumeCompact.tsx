import React from 'react';
import { ResumeLayoutProps } from './resume.types';

/**
 * Left-aligned name, skills as chips, tighter vertical rhythm. Fits more onto
 * one page than Classic, which matters once a learner has edited their profile
 * up to the 30-skill ceiling.
 */
export const ResumeCompact: React.FC<ResumeLayoutProps> = ({ data, labels }) => (
  <article className="resume-sheet" style={{ padding: '15mm 14mm' }}>
    <header style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>
          {data.fullName}
        </h1>
        {data.email && (
          <span style={{ fontSize: '9px', color: '#6b7280', whiteSpace: 'nowrap' }}>{data.email}</span>
        )}
      </div>
      <p style={{ fontSize: '11px', color: '#2563eb', margin: '4px 0 0', fontWeight: 600 }}>
        {data.headline}
      </p>
      <div style={{ height: '3px', backgroundColor: '#2563eb', width: '46px', marginTop: '9px' }} />
    </header>

    <section style={{ marginBottom: '13px' }}>
      <Heading>{labels.sectionSummary}</Heading>
      <p style={{ fontSize: '10px', lineHeight: 1.6, color: '#1f2937', margin: 0 }}>{data.summary}</p>
    </section>

    {data.skills.length > 0 && (
      <section style={{ marginBottom: '13px' }}>
        <Heading>{labels.sectionSkills}</Heading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {data.skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: '9px',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                padding: '2px 7px',
                // Chips must not split across a page break.
                breakInside: 'avoid',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    )}

    {data.jobTitles.length > 0 && (
      <section>
        <Heading>{labels.sectionTargets}</Heading>
        <p style={{ fontSize: '10px', lineHeight: 1.6, color: '#1f2937', margin: 0 }}>
          {data.jobTitles.join('  ·  ')}
        </p>
      </section>
    )}
  </article>
);

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2
    style={{
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: '#2563eb',
      margin: '0 0 5px',
    }}
  >
    {children}
  </h2>
);

export default ResumeCompact;
