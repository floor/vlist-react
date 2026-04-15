# vlist-react

React hooks for [@floor/vlist](https://github.com/floor/vlist) — lightweight, zero-dependency virtual scrolling.

## Install

```bash
npm install @floor/vlist vlist-react
```

## Quick Start

```tsx
import { useVList } from 'vlist-react';
import '@floor/vlist/styles';

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

Config accepts all [@floor/vlist options](https://vlist.dev/docs/api/reference) minus `container` (handled by the ref). Feature fields like `adapter`, `grid`, `groups`, `selection`, `scrollbar`, and `estimatedHeight` are translated into `.use(withX())` calls automatically.

## Documentation

Full usage guide, feature config examples, and TypeScript types: **[Framework Adapters — React](https://vlist.dev/docs/frameworks#react)**

## License

MIT © [Floor IO](https://floor.io)