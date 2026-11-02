import { defineConfig } from 'vitest/config';

/** Coverage targets from CLAUDE.md §6. Never lower them to make a push pass. */
const SAFETY_CRITICAL = { lines: 100, branches: 100, functions: 100, statements: 100 };

export default defineConfig({
  test: {
    include: ['core/**/*.test.ts', 'pipeline/**/*.test.ts', 'site/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['core/**/*.ts', 'pipeline/**/*.ts', 'site/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/__fixtures__/**',
        // Thin argv/exit wrappers; the logic they call is unit-tested.
        '**/cli.ts',
        // Generated from JSON Schema (ADR 0003); covered by the staleness test, not unit tests.
        'schema/generated/**',
      ],
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
        'core/units/**': SAFETY_CRITICAL,
        'core/sources/**': SAFETY_CRITICAL,
        'core/population/**': SAFETY_CRITICAL,
        'core/discrepancy/**': SAFETY_CRITICAL,
        'core/history/**': SAFETY_CRITICAL,
      },
    },
  },
});
