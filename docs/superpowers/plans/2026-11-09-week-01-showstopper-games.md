# Week 01 Showstopper Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Nov. 9–13 Play examples with five genuine SmartBoard-first games and a reusable Code Lens while preserving the working lesson shell.

**Architecture:** Add a small dependency-free game engine under `engine/`, implement the first five games as focused ES modules under `games/week-01/`, and keep `games.js` as a compatibility bridge for unfinished weeks. Each game module exports a lifecycle factory with `mount`, `reset`, and `destroy`; pure state transitions are exported separately for Node tests.

**Tech Stack:** Semantic HTML, CSS, native ES modules, Canvas 2D, Web Audio API, Pointer Events, Node.js built-in test runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-09-game-overhaul-design.md`

## Global Constraints

- Primary surface is a whole-class SmartBoard / 16:9 projector.
- Each game round resolves in approximately 2–4 minutes and resets instantly.
- Runtime remains dependency-free and works without external network requests.
- Every game supports pointer/touch and keyboard operation.
- Sound Off never removes required information.
- Reduced Motion replaces shake, parallax, flashes, and rapid particles with static emphasis.
- High Contrast, Large Text, pause, restart, and deterministic teacher-demo behavior remain functional.
- Existing lesson dates, lesson sections, teacher console, presentation mode, timer, CFU, and notebook work remain unchanged.
- Development occurs away from the live version; only the verified Nov. 9–13 batch is released.

## Review Focus

- Repeated lesson navigation must destroy old animation/audio/input listeners before mounting another game; Task 1 adds lifecycle cleanup tests.
- Touch and pointer input may fire duplicate actions; Task 1 adds normalized-input deduplication tests.
- Reduced Motion and Sound Off may be changed during a round; Task 1 tests live setting updates and Tasks 3–7 verify game-specific fallbacks.
- Canvas may be resized during presentation mode; Task 1 tests coordinate scaling and each game uses the shared resize helper.
- Code Lens must trap focus, close with button/Escape, and restore focus without blocking lesson navigation; Task 2 adds overlay-state tests and Task 8 performs browser verification.

---

## File structure

- Create `engine/game-host.js` — lifecycle, pause/reset, resize, settings subscription, and safe cleanup.
- Create `engine/input.js` — normalized keyboard, pointer, touch, and SmartBoard actions.
- Create `engine/canvas.js` — device-pixel-ratio sizing, coordinate conversion, collision helpers, and drawing utilities.
- Create `engine/effects.js` — particles, shake, screen flash, and reduced-motion fallbacks.
- Create `engine/audio.js` — procedural Web Audio cues with sound-state handling.
- Create `engine/code-lens.js` — accessible three-column Code Lens overlay.
- Create `engine/random.js` — deterministic seeded random helper for teacher-demo mode.
- Create `games/week-01/portal-panic.js` — Day 1 action maze.
- Create `games/week-01/rulebreaker-arena.js` — Day 2 rule-configuration arena.
- Create `games/week-01/temple-sequence.js` — Day 3 causal puzzle adventure.
- Create `games/week-01/signal-storm.js` — Day 4 feedback-defense game.
- Create `games/week-01/prototype-pit-crew.js` — Day 5 build, test, observe, revise game.
- Create `games/week-01/index.js` — registry for the five dates.
- Create `tests/engine.test.mjs` — shared engine unit tests.
- Create `tests/week-01-games.test.mjs` — pure state-transition tests for all five games.
- Modify `index.html` — load the module bridge and add the Code Lens mount point.
- Modify `games.js` — route the first five game IDs to the new registry; retain legacy renderers for Days 6–30.
- Modify `app.js` — pass live accessibility settings and lesson context to the game host.
- Modify `lessons.js` — update the first five game IDs, titles, play instructions, purposes, and Code Lens metadata.
- Modify `styles.css` — add shared game HUD, canvas, overlay, world-intro, Code Lens, and reduced-motion styling.
- Modify `README.md` — document Week 01 games and controls.

### Task 1: Shared SmartBoard game engine

**Files:**
- Create: `engine/game-host.js`
- Create: `engine/input.js`
- Create: `engine/canvas.js`
- Create: `engine/effects.js`
- Create: `engine/audio.js`
- Create: `engine/random.js`
- Test: `tests/engine.test.mjs`

**Interfaces:**
- Produces: `createGameHost(root, options) -> { mount(gameFactory), reset(), pause(), resume(), updateSettings(settings), destroy() }`
- Produces: `createInputController(target, bindings) -> { isDown(action), consume(action), destroy() }`
- Produces: `fitCanvas(canvas, logicalWidth, logicalHeight) -> { ctx, scaleX, scaleY, toLogicalPoint(event) }`
- Produces: `createEffects(layer, getSettings) -> { burst(options), shake(strength), flash(kind), clear() }`
- Produces: `createAudio(getSettings) -> { cue(name), stopAll(), destroy() }`
- Produces: `seededRandom(seed) -> () => number`

- [ ] **Step 1: Write failing engine tests**

Add tests for deterministic random sequences, logical canvas coordinate scaling, collision boundaries, action consumption, pointer deduplication, live settings changes, and lifecycle cleanup count.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/engine.test.mjs`  
Expected: FAIL because the engine modules do not exist.

- [ ] **Step 3: Implement the shared engine interfaces**

Use one active animation frame, one resize observer, and one abort controller per mounted game. `destroy()` must cancel the frame, disconnect the observer, stop audio, clear effects, and abort all listeners.

- [ ] **Step 4: Run engine tests**

Run: `node --test tests/engine.test.mjs`  
Expected: all engine tests PASS.

- [ ] **Step 5: Commit the engine**

Commit: `feat: add SmartBoard game engine`

### Task 2: Accessible Code Lens

**Files:**
- Create: `engine/code-lens.js`
- Modify: `index.html`
- Modify: `styles.css`
- Test: `tests/engine.test.mjs`

**Interfaces:**
- Consumes: current accessibility settings from `createGameHost`.
- Produces: `createCodeLens(root) -> { open(lensData, trigger), close(), destroy() }`
- Lens data: `{ title, emphasis: 'html'|'css'|'js', html, css, js, explanation, editableValue, predictionPrompt, closing }`

- [ ] **Step 1: Add failing tests for Code Lens state**

Assert open/closed state, emphasized column, Escape close, trigger restoration, and sanitized code display.

- [ ] **Step 2: Run the targeted tests**

Run: `node --test tests/engine.test.mjs --test-name-pattern="Code Lens"`  
Expected: FAIL because `createCodeLens` is missing.

- [ ] **Step 3: Implement the Code Lens overlay**

Add a fixed overlay with labeled HTML/CSS/JavaScript columns, syntax-safe `<code>` text, plain-language explanation, prediction prompt, closing statement, close button, focus trap, and reduced-motion entrance.

- [ ] **Step 4: Run Code Lens and full engine tests**

Run: `node --test tests/engine.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit Code Lens**

Commit: `feat: add accessible lesson Code Lens`

### Task 3: Portal Panic — Day 1

**Files:**
- Create: `games/week-01/portal-panic.js`
- Modify: `lessons.js`
- Modify: `styles.css`
- Test: `tests/week-01-games.test.mjs`

**Interfaces:**
- Produces: `createPortalPanic(context) -> GameLifecycle`
- Produces: `updatePortalState(state, action, dt) -> state`
- Consumes: host input, canvas, effects, audio, settings, deterministic RNG, `openCodeLens`.

- [ ] **Step 1: Write failing Portal Panic tests**

Test core collection increments, hazard collision removes one life with invulnerability, collecting three cores activates the portal, timeout loses, portal entry wins, and teacher-demo seed generates the same maze.

- [ ] **Step 2: Run the targeted tests**

Run: `node --test tests/week-01-games.test.mjs --test-name-pattern="Portal Panic"`  
Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement Portal Panic**

Create a neon maze with arrow/WASD/touch-pad movement, wall and hazard collision, three animated cores, timer, lives, parallax grid, collection particles, visible hazard warnings, victory portal, and the Day 1 game-state Code Lens.

- [ ] **Step 4: Run Portal Panic tests**

Run: targeted test command.  
Expected: PASS.

- [ ] **Step 5: Commit Portal Panic**

Commit: `feat: add Portal Panic game`

### Task 4: Rulebreaker Arena — Day 2

**Files:**
- Create: `games/week-01/rulebreaker-arena.js`
- Modify: `lessons.js`
- Modify: `styles.css`
- Test: `tests/week-01-games.test.mjs`

**Interfaces:**
- Produces: `createRulebreakerArena(context) -> GameLifecycle`
- Produces: `applyRuleConfig(baseState, config) -> state`

- [ ] **Step 1: Write failing Rulebreaker tests**

Test that move-limit, hazard-pattern, and win-condition configurations alter behavior without changing the arena map; verify all three rounds and accessible rule announcements.

- [ ] **Step 2: Run the targeted tests**

Run: `node --test tests/week-01-games.test.mjs --test-name-pattern="Rulebreaker"`  
Expected: FAIL.

- [ ] **Step 3: Implement Rulebreaker Arena**

Build one arena that runs three short rounds with a visible rule card, player dash, moving hazards, collectible objective, changing limits, animated rule swaps, and configuration-object Code Lens.

- [ ] **Step 4: Run Rulebreaker tests**

Expected: PASS.

- [ ] **Step 5: Commit Rulebreaker Arena**

Commit: `feat: add Rulebreaker Arena game`

### Task 5: Temple of the Missing Step — Day 3

**Files:**
- Create: `games/week-01/temple-sequence.js`
- Modify: `lessons.js`
- Modify: `styles.css`
- Test: `tests/week-01-games.test.mjs`

**Interfaces:**
- Produces: `createTempleSequence(context) -> GameLifecycle`
- Produces: `processTempleEvent(state, event) -> state`

- [ ] **Step 1: Write failing Temple tests**

Test event queue order, locked mechanisms, recoverable wrong-order consequences, reset behavior, and successful causal chain.

- [ ] **Step 2: Run the targeted tests**

Run: `node --test tests/week-01-games.test.mjs --test-name-pattern="Temple"`  
Expected: FAIL.

- [ ] **Step 3: Implement Temple of the Missing Step**

Build a multi-room adventure with character movement, pressure plate, energy beam, key, gate, recoverable trap, visible event trail, room transitions, and array/event-queue Code Lens.

- [ ] **Step 4: Run Temple tests**

Expected: PASS.

- [ ] **Step 5: Commit Temple**

Commit: `feat: add Temple sequence adventure`

### Task 6: Signal Storm — Day 4

**Files:**
- Create: `games/week-01/signal-storm.js`
- Modify: `lessons.js`
- Modify: `styles.css`
- Test: `tests/week-01-games.test.mjs`

**Interfaces:**
- Produces: `createSignalStorm(context) -> GameLifecycle`
- Produces: `resolveSignal(state, threat, enabledChannels) -> result`

- [ ] **Step 1: Write failing Signal Storm tests**

Test threat resolution with visual, text, motion, and sound channels; verify sound-only never carries required information; verify reduced-motion static cue; verify reactor health and wave completion.

- [ ] **Step 2: Run targeted tests**

Run: `node --test tests/week-01-games.test.mjs --test-name-pattern="Signal Storm"`  
Expected: FAIL.

- [ ] **Step 3: Implement Signal Storm**

Create a reactor-defense game with incoming signal shapes, shield controls, optional feedback-channel switches, readable threat labels, combo effects, reactor damage, wave progression, and CSS-class/DOM-update Code Lens.

- [ ] **Step 4: Run Signal Storm tests**

Expected: PASS.

- [ ] **Step 5: Commit Signal Storm**

Commit: `feat: add Signal Storm feedback game`

### Task 7: Prototype Pit Crew — Day 5

**Files:**
- Create: `games/week-01/prototype-pit-crew.js`
- Modify: `lessons.js`
- Modify: `styles.css`
- Test: `tests/week-01-games.test.mjs`

**Interfaces:**
- Produces: `createPrototypePitCrew(context) -> GameLifecycle`
- Produces: `simulateRunner(levelData, ruleConfig) -> { outcome, observations, path }`

- [ ] **Step 1: Write failing Prototype tests**

Test platform/hazard/goal placement, deterministic runner path, observable hesitation and failure evidence, one-rule revision, and successful second test.

- [ ] **Step 2: Run targeted tests**

Run: `node --test tests/week-01-games.test.mjs --test-name-pattern="Prototype"`  
Expected: FAIL.

- [ ] **Step 3: Implement Prototype Pit Crew**

Build a drag-and-place level board, AI runner simulation, observation log, one-change revision lock, before/after playback, pit-crew visual effects, and DOM-creation Code Lens.

- [ ] **Step 4: Run Prototype tests**

Expected: PASS.

- [ ] **Step 5: Commit Prototype Pit Crew**

Commit: `feat: add Prototype Pit Crew game`

### Task 8: Registry, lesson integration, and compatibility bridge

**Files:**
- Create: `games/week-01/index.js`
- Modify: `games.js`
- Modify: `app.js`
- Modify: `index.html`
- Modify: `lessons.js`
- Modify: `styles.css`
- Modify: `README.md`
- Test: `tests/week-01-games.test.mjs`

**Interfaces:**
- Produces: `week01Registry: Map<string, GameFactory>` keyed by `portal-panic`, `rulebreaker-arena`, `temple-sequence`, `signal-storm`, and `prototype-pit-crew`.
- Legacy contract remains: `window.GameLabGames.render(game, mount, api)` and `window.GameLabGames.reset()`.

- [ ] **Step 1: Add failing registry and compatibility tests**

Assert all five IDs resolve, unknown IDs fall back to the legacy renderer, repeated render/reset calls destroy the prior lifecycle once, and Days 6–30 keep their existing game metadata.

- [ ] **Step 2: Run all tests and verify integration failures**

Run: `node --test tests/*.test.mjs`  
Expected: registry tests FAIL before bridge implementation; previous task tests PASS.

- [ ] **Step 3: Implement registry and compatibility bridge**

Lazy-import Week 01 modules when their Play section opens. Pass lesson metadata, settings subscription, Code Lens, sound, celebrate, and announce APIs through the shared host. Preserve existing renderer behavior for every unfinished game.

- [ ] **Step 4: Run all tests**

Run: `node --test tests/*.test.mjs`  
Expected: PASS with 30 lessons, five new IDs, and 25 legacy IDs.

- [ ] **Step 5: Run static validation**

Run: `node --check app.js && node --check games.js && node --check lessons.js` plus module import checks for every file under `engine/` and `games/week-01/`.  
Expected: no syntax or import errors.

- [ ] **Step 6: Commit integration**

Commit: `feat: integrate Week 01 showstopper games`

### Task 9: Browser verification and weekly release

**Files:**
- Modify only files required by defects found during verification.

**Interfaces:**
- Consumes the complete Week 01 build.
- Produces a verified main-branch release for Nov. 9–13.

- [ ] **Step 1: Verify shared classroom shell**

Open each Day 1–5 lesson, navigate all nine sections, open/close timer, teacher drawer, access drawer, and Code Lens, then return to the world map.

- [ ] **Step 2: Verify every game in normal mode**

Play to one win and one useful failure; restart; confirm the correct Code Lens and lesson feature.

- [ ] **Step 3: Verify access modes**

For each game, test keyboard-only and pointer/touch paths. Across the batch, test Sound Off, Reduced Motion, High Contrast, Large Text, and teacher-demo mode.

- [ ] **Step 4: Verify projector and responsive layouts**

Check 16:9 presentation mode at 1366×768 and 1920×1080 plus a narrow 390×844 viewport. No essential control may be clipped or hidden behind the HUD.

- [ ] **Step 5: Run full automated checks**

Run: `node --test tests/*.test.mjs` and all syntax/import checks.  
Expected: PASS.

- [ ] **Step 6: Review remote diff before release**

Confirm only Week 01, shared engine, Code Lens, integration, styles, tests, docs, and README changed. Days 6–30 lesson content and legacy games remain intact.

- [ ] **Step 7: Release and verify Pages**

Publish the verified batch to `main`, wait for `pages build and deployment` to conclude `success`, and smoke-test the live URL.

- [ ] **Step 8: Commit any release-only fixes**

Commit: `fix: polish Week 01 classroom release`

## Self-review record

- Spec coverage: Week 01 implements the shared six-beat game experience, five selected games, Code Lens, accessibility, SmartBoard controls, stable weekly release, and legacy preservation.
- Step scan: each task has a failing-test, implementation, passing-test, and commit cycle; browser verification is isolated from implementation.
- Type consistency: all game factories consume the shared host context and return the same lifecycle contract; the registry preserves the existing global bridge.
- Review Focus: lifecycle cleanup, input deduplication, live access settings, resize behavior, and overlay focus each have an owning test task.
- Proportion: the plan specifies public interfaces and exact acceptance checks without transcribing implementation bodies.
