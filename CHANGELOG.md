# Changelog

## [Unreleased]

## [3.1.0-next.3] - 2026-10-01

### Deprecated

- This package. Use `vlist/react` from the `vlist` package: change the import path, and pass
  features as plugins (`useVList({ items, item }, [selection({ mode: "single" })])`, with `selection` from `vlist`).

### Changed

- Built on `vlist/react`: the exports are `vlist/react`'s, building the list with
  `createVListFromConfig`, so the config-based API, its feature fields and its return values are
  unchanged. `peerDependencies.vlist` is `^3.1.0-next.3`, the first vlist with the entry; on vlist
  3.0.x, stay on vlist-react 3.0.x. Tests run against `vlist@3.1.0-next.3`.

## [3.1.0-next.2] - 2026-09-28

### Changed

- For vlist 3.1: `peerDependencies.vlist` is `^3.0.0 || ^3.1.0-next.2`. The 3.0.1-next.1 range
  did not admit a 3.1.0 prerelease (a prerelease only matches a range naming its own version),
  so installing it beside `vlist@next` failed with a peer conflict. Tests run against
  `vlist@3.1.0-next.2`.

## [3.0.1-next.1] - 2026-09-27

### Changed

- For vlist 3.0.1: `peerDependencies.vlist` is `^3.0.0 || ^3.0.1-next.1`, since a `^3.0.0`
  range does not admit the prerelease; tests run against `vlist@3.0.1-next.1`.
- The README selects synthetic input with `scroll: { mode: "synthetic" }`, which the adapter
  forwards unchanged. The default, `"auto"`, hands a list past the browser's size limit to
  synthetic input by itself, and a synthetic list draws its own scrollbar.

## [3.0.0-next.1] - 2026-09-19

### Changed

- **Breaking: requires vlist 3.** `peerDependencies.vlist` is now `^3.0.0-next.1`, a range that
  also satisfies 3.0.0 final.
- `createVListFromConfig` takes two type parameters in vlist 3 — the item and the config, so the
  instance carries the methods the config's feature fields imply. The hook passed one, which is
  an arity error; both are inferred from the argument instead.

### Fixed

- The README installed and imported `@floor/vlist`, the old scoped package name. That name still
  resolves on npm, to an abandoned 1.5.6, so the quick start silently installed the wrong library
  beside a current adapter. It is `vlist`.
- The README's synthetic example passed the `scroll.mode` option, removed in vlist 3, where the
  factory is what selects synthetic input. The API section described feature fields as becoming
  `.use(withX())` calls, which was the v1 mechanism.

## [2.8.0] - 2026-09-15

### Added

- Support the vlist 2.8 `factory` configuration for opting into `vlist/synthetic`, and re-export `VListFactory`. The existing config spread forwards factories unchanged.

### Changed

- Require `vlist ^2.8.0` as a peer dependency.
