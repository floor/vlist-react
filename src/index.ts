// vlist-react
/**
 * React hooks for vlist - lightweight virtual scrolling
 */

import { useRef, useEffect, useCallback } from "react";
import type {
  VListConfig,
  VListItem,
  VListEvents,
  EventHandler,
  Unsubscribe,
} from "vlist";
import { vlist, type VList } from "vlist";
import {
  withAsync,
  withAutoSize,
  withGrid,
  withMasonry,
  withGroups,
  withSelection,
  withScrollbar,
  withScale,
  withSnapshots,
  withPage,
} from "vlist";

// Re-export types that appear in UseVListConfig / UseVListReturn
export type {
  VListItem,
  VListEvents,
  VList,
  VListConfig,
  ItemConfig,
  ItemTemplate,
  EventHandler,
  Unsubscribe,
} from "vlist";

export type UseVListConfig<T extends VListItem = VListItem> = Omit<
  VListConfig<T>,
  "container"
>;

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

    let builder = vlist<T>({
      ...configRef.current,
      container,
    });

    if (configRef.current.scroll?.element === window) {
      builder = builder.use(withPage());
    }

    // Auto-detect Mode B: estimatedHeight/estimatedWidth without explicit height/width
    const item = configRef.current.item;
    const isHorizontal = configRef.current.orientation === "horizontal";
    const hasExplicitSize = isHorizontal
      ? item.width != null
      : item.height != null;
    const hasEstimate = isHorizontal
      ? (item as unknown as Record<string, unknown>).estimatedWidth != null
      : (item as unknown as Record<string, unknown>).estimatedHeight != null;
    if (!hasExplicitSize && hasEstimate) {
      builder = builder.use(withAutoSize());
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

    if (configRef.current.layout === "masonry" && configRef.current.masonry) {
      builder = builder.use(withMasonry(configRef.current.masonry));
    }

    if (configRef.current.groups) {
      const groupsConfig = configRef.current.groups;
      const headerHeight =
        typeof groupsConfig.headerHeight === "function"
          ? groupsConfig.headerHeight("", 0)
          : groupsConfig.headerHeight;

      builder = builder.use(
        withGroups({
          getGroupForIndex: groupsConfig.getGroupForIndex,
          headerHeight,
          headerTemplate: groupsConfig.headerTemplate,
          ...(groupsConfig.sticky !== undefined && {
            sticky: groupsConfig.sticky,
          }),
        }),
      );
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
