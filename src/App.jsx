"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Work from "./Page/Work"
import CreateTaskPage from "./Page/CreateTaskPage"
import Home from "./Page/Home"
import Profile from "./Page/Profile"
import Settings from "./Page/Settings"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="lg:ml-72 min-h-screen">
          {/* Routes */}
          <div className=" ">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work-progress" element={<Work />} />
              <Route path="/create-task" element={<CreateTaskPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

            </Routes>
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </Router>
  )
}

export default App
