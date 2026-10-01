# vlist-react

React hooks for [vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

> **Deprecated.** Use [`vlist/react`](https://github.com/floor/vlist#frameworks) from the `vlist` package instead. Change the import path, and pass features as plugins:
>
> ```ts
> // before
> import { useVList } from "vlist-react";
> useVList({ items, item, selection: { mode: "single" } });
>
> // after
> import { useVList } from "vlist/react";
> import { selection } from "vlist";
> useVList({ items, item }, [selection({ mode: "single" })]);
> ```
>
> From 3.1 this package is built on `vlist/react` and keeps its config-based API, so existing code keeps working while you migrate. It needs `vlist ^3.1.0-next.3`; on vlist 3.0.x, stay on `vlist-react` 3.0.x.

## Install

```bash
npm install vlist vlist-react
```

## Quick Start

```tsx
import { useVList } from 'vlist-react';
import 'vlist/styles';

function UserList({ users }) {
  const { containerRef, instanceRef } = useVList({
    item: {
      height: 48,
      template: (user) => `<div class="user">${user.name}</div>`,
    },
    items: users,
  });

  return <div ref={containerRef} style={{ height: 400 }} />;
}
```

## API

- **`useVList(config)`** — Creates a virtual list. Returns `{ containerRef, instanceRef, getInstance }`.
- **`useVListEvent(instanceRef, event, handler)`** — Subscribe to vlist events with automatic cleanup.

Config accepts all [vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the ref). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are resolved into plugins automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — React](https://vlist.dev/docs/frameworks#react)**

## Synthetic input

Every list scrolls natively by default, and hands itself to synthetic input past the browser's element size limit: `scroll.mode` is `"auto"`. Pass `scroll: { mode: "synthetic" }` for synthetic input from the start, or `"native"` to stay native; the adapter forwards `scroll` unchanged through `vlist/config`. A synthetic list draws its own scrollbar. Requires `vlist ^3.1.0-next.3`. A carousel honours `"synthetic"` too. `VListFactory` is re-exported for typed custom factories.

```tsx
import { useVList } from "vlist-react";

function Rows({ items }: { items: { id: number }[] }) {
  const { containerRef } = useVList({
    items,
    item: { height: 48, template: item => String(item.id) },
    scroll: { mode: "synthetic" },
  });
  return <div ref={containerRef} style={{ height: 400 }} />;
}
```

## License

MIT © [Floor IO](https://floor.io)
