# Next.js + TanStack Query + Zustand

A working project and sprint tracker built with Next.js 16, React 19, TanStack Query 5 (React Query), and Zustand 5. REST requests run against a browser-based MSW demo API, so no backend setup is required.

## Run locally

Use Node.js 24 LTS (see `.nvmrc`), or Node.js 22+.

```bash
nvm use
npm ci
npm run dev
```

Open http://localhost:3000. Sign in with `johndoe@example.com` and password `Summertime2025`. Other seeded accounts are listed on the login page. Installation uses normal peer dependency resolution; no force flags are needed.

## Features

- Sign in/out, protected pages, and session restoration on reload.
- Project lists split by ownership, with live issue counts.
- Create, edit, assign, move, and delete issues with validated forms.
- Backlog and sprint issue lists, including drag-and-drop ordering.
- Active sprint board with drag-and-drop status changes, ordering within columns, and keyboard controls. Drag anywhere on a card or its title; click the title to edit it. The grip supports Space to pick up/drop, arrow keys to move, and Escape to cancel.
- Create, start, and complete sprints. Only one sprint per project can be active; pending work must be completed or moved before completing a sprint.
- Profile editing, assignment notifications, read/unread state, and toast feedback.
- Local initials avatars, native form controls, and accessible Radix dialogs, popovers, and menus.

## State and API design

**TanStack Query** owns fetched users, projects, issues, sprints, and notifications. Mutations invalidate related lists/counts; issue, sprint, profile, and notification updates use optimistic cache updates with rollback on failure. Notification query keys include the signed-in user, and logout cancels requests and clears the cache.

**Zustand** owns authentication and persisted preferences. The notification popover keeps its open state locally. A project-scoped React provider owns issue and sprint dialogs and resets them when leaving or switching projects. Shared toast state lives alongside its components in `components/design-system/toast`. Session state uses `sessionStorage`; the last visited project preference uses `localStorage`. Providers hydrate persisted stores and await MSW startup before mounting data-fetching screens. The root layout remains a Server Component.

**MSW** intercepts REST requests in the browser. Content reads wait 2 seconds; authentication and writes do not. Its typed in-memory database is seeded from `mocks/data/*.json`; changes are saved to the current tab's `sessionStorage` and survive reloads. Close the tab or clear session storage to reset the demo. This is an example app with simulated authentication, not a production backend or security boundary.

To use your own REST backend, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_ENABLE_API_MOCKING=false`, and configure `NEXT_PUBLIC_API_BASE_URL`. Restart Next.js after changing these public environment variables. The backend must implement these routes and enforce authentication/authorization:

| Method       | Route                                  | Purpose                                    |
| ------------ | -------------------------------------- | ------------------------------------------ |
| POST         | `/api/login`, `/api/logout`            | Session actions                            |
| GET          | `/api/projects`, `/api/projects/:id`   | Projects                                   |
| GET/PATCH    | `/api/users/:id`                       | Read/update profile                        |
| GET          | `/api/users`                           | Assignee/reporter choices                  |
| GET/POST     | `/api/:projectId/issues`               | Read backlog / create issue                |
| GET          | `/api/:projectId/issues/count`         | Total project issues                       |
| PATCH/DELETE | `/api/:projectId/issues/:id`           | Update/delete issue                        |
| GET/POST     | `/api/projects/:projectId/sprints`     | Sprints with nested issues / create sprint |
| PATCH        | `/api/projects/:projectId/sprints/:id` | Sprint transition                          |
| GET          | `/api/:userId/notifications`           | User notifications                         |
| PATCH        | `/api/notifications/:id/read`          | Mark notification read                     |

## Checks and production preview

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm start
```

Unit/API tests cover store behavior, CRUD contracts, validation, counts, sprint transitions, and notifications. Browser tests cover authentication, issue editing/moving/deleting, drag-and-drop ordering and status changes, sprint lifecycle rules, notifications, profile changes, mobile controls, and refresh persistence. The production preview uses the same demo API by default.

To run the browser suite against a production build, run `npm run build` followed by `PLAYWRIGHT_USE_PRODUCTION=true npm run test:e2e`.
