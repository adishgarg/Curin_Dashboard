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
  DollarSign,
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

  // Fetch user data directly from API without caching
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data from API...")
        console.log("API endpoint:", "/auth/me")
        
        // Check if token exists
        const token = localStorage.getItem('token')
        console.log("Token exists:", !!token)
        
        const response = await userService.getCurrentUser()
        console.log("API response:", response)
        
        if (response && response.status === "success" && response.data && response.data.user) {
          const user = response.data.user
          console.log("User data received:", user)
          
          // Transform the API response to match our component's expected structure
          const transformedUserData = {
            id: user.id,
            firstName: user.name ? user.name.split(' ')[0] : '',
            lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
            fullName: user.fullName || user.name,
            email: user.email,
            designation: user.designation,
            avatar: user.avatar || null
          }
          
          console.log("Transformed user data:", transformedUserData)
          setUserData(transformedUserData)
        } else {
          console.log("Unexpected response structure:", response)
          throw new Error("Invalid response structure from API")
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        console.error("Error details:", error.message)
        
        // Fallback to basic user info
        console.log("Using fallback user data")
        setUserData({
          firstName: "Guest",
          lastName: "User",
          fullName: "Guest User",
          email: "guest@example.com",
          avatar: null,
          designation: "User",
        })
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUserData()
  }, [])

  // Check if user is PPI/LPI (has admin privileges)
  const isPPI = () => {
    return userData?.designation?.toUpperCase() === "PPI" || userData?.designation?.toUpperCase() === "LPI"
  }

  // Check if user is regular User
  const isUser = () => {
    return userData?.designation?.toUpperCase() === "USER"
  }

  // Basic menus that everyone can see
  const basicMenus = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ]

  // User-specific grouped menus (for regular users)
  const userGroupedMenus = {
    tasks: {
      name: "Tasks",
      icon: ClipboardList,
      items: [
        { name: "My Tasks", icon: ClipboardList, href: "/my-tasks" },
      ],
    },
    events: {
      name: "Events", 
      icon: Calendar,
      items: [
        { name: "My Events", icon: Calendar, href: "/my-events" },
        { name: "Events", icon: Calendar, href: "/events" },
      ],
    },
    progress: {
      name: "Progress",
      icon: UserCheck,
      items: [
        { name: "My Progress", icon: UserCheck, href: "/my-progress" },
      ],
    },
  }

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
    finance: {
      name: "Finance",
      icon: DollarSign,
      items: [
        { name: "Manage Finance", icon: DollarSign, href: "/manage-finance" },
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
    // If no firstName or lastName, try to extract from fullName
    if (!firstName && !lastName && userData?.fullName) {
      const nameParts = userData.fullName.split(' ')
      firstName = nameParts[0] || ""
      lastName = nameParts[1] || ""
    }
    
    if (!firstName && !lastName) return "U"
    const first = firstName ? firstName[0].toUpperCase() : ""
    const last = lastName ? lastName[0].toUpperCase() : ""
    return first + last || first || "U"
  }

  const getUserDisplayName = () => {
    if (loadingUser) return "Loading..."
    
    // Use fullName first, then fallback to firstName + lastName, then name
    if (userData?.fullName) {
      return userData.fullName
    }
    
    const firstName = userData?.firstName || ""
    const lastName = userData?.lastName || ""
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    }
    
    // Fallback to name field or default
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
        className="fixed top-4 right-4 z-50 lg:hidden p-3 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 transition-all duration-200 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
      </button>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-700 shadow-lg
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Content */}
        <div className="relative z-20 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">Curin</h1>
            <div className="w-12 h-1 bg-white rounded-full mt-2" />
            {/* User role indicator */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isPPI()
                    ? "bg-gray-800 text-white border border-gray-600"
                    : "bg-gray-700 text-gray-200 border border-gray-600"
                }`}
              >
                {getUserDesignation()}
              </span>
            </div>
          </div>

          {/* Navigation - Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar">
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
                          ? "bg-white text-gray-900 shadow-md border border-gray-600"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-600"
                      }
                    `}
                  >
                    <menu.icon
                      size={20}
                      className={isActive ? "text-gray-900" : "text-gray-300 group-hover:text-white"}
                    />
                    <span className="font-medium">{menu.name}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto text-gray-900" />}
                  </button>
                )
              })}

              {/* Conditional Navigation based on user role */}
              {isPPI() ? (
                /* PPI/LPI/Admin - Show all grouped menus */
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
                              ? "bg-white text-gray-900 shadow-md border border-gray-600"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-600"
                          }
                        `}
                      >
                        <group.icon
                          size={20}
                          className={isActiveGroup ? "text-gray-900" : "text-gray-300 group-hover:text-white"}
                        />
                        <span className="font-medium">{group.name}</span>
                        <ChevronDown
                          size={16}
                          className={`ml-auto transition-transform duration-200 ${
                            openMenus[key] ? "rotate-180" : ""
                          } ${isActiveGroup ? "text-gray-900" : "text-gray-300"}`}
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
                                      ? "bg-gray-700 text-white border-l-2 border-white shadow-sm"
                                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent hover:border-gray-500"
                                  }
                                `}
                              >
                                <submenu.icon
                                  size={16}
                                  className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}
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
                /* Regular User - Show grouped user menus */
                Object.entries(userGroupedMenus).map(([key, group]) => {
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
                              ? "bg-white text-gray-900 shadow-md border border-gray-600"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-600"
                          }
                        `}
                      >
                        <group.icon
                          size={20}
                          className={isActiveGroup ? "text-gray-900" : "text-gray-300 group-hover:text-white"}
                        />
                        <span className="font-medium">{group.name}</span>
                        <ChevronDown
                          size={16}
                          className={`ml-auto transition-transform duration-200 ${
                            openMenus[key] ? "rotate-180" : ""
                          } ${isActiveGroup ? "text-gray-900" : "text-gray-300"}`}
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
                                      ? "bg-gray-700 text-white border-l-2 border-white shadow-sm"
                                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent hover:border-gray-500"
                                  }
                                `}
                              >
                                <submenu.icon
                                  size={16}
                                  className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"}
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
              )}
            </nav>
          </div>

          {/* User Profile - Fixed at bottom */}
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 font-semibold shadow-md ring-2 ring-gray-600">
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
                  <p className="text-sm text-gray-300 truncate">{getUserEmail()}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-300 transition-transform duration-200 ${
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
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-2 space-y-1 shadow-lg">
                  <button
                    onClick={() => {
                      handleNavigation("/profile")
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-all duration-200"
                  >
                    <User size={16} className="text-gray-400" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-all duration-200"
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
    </>
  )
}
