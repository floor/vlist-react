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
import type {
  VListItem,
  VList,
  VListPlugin,
  TableMethods,
  ColumnPinMethods,
  ColumnReorderMethods,
} from "vlist";
import { createVListFromConfig, type VListConfig, type ConfigMethods } from "vlist/config";
import { useVList as useEntry, useVListEvent } from "vlist/react";

export { useVListEvent };

// Re-export types that appear in UseVListConfig / UseVListReturn
export type {
  VListItem,
  VListEvents,
  VList,
  VListPlugin,
  CreateVListConfig,
  ItemConfig,
  ItemTemplate,
  EventHandler,
  Unsubscribe,
  TableColumn,
  TablePluginConfig,
  TableMethods,
  TableFeature,
  TableFeatureMethods,
  ColumnPinConfig,
  ColumnPinMethods,
  ColumnReorderConfig,
  ColumnReorderMethods,
} from "vlist";
export type { VListConfig, VListFactory, ConfigMethods } from "vlist/config";

/**
 * Configuration for {@link useVList}. This is vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the hook owns via a ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

type InstanceMethods<T extends VListItem, M> = M extends UseVListConfig<T> ? ConfigMethods<T, M> : M;

export interface UseVListReturn<
  T extends VListItem = VListItem,
  M = {},
> {
  containerRef: RefObject<HTMLDivElement | null>;
  instanceRef: RefObject<(VList<T> & InstanceMethods<T, M>) | null>;
  getInstance: () => (VList<T> & InstanceMethods<T, M>) | null;
}

type WithPlugin<T extends VListItem, M> = Omit<UseVListConfig<T>, "plugins"> & {
  plugins:
    | readonly [VListPlugin<T, M>, ...(readonly VListPlugin<T, unknown>[])]
    | readonly [...(readonly VListPlugin<T, unknown>[]), VListPlugin<T, M>];
};

/** `vlist/react`'s factory argument: builds from the whole config. */
const fromConfig = createVListFromConfig as unknown as Parameters<typeof useEntry>[2];

export function useVList<
  T extends VListItem,
  const C extends UseVListConfig<NoInfer<T>> & { items: readonly T[] },
>(
  config: { items: readonly T[] } & UseVListConfig<NoInfer<T>> & C,
): UseVListReturn<T, ConfigMethods<T, C>>;
export function useVList<
  T extends VListItem,
  const C extends UseVListConfig<T>,
>(
  config: UseVListConfig<T> & C,
): UseVListReturn<T, ConfigMethods<T, C>>;
export function useVList<T extends VListItem = VListItem>(
  config: WithPlugin<T, TableMethods<T> & ColumnPinMethods & ColumnReorderMethods>,
): UseVListReturn<T, TableMethods<T> & ColumnPinMethods & ColumnReorderMethods>;
export function useVList<T extends VListItem = VListItem>(
  config: WithPlugin<T, TableMethods<T> & ColumnPinMethods>,
): UseVListReturn<T, TableMethods<T> & ColumnPinMethods>;
export function useVList<T extends VListItem = VListItem>(
  config: WithPlugin<T, TableMethods<T> & ColumnReorderMethods>,
): UseVListReturn<T, TableMethods<T> & ColumnReorderMethods>;
export function useVList<T extends VListItem = VListItem>(
  config: WithPlugin<T, TableMethods<T>>,
): UseVListReturn<T, TableMethods<T>>;
export function useVList<T extends VListItem = VListItem>(
  config: UseVListConfig<T>,
): UseVListReturn<T>;
export function useVList<T extends VListItem = VListItem>(
  config: UseVListConfig<T> | WithPlugin<T, unknown>,
): UseVListReturn<T, never> {
  return useEntry<T>(config as Parameters<typeof useEntry<T>>[0], [], fromConfig) as UseVListReturn<T, never>;
}
