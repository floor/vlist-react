// vlist-react
/**
 * React hooks for vlist - lightweight virtual scrolling
 *
 * Deprecated: use `vlist/react` from the vlist package, which takes features
 * as plugins (`useVList({ items, item }, [selection()])`). This package keeps
 * the config-based API on top of it: the hooks are `vlist/react`'s, building
 * the list with `createVListFromConfig` so feature fields still resolve to
 * plugins.
 */

import type { RefObject } from "react";
import type { VListItem, VList } from "vlist";
import { createVListFromConfig, type VListConfig } from "vlist/config";
import { useVList as useEntry, useVListEvent } from "vlist/react";

export { useVListEvent };

// Re-export types that appear in UseVListConfig / UseVListReturn
export type {
  VListItem,
  VListEvents,
  VList,
  CreateVListConfig,
  ItemConfig,
  ItemTemplate,
  EventHandler,
  Unsubscribe,
} from "vlist";
export type { VListConfig, VListFactory } from "vlist/config";

/**
 * Configuration for {@link useVList}. This is vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the hook owns via a ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

export interface UseVListReturn<T extends VListItem = VListItem> {
  containerRef: RefObject<HTMLDivElement | null>;
  instanceRef: RefObject<VList<T> | null>;
  getInstance: () => VList<T> | null;
}

/** `vlist/react`'s factory argument: builds from the whole config. */
const fromConfig = createVListFromConfig as unknown as Parameters<typeof useEntry>[2];

export function useVList<T extends VListItem = VListItem>(
  config: UseVListConfig<T>,
): UseVListReturn<T> {
  return useEntry<T>(config as Parameters<typeof useEntry<T>>[0], [], fromConfig) as UseVListReturn<T>;
}
