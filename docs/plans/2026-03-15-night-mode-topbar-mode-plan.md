# Night Mode Button Fix + Topbar Mode/Entity Switch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve night-mode button contrast and move mode/entity switching to the chat top bar, removing it from settings.

**Architecture:** Use CSS theme overrides for night mode on specific buttons. Reuse existing mode/entity state and query handling, moving UI controls to the top bar. Remove mode section from settings popover.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Radix UI, Vitest.

---

### Task 1: Update sidebar settings test for removed mode section

**Files:**
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/tests/chat/sidebar-settings.test.tsx`

**Step 1: Write the failing test**

Remove the assertion that Mode is present in settings.

```tsx
expect(screen.queryByText('Mode')).toBeNull()
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- tests/chat/sidebar-settings.test.tsx`

Expected: FAIL because Mode still exists in settings.

**Step 3: Commit**

```bash
git add /Users/mango/dev/ai/agent/agno/agent-ui/tests/chat/sidebar-settings.test.tsx
git commit -m "test: settings popover excludes mode section"
```

---

### Task 2: Night mode button contrast fixes

**Files:**
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/app/globals.css`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/LanguageToggle.tsx`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/ChatArea.tsx`

**Step 1: Add night-mode button styles**

Add CSS overrides that apply only in `data-theme='night'` for:
- Language toggle selected state
- Topbar signup button

Example:

```css
[data-theme='night'] .night-outline {
  background-color: var(--main-surface-secondary);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
}

[data-theme='night'] .night-outline-strong {
  background-color: transparent;
  border: 1px solid var(--border-medium);
  color: var(--text-primary);
}
```

**Step 2: Apply classes**

- Add `night-outline`/`night-outline-strong` to LanguageToggle selected button and signup button.

**Step 3: Commit**

```bash
git add /Users/mango/dev/ai/agent/agno/agent-ui/src/app/globals.css /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/LanguageToggle.tsx /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/ChatArea.tsx
git commit -m "fix: improve night mode button contrast"
```

---

### Task 3: Add topbar mode toggle and entity selector

**Files:**
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/ChatArea.tsx`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/EntitySelector.tsx`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/SettingsPopover.tsx`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/i18n/messages.ts`

**Step 1: Add topbar mode toggle**

Create a small button in `ChatTopBar` that toggles mode between agent/team, reusing current logic (clear entity, reset messages/session).

**Step 2: Add topbar entity dropdown**

Replace ChatGPT label with `EntitySelector` and pass a `variant="topbar"` prop to change the trigger style to compact.

**Step 3: Update EntitySelector to support topbar variant**

Add a prop to swap trigger styles to match topbar.

**Step 4: Remove mode block from settings popover**

Delete the mode section inside `SettingsPopover`.

**Step 5: i18n strings**

Add label for the mode toggle button (e.g. `chat.mode_agent`, `chat.mode_team` or `chat.mode_toggle`).

**Step 6: Run tests**

Run: `pnpm test -- tests/chat/sidebar-settings.test.tsx`

Expected: PASS

**Step 7: Commit**

```bash
git add /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/ChatArea.tsx /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/EntitySelector.tsx /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/SettingsPopover.tsx /Users/mango/dev/ai/agent/agno/agent-ui/src/i18n/messages.ts
git commit -m "feat: move mode and entity switch to topbar"
```

---

### Task 4: Validation

**Step 1: Run tests**

Run: `pnpm test`

Expected: PASS

**Step 2: Run lint/typecheck**

Run: `pnpm run validate`

Expected: May still fail due to pre-existing lint/format warnings; report results.
