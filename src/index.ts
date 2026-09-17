// vlist-react
/**
 * React hooks for vlist - lightweight virtual scrolling
 */

import { useRef, useEffect, useCallback } from "react";
import type {
  VListItem,
  VListEvents,
  EventHandler,
  Unsubscribe,
  VList,
} from "vlist";
import { createVListFromConfig, type VListConfig, type ConfigItem, type ConfigMethods } from "vlist/config";

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
export type { VListConfig, VListFactory, ConfigItem, ConfigMethods } from "vlist/config";

/**
 * Configuration for {@link useVList}. This is vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the hook owns via a ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

/**
 * The list a config builds: its item type read from `items` or the template,
 * and the methods its feature fields wire — `selection` brings `select()`,
 * `adapter` brings `reload()`, `layout: "grid"` brings `getGridLayout()`.
 */
export type UseVListInstance<C extends UseVListConfig<any>> =
  VList<ConfigItem<C>> & ConfigMethods<ConfigItem<C>, C>;

export interface UseVListReturn<C extends UseVListConfig<any>> {
  containerRef: React.RefObject<HTMLDivElement | null>;
  instanceRef: React.RefObject<UseVListInstance<C> | null>;
  getInstance: () => UseVListInstance<C> | null;
}

/**
 * One type parameter, the config itself, inferred from the argument. Do not
 * pass a type argument: the item type comes from `items` or `item.template`,
 * and the plugin methods from the feature fields. `useVList<Row>(…)` names a
 * config type where an item type was meant and does not compile.
 */
export function useVList<const C extends UseVListConfig<any>>(
  config: C,
): UseVListReturn<C> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<UseVListInstance<C> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const mountedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = createVListFromConfig({ ...configRef.current, container }) as UseVListInstance<C>;
    instanceRef.current = instance;
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current || !instanceRef.current) return;
    if (config.items) {
      instanceRef.current.setItems(config.items);
    }
  }, [config.items]);

  const getInstance = useCallback((): UseVListInstance<C> | null => {
    return instanceRef.current;
  }, []);

  return {
    containerRef,
    instanceRef,
    getInstance,
  };
}

export function useVListEvent<
  T extends VListItem,
  K extends keyof VListEvents<T>,
>(
  instanceRef: React.RefObject<VList<T> | null>,
  event: K,
  handler: EventHandler<VListEvents<T>[K]>,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;

    const wrappedHandler: EventHandler<VListEvents<T>[K]> = (payload) => {
      handlerRef.current(payload);
    };

    const unsub: Unsubscribe = instance.on(event, wrappedHandler);
    return unsub;
  }, [instanceRef.current, event]);
}
