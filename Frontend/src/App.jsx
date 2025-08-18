import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SideNavbar from "./components/Sidebar.jsx"
import WorkProgressPage from "./Page/WorkProgressPage.jsx"

function App() {
  return (
     <div className="flex h-screen bg-slate-50">
      <SideNavbar />
      <div className="flex-1 overflow-hidden">
        <WorkProgressPage sidebarOpen={false} />
      </div>
    </div>
  )
}

export default App


