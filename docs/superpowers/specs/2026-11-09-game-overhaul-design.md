# Game Lab: Thirty-Game Showcase Overhaul

**Date:** November 9, 2026  
**Audience:** Ms. CJ’s sixth-grade Intro to STEM classes  
**Primary surface:** Whole-class SmartBoard / projector  

## Intent

The current Game Lab has a strong lesson structure and visual identity, but several playable examples behave like multiple-choice checks or ordering exercises. The overhaul will make every one of the 30 daily examples feel like a real game that demonstrates the expressive power of HTML, CSS, and JavaScript.

The purpose is not entertainment detached from instruction. Each game must create the exact system students are studying, let the class feel that system during play, and then reveal one key web-development feature responsible for the experience. The emotional target is: “Wait—web code can do that, and I could learn to make it.”

## Goals

- Replace all 30 existing examples with distinct, replayable games.
- Design first for whole-class SmartBoard play: large targets, quick starts, visible state, and 2–4 minute rounds.
- Demonstrate real-time movement, collisions, state, physics, animation, particles, audio, responsive input, branching logic, and accessible alternatives.
- Tie each mechanic directly to that day’s lesson vocabulary and purpose.
- End every game with a short **Code Lens** that shows one real HTML, CSS, or JavaScript feature and explains it in sixth-grade language.
- Preserve the existing 30-day lesson sequence, teacher console, presentation mode, timers, low-tech alternatives, and accessibility settings.
- Make the seven unit worlds feel mechanically and visually different.

## Non-goals

- These are not full commercial games or long student assignments.
- Students will not need accounts, saved progress, external libraries, or network access.
- The Code Lens will not become a full coding tutorial or require students to copy long programs.
- The overhaul will not change lesson dates, vocabulary, CFUs, notebook work, or clay-project expectations.

## Anti-goals

- No answer-card grids presented as games.
- No game whose lesson connection exists only in a paragraph beside it.
- No critical instruction delivered only through sound, color, rapid motion, or precise mouse control.
- No childish praise, preschool graphics, or fake difficulty.
- No visual spectacle that makes projected text unreadable.

## Constraints

- Static GitHub Pages site using dependency-free HTML, CSS, and JavaScript.
- Must run without external assets or a reliable classroom connection.
- Must remain usable on a SmartBoard, laptop, keyboard, touch screen, and pointer.
- Game rounds should usually resolve in 2–4 minutes and reset instantly.
- Effects must honor Sound Off and Reduced Motion settings.
- Every game needs a non-color cue, visible instructions, restart, keyboard path, and a teacher-friendly demonstration mode.

## Approaches considered

### 1. Thirty independent arcade games

Maximum variety and a unique game for every date. The tradeoff is a larger implementation and the risk of forcing non-arcade concepts into shallow quiz mechanics.

### 2. Six to eight evolving flagship games

Higher mechanical depth and stronger replay value. The tradeoff is that individual dates feel less distinct and some lesson concepts become indirect.

### 3. Arcade games plus interactive creator studios

Twelve arcade games and eighteen high-production simulations. This was initially recommended because it naturally fits design concepts, but Ms. CJ chose a stronger constraint: all 30 experiences should remain games.

### Selected approach

Build all 30 as games. Each game receives one lesson-specific Code Lens explaining the key HTML, CSS, or JavaScript feature responsible for its signature behavior. Concepts that are not naturally twitch-based will use strategy, construction, direction, rhythm, production, or simulation mechanics instead of reverting to question cards.

## Shared experience architecture

Each game has six beats:

1. **Cold open:** A 3–5 second animated title and one-sentence mission.
2. **Control check:** Icons plus text show touch/mouse and keyboard controls.
3. **Play:** A 2–4 minute round with score, progress, or an observable outcome.
4. **Mid-game lesson cue:** A short callout names the lesson system while it is happening.
5. **Victory / useful failure:** The result identifies evidence from play rather than saying only “correct” or “wrong.”
6. **Code Lens:** One real code feature is revealed with a tiny syntax-highlighted snippet, plain-language explanation, and “You could change…” prompt.

## Shared game systems

- Fixed-timestep update loop for real-time games.
- Pointer, touch, arrow/WASD, Space, and Enter input helpers.
- Reusable collision, particle, shake, sprite, sound, timer, score, dialogue, and scene-transition modules.
- CSS custom properties for each world’s palette and reduced-motion alternatives.
- Web Audio effects generated in code; no required audio downloads.
- Deterministic teacher-demo option so a demonstration does not fail due to random difficulty.
- `aria-live` status updates and visible equivalents for sound effects.
- Canvas used for action-heavy games; semantic DOM controls used where direct selection or construction matters.

## Thirty-game map

| Day | Lesson | New game | Core play | Signature web feature in Code Lens |
|---:|---|---|---|---|
| 1 | What Makes a Game? | **Portal Panic** | Pilot Pixel through a neon maze, collect three cores, avoid hazards, and reach the portal before the timer ends. Afterward, the class labels goal, rules, challenge, and feedback inside the game they just played. | **JavaScript game state object:** one object stores goal progress, time, lives, and win state. |
| 2 | Rules Create Possibility | **Rulebreaker Arena** | The same arena runs three times while one rule changes: movement limit, hazard behavior, or win condition. Students must adapt strategy, not answer a question. | **JavaScript configuration objects:** changing values creates a different game without rebuilding the page. |
| 3 | Sequence | **Temple of the Missing Step** | Move through rooms by activating mechanisms in the correct causal order. Wrong order changes the level and creates recoverable consequences. | **Arrays and event queues:** ordered items are processed one at a time. |
| 4 | Feedback | **Signal Storm** | Defend a reactor while toggling visual, text, motion, and sound feedback channels; incomplete feedback makes threats harder to read. | **CSS classes + DOM updates:** JavaScript adds classes and text when game state changes. |
| 5 | Paper Prototypes | **Prototype Pit Crew** | Rapidly place platforms, hazards, and a goal, then watch an AI runner test the level. Revise one rule between runs. | **DOM element creation:** HTML pieces are created from JavaScript data. |
| 6 | Coordinates | **Coordinate Comet** | Fly through a star grid to intercept moving coordinates while the x/y values update live. | **Canvas coordinates:** `x` and `y` determine where every sprite is drawn. |
| 7 | Events | **Event Reactor** | Multiple machines wait for different keyboard, touch, collision, and broadcast triggers; chain them to restart a city. | **Event listeners and custom events:** different inputs wake different code. |
| 8 | Loops | **Loop Lagoon: Wave Runner** | Survive enemy waves generated by loop patterns; alter repeat count to create bridges and attack rhythms. | **`for` loops and animation loops:** one instruction creates many objects and repeated frames. |
| 9 | Conditionals | **If/Then Dungeon** | Navigate doors, traps, and power-ups whose behavior changes based on keys, health, location, and score. | **Boolean conditions:** `if` statements choose which action occurs. |
| 10 | Variables | **Combo Core** | Collect matching energy, maintain a combo, lose charge on collisions, and unlock an overdrive state. | **Variables and mutation:** score, combo, health, and mode change during play. |
| 11 | Debugging | **Glitch City Rescue** | Play a deliberately malfunctioning platformer, pause time, inspect visual code clues, apply one patch, and immediately test the repair. | **Console-style tracing and function swapping:** isolate expected vs. actual behavior. |
| 12 | Accessibility | **Access Hero** | Complete the same action level while switching high contrast, captions, reduced motion, alternate controls, target size, and game speed; rescue characters with different access needs. | **CSS custom properties and settings state:** one control changes the whole experience. |
| 13 | Story World | **Worldseed** | Steer a growing world by choosing and physically collecting character, goal, obstacle, and setting fragments while the environment transforms around the player. | **Data-driven rendering:** story data changes CSS scenery and game objects. |
| 14 | Storyboard Beats | **Beat Runner** | Race across a collapsing story timeline, landing on cause-and-effect beats to keep the path from breaking. | **Array reordering and transitions:** scene cards animate into a new sequence. |
| 15 | Character Choices | **Trait Trial** | A character faces timed dilemmas; actions alter visible posture, relationships, and the world’s response. Players infer the emerging trait from behavior. | **Branching state machine:** choices move a character between emotional and story states. |
| 16 | Camera Shots | **Director Dash** | Control a virtual camera during a live monster encounter; capture wide, medium, and close shots at the moments that communicate setting, action, or emotion. | **CSS transforms and camera viewport:** scale and translation change framing. |
| 17 | Timing | **Freeze-Frame Heist** | Slow, hold, and accelerate action to sneak past cameras and land on readable story moments. | **`requestAnimationFrame` and delta time:** time controls how far objects move each frame. |
| 18 | First Scratch Scene | **Scene Zero** | Build the opening state under pressure, then launch it repeatedly while hidden leftover states try to break continuity. | **Initialization function:** reset positions, visibility, values, and scene data reliably. |
| 19 | Dialogue | **Broadcast Battle** | Coordinate two heroes’ attacks by sending dialogue and action signals in the correct rhythm; overlapping cues cause visible chaos. | **Custom events / message bus:** separate characters respond to named messages. |
| 20 | Transitions | **Portal Editor** | Keep a chase flowing across forest, city, space, and underwater scenes by clearing old state and preparing the next world before the portal opens. | **CSS transitions + scene manager:** exit, swap, initialize, and enter phases. |
| 21 | Sound & Captions | **Soundwave Spy** | Use visual waveforms, captions, and directional sound cues to locate an invisible target; sound-off mode remains fully playable. | **Web Audio oscillator + synchronized captions:** sound and visible text share one event. |
| 22 | Playtesting | **Test Pilot** | One player pilots while classmates trigger structured test scenarios; the game records hesitations, retries, and barriers into a visible heat map. | **Telemetry arrays and heat-map rendering:** interaction evidence becomes visual data. |
| 23 | Clay Character Design | **Rig-a-Critter** | Assemble a creature from clay-like parts, balance its center of mass, test silhouette readability, and survive a pose challenge. | **Drag-and-drop with pointer events:** parts follow touch or mouse and snap to anchors. |
| 24 | Pose-to-Pose | **Pose Fighter** | Create three strong key poses, then battle a shadow opponent by timing in-between frames along motion arcs. | **Interpolation:** JavaScript calculates positions between key poses. |
| 25 | Sets, Camera & Lighting | **Flicker Fixer** | Protect a stop-motion set from camera bumps, moving shadows, changing lights, and background intrusions while filming a scene. | **CSS filters and layered lighting:** brightness, shadows, and overlays simulate continuity problems. |
| 26 | Frame-by-Frame | **Frame Runner** | Control spacing between captured frames to make a character creep, walk, dash, or teleport through an obstacle course. | **Frame arrays and playback rate:** stored positions become animation. |
| 27 | Production Roles | **Studio Mayhem** | Four stations fail at once; assign director, animator, camera, and continuity powers in real time to keep production alive. | **Component system:** independent UI/game modules communicate through shared state. |
| 28 | Capture Day | **One-Take Wonder** | Perform the move–clear–check–capture rhythm while avoiding hand intrusions, bumps, and inconsistent spacing; build a clean frame strip. | **Finite-state machine:** only valid production steps advance capture. |
| 29 | Editing | **Cut! The Editing Game** | Drag live clips onto a timeline, trim hand frames, reorder shots, caption dialogue, and balance pacing before the premiere clock expires. | **HTML drag/drop + timeline data:** clip order and duration update the preview. |
| 30 | Premiere & Reflection | **Potential Portal: Final Boss** | A celebratory boss encounter uses mechanics from the whole unit. Students defeat phases by demonstrating goals, loops, conditionals, timing, framing, and accessibility choices. | **Composition:** small HTML, CSS, and JavaScript systems combine into one complete experience. |

## Visual direction

The existing seven-world structure remains, but each world gains a distinct visual system:

- **Inventor’s Arcade:** neon cabinets, scanlines, sticker bursts, playful chunky geometry.
- **Code Caverns:** glowing crystals, parallax rock layers, code-rune particles, electric trails.
- **Bug Bazaar:** animated market signs, glitch tears, diagnostic overlays, repair sparks.
- **Story Forge:** ink, fire, paper layers, dramatic silhouettes, cinematic wipes.
- **Scratch Studio:** production monitors, waveform panels, stage lights, broadcast pulses.
- **Claymotion Workshop:** tactile clay-like CSS shapes, fingerprints, tabletop sets, warm studio lighting.
- **Premiere Portal:** theater marquee, dimensional portal rings, callbacks to all previous worlds.

The tone remains whimsical but not babyish. Students are treated as emerging designers and developers.

## Code Lens design

After each round, a three-column overlay appears:

1. **HTML — What exists:** a 3–6 line semantic fragment or canvas element.
2. **CSS — How it looks/moves:** one relevant rule, custom property, keyframe, transform, filter, or layout feature.
3. **JavaScript — How it behaves:** a 4–8 line real snippet focused on the lesson feature.

Only one column is emphasized per day according to the signature feature. Every snippet includes:

- syntax color that also has non-color labels;
- a plain-language translation;
- one editable-looking value highlighted, such as `speed = 6` or `repeatCount = 4`;
- “What would happen if…?” prompt for class prediction;
- “You could build this” closing statement tied to the lesson.

## Accessibility behavior

- All games expose keyboard, pointer/touch, and teacher-demo controls.
- Reduced Motion replaces shake, parallax, rapid particles, and flashes with static emphasis and progress changes.
- Sound Off never removes necessary information; captions and visual pulses remain.
- High Contrast changes both world palette and game objects.
- Large Text affects HUD, instructions, Code Lens, and result screens without covering play space.
- Timing-heavy games offer a wider target window in Access Mode.
- Action games include pause and a deterministic demonstration option.
- Instructions use icon + word + key, never icon or color alone.

## Content and technical organization

- Keep `lessons.js` as the source of lesson and game metadata.
- Replace the monolithic renderer map in `games.js` with a small engine and 30 game modules grouped by world.
- Add `engine/` modules for input, audio, particles, collision, state, scenes, accessibility, and Code Lens.
- Add `games/` modules with one exported setup function per daily game.
- Keep all graphics code-native using Canvas, CSS, SVG, and DOM; no fragile external image dependency.
- Lazy-load a game only when its lesson reaches the Play section.
- Preserve GitHub Pages compatibility with native ES modules and relative paths.

## Release strategy

The overhaul will be developed away from the live classroom version and released in verified weekly batches. The first release covers Nov. 9–13, followed by the remaining worlds in calendar order. A batch may replace its live games only after the games, accessibility modes, Code Lens, navigation, timer, and restart behavior pass verification. Unfinished future weeks remain on the current stable implementation until their batch is ready.

## Verification and acceptance criteria

### Every game

- Starts, explains controls, plays, resolves, restarts, and opens Code Lens.
- Works with pointer/touch and keyboard.
- Has a visible lesson connection during play.
- Has a distinct mechanic or meaningful variation, not a renamed choice grid.
- Respects sound, motion, contrast, and text settings.
- Runs without console errors and without external network requests.

### Whole site

- All 30 lessons still open and all nine lesson sections remain navigable.
- Timer and drawers continue to close correctly.
- Presentation mode fits a 16:9 projector without essential controls below the fold.
- Mobile layout remains usable, though SmartBoard is the primary design target.
- Automated smoke tests open every game, invoke its main controls, restart it, and open/close Code Lens.
- Manual review covers at least one action, strategy, story, audio, clay, and editing game in normal, reduced-motion, sound-off, and keyboard-only modes.

## Builder decisions still open

The builder may choose exact particle counts, procedural sound pitches, enemy speeds, round lengths, and decorative animation timings as long as they preserve projector clarity, the 2–4 minute target, and accessibility behavior.
