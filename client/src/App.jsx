import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import { FullPageLoader } from './components/ui/Misc';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';

// The public page loads straight away; everything behind the login is split into its own chunk.
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const MyTasks = lazy(() => import('./pages/MyTasks'));
const Team = lazy(() => import('./pages/Team'));
const Activity = lazy(() => import('./pages/Activity'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Old links to /tasks/:id open the same task in the side panel. */
function TaskRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tasks?task=${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Landing />} />
                </Route>
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<MyTasks />} />
                  <Route path="/tasks/:id" element={<TaskRedirect />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Navigate to="/settings" replace />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
