import React from 'react';
import { ResumeLayoutProps } from './resume.types';
import {
  CertificationEntries,
  EducationEntries,
  ExperienceEntries,
  ProjectEntries,
} from './ResumeSections';

/** Tighter than the default so a fuller history still fits the page. */
const COMPACT_SCALE = { title: 10, meta: 9.5, body: 9.5 };

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
        {(data.email || data.phone || data.city) && (
          <span style={{ fontSize: '9px', color: '#6b7280', textAlign: 'right' }}>
            {[data.email, data.phone, data.city].filter(Boolean).join('  ·  ')}
          </span>
        )}
      </div>
      <p style={{ fontSize: '11px', color: '#2563eb', margin: '4px 0 0', fontWeight: 600 }}>
        {data.headline}
      </p>
      {data.links && data.links.length > 0 && (
        <p style={{ fontSize: '9px', color: '#6b7280', margin: '3px 0 0', wordBreak: 'break-word' }}>
          {data.links.map((link) => link.url).join('  ·  ')}
        </p>
      )}
      <div style={{ height: '3px', backgroundColor: '#2563eb', width: '46px', marginTop: '9px' }} />
    </header>

    <section style={{ marginBottom: '13px' }}>
      <Heading>{labels.sectionSummary}</Heading>
      <p style={{ fontSize: '10px', lineHeight: 1.6, color: '#1f2937', margin: 0 }}>{data.summary}</p>
    </section>

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: '13px' }}>
        <Heading>{labels.sectionExperience}</Heading>
        <ExperienceEntries
          items={data.experience}
          presentLabel={labels.present}
          scale={COMPACT_SCALE}
        />
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: '13px' }}>
        <Heading>{labels.sectionEducation}</Heading>
        <EducationEntries items={data.education} scale={COMPACT_SCALE} />
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: '13px' }}>
        <Heading>{labels.sectionProjects}</Heading>
        <ProjectEntries items={data.projects} scale={COMPACT_SCALE} />
      </section>
    )}

    {data.certifications && data.certifications.length > 0 && (
      <section style={{ marginBottom: '13px' }}>
        <Heading>{labels.sectionCertifications}</Heading>
        <CertificationEntries items={data.certifications} scale={COMPACT_SCALE} />
      </section>
    )}

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
      breakAfter: 'avoid',
      pageBreakAfter: 'avoid',
    }}
  >
    {children}
  </h2>
);

export default ResumeCompact;
