# Jenga 0.2 — local communications prototype

## Repository audit and integration plan

The baseline contains a lazy React Router CRM, a normalized in-memory DataStore,
separate browser workspaces for groups/tasks/staff, a vinext Teacher application,
and optional read-only Supabase hydration. Permissions and sign-in are demo UI;
there is no trusted server authorization. The old Events page manages club events
and is retained at `/events`. No chat page was routed in the current baseline.

The implementation adds a shared repository and typed contracts in
`packages/platform/demo.{mjs,d.mts}`, a subscribed CRM feature folder,
five lazy routes, Teacher chat UI, and group launch/cancellation hooks. Existing
CRM staff directories supply chat participants and Inbox assignees by ID. Calls
reference Inbox IDs rather than creating another client. Group events/posts refer
to existing group IDs. External integration contracts are declarations only.

## Routes and behavior

| Module | Route | Implemented actions |
| --- | --- | --- |
| Chats | `/chats` | Create discussion, select staff participant, send messages, restore after reload |
| Events | `/activity` | Automatic activity feed, read state per demo user, unread filter, header counter, links |
| Inbox | `/inbox` | Manually simulate website/email intake, search, status, assignment, call history |
| Calls | `/calls` | Select existing Inbox request, simulate call, record outcome/refusal reason/note, filter log |
| Publish | `/publish` | Create/edit drafts, channel label, text preview, planned date, simulated publish, copy/delete |
| Teacher Chats | Teacher navigation → Чаты | Select discussion, send/read persisted messages |

A group launch creates one event, a team message and a publication draft.
Repeated launch notifications are deduplicated. Cancellation emits an event and
returns pending publications to draft. Starting again can generate a new announcement.
An Inbox request creates an event. A connected call marks it in progress;
a refusal closes it and requires a reason. Call results appear on the original
Inbox card. Publication simulation creates another event, with no network send.

## Empty start and data boundaries

Pre-populated groups, schedules, individual lessons, students, tasks, payments,
club events, staff directories and Teacher lesson JSON are empty. Demo sign-in
personas, permissions and option dictionaries remain for navigation and editing.
All new browser state uses `jenga-demo-v02-*`. Older browser keys are neither
loaded nor deleted. Supabase schema, migrations, and external databases are untouched.
The existing opt-in Supabase read mode remains opt-in and does not use local core
persistence. It is not the mode to use for the empty demo test.

Settings → **Начать тест с нуля** clears only the local 0.2 demo namespace after
confirmation. It is hidden in Supabase mode. This does not purge an old deployment,
other origins, browser profiles or server records.

Newly created groups and normalized schedule records persist locally. Dates are
restored as Dates. The existing realGroups compatibility collection remains a
view used by old UI; it is not a new independent directory for the new modules.

## Limits

- No Telegram, SIP, email, AI, VPN or other network transport is implemented.
- Planned posts are local plans, not background jobs. Simulation is always labelled.
- Local storage is per origin and browser. Separate CRM and Teacher domains/ports
  **do not synchronize**; no cross-origin messaging or real multi-user delivery.
- Room participant lists and roles are descriptive. They are not access control.
- Teacher uses a demo persona, not unified identity. Existing sign-in is not security.
- No real customer data is included; manually use synthetic names and messages.
- Inbox requests are kept in the new demo repository; conversion into the old
  Applications/Students workflow is not implemented. Calls link to Inbox only.
- Existing legacy schedule/group workflows and their limitations are preserved;
  this is not a rewrite of the entire data layer. Concurrent edits across tabs
  use last-write-wins, not server transactions.
- Older Git history and upstream repositories are not rewritten. Branding check
  covers the current repository tree, filenames, scripts, docs, SQL and assets.

## Verification and manual test

```sh
npm run install:apps
npm run check:branding
npm run check
npm run dev:crm
npm run dev:teacher
```

Open CRM at `http://localhost:5173`, click **Открыть локальное демо**.

1. Confirm groups, clients and schedules are empty. Add a teacher if needed.
2. Groups → Add group → fill name and add a lesson day → Create. Reload; the
   group remains under Upcoming. Start it using a synthetic `example.com` address.
   Existing teacher-email preparation remains a local placeholder, not delivery.
3. Open Events, Chats and Publish: see the linked launch notification/message/draft.
4. Inbox → Add test request. Record a call using the request's button. Select
   Refused, choose a reason, save; return to Inbox and inspect status/history.
5. Send a team message, reload, check it remains. Create another discussion.
6. Edit a post, save, simulate publication: status must say it was not sent.
7. Mark events read; the header counter updates. Test the unread filter.
8. Teacher at `http://localhost:5174` → local demo → Chats → send and reload.
   Re-enter demo after reload; messages remain on that Teacher origin.
9. Settings → Begin test from scratch → confirm. CRM records should be empty.

Automated coverage: platform transitions, deduplication, reference integrity,
validation, write errors, namespace reset, persisted core dates, existing sibling
navigation tests, TypeScript, ESLint, both builds and Teacher HTML artifact tests.
