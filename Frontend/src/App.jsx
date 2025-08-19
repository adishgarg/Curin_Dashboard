import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Work from './Page/Work'
import CreateTaskPage from './Page/CreateTaskPage'
import Home from './Page/Home'
import Profile from './Page/Profile'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex">
          {/* <CHANGE> Added Router and responsive layout */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 p-7">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
               
              </button>
            </div>

            {/* Routes */}
            <div className="p-4 lg:p-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/work-progress" element={<Work />} />
                <Route path="/create-task" element={<CreateTaskPage />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
