# Night Mode Button Fix + Topbar Mode/Entity Switch

Date: 2026-03-15

## Summary
Fix night theme button contrast (signup + language toggle) and move mode selection from settings popover into the chat top bar: add a mode toggle button and replace the ChatGPT label with an entity dropdown for the current mode.

## Goals
- Night mode: Signup and language toggle buttons should use outline/low-fill styling with readable text.
- Top bar: Add a mode switch button (Agent/Team) and replace the ChatGPT dropdown label with an entity selector.
- Remove Mode selector section from settings popover.

## Non-Goals
- Redesign overall layout.
- Change existing agent/team selection logic.

## Approach
- CSS override for night theme on specific buttons, preserving brand colors.
- Reuse existing store/query logic for mode/entity selection.
- Reuse `EntitySelector` with a compact topbar variant.

## Architecture
- Top bar gets a new mode toggle button that flips `store.mode` and clears the current entity/session/message state.
- `EntitySelector` is rendered in the top bar and uses current `mode` to show agent/team list.
- Settings popover removes mode/entity/model sections.

## Components
- `ChatTopBar`: add `ModeToggleButton`, replace ChatGPT label with `EntitySelector`.
- `EntitySelector`: optional prop for topbar styling (compact trigger).
- `SettingsPopover`: remove mode-related block.
- `ModeSelector`: no longer used in settings.

## Data Flow
- Mode toggle button calls the same behavior as existing ModeSelector.
- Entity selector continues to update `agentId`/`teamId` and clears messages/session.

## Testing / Acceptance Criteria
- Night mode: signup + language toggle no longer white-on-white, uses outlined/low-fill style.
- Top bar shows mode toggle and entity dropdown (agent/team based on mode).
- Settings popover no longer shows mode section.
