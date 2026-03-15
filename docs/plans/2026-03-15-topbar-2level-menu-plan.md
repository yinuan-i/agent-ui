# Topbar Two-Level Menu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace topbar mode toggle + entity selector with a two-level dropdown menu (mode -> entities).

**Architecture:** Use Radix Dropdown Menu to render a two-step menu with a back item. On mode selection, update store mode and clear selection state; on entity selection, set agent/team ids and clear chat/session.

**Tech Stack:** Next.js, React, Tailwind CSS, Radix UI, Vitest.

---

### Task 1: Add dropdown menu dependency

**Files:**
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/package.json`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/pnpm-lock.yaml`

**Step 1: Add dependency**

Run: `pnpm add @radix-ui/react-dropdown-menu`

**Step 2: Commit**

```bash
git add /Users/mango/dev/ai/agent/agno/agent-ui/package.json /Users/mango/dev/ai/agent/agno/agent-ui/pnpm-lock.yaml
git commit -m "chore: add radix dropdown menu"
```

---

### Task 2: Implement topbar two-level menu

**Files:**
- Create: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/TopbarEntityMenu.tsx`
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/ChatArea.tsx`

**Step 1: Implement TopbarEntityMenu**

- Use `DropdownMenu` with internal state `step` and `pendingMode`.
- Root step shows two items: Agent/Team.
- Entities step shows Back + list of entities (from store, based on `pendingMode`).
- Selecting a mode updates store mode and clears agent/team selection + messages + session.
- Selecting entity updates agentId/teamId, sets selected model, clears messages + session.

**Step 2: Replace topbar UI**

Replace current mode toggle + entity selector with `TopbarEntityMenu`.

**Step 3: Commit**

```bash
git add /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/TopbarEntityMenu.tsx /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/ChatArea/ChatArea.tsx
git commit -m "feat: add topbar two-level entity menu"
```

---

### Task 3: Remove unused entity selector variant (if needed)

**Files:**
- Modify: `/Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/EntitySelector.tsx`

**Step 1: Remove topbar variant logic**

If no longer used, delete the `variant` prop and revert to sidebar-only styles.

**Step 2: Commit**

```bash
git add /Users/mango/dev/ai/agent/agno/agent-ui/src/components/chat/Sidebar/EntitySelector.tsx
git commit -m "chore: simplify entity selector"
```

---

### Task 4: Tests

**Step 1: Run tests**

Run: `pnpm test`

Expected: PASS

**Step 2: Report validate status**

Run: `pnpm run validate`

Expected: May still fail due to pre-existing lint/format warnings; report results.
