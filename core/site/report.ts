/**
 * "Report a problem" links (TS-06.5.1): a prefilled GitHub issue form per page section, plus an optional e-mail
 * fallback for users without a GitHub account when the build sets VALVIA_CONTACT_EMAIL (repository variable).
 */
export const REPOSITORY = 'tudorgrigoriu90/valvia';

export interface ReportContext {
  /** Absolute URL of the section, e.g. 'https://valvia-echo.se/…/#severity'. */
  pageUrl: string;
  topic: string;
  section: string;
}

type Env = Readonly<Record<string, string | undefined>>;

const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const titleOf = (context: ReportContext): string => `Value problem: ${context.topic} › ${context.section}`;

export function reportIssueUrl(context: ReportContext): string {
  const url = new URL(`https://github.com/${REPOSITORY}/issues/new`);
  url.searchParams.set('template', 'value-problem.yml');
  url.searchParams.set('title', titleOf(context));
  url.searchParams.set('page', context.pageUrl);
  return url.href;
}

export function reportMailto(email: string, context: ReportContext): string {
  const body = [
    `Page: ${context.pageUrl}`,
    '',
    'Which value (parameter, population, grade):',
    '',
    'What is wrong, and where the source says otherwise (table, figure or page):',
    '',
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(titleOf(context))}&body=${encodeURIComponent(body)}`;
}

export function contactEmail(env: Env): string | undefined {
  const value = env.VALVIA_CONTACT_EMAIL;
  if (value === undefined || value === '') return undefined;
  if (!EMAIL.test(value))
    throw new Error('VALVIA_CONTACT_EMAIL has an invalid format: expected a plain e-mail address');
  return value;
}
