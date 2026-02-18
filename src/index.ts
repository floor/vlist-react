// @floor/vlist-react
/**
 * React hooks for vlist - lightweight virtual scrolling
 *
 * @packageDocumentation
 */

import { useRef, useEffect, useCallback } from "react";
import type {
  VListConfig,
  VListItem,
  VList,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "@floor/vlist";
import { vlist } from "@floor/vlist";
import {
  withAsync,
  withGrid,
  withSections,
  withSelection,
  withScrollbar,
  withScale,
  withSnapshots,
  withPage,
} from "@floor/vlist";

// =============================================================================
// Types
// =============================================================================

/** Configuration for useVList (VListConfig without container) */
export type UseVListConfig<T extends VListItem = VListItem> = Omit<
  VListConfig<T>,
  "container"
>;

/** Return value from the useVList hook */
export interface UseVListReturn<T extends VListItem = VListItem> {
  containerRef: React.RefObject<HTMLDivElement | null>;
  instanceRef: React.RefObject<VList<T> | null>;
  getInstance: () => VList<T> | null;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * React hook for vlist integration.
 *
 * @example
 * ```tsx
 * import { useVList } from '@floor/vlist-react';
 * import '@floor/vlist/styles';
 *
 * function UserList({ users }) {
 *   const { containerRef, instanceRef } = useVList({
 *     item: {
 *       height: 48,
 *       template: (user) => `<div>${user.name}</div>`,
 *     },
 *     items: users,
 *   });
 *
 *   return <div ref={containerRef} style={{ height: 400 }} />;
 * }
 * ```
 */
export function useVList<T extends VListItem = VListItem>(
  config: UseVListConfig<T>,
): UseVListReturn<T> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<VList<T> | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const mountedRef = useRef(false);

  // Create instance on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Build vlist with plugins
    let builder = vlist<T>({
      ...configRef.current,
      container,
    });

    if (configRef.current.scroll?.element === window) {
      builder = builder.use(withPage());
    }

    if (configRef.current.adapter) {
      builder = builder.use(
        withAsync({
          adapter: configRef.current.adapter,
          ...(configRef.current.loading && {
            loading: configRef.current.loading,
          }),
        }),
      );
    }

    if (configRef.current.layout === "grid" && configRef.current.grid) {
      builder = builder.use(withGrid(configRef.current.grid));
    }

    if (configRef.current.groups) {
      builder = builder.use(withSections(configRef.current.groups));
    }

    const selectionMode = configRef.current.selection?.mode || "none";
    if (selectionMode !== "none") {
      builder = builder.use(withSelection(configRef.current.selection));
    } else {
      builder = builder.use(withSelection({ mode: "none" }));
    }

    builder = builder.use(withScale());

    const scrollbarConfig =
      configRef.current.scroll?.scrollbar || configRef.current.scrollbar;
    if (scrollbarConfig !== "none") {
      const scrollbarOptions =
        typeof scrollbarConfig === "object" ? scrollbarConfig : {};
      builder = builder.use(withScrollbar(scrollbarOptions));
    }

    builder = builder.use(withSnapshots());

    const instance = builder.build();
    instanceRef.current = instance as VList<T>;
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);

  // Sync items when they change
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

/**
 * Subscribe to vlist events within React lifecycle
 *
 * @example
 * ```tsx
 * useVListEvent(instanceRef, 'selection:change', ({ selected }) => {
 *   console.log('Selected:', selected);
 * });
 * ```
 */
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
