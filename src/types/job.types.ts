export interface JobSuggestion {
  title: string;
  keywords: string;
  blurb: string;
}

/*
 * `JobSuggestionWithStatus` and the Active/Unavailable badge were removed.
 *
 * The backend probed an Indeed *search results* page, which returns HTTP 200
 * whether it matches 500 jobs or none — so "Active" never meant a job existed.
 * Indeed also serves a 403 anti-bot page to server IPs, and that 403 was
 * rendered as "Unavailable", showing healthy roles as dead.
 *
 * The Indeed and Fiverr links are unaffected, and are the point of these
 * cards: a generated role is a direction to look in, not a vacancy. Indeed
 * searches for someone to hire you; Fiverr opens seller onboarding to sell
 * the skill yourself. Neither claims a specific job exists.
 */
