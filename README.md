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
> From 3.1 this package is built on `vlist/react` and keeps its config-based API, so existing code keeps working while you migrate. It needs `vlist ^3.7.0`; on vlist 3.1–3.6, stay on `vlist-react` 3.1.0; on vlist 3.0.x, stay on `vlist-react` 3.0.x.

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

Config accepts all [vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the ref). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are resolved into plugins automatically; `plugins` passes explicit plugins like `table({ features })` through unchanged, and the returned instance type carries the methods they add.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — React](https://vlist.dev/docs/frameworks#react)**

## Table features

Pass `table()` and its optional `features` (`columnPin()`, `columnReorder()`) in `plugins`. Give the table a `rowHeight` and `item` a fixed `height` (not `estimatedHeight`, which wires `autosize()` and conflicts with `table()`). The returned `instanceRef` and `getInstance()` carry the table and feature methods (`setColumnPin`, `getColumnPins`, `moveColumn`, `getColumnOrder`) without a cast; `TableColumn` and the table feature types are re-exported. Requires `vlist ^3.7.0`.

```tsx
import { useVList, type TableColumn } from "vlist-react";
import { table, columnPin, columnReorder } from "vlist";
import "vlist/styles";
import "vlist/styles/table";

interface Row {
  id: number;
  name: string;
  role: string;
}

const columns: TableColumn<Row>[] = [
  { key: "name", label: "Name", width: 180 },
  { key: "role", label: "Role", width: 140 },
];

function UsersTable({ rows }: { rows: Row[] }) {
  const { containerRef, instanceRef } = useVList({
    items: rows,
    item: { height: 40, template: (row) => row.name },
    plugins: [
      table<Row>({
        columns,
        rowHeight: 40,
        features: [columnPin(), columnReorder()],
      }),
    ],
  });

  const pinNameLeft = () => instanceRef.current?.setColumnPin("name", "left");
  const moveRoleFirst = () => instanceRef.current?.moveColumn("role", 0);
  void [pinNameLeft, moveRoleFirst];

  return <div ref={containerRef} style={{ height: 400 }} />;
}
```

## Synthetic input

Every list scrolls natively by default, and hands itself to synthetic input past the browser's element size limit: `scroll.mode` is `"auto"`. Pass `scroll: { mode: "synthetic" }` for synthetic input from the start, or `"native"` to stay native; the adapter forwards `scroll` unchanged through `vlist/config`. A synthetic list draws its own scrollbar. Requires `vlist ^3.1.0`. A carousel honours `"synthetic"` too. `VListFactory` is re-exported for typed custom factories.

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
