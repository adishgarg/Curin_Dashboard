import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Work from "./Page/Work"
import CreateTaskPage from "./Page/CreateTaskPage"
import Home from "./Page/Home"
import Profile from "./Page/Profile"
import Settings from "./Page/Settings"
import LoginPage from "./Page/LoginPage"
// (Optional) Reset Password page
import ResetPasswordPage from "./Page/ResetPasswordPage"
import AddUserPage from "./Page/AddUserPage"
import AddOrganizationsPage from "./Page/AddOrganizationsPage"
import AddIndustriesPage from "./Page/AddIndustriesPage"

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
          <Route path="/" element={<Home />} />
          <Route path="/work-progress" element={<Work />} />
          <Route path="/create-task" element={<CreateTaskPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/add-users" element={<AddUserPage />} />
          <Route path="/add-organizations" element={<AddOrganizationsPage />} />
          <Route path="/add-industries" element={<AddIndustriesPage />} />
        </Routes>
      </div>

      {/* Overlay for mobile sidebar */}
      {!hideSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
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
