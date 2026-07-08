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
import { createVListFromConfig, type VListConfig } from "vlist/config";

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
export type { VListConfig } from "vlist/config";

/**
 * Configuration for {@link useVList}. This is vlist's high-level `VListConfig`
 * (feature fields like `layout`, `grid`, `selection`, `plugins` are translated
 * into plugins automatically) minus `container`, which the hook owns via a ref.
 */
export type UseVListConfig<T extends VListItem = VListItem> = VListConfig<T>;

export interface UseVListReturn<T extends VListItem = VListItem> {
  containerRef: React.RefObject<HTMLDivElement | null>;
  instanceRef: React.RefObject<VList<T> | null>;
  getInstance: () => VList<T> | null;
}

export function useVList<T extends VListItem = VListItem>(
  config: UseVListConfig<T>,
): UseVListReturn<T> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<VList<T> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const mountedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = createVListFromConfig<T>({ ...configRef.current, container });
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

  const getInstance = useCallback((): VList<T> | null => {
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
