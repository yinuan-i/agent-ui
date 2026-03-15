# Night Mode + Settings Popover + Sidebar Toggle Fix

Date: 2026-03-15

## Summary
Add a three-state theme selector (Day, Night, System) that follows system preferences when set to System, migrate existing sidebar settings into a bottom-of-sidebar settings button that opens a popover card, and fix the sidebar collapse/expand icon not rendering.

## Goals
- Provide theme options: Day, Night (deep black, low-contrast), System.
- Persist user theme choice and reflect system theme changes when in System.
- Move sidebar settings into a bottom settings button with a popover card.
- Fix missing sidebar collapse/expand icon visibility.

## Non-Goals
- Redesign global layout or typography.
- Introduce new branding colors.

## Approaches Considered
1. next-themes + data-theme variables (recommended)
   - Fits existing CSS variable system; minimal per-component changes.
2. Tailwind dark class
   - Requires wide `dark:` coverage that doesn’t exist today.
3. CSS-only localStorage + matchMedia
   - More custom code and SSR flash risks.

## Architecture
- Add a theme provider at the app root.
- Use `data-theme` on `html`/`body` with values: `light`, `night`, `system`.
- Map `system` to system preference (light/night) automatically.
- Define `[data-theme='night']` variable overrides in `globals.css` for low-contrast dark palette while preserving brand color tokens.

## Components
- Sidebar
  - Add a bottom settings button (icon + label) that opens a popover card.
  - Remove the inline “Settings” accordion block from the main sidebar body.
- Settings Popover Card
  - Contains: Endpoint, Auth Token, Mode selector, Language toggle, Theme selector (Day/Night/System).
- Theme Selector
  - 3-option segmented control or radio group integrated into the popover.

## Data Flow
- Theme selection stored by `next-themes` in localStorage.
- On load, provider reads storage and resolves `system` via `prefers-color-scheme`.
- UI reads current theme and updates display/selection accordingly.

## Error Handling / Edge Cases
- If system preference is unavailable, default to `light`.
- Avoid SSR hydration mismatch by rendering selection after mounted if necessary.
- Ensure popover is accessible via keyboard and closes on outside click.

## Testing / Acceptance Criteria
- Theme changes apply immediately; refresh persists selection.
- In System mode, UI changes when OS theme toggles.
- Settings button appears at bottom of sidebar and opens card containing all settings.
- Sidebar collapse/expand icon is visible and clickable in all states.

## Open Questions
- None (color direction confirmed: black background, low contrast, keep brand colors).
