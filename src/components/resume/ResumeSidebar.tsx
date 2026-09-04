import React from 'react';
import { ResumeLayoutProps } from './resume.types';

/**
 * Two columns: skills and target roles in a tinted sidebar, summary in the main
 * column. Reads as more designed than Classic at the cost of ATS friendliness —
 * some parsers flatten columns in the wrong order.
 *
 * The sidebar tint is printed with -webkit-print-color-adjust: exact (set on
 * .resume-sheet in index.css), since browsers drop background fills by default.
 */
export const ResumeSidebar: React.FC<ResumeLayoutProps> = ({ data, labels }) => (
  <article className="resume-sheet" style={{ display: 'flex' }}>
    {/* Sidebar */}
    <aside
      style={{
        width: '34%',
        backgroundColor: '#f3f4f6',
        padding: '16mm 8mm',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      {data.email && (
        <SideSection title={labels.contactEmail}>
          {/* Long addresses must wrap rather than overflow the column. */}
          <p style={{ fontSize: '9px', color: '#374151', margin: 0, wordBreak: 'break-word' }}>
            {data.email}
          </p>
        </SideSection>
      )}

      {data.skills.length > 0 && (
        <SideSection title={labels.sectionSkills}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.skills.map((skill) => (
              <li
                key={skill}
                style={{ fontSize: '9.5px', lineHeight: 1.5, color: '#1f2937', marginBottom: '5px' }}
              >
                {skill}
              </li>
            ))}
          </ul>
        </SideSection>
      )}

      {data.jobTitles.length > 0 && (
        <SideSection title={labels.sectionTargets}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {data.jobTitles.map((title) => (
              <li
                key={title}
                style={{ fontSize: '9.5px', lineHeight: 1.5, color: '#1f2937', marginBottom: '5px' }}
              >
                {title}
              </li>
            ))}
          </ul>
        </SideSection>
      )}
    </aside>

    {/* Main column */}
    <div style={{ flex: 1, padding: '16mm 12mm' }}>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#111827',
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {data.fullName}
      </h1>
      <p
        style={{
          fontSize: '11px',
          color: '#4b5563',
          margin: '7px 0 0',
          paddingBottom: '11px',
          borderBottom: '2px solid #111827',
        }}
      >
        {data.headline}
      </p>

      <h2
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#111827',
          margin: '16px 0 7px',
        }}
      >
        {labels.sectionSummary}
      </h2>
      <p style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#1f2937', margin: 0 }}>
        {data.summary}
      </p>
    </div>
  </article>
);

const SideSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '18px' }}>
    <h2
      style={{
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#6b7280',
        margin: '0 0 7px',
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

export default ResumeSidebar;
