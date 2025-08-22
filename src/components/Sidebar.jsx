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
  LogOut,
} from "lucide-react"
import { userService } from "../services/api/user"
import { logoutService } from "../services/api/logout"

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [isMobile, setIsMobile] = useState(false)
  const [openMenus, setOpenMenus] = useState({
    workProgress: false,
    tasks: false,
    events: false,
    admin: false,
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
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

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First try to get user from localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUserData(JSON.parse(storedUser))
          setLoadingUser(false)
          return
        }

        // If not in localStorage, fetch from API
        const response = await userService.getCurrentUser()
        if (response.data) {
          setUserData(response.data)
          localStorage.setItem("user", JSON.stringify(response.data))
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        // Fallback to basic user info - using your schema structure
        setUserData({
          firstName: "AKsHaT",
          lastName: "",
          email: "admin@taskflow.com",
          avatar: null,
          designation: "PPI", // Default to PPI for fallback
        })
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUserData()
  }, [])

  // Check if user is PPI (has admin privileges)
  const isPPI = () => {
    return userData?.designation?.toUpperCase() === "PPI"
  }

  // Basic menus that everyone can see
  const basicMenus = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ]

  // User-specific menus (for regular users)
  const userSpecificMenus = [
    { name: "My Tasks", icon: ClipboardList, href: "/my-tasks" },
    { name: "My Events", icon: Calendar, href: "/my-events" },
    { name: "Events", icon: Calendar, href: "/events" },
    { name: "My Progress", icon: UserCheck, href: "/my-progress" },
  ]

  // Admin/PPI menus - all grouped menus
  const adminGroupedMenus = {
    admin: {
      name: "Admin",
      icon: User,
      items: [
        { name: "Add Users", icon: User, href: "/add-users" },
        { name: "Manage Users", icon: User, href: "/manage-users" },
        { name: "Manage Organizations", icon: UserCheck, href: "/manage-organizations" },
        { name: "Manage Industries", icon: ClipboardList, href: "/manage-industries" },
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

  const handleLogout = async () => {
    try {
      await logoutService.logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API fails
      logoutService.logoutLocal()
      navigate("/login")
    }
  }

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "U"
    const first = firstName ? firstName[0].toUpperCase() : ""
    const last = lastName ? lastName[0].toUpperCase() : ""
    return first + last || first || "U"
  }

  const getUserDisplayName = () => {
    if (loadingUser) return "Loading..."
    
    // Handle your schema structure: firstName + lastName
    const firstName = userData?.firstName || ""
    const lastName = userData?.lastName || ""
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    }
    
    // Fallback to other possible name fields
    return userData?.name || "User"
  }

  const getUserEmail = () => {
    if (loadingUser) return "Loading..."
    return userData?.email || "user@example.com"
  }

  const getUserDesignation = () => {
    if (loadingUser) return ""
    return userData?.designation || "User"
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-50 lg:hidden p-3 rounded-xl mobile-menu-button border border-gray-600 hover:bg-gray-700/50 transition-all duration-200 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={22} className="text-gray-100" /> : <Menu size={22} className="text-gray-100" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72 glass-sidebar-dark
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Content */}
        <div className="relative z-20 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/60 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">Curin</h1>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-2" />
            {/* User role indicator */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isPPI()
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {getUserDesignation()}
              </span>
            </div>
          </div>

          {/* Navigation - Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <nav className="p-4 space-y-2">
              {/* Basic Menus - Always visible */}
              {basicMenus.map((menu) => {
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
                          ? "bg-blue-600/30 text-blue-300 shadow-md border border-blue-500/40 backdrop-blur-sm"
                          : "text-gray-300 hover:bg-gray-700/40 hover:text-white border border-transparent hover:border-gray-600/40"
                      }
                    `}
                  >
                    <menu.icon
                      size={20}
                      className={isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-200"}
                    />
                    <span className="font-medium">{menu.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-blue-400" />}
                  </button>
                )
              })}

              {/* Conditional Navigation based on user role */}
              {isPPI() ? (
                /* PPI/Admin - Show all grouped menus */
                Object.entries(adminGroupedMenus).map(([key, group]) => {
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
                              ? "bg-blue-600/30 text-blue-300 shadow-md border border-blue-500/40 backdrop-blur-sm"
                              : "text-gray-300 hover:bg-gray-700/40 hover:text-white border border-transparent hover:border-gray-600/40"
                          }
                        `}
                      >
                        <group.icon
                          size={20}
                          className={isActiveGroup ? "text-blue-400" : "text-gray-400 group-hover:text-gray-200"}
                        />
                        <span className="font-medium">{group.name}</span>
                        <ChevronDown
                          size={16}
                          className={`ml-auto transition-transform duration-200 ${
                            openMenus[key] ? "rotate-180" : ""
                          } ${isActiveGroup ? "text-blue-400" : "text-gray-400"}`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openMenus[key] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="ml-4 space-y-1 mt-2">
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
                                      ? "bg-blue-500/20 text-blue-300 border-l-2 border-blue-400 backdrop-blur-sm shadow-sm"
                                      : "text-gray-400 hover:bg-gray-700/30 hover:text-gray-200 border-l-2 border-transparent hover:border-gray-500"
                                  }
                                `}
                              >
                                <submenu.icon
                                  size={16}
                                  className={isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}
                                />
                                <span className="font-medium">{submenu.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                /* Regular User - Show only specific menus */
                userSpecificMenus.map((menu) => {
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
                            ? "bg-blue-600/30 text-blue-300 shadow-md border border-blue-500/40 backdrop-blur-sm"
                            : "text-gray-300 hover:bg-gray-700/40 hover:text-white border border-transparent hover:border-gray-600/40"
                        }
                      `}
                    >
                      <menu.icon
                        size={20}
                        className={isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-200"}
                      />
                      <span className="font-medium">{menu.name}</span>
                      {isActive && <ChevronRight size={16} className="ml-auto text-blue-400" />}
                    </button>
                  )
                })
              )}
            </nav>
          </div>

          {/* User Profile - Fixed at bottom */}
          <div className="p-4 border-t border-gray-700/60 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700/40 transition-all duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-emerald-400/30">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={getUserDisplayName()}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(userData?.firstName, userData?.lastName)
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-white truncate">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-400 truncate">{getUserEmail()}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Menu Dropdown */}
              <div
                className={`absolute bottom-full left-0 right-0 mb-2 overflow-hidden transition-all duration-300 ${
                  userMenuOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600/40 rounded-xl p-2 space-y-1">
                  <button
                    onClick={() => {
                      handleNavigation("/profile")
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <User size={16} className="text-gray-400" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={16} className="text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-sidebar-dark {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(17, 24, 39, 0.85);
          border-right: 1px solid rgba(75, 85, 99, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .mobile-menu-button {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(17, 24, 39, 0.9);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .mobile-menu-button:hover {
          background: rgba(17, 24, 39, 0.95);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          transform: scale(1.05);
        }

        .mobile-menu-button:active {
          transform: scale(0.95);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Custom dark scrollbar */
        .glass-sidebar-dark .scrollbar-hide::-webkit-scrollbar {
          width: 8px;
        }

        .glass-sidebar-dark .scrollbar-hide::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }

        .glass-sidebar-dark .scrollbar-hide::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 4px;
        }

        .glass-sidebar-dark .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }

        /* Smooth animations */
        .glass-sidebar-dark button {
          transform: translateZ(0);
          will-change: transform, background-color;
        }

        /* Subtle gradient overlay for depth */
        .glass-sidebar-dark::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(17, 24, 39, 0.1) 0%, rgba(17, 24, 39, 0.05) 100%);
          z-index: 5;
          pointer-events: none;
        }

        /* Glow effect for active items */
        .glass-sidebar-dark button:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
        }

        /* Active state glow */
        .glass-sidebar-dark button[class*="bg-blue-600"] {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </>
  )
}
