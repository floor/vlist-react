# @floor/vlist-react

React hooks for [vlist](https://github.com/floor/vlist) - lightweight, zero-dependency virtual scrolling.

## Installation

```bash
npm install @floor/vlist @floor/vlist-react
```

## Usage

```tsx
import { useVList } from '@floor/vlist-react';
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

### `useVList(config)`

**Parameters:**
- `config` - VList configuration (same as core vlist, minus `container`)

**Returns:**
- `containerRef` - Ref to attach to your container element
- `instanceRef` - Reference to the vlist instance
- `getInstance()` - Helper function to get the instance

## Documentation

For full documentation, see [vlist.dev](https://vlist.dev)

## License

MIT © [Floor IO](https://floor.io)
