# Chat Working Indicator Streaming Status Design

## Summary
Update the chat working indicator to follow stream events explicitly. The UI should show `Working...` once a run starts, switch to `Tool Call Started: {tool}` on tool start, then return to `Working...` after tool completion. Text must be i18n-driven.

## Goals
- Show `Working...` starting at `RunStarted`/`TeamRunStarted`.
- Switch to `Tool Call Started: {tool}` at `ToolCallStarted`/`TeamToolCallStarted`.
- Switch back to `Working...` at `ToolCallCompleted`/`TeamToolCallCompleted`.
- Tool name fallback to localized `Tool` when missing.

## Non-Goals
- No changes to tool-call timeline panel or timing calculations.
- No changes to streaming lifecycle beyond the indicator text.

## Data Model
- Extend `ChatMessage.extra_data` with:
  - `streaming_status.status`: `'working' | 'tool_started'`
  - `streaming_status.tool_name?`: `string`

## Event Handling
In `useAIStreamHandler`, update `extra_data.streaming_status` on events:
- `RunStarted`/`TeamRunStarted` => `{ status: 'working' }`
- `ToolCallStarted`/`TeamToolCallStarted` => `{ status: 'tool_started', tool_name }`
- `ToolCallCompleted`/`TeamToolCallCompleted` => `{ status: 'working' }`

## UI Rendering
In `Messages.tsx`, the streaming indicator label should be derived from `streaming_status`:
- `working` => `t('chat.working')`
- `tool_started` => `t('chat.tool_call_started', { tool: toolName || t('chat.tool') })`

## i18n
Add `chat.tool_call_started`:
- zh: `工具调用开始：{tool}`
- en: `Tool Call Started: {tool}`

## Testing / Verification
- Manual: start a run and ensure indicator changes on the three event types.
- Ensure indicator returns to `Working...` after tool completion.
- Confirm tool name fallback when missing.
