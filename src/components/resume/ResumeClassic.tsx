import React from 'react';
import { ResumeLayoutProps } from './resume.types';
import {
  CertificationEntries,
  EducationEntries,
  ExperienceEntries,
  ProjectEntries,
} from './ResumeSections';

/**
 * Single column, centred name, rules under each heading. The most conservative
 * of the three and the safest through employer ATS parsers, which read a linear
 * document more reliably than a multi-column one.
 *
 * Colours are hard-coded rather than taken from the app's CSS variables: the
 * app is a fixed dark theme, and inheriting it would print white text onto
 * white paper.
 */
export const ResumeClassic: React.FC<ResumeLayoutProps> = ({ data, labels }) => (
  <article className="resume-sheet" style={{ padding: '18mm 16mm' }}>
    <header style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '10px' }}>
      <h1
        style={{
          fontSize: '25px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#111827',
          margin: 0,
        }}
      >
        {data.fullName}
      </h1>
      <p style={{ fontSize: '11.5px', color: '#374151', margin: '6px 0 0' }}>{data.headline}</p>
      {/* Only the details the learner actually gave; every one is optional. */}
      {(data.email || data.phone || data.city) && (
        <p style={{ fontSize: '10px', color: '#6b7280', margin: '5px 0 0' }}>
          {[data.email, data.phone, data.city].filter(Boolean).join('  ·  ')}
        </p>
      )}
      {data.links && data.links.length > 0 && (
        <p style={{ fontSize: '9.5px', color: '#6b7280', margin: '3px 0 0', wordBreak: 'break-word' }}>
          {data.links.map((link) => link.url).join('  ·  ')}
        </p>
      )}
    </header>

    <Section title={labels.sectionSummary}>
      <p style={{ fontSize: '10.5px', lineHeight: 1.65, color: '#1f2937', margin: 0 }}>
        {data.summary}
      </p>
    </Section>

    {data.experience && data.experience.length > 0 && (
      <Section title={labels.sectionExperience}>
        <ExperienceEntries items={data.experience} presentLabel={labels.present} />
      </Section>
    )}

    {data.education && data.education.length > 0 && (
      <Section title={labels.sectionEducation}>
        <EducationEntries items={data.education} />
      </Section>
    )}

    {data.projects && data.projects.length > 0 && (
      <Section title={labels.sectionProjects}>
        <ProjectEntries items={data.projects} />
      </Section>
    )}

    {data.certifications && data.certifications.length > 0 && (
      <Section title={labels.sectionCertifications}>
        <CertificationEntries items={data.certifications} />
      </Section>
    )}

    {data.skills.length > 0 && (
      <Section title={labels.sectionSkills}>
        {/* Comma-separated rather than bulleted: a plain run of keywords is what
            a resume parser extracts most cleanly. */}
        <p style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#1f2937', margin: 0 }}>
          {data.skills.join(' · ')}
        </p>
      </Section>
    )}

    {data.jobTitles.length > 0 && (
      <Section title={labels.sectionTargets}>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          {data.jobTitles.map((title) => (
            <li
              key={title}
              style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#1f2937', marginBottom: '2px' }}
            >
              {title}
            </li>
          ))}
        </ul>
      </Section>
    )}
  </article>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginTop: '16px' }}>
    <h2
      style={{
        breakAfter: 'avoid',
        pageBreakAfter: 'avoid',
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#111827',
        borderBottom: '1px solid #d1d5db',
        paddingBottom: '3px',
        marginBottom: '7px',
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

export default ResumeClassic;
