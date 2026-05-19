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
  CreateVListConfig,
} from "vlist";
import {
  createVList as createVListCore,
  page,
  autosize,
  async as asyncPlugin,
  grid,
  masonry,
  groups,
  selection,
  scale,
  scrollbar,
  snapshots,
  type VList,
  type VListPlugin,
} from "vlist";

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

export type UseVListConfig<T extends VListItem = VListItem> = Omit<
  CreateVListConfig<T>,
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

    const cfg = configRef.current;
    const plugins: VListPlugin<T>[] = [];

    if (cfg.scroll?.element === window) {
      plugins.push(page());
    }

    // Auto-detect Mode B
    const item = cfg.item;
    const isHorizontal = cfg.orientation === "horizontal";
    const hasExplicitSize = isHorizontal ? item.width != null : item.height != null;
    const hasEstimate = isHorizontal
      ? (item as unknown as Record<string, unknown>).estimatedWidth != null
      : (item as unknown as Record<string, unknown>).estimatedHeight != null;
    if (!hasExplicitSize && hasEstimate) {
      plugins.push(autosize());
    }

    if (cfg.adapter) {
      plugins.push(
        asyncPlugin({
          adapter: cfg.adapter,
          ...(cfg.loading && { loading: cfg.loading }),
        }),
      );
    }

    if (cfg.layout === "grid" && cfg.grid) {
      plugins.push(grid(cfg.grid));
    }

    if (cfg.layout === "masonry" && cfg.masonry) {
      plugins.push(masonry(cfg.masonry));
    }

    if (cfg.groups) {
      const groupsConfig = cfg.groups;
      const headerHeight =
        typeof groupsConfig.headerHeight === "function"
          ? groupsConfig.headerHeight("", 0)
          : groupsConfig.headerHeight;
      plugins.push(
        groups({
          getGroupForIndex: groupsConfig.getGroupForIndex,
          headerHeight,
          headerTemplate: groupsConfig.headerTemplate,
          ...(groupsConfig.sticky !== undefined && { sticky: groupsConfig.sticky }),
        }),
      );
    }

    const selectionMode = cfg.selection?.mode || "none";
    if (selectionMode !== "none") {
      plugins.push(selection(cfg.selection));
    } else {
      plugins.push(selection({ mode: "none" }));
    }

    plugins.push(scale());

    const scrollbarConfig = cfg.scroll?.scrollbar || cfg.scrollbar;
    if (scrollbarConfig !== "none") {
      const scrollbarOptions =
        typeof scrollbarConfig === "object" ? scrollbarConfig : {};
      plugins.push(scrollbar(scrollbarOptions));
    }

    plugins.push(snapshots());

    const instance = createVListCore<T>({ ...cfg, container }, plugins);
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
