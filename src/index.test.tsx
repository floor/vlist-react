import { createVList as createSynthetic } from "vlist/synthetic";
import type { VListFactory } from "./index";
/**
 * vlist-react — real render tests
 *
 * Exercises the `useVList` hook end-to-end: mounts a component into a happy-dom
 * document via react-dom, lets the effect create a real vlist instance, and
 * asserts it virtualizes (renders a windowed subset of items, not all of them)
 * and tears down cleanly on unmount.
 *
 * Includes regression coverage for floor/vlist#119 — a `plugins` array passed
 * through the hook must both typecheck and run without a "Duplicate plugin"
 * throw, even when it overlaps the hook's auto-wiring.
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useVList } from "./index";
import { autosize, selection, type VListItem } from "vlist";

// react's act() requires this flag to flush effects deterministically.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface Row extends VListItem {
  id: string;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `row-${i}` }));
const template = (r: Row): string => `<div class="row" data-id="${r.id}">${r.id}</div>`;

// happy-dom doesn't lay out, so vlist would measure a 0px viewport. Shim the
// size signals vlist reads: clientHeight/Width on every element and an
// immediate-firing ResizeObserver. rAF → setTimeout keeps renders deterministic.
const VIEWPORT_H = 500;
const VIEWPORT_W = 300;

function installLayoutShims(): () => void {
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return VIEWPORT_H;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return VIEWPORT_W;
    },
  });

  const RealRO = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element): void {
      this.cb(
        [
          {
            target,
            contentRect: { width: VIEWPORT_W, height: VIEWPORT_H } as DOMRectReadOnly,
            // A real ResizeObserverEntry carries both, and autosize() measures
            // the border box. Without this the shim crashes it.
            borderBoxSize: [{ inlineSize: VIEWPORT_W, blockSize: VIEWPORT_H }] as unknown as readonly ResizeObserverSize[],
          } as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;

  const realRAF = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback): number =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number) as typeof requestAnimationFrame;

  return () => {
    globalThis.ResizeObserver = RealRO;
    globalThis.requestAnimationFrame = realRAF;
  };
}

let restoreShims: () => void;

beforeAll(() => {
  GlobalRegistrator.register();
  restoreShims = installLayoutShims();
});

afterAll(() => {
  restoreShims?.();
  GlobalRegistrator.unregister();
});

/** Mount a component, flushing effects and the rAF-scheduled first render. */
async function mount(el: React.ReactElement): Promise<{ host: HTMLElement; root: Root }> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(el);
  });
  // flush the rAF (setTimeout(0)) that vlist schedules its first paint on
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  return { host, root };
}

describe("useVList — render", () => {
  it("mounts and virtualizes a large list", async () => {
    let instance: ReturnType<typeof useVList<Row>>["getInstance"] | null = null;

    function List() {
      const { containerRef, getInstance } = useVList<Row>({
        item: { height: 40, template },
        items: rows(1000),
      });
      instance = getInstance;
      return <div ref={containerRef} style={{ height: VIEWPORT_H }} />;
    }

    const { host, root } = await mount(<List />);

    // A real instance was created.
    expect(instance).not.toBeNull();
    expect(instance!()).not.toBeNull();

    // Virtualized: some rows rendered, but nowhere near all 1000.
    const rendered = host.querySelectorAll(".row");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(100);

    await act(async () => {
      root.unmount();
    });
  });

  it("tears down the instance on unmount", async () => {
    let getInstance: ReturnType<typeof useVList<Row>>["getInstance"] | null = null;

    function List() {
      const hook = useVList<Row>({ item: { height: 40, template }, items: rows(100) });
      getInstance = hook.getInstance;
      return <div ref={hook.containerRef} style={{ height: VIEWPORT_H }} />;
    }

    const { root } = await mount(<List />);
    expect(getInstance!()).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
    expect(getInstance!()).toBeNull();
  });

  it("#119: accepts and runs a plugins array overlapping auto-wiring", async () => {
    let getInstance: ReturnType<typeof useVList<Row>>["getInstance"] | null = null;

    function List() {
      // estimatedHeight auto-wires autosize; the user passes autosize() as well.
      // Must not throw "Duplicate plugin". (Until 3.0 this also passed grid(),
      // which declares a conflict with autosize — a combination vlist refuses
      // by design, and beside the point of #119.)
      const hook = useVList<Row>({
        item: { estimatedHeight: 200, template },
        items: rows(200),
        plugins: [autosize(), selection({ mode: "single" })],
      });
      getInstance = hook.getInstance;
      return <div ref={hook.containerRef} style={{ height: VIEWPORT_H }} />;
    }

    const { host, root } = await mount(<List />);
    expect(getInstance!()).not.toBeNull();
    // It ran rather than throwing: items are on screen.
    expect(host.querySelectorAll(".row").length).toBeGreaterThan(0);

    await act(async () => {
      root.unmount();
    });
  });
});

it("forwards a typed synthetic factory and creates the synthetic driver", async () => {
  let calls = 0;
  let pluginNames: string[] = [];
  const factory: VListFactory<Row> = (config, plugins = []) => {
    calls++;
    pluginNames = plugins.map(plugin => plugin.name);
    expect(config).not.toHaveProperty("factory");
    return createSynthetic(config, plugins);
  };
  function List() {
    // vlist 3: the factory is what selects synthetic input — `scroll.mode` is gone,
    // and with it the plugins that option used to wire. A feature field still
    // resolves to a plugin, which is what proves the hook forwards them.
    const { containerRef } = useVList<Row>({
      factory, items: rows(100), item: { height: 40, template }, selection: { mode: "single" },
    });
    return <div ref={containerRef} style={{ height: VIEWPORT_H }} />;
  }
  const { host, root } = await mount(<List />);
  try {
    expect(calls).toBe(1);
    expect(host.querySelector<HTMLElement>(".vlist-viewport")!.style.touchAction).toBe("pan-x pinch-zoom");
    expect(pluginNames).toEqual(["selection"]);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
