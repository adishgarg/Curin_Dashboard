import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Home,
  Settings,
  User,
  Menu,
  X,
  BarChart3,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit3,
  ClipboardList,
  Calendar,
  UserCheck,
} from "lucide-react"

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [isMobile, setIsMobile] = useState(false)
  const [openMenus, setOpenMenus] = useState({
    workProgress: false,
    tasks: false,
    events: false,
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const menus = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ]

  const groupedMenus = {
    admin: {
    name: "Admin",
    icon: User, // you can change to another Lucide icon if you like
    items: [
      { name: "Add Users", icon: User, href: "/add-users" },
      { name: "Add Organizations", icon: UserCheck, href: "/add-organizations" },
      { name: "Add Industries", icon: ClipboardList, href: "/add-industries" },
    ],
  },
    workProgress: {
      name: "Work Progress",
      icon: BarChart3,
      items: [
        { name: "Overall Progress", icon: BarChart3, href: "/overall-progress" },
        { name: "User Progress", icon: User, href: "/user-progress" },
        { name: "My Progress", icon: UserCheck, href: "/my-progress" },
      ],
    },
    tasks: {
      name: "Tasks",
      icon: ClipboardList,
      items: [
        { name: "Create", icon: Plus, href: "/create-task" },
        { name: "Manage", icon: Edit3, href: "/work-progress" },
        { name: "My Tasks", icon: ClipboardList, href: "/my-tasks" },
      ],
    },
    events: {
      name: "Events",
      icon: Calendar,
      items: [
        { name: "Create", icon: Plus, href: "/create-event" },
        { name: "Manage", icon: Edit3, href: "/manage-events" },
        { name: "My Events", icon: Calendar, href: "/my-events" },
         { name: "Events", icon: Calendar, href: "/events" },
        
      ],
      
    },
    
  }

  const handleNavigation = (href) => {
    navigate(href)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }))
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-50 lg:hidden p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Curin</h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Basic Menus */}
            {menus.map((menu) => {
              const isActive = location.pathname === menu.href
              return (
                <button
                  key={menu.href}
                  onClick={() => handleNavigation(menu.href)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <menu.icon
                    size={20}
                    className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                  />
                  <span className="font-medium">{menu.name}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto text-blue-600" />}
                </button>
              )
            })}

            {/* Grouped Menus */}
            {Object.entries(groupedMenus).map(([key, group]) => {
              const isActiveGroup = group.items.some((item) => location.pathname === item.href)
              return (
                <div key={key} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(key)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      group relative overflow-hidden
                      ${
                        isActiveGroup
                          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <group.icon
                      size={20}
                      className={isActiveGroup ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                    />
                    <span className="font-medium">{group.name}</span>
                    <ChevronDown
                      size={16}
                      className={`ml-auto transition-transform duration-200 ${
                        openMenus[key] ? "rotate-180" : ""
                      } ${isActiveGroup ? "text-blue-600" : "text-gray-400"}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openMenus[key] ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-4 space-y-1">
                      {group.items.map((submenu) => {
                        const isActive = location.pathname === submenu.href
                        return (
                          <button
                            key={submenu.href}
                            onClick={() => handleNavigation(submenu.href)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                              text-sm
                              ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }
                            `}
                          >
                            <submenu.icon
                              size={16}
                              className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                            />
                            <span className="font-medium">{submenu.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-lg">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">AKsHaT</p>
              <p className="text-sm text-gray-500 truncate">admin@taskflow.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
