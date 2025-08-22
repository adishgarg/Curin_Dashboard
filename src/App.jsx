import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Work from "./Page/Work"
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
import ProtectedRoute from "./components/AuthGuard"

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

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/work-progress" element={<ProtectedRoute><Work /></ProtectedRoute>} />
          <Route path="/create-task" element={<ProtectedRoute><CreateTaskPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/add-users" element={<ProtectedRoute><AddUserPage /></ProtectedRoute>} />
          <Route path="/manage-organizations" element={<ProtectedRoute><AddOrganizationsPage /></ProtectedRoute>} />
          <Route path="/manage-industries" element={<ProtectedRoute><AddIndustriesPage /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute><AllUsers /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
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
