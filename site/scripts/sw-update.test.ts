import { describe, expect, it } from 'vitest';
import { shouldPromptUpdate } from './sw-update';

describe('shouldPromptUpdate (TS-05.3.3)', () => {
  it('prompts only when a new worker waits behind an active controller (not on the first install)', () => {
    expect(shouldPromptUpdate({ waiting: true, hasController: true })).toBe(true);
    expect(shouldPromptUpdate({ waiting: true, hasController: false })).toBe(false);
    expect(shouldPromptUpdate({ waiting: false, hasController: true })).toBe(false);
  });
});
