<p align="center"> # TaskCollab </p>

<p align="center">
  <img src="https://img.shields.io/badge/TaskCollab-Project%20Management-111827?style=for-the-badge" alt="TaskCollab">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

<p align="center">
  A modern collaborative workspace for teams to plan, organize, and complete work.
</p>

<p align="center">
  <a href="https://github.com/KevinJoeS/TaskCollabrationPlatform">
    <img src="https://img.shields.io/badge/View%20Repository-18181B?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

---

## About

TaskCollab is a full-stack collaborative project and task management platform designed to bring projects, tasks, team members, communication, and progress tracking into one focused workspace.

Instead of jumping between different productivity tools, teams can use TaskCollab to:

```text
Plan
  ↓
Organize
  ↓
Assign
  ↓
Collaborate
  ↓
Track
  ↓
Complete
```

The application combines a responsive React frontend with a Node.js/Express backend and MongoDB database.

## Features

### Authentication

- Secure JWT authentication
- bcrypt password hashing
- Remember-me functionality
- Protected routes
- Profile management
- Change password

### Projects

- Create projects
- Invite members by email
- Manage project members
- Project settings
- Project progress tracking
- Project activity

### Task Management

- Create and edit tasks
- Assign tasks to team members
- Set priorities
- Set deadlines
- Update task status
- Task descriptions
- Task comments
- Task detail side panel
- Shareable task URLs

### Kanban Board

TaskCollab provides a five-stage workflow:

```text
┌──────────┐
│ BACKLOG  │
└────┬─────┘
     ↓
┌──────────┐
│  TO DO   │
└────┬─────┘
     ↓
┌─────────────┐
│ IN PROGRESS │
└──────┬──────┘
       ↓
┌─────────────┐
│  IN REVIEW  │
└──────┬──────┘
       ↓
┌────────────┐
│ COMPLETED  │
└────────────┘
```

Includes:

- Drag and drop
- Task priority
- Assignee information
- Due dates
- Touch-friendly "Move to" controls
- Keyboard-friendly controls

---

## Dashboard

The dashboard acts as the team's command center.

### Includes

- Workload overview
- My Work
- Upcoming deadlines
- 14-day deadline timeline
- Project progress
- Recent activity
- Task statistics

---

## Collaboration

TaskCollab isn't only about managing tasks.

Teams can collaborate directly around their work.

### Activity

Track events such as:

- Task creation
- Task assignment
- Status changes
- Comments
- Project milestones

### Notifications

Receive notifications for:

- New assignments
- Comments
- Approaching deadlines
- Project updates
- Milestones

Notifications support read/unread states.

---

## Search

TaskCollab includes global workspace search.

Search across:

- Projects
- Tasks
- Team members

### Command Palette

Quickly access application actions using:

```text
Ctrl + K
```

or:

```text
Cmd + K
```

---

## UI / UX

TaskCollab is designed as a focused productivity workspace rather than a generic admin dashboard.

### Interface includes

- Light mode
- Dark mode
- Responsive layouts
- Collapsible sidebar
- Mobile-friendly task views
- Skeleton loaders
- Empty states
- Error states
- Toast notifications
- Hover interactions
- Keyboard interactions
- Responsive Kanban board

---

## Design Philosophy

The interface follows a simple principle:

> **Complex project information should feel simple to navigate.**

The design focuses on:

```text
Clear hierarchy
       +
Consistent spacing
       +
Focused interactions
       +
Useful feedback
       =
Better productivity
```

---

## Tech Stack

<p align="center">

<img src="https://skillicons.dev/icons?i=react,vite,js,nodejs,express,mongodb,git,github" alt="Tech Stack">

</p>

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- REST API
- JWT
- bcrypt

### Database

- MongoDB
- Mongoose

### Tools

- Git
- GitHub
- npm
- Concurrently

---

## Architecture

```text
                    TASKCOLLAB
                        │
              ┌─────────┴─────────┐
              │                   │
           FRONTEND             BACKEND
           React              Node.js
            Vite              Express
              │                   │
              │    REST API       │
              └─────────┬─────────┘
                        │
                        ▼
                   MongoDB Atlas
```

---

## Project Structure

```text
TaskCollab/
│
├── client/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── Board.jsx
│       │   ├── TaskCard.jsx
│       │   ├── TaskPanel.jsx
│       │   ├── TaskTable.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Topbar.jsx
│       │   ├── CommandPalette.jsx
│       │   └── ...
│       │
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have:

- Node.js 18+
- npm
- MongoDB or MongoDB Atlas
- Git

### Clone

```bash
git clone https://github.com/KevinJoeS/TaskCollabrationPlatform.git
```

```bash
cd TaskCollabrationPlatform
```

### Install dependencies

```bash
npm install
```

Then:

```bash
npm run install-all
```

### Environment Variables

Create:

```text
server/.env
```

Use:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

For the frontend:

```text
client/.env
```

Use:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files.

### Run

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## API

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/password
```

### Projects

```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
```

### Tasks

```http
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Comments

```http
GET    /api/comments/task/:taskId
POST   /api/comments/task/:taskId
DELETE /api/comments/:id
```

### Activity

```http
GET /api/activity
```

### Notifications

```http
GET   /api/notifications
PATCH /api/notifications/:id/read
POST  /api/notifications/read-all
```

### Search

```http
GET /api/search?q=<query>
```

---

## Task Workflow

| Internal Value | UI |
|---|---|
| `backlog` | Backlog |
| `todo` | To Do |
| `in-progress` | In Progress |
| `in-review` | In Review |
| `done` | Completed |

---

## Security

TaskCollab implements:

- JWT authentication
- bcrypt password hashing
- Protected routes
- Project membership authorization
- Server-side access validation
- Environment-based secrets
- `.env` exclusion through `.gitignore`

---

## Responsive Design

TaskCollab is designed for:

```text
Desktop
   ↓
Laptop
   ↓
Tablet
   ↓
Mobile
```

The interface adapts rather than simply shrinking the desktop layout.

---

## Future Roadmap

The project can be extended with:

- Real-time collaboration
- WebSocket updates
- Email invitations
- Password reset
- File attachments
- Calendar integration
- Task dependencies
- Recurring tasks
- Team mentions
- Rich-text comments
- Advanced analytics
- Role-based permissions

---

## Known Limitations

- Password reset email functionality is not currently implemented.
- Profile pictures use HTTPS image URLs instead of file uploads.
- Kanban drag-and-drop uses the browser's native drag-and-drop API.
- Touch devices can use the "Move to" action.

---

## Author

<p align="center">

### Kevin Joe S

B.Tech Artificial Intelligence and Machine Learning

Rajalakshmi Engineering College, Chennai

</p>

<p align="center">

<a href="https://github.com/KevinJoeS">
<img src="https://img.shields.io/badge/GitHub-KevinJoeS-18181B?style=for-the-badge&logo=github" alt="GitHub">
</a>

<a href="https://www.linkedin.com/in/kevinjoes/">
<img src="https://img.shields.io/badge/LinkedIn-Kevin%20Joe-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>

</p>

---

<p align="center">
  <strong>TaskCollab</strong>
  <br>
  Plan. Collaborate. Execute.
</p>

<p align="center">
  Built with React, Node.js, Express and MongoDB.
</p>
