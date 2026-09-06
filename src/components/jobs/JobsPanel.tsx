import React, { useEffect, useState } from 'react';
import CareerjetJobList from './CareerjetJobList';
import profileService from '../../services/profile.service';

/** Used until the learner's own profile says something more specific. */
const DEFAULT_JOB_QUERY = 'entry level';

/*
 * Searches are deliberately country-wide. Passing the learner's profile city
 * looked better but was worse: the city is free text and the locale is not
 * derived from it, so a learner in Leeds, UK searched US places and Careerjet
 * matched Leeds, Alabama — zero results. These roles are remote-capable
 * anyway, so breadth beats a precision that silently returns nothing.
 */

/**
 * The Jobs tab.
 *
 * Careerjet needs no account of any kind, so there is no connection gate:
 * every learner sees real vacancies immediately, including one who has just
 * signed up.
 */
export const JobsPanel: React.FC = () => {
  const [query, setQuery] = useState(DEFAULT_JOB_QUERY);

  useEffect(() => {
    let cancelled = false;

    profileService
      .getProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setQuery(profile.job_titles?.[0] || profile.skills?.[0] || DEFAULT_JOB_QUERY);
      })
      .catch(() => {
        /* No profile yet: the broad default query still shows real work. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <CareerjetJobList query={query} />;
};

export default JobsPanel;
