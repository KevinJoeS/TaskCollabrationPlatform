# TaskCollab

### A modern collaborative workspace for teams to plan, organize, and complete work.

TaskCollab is a full-stack project and task management platform designed to bring projects, tasks, team collaboration, and progress tracking into one focused workspace.

Built with React, Node.js, Express, and MongoDB, TaskCollab provides a responsive productivity experience with project workspaces, Kanban boards, task management, team activity, notifications, global search, and more.

---

## Overview

Managing team projects often means switching between task boards, messages, spreadsheets, and scattered updates.

TaskCollab brings the essential workflow into one place.

Create a project, invite your team, break work into tasks, assign responsibilities, track progress, discuss work, and monitor deadlines from a single workspace.

### Core workflow

```text
Create Project
      |
      v
Invite Team
      |
      v
Create Tasks
      |
      v
Assign & Organize
      |
      v
Track Progress
      |
      v
Collaborate
      |
      v
Complete Work
```

---

## Features

### Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Persistent authentication
- Remember-me functionality
- Profile management
- Change password
- Protected routes

### Project Management

- Create and manage projects
- Invite members by email
- Manage project members
- Project settings
- Project progress tracking
- Project activity history

### Multiple Project Views

Each project provides multiple ways to understand and manage work:

- Overview
- Kanban Board
- Task List
- Activity Feed

### Kanban Board

A five-stage workflow:

```text
Backlog
   |
To Do
   |
In Progress
   |
In Review
   |
Completed
```

Features include:

- Drag-and-drop task management
- Task status updates
- Priority indicators
- Assignee information
- Due dates
- Touch and keyboard-friendly "Move to" actions

### Task Management

Tasks support:

- Title
- Description
- Status
- Priority
- Assignee
- Due date
- Comments
- Project association
- Task detail side panel
- Shareable task URLs using `?task=<id>`

### Dashboard

The dashboard provides a high-level view of your work:

- Workload overview
- 14-day due-date timeline
- My Work
- Upcoming deadlines
- Project progress
- Recent activity

### Team Workspace

- View project members
- Member roles
- Workload overview
- Profile summaries
- Assigned work visibility

### Activity & Notifications

Track important workspace events such as:

- Task assignments
- Comments
- Approaching deadlines
- Project milestones
- Task updates

Notifications support:

- Read/unread states
- Mark as read
- Mark all as read

### Global Search

Search across your workspace for:

- Projects
- Tasks
- Team members

TaskCollab also includes a command palette:

```text
Ctrl + K
```

or:

```text
Cmd + K
```

### UI & Experience

- Responsive layouts
- Light and dark themes
- Theme persistence
- Collapsible sidebar
- Responsive task tables
- Skeleton loading states
- Empty states
- Error states
- Toast notifications
- Keyboard-friendly interactions
- Mobile-friendly task management

---

## Tech Stack

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

### Development

- Git
- GitHub
- npm
- Concurrently

---

## Architecture

```text
                    TASKCOLLAB
                        |
          +-------------+-------------+
          |                           |
      Frontend                    Backend
      React + Vite             Node + Express
          |                           |
          | REST API                  |
          +------------+--------------+
                       |
                   MongoDB
                   Mongoose
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
│       │   ├── ActivityFeed.jsx
│       │   ├── Board.jsx
│       │   ├── CommandPalette.jsx
│       │   ├── ProjectCard.jsx
│       │   ├── Sidebar.jsx
│       │   ├── TaskCard.jsx
│       │   ├── TaskPanel.jsx
│       │   ├── TaskTable.jsx
│       │   └── ...
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   └── ToastContext.jsx
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useProjects.js
│       │   ├── useTasks.js
│       │   └── ...
│       │
│       ├── layouts/
│       │   ├── PublicLayout.jsx
│       │   ├── AuthLayout.jsx
│       │   └── DashboardLayout.jsx
│       │
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Projects.jsx
│       │   ├── ProjectDetails.jsx
│       │   ├── MyTasks.jsx
│       │   ├── Team.jsx
│       │   ├── Activity.jsx
│       │   ├── Settings.jsx
│       │   └── NotFound.jsx
│       │
│       ├── services/
│       │   ├── api.js
│       │   ├── auth.js
│       │   ├── project.js
│       │   ├── task.js
│       │   ├── comment.js
│       │   └── ...
│       │
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

Make sure you have installed:

- Node.js 18+
- npm
- MongoDB or MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone https://github.com/KevinJoeS/TaskCollabrationPlatform.git
```

```bash
cd TaskCollabrationPlatform
```

### 2. Install dependencies

Install the root dependencies:

```bash
npm install
```

Then install frontend and backend dependencies:

```bash
npm run install-all
```

### 3. Configure environment variables

Create:

```text
server/.env
```

Use the provided example as a reference:

```text
server/.env.example
```

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

For the frontend, create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files to GitHub.

### 4. Start the application

From the project root:

```bash
npm run dev
```

The application will run at:

```text
Frontend:
http://localhost:5173
```

```text
Backend:
http://localhost:5000
```

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `PORT` | Backend API port |
| `CLIENT_URL` | Frontend URL allowed by CORS |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API

All API routes except registration and login require:

```http
Authorization: Bearer <token>
```

Errors follow the format:

```json
{
  "message": "Error message"
}
```

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

Creating a project supports member invitations through:

```text
memberEmails
```

### Tasks

```http
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

Task filtering supports:

```text
?project=<id>
?status=<status>
?priority=<priority>
?assignedTo=<userId>
?mine=true
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

Supported query parameters:

```text
?project=<id>
?limit=<number>
?before=<timestamp>
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

All project-related resources are checked against project membership on the server.

---

## Task Statuses

TaskCollab uses five workflow stages:

| Internal Value | Display |
|---|---|
| `backlog` | Backlog |
| `todo` | To Do |
| `in-progress` | In Progress |
| `in-review` | In Review |
| `done` | Completed |

The internal `done` value is intentionally retained for compatibility with previously created tasks.

---

## Security

TaskCollab includes:

- JWT authentication
- bcrypt password hashing
- Protected API routes
- Project membership authorization
- Server-side access checks
- Environment-based secret management
- `.env` excluded from version control

Users can only access project resources they are authorized to access.

---

## Responsive Experience

TaskCollab is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The interface adapts its layout depending on screen size.

For example:

- Desktop uses a collapsible sidebar
- Kanban cards support touch-friendly movement controls
- Task tables become mobile-friendly cards
- Modals adapt to smaller screens
- Navigation changes for mobile layouts

---

## Design

TaskCollab uses a focused productivity-oriented interface rather than a generic dashboard template.

The design system includes:

- Light and dark themes
- Consistent design tokens
- Responsive spacing
- Reusable UI components
- Accessible interaction states
- Structured information hierarchy
- Subtle transitions and feedback

The goal is to keep the interface visually clean while making complex project information easy to understand.

---

## Current Limitations

A few features are intentionally outside the current scope:

- Password reset email service is not implemented
- Profile pictures use an external HTTPS image URL rather than file uploads
- Kanban drag-and-drop uses the browser's native drag-and-drop API
- Touch devices can use the task "Move to" action instead of drag-and-drop

---

## Future Improvements

Potential future additions include:

- Real-time collaboration with WebSockets
- Email invitations
- Password reset via email
- File attachments
- Advanced project analytics
- Calendar integration
- Task dependencies
- Recurring tasks
- Team mentions
- Rich-text comments
- Advanced role and permission management
- Deployment-specific monitoring

---

## Contributing

Contributions and suggestions are welcome.

If you would like to improve TaskCollab:

```bash
git clone https://github.com/KevinJoeS/TaskCollabrationPlatform.git
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Commit your changes:

```bash
git commit -m "Add your feature"
```

Push your branch:

```bash
git push origin feature/your-feature
```

Then open a pull request.

---

## License

This project is currently intended as a personal/portfolio project.

---

## Author

### Kevin Joe S

B.Tech Artificial Intelligence and Machine Learning

Rajala​kshmi Engineering College, Chennai

GitHub: [KevinJoeS](https://github.com/KevinJoeS)

LinkedIn: [Kevin Joe S](https://www.linkedin.com/in/kevinjoes/)

---

## TaskCollab

**Plan. Collaborate. Execute.**

Built to make team work more organized, visible, and manageable.
