/**
 * Lighthouse CI budgets (TS-05.2.1, NFR-02): blocking in CI.
 * Pages are served by the E2E static server under the production base path.
 */
const base = `http://localhost:4323${process.env.VALVIA_BASE ?? '/valvia/'}`;
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'PORT=4323 npx tsx tests/e2e/static-server.ts',
      startServerReadyPattern: 'serving',
      url: [
        base,
        `${base}valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/`,
        `${base}chamber-size-and-function/right-ventricle/rv-dimensions/`,
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'perf',
        formFactor: 'mobile',
        chromeFlags: '--headless=new --no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 51200 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
