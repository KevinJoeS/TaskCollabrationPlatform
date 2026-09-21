# TaskCollab

A collaborative workspace for team projects and tasks, built with React, Express, Node.js and MongoDB.

## Features

- JWT authentication with bcrypt password hashing, "remember me", and change password
- Projects with members (invite by email when creating a project, or later in project settings)
- Project page with four views: Overview, Board, List and Activity
- Five-stage Kanban board (Backlog, To do, In progress, In review, Completed) with drag and drop, plus a "Move to" menu on every card for touch and keyboard
- Sortable, filterable, searchable task list that turns into cards on phones
- Task side panel (linkable with `?task=<id>`): edit title, description, status, priority, assignee and due date, and hold a conversation in comments
- Dashboard with a workload overview, a 14-day due-date strip, My work, upcoming deadlines, project progress and recent activity
- Team page with roles, workload and a profile summary for each person
- Activity feed and a notification centre (assignments, comments, approaching deadlines, project milestones) with read / unread state
- Global search and command palette (`Ctrl K` / `⌘ K`)
- Light and dark themes (saved per browser), collapsible sidebar, responsive layouts, skeleton loaders, empty and error states, toasts

## Run locally

1. Install Node.js 18+ and MongoDB (local MongoDB or Atlas).
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET` (at least 16 characters).
3. From the root: `npm install` (installs `concurrently`).
4. Run `npm run install-all`.
5. Run `npm run dev`.
6. Open `http://localhost:5173`.

The API runs on `http://localhost:5000`.

## Environment

Server (`server/.env`):

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens (16+ characters) |
| `PORT` | API port, default `5000` |
| `CLIENT_URL` | Allowed front-end origin(s) for CORS, comma-separated. Default `http://localhost:5173` |

Client (`client/.env`, optional, see `client/.env.example`):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, default `http://localhost:5000/api` |

Never commit `.env` files. They are already listed in `.gitignore`.

## API

All routes except register and login need `Authorization: Bearer <token>`. Errors always look like `{ "message": "..." }`.

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/password` |
| Projects | `GET /api/projects`, `POST /api/projects` (accepts `memberEmails`), `GET /api/projects/:id`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`, `POST /api/projects/:id/members`, `DELETE /api/projects/:id/members/:userId` |
| Tasks | `GET /api/tasks` (`?project`, `?status`, `?priority`, `?assignedTo`, `?mine=true`), `POST /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` |
| Comments | `GET /api/comments/task/:taskId`, `POST /api/comments/task/:taskId`, `DELETE /api/comments/:id` |
| Activity | `GET /api/activity` (`?project`, `?limit`, `?before`) |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all` |
| Search | `GET /api/search?q=` |

Every project, task, comment, activity and search request is checked against project membership on the server.

### Task status values

`backlog`, `todo`, `in-progress`, `in-review`, `done`. The value `done` is shown as "Completed" in the interface. It was kept so tasks created before the five-column board keep working without a data migration.

## Project structure

```
server/
  app.js, server.js        Express app and startup checks
  config/ middleware/      database connection, JWT auth
  models/                  User, Project, Task, Comment, Activity, Notification
  controllers/ routes/     one pair per API area
  utils/                   errors + async wrapper, membership checks, activity and notification helpers
client/src/
  components/ui/           Button, Input, Select, Modal, Avatar, Badge, Skeleton, Popover, states
  components/              Sidebar, Topbar, Navbar, Board, TaskCard, TaskTable, TaskPanel, CommandPalette, ...
  layouts/                 PublicLayout, AuthLayout, DashboardLayout
  pages/                   Landing, Login, Register, Dashboard, Projects, ProjectDetails, MyTasks, Team, Activity, Settings, NotFound
  services/                axios instance and one service per API area
  hooks/ context/ lib/     data hooks, auth / theme / toast providers, small request cache
  styles/                  design tokens (light + dark), base, UI, shell, workspace, public
```

## Notes

- "Forgot password?" on the login page explains that email reset is not set up. Adding it needs an email service.
- The profile picture is an optional `https://` image link. There is no file upload.
- Drag and drop uses the browser's native API, which works with a mouse. On touch screens use the "Move to" menu on the card, or the status field in the task panel.
