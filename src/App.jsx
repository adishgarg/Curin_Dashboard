import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Work from "./Page/Work"
import TaskDetails from "./Page/TaskDetails"
import CreateTaskPage from "./Page/CreateTaskPage"
import Home from "./Page/Home"
import Profile from "./Page/Profile"
import Settings from "./Page/Settings"
import LoginPage from "./Page/LoginPage"
import ResetPasswordPage from "./Page/ResetPasswordPage"
import AddUserPage from "./Page/AddUserPage"
import AddOrganizationsPage from "./Page/AddOrganizationsPage"
import AddIndustriesPage from "./Page/AddIndustriesPage"
import AllUsers from "./Page/AllUsers"
import CreateEventPage from "./Page/CreateEvent"
import EventDetails from "./Page/EventDetails"
import NoAccessPage from "./Page/NoAccessPage"
import ProtectedRoute from "./components/AuthGuard"
import RoleBasedRoute from "./components/RoleBasedRoute"
import MyTasks from "./Page/MyTasks"
import OverallProgress from "./Page/OverallProgress"
import ManageEvents from "./Page/ManageEvents"
import AllEvents from "./Page/AllEvents"
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Define paths where sidebar should be hidden
  const hideSidebarPaths = ["/login", "/reset-password"]
  const hideSidebar = hideSidebarPaths.includes(location.pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar (hidden on login/reset-password) */}
      {!hideSidebar && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* Main Content */}
      <div className={!hideSidebar ? "lg:ml-72 min-h-screen" : "min-h-screen"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* No Access Page - Available to all authenticated users */}
          <Route path="/no-access" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/no-access">
                <NoAccessPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Protected Routes with Role-Based Access */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/">
                <Home />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/profile">
                <Profile />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/settings">
                <Settings />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* User Routes */}
          <Route path="/my-tasks" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/my-tasks">
                <MyTasks />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/my-events" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/my-events">
                <div>My Events Page (Coming Soon)</div>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/events">
               <AllEvents />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/my-progress" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/my-progress">
                <div>My Progress Page (Coming Soon)</div>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/work-progress" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/work-progress">
                <Work />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/overall-progress" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/overall-progress">
                <OverallProgress />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/Task/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/Task/:id">
                <TaskDetails />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/create-task" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/create-task">
                <CreateTaskPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/add-users" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/add-users">
                <AddUserPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/manage-organizations" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/manage-organizations">
                <AddOrganizationsPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/manage-industries" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/manage-industries">
                <AddIndustriesPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/manage-users" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/manage-users">
                <AllUsers />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/create-event" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/create-event">
                <CreateEventPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/manage-events" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/manage-events">
                <ManageEvents />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/event/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute path="/event/:id">
                <EventDetails />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
        </Routes>

        
        
        
      </div>

      {/* Overlay for mobile sidebar */}
      {!hideSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
