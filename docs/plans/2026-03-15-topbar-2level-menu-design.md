# Topbar Two-Level Menu for Mode + Entity

Date: 2026-03-15

## Summary
Replace the topbar mode toggle + entity selector with a two-level dropdown: first choose mode (Agent/Team), then choose the entity list for that mode. Keep settings popover free of mode/entity controls.

## Goals
- Single topbar dropdown with two-level navigation.
- First level: mode selection (Agent/Team).
- Second level: entities list for chosen mode, with a back item.
- Keep existing mode/entity state behavior (clear messages/session on changes).

## Non-Goals
- Overhaul of sidebar or chat layout.
- Changing data fetching for agents/teams.

## Approach
- Use Radix Dropdown Menu to implement accessible two-level menu.
- Maintain local state: `step` (`root` | `entities`) and `pendingMode`.

## Components
- New `TopbarEntityMenu` component in `ChatArea` (or `components/chat/ChatArea/TopbarEntityMenu.tsx`).
- Uses store mode and agent/team lists.

## Data Flow
- When user clicks a mode in root step:
  - set mode in store
  - clear selected entity + messages + session
  - move to entities step
- When user selects entity:
  - set agentId or teamId
  - set selectedModel
  - clear messages + session
  - close menu

## Testing / Acceptance
- Topbar dropdown shows Agent/Team options.
- Selecting a mode transitions to entity list with Back.
- Selecting entity updates selection and clears chat.
- Settings popover remains without mode section.
