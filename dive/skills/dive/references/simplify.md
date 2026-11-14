# Lens: simplify

Question: could the same behavior come from less code? Less means fewer concepts, files, layers, states, effects and
dependencies, not fewer characters. Correctness, style and naming are out of this lens.

## Steps

1. **Map.** Read the manifest and build config. Note the framework and its version: the version decides which custom
   code is now redundant. Note the dependencies and the folder layout.
2. **Find entry points** of the scope: routes, root component, `main`, handlers, CLI commands, jobs. Name the flows.
3. **Trace outward.** Code reachable from an entry point is live. Unreachable code is a candidate, not yet a finding.
4. **Walk the catalog below.** On a large scope, split by area across parallel read-only subagents and hand each
   one your entry-point map. Verify every finding they return.
5. **Count, merge, grade.** Count the uses behind every deletion claim. Merge repeats into one finding with a list of
   locations. Run the self-check at the end of this file.

Extra rules for this lens:

- **Simpler must not add concepts.** A proposal that adds a hook, service, layer, dependency or pattern is not a
  simplification. Check the language, standard library and framework before any package.
- **Earned complexity stays.** Keep an abstraction with several real callers, one that isolates a platform
  difference, protects data or security, centralizes a hard domain rule, or makes testing clearly easier. List it
  under "checked and sound" with the reason.

Finding shape:

```
[P2] Short title
Where: path/file.ts:120-186 (useThing) · only caller path/screen.tsx:44
Now: how it works, in one or two sentences.
Why it is extra: the redundant layer, state or dependency, with the count ("exported from 3 files, imported by 1").
Simpler: the same behavior with less, with a short sketch.
Saves: e.g. 3 files → 1 · 4 states → 1 · dependency removed · ~80 lines → ~25
Risk: Low | Medium | High · Confidence: High | Medium | Low
```

Add to the report: the **biggest win** as the verdict line, the **top five** changes by payoff, lists of files to
delete or merge, dependencies to drop and custom code a built-in replaces, and an **order of work** (low risk and
high payoff first, risky last) with the checks for each step.

# Catalog

## 1. Layers that do no work

- A hook, service, manager, factory, provider or helper with one caller.
- A wrapper that passes its arguments straight through, or only renames a function.
- A wrapper around a standard API with the same signature.
- A strategy, registry or plugin system where an object literal or a `switch` would do.
- Several layers for work one function does.

## 2. Code that does not need to exist

- Exports, files, types or branches nothing reaches.
- The same logic in two places, or a copy with a trivial difference.
- Fallbacks and compatibility code for a case that can no longer happen.
- Defensive checks for states the types already rule out.
- Infrastructure for a future need with no caller today.

## 3. State and effects

- State that is a pure function of other state or inputs. Compute it instead.
- Two states kept in sync by hand where one source would do.
- Global or shared state used by one screen or one small subtree.
- One value held in route params, local state and a global store at once.

React and React Native:

- A `useEffect` that does not sync with anything outside React.
- State set inside an effect that could be computed during render.
- `useMemo` or `useCallback` with no measured cost and no consumer that needs a stable identity.
- A context whose value changes far more often than its consumers care about.
- Simple component logic spread over several custom hooks.
- A component that exists only to move JSX into another file.

## 4. Built-ins rewritten by hand

- Custom code for what the installed framework or standard library already ships. Check the installed version.
- A package where a built-in suffices, or a heavy package used for one small thing.
- Runtime setup that belongs in build or framework config.

Before proposing to drop a dependency, list every place and every feature of it the repo uses.

Expo and React Native: hand-written versions of Expo Router, SecureStore, FileSystem, Image, Linking,
Notifications, Constants and similar SDK modules; hand-written platform branches where `.ios.tsx` /
`.android.tsx` files would do; setup that belongs in `app.json`, `app.config.*` or a config plugin. A plain search
misses file-based routes and config plugins, so check those before calling anything unused.

## 5. Types heavier than the data

- Generic machinery for a simple model, or a generic with one instantiation.
- One shape declared under several names.
- Casts that hide a modelling problem.
- A schema system for a handful of constants.
- A class where plain functions and data would do.
- TypeScript: long utility-type chains, conditional or mapped types that cost more reading than they buy.

A proposal must keep type safety or improve it. If it cannot, drop it.

## 6. Data and business logic

- The same data stored in two shapes, or normalized and denormalized for no consumer.
- A cache or repository layer over a small local dataset.
- Retry, queue, event bus or observer machinery with one producer and one consumer.
- A state machine for a linear async step, or a config-driven engine for two conditions.
- The same validation repeated at several layers on the same side.

## 7. Files and modules

- Files too small to carry meaning, so one feature needs many files open.
- Barrel files that add a hop without marking a boundary.
- `constants`, `types` or `utils` files with one consumer.
- Folders that add depth without marking a domain.

A long file is not a finding by itself. Propose a split only when it makes responsibility clearer.

## Do not propose

- New hooks, helpers, services, layers, state libraries or dependencies as the cure.
- Splitting code into more pieces, or making single-use code reusable.
- Classes for plain functions, or a design pattern for its own sake.
- Shorter code that reads worse.

## Self-check before each finding

- Did I count the callers, or only skim them?
- Does the simpler version keep every edge case and error path?
- Does it just move the complexity somewhere else?
- Does another use in the repo justify the current shape?
- Is the gain worth the risk of the change?

A finding that fails a question moves to the unverified list or leaves the report.
