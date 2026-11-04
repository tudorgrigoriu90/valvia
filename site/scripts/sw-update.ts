/** Update prompt decision (TS-05.3.3): a waiting worker with an active controller means new content. */
export const shouldPromptUpdate = (state: { waiting: boolean; hasController: boolean }): boolean =>
  state.waiting && state.hasController;
