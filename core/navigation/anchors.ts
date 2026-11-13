/**
 * Parameter anchors (TS-04.5.1): `<leaf URL>#p-<parameter id>` jumps to the first row showing that parameter.
 * Parameter ids never change (CLAUDE.md §12), so these links stay valid; the first table or list block in page
 * order that shows the parameter owns its anchor.
 */
import type { LoadedBlock } from '../content/types';

export const parameterAnchor = (parameterId: string): string => `p-${parameterId}`;

/** Parameter id → id of the block whose first row of that parameter carries the anchor. */
export function parameterAnchorBlocks(blocks: readonly LoadedBlock[]): Map<string, string> {
  const owners = new Map<string, string>();
  for (const block of blocks) {
    if (block.type !== 'grading-table' && block.type !== 'normal-range-table' && block.type !== 'threshold-list') {
      continue;
    }
    for (const value of block.values) if (!owners.has(value.parameter)) owners.set(value.parameter, block.id);
  }
  return owners;
}

/** Anchor id per row of a block (rows given by parameter id, in render order), or undefined. */
export function rowAnchors(
  rowParameters: readonly string[],
  blockId: string,
  owners: ReadonlyMap<string, string>,
): (string | undefined)[] {
  const claimed = new Set<string>();
  return rowParameters.map((parameter) => {
    if (owners.get(parameter) !== blockId || claimed.has(parameter)) return undefined;
    claimed.add(parameter);
    return parameterAnchor(parameter);
  });
}
