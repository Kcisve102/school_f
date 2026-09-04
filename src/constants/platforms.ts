import { HandoffPlatform } from '../types';

export interface PlatformDefinition {
  id: HandoffPlatform;
  name: string;
  /**
   * Where the learner lands. Each was opened in a real browser rather than
   * curl'd: two of the obvious guesses (`ziprecruiter.com/authn/registration`
   * and `dice.com/dashboard/register`) are dead, and the Dice one answers 200
   * while rendering a "page doesn't exist" screen client-side, so a status
   * code alone would have shipped a broken link.
   *
   * ZipRecruiter and Dice have no separate signup route — both put "create an
   * account" on their login page, which is why these point at /login.
   */
  signupUrl: string;
  /** Brand accent, used only as a small dot. */
  accent: string;
}

/**
 * The destinations a learner can take their profile to.
 *
 * All four are US job boards that let a candidate register for free, and the
 * order is deliberate: Indeed first because it has the largest reach, Dice
 * last because it is tech-specific.
 *
 * LinkedIn is absent on purpose. Its terms forbid the automated profile
 * population this feature exists to make easy, and offering it would invite
 * exactly the misuse we avoid elsewhere.
 *
 * These ids must stay in sync with HANDOFF_PLATFORMS on the server, which
 * rejects anything outside the whitelist.
 */
export const HANDOFF_PLATFORMS: PlatformDefinition[] = [
  {
    id: 'indeed',
    name: 'Indeed',
    signupUrl: 'https://secure.indeed.com/account/register',
    accent: '#2557a7',
  },
  {
    id: 'ziprecruiter',
    name: 'ZipRecruiter',
    signupUrl: 'https://www.ziprecruiter.com/authn/login',
    accent: '#1a7f37',
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    signupUrl: 'https://www.glassdoor.com/member/profile/joinNow',
    accent: '#0caa41',
  },
  {
    id: 'dice',
    name: 'Dice',
    signupUrl: 'https://www.dice.com/dashboard/login',
    accent: '#e11d48',
  },
];

export default HANDOFF_PLATFORMS;
