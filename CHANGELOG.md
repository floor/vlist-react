# Changelog

## [Unreleased]

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
