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
  ChevronLeft,
  Edit3,
  ClipboardList,
  Calendar,
  UserCheck,
  LogOut,
  DollarSign,
} from "lucide-react"
import { userService } from "../services/api/user"
import { logoutService } from "../services/api/logout"

export default function Sidebar({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, hideSidebar = false }) {
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
      // Reset collapsed state on mobile
      if (mobile) {
        setSidebarCollapsed(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setSidebarCollapsed])

  // Reset user menu when sidebar is collapsed
  useEffect(() => {
    if (sidebarCollapsed) {
      setUserMenuOpen(false)
    }
  }, [sidebarCollapsed])

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
      {/* Sidebar Toggle Button - Only when sidebar is closed */}
      {!hideSidebar && !sidebarOpen && (
        <button
          className="fixed top-6 left-6 z-50 p-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 shadow-md group"
          onClick={() => setSidebarOpen(true)}
          aria-label="Show sidebar"
        >
          <Menu size={18} className="text-gray-700 group-hover:text-gray-900" />
        </button>
      )}

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
          fixed inset-y-0 left-0 z-40 bg-gray-900 border-r border-gray-700 shadow-lg
          transform transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarOpen && sidebarCollapsed && !isMobile ? "w-20" : "w-72"}
        `}
        style={{
          ...(sidebarCollapsed && !isMobile ? { overflow: "hidden" } : {}),
          minWidth: sidebarOpen && sidebarCollapsed && !isMobile ? "80px" : "288px"
        }}
      >
        {/* Content */}
        <div className={`relative z-20 flex flex-col h-full ${sidebarCollapsed && !isMobile ? "overflow-hidden" : ""}`}>
          {/* Header */}
          <div className={`border-b border-gray-700 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed && !isMobile ? "p-3" : "p-6"}`}>
            {sidebarCollapsed && !isMobile ? (
              /* Collapsed state - Only button centered */
              <div className="flex justify-center">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight size={20} className="text-gray-400 hover:text-white transition-all duration-300" />
                </button>
              </div>
            ) : (
              /* Expanded state - Full header with text and button */
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white whitespace-nowrap overflow-hidden">
                    {getUserDisplayName()}
                  </h1>
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
                {/* Collapse button - Only on desktop */}
                {!isMobile && (
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300 flex-shrink-0"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronLeft size={20} className="text-gray-400 hover:text-white transition-all duration-300" />
                  </button>
                )}
                {/* Mobile close button */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
                    aria-label="Close sidebar"
                  >
                    <X size={20} className="text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation - Scrollable Content */}
          <div 
            className={`flex-1 ${sidebarCollapsed && !isMobile ? "overflow-hidden" : "overflow-y-auto scrollbar"}`}
            style={sidebarCollapsed && !isMobile ? {
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            } : {}}
          >
            <div 
              className={sidebarCollapsed && !isMobile ? "no-scrollbar" : ""}
              style={sidebarCollapsed && !isMobile ? {
                WebkitScrollbar: { display: "none" }
              } : {}}
            >
              <nav className={`space-y-2 ${sidebarCollapsed && !isMobile ? "p-2" : "p-4"}`}>
              {/* Basic Menus - Always visible */}
              {basicMenus.map((menu) => {
                const isActive = location.pathname === menu.href
                return (
                  <div key={menu.href} className="relative group">
                    <button
                      onClick={() => handleNavigation(menu.href)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        group relative overflow-hidden
                        ${
                          isActive
                            ? "bg-white text-gray-900 shadow-md border border-gray-600"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-600"
                        }
                        ${sidebarCollapsed && !isMobile ? "justify-center" : ""}
                      `}
                    >
                      <menu.icon
                        size={20}
                        className={isActive ? "text-gray-900" : "text-gray-300 group-hover:text-white"}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium whitespace-nowrap transition-all duration-300" style={{
                            transitionDelay: "150ms"
                          }}>{menu.name}</span>
                          {isActive && <ChevronRight size={16} className="ml-auto text-gray-900" />}
                        </>
                      )}
                    </button>
                    {/* Tooltip for collapsed state - only on desktop */}
                    {sidebarCollapsed && !isMobile && (
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {menu.name}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Conditional Navigation based on user role */}
              {isPPI() ? (
                /* PPI/LPI/Admin - Show all grouped menus */
                Object.entries(adminGroupedMenus).map(([key, group]) => {
                  const isActiveGroup = group.items.some((item) => location.pathname === item.href)
                  
                  if (sidebarCollapsed && !isMobile) {
                    // In collapsed mode on desktop, show only the group icon with tooltip
                    return (
                      <div key={key} className="relative group">
                        <button
                          onClick={() => {
                            // If collapsed, expand sidebar when clicking on groups
                            setSidebarCollapsed(false)
                            toggleMenu(key)
                          }}
                          className={`
                            w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200
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
                        </button>
                        {/* Tooltip for collapsed state */}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {group.name}
                        </div>
                      </div>
                    )
                  }
                  
                  // Expanded mode - normal functionality
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
                  
                  if (sidebarCollapsed && !isMobile) {
                    // In collapsed mode on desktop, show only the group icon with tooltip
                    return (
                      <div key={key} className="relative group">
                        <button
                          onClick={() => {
                            // If collapsed, expand sidebar when clicking on groups
                            setSidebarCollapsed(false)
                            toggleMenu(key)
                          }}
                          className={`
                            w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200
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
                        </button>
                        {/* Tooltip for collapsed state */}
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {group.name}
                        </div>
                      </div>
                    )
                  }
                  
                  // Expanded mode - normal functionality
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
          </div>

          {/* User Profile - Fixed at bottom */}
          <div className={`p-4 border-t border-gray-700 flex-shrink-0 ${sidebarCollapsed && !isMobile ? "px-2" : ""}`}>
            <div className="relative">
              {sidebarCollapsed && !isMobile ? (
                /* Collapsed state on desktop - Just avatar centered */
                <div className="flex justify-center">
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
                </div>
              ) : (
                /* Expanded state - Full profile with dropdown */
                <>
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
                    <div className="flex-1 min-w-0 text-left transition-all duration-300" style={{
                      transitionDelay: "150ms"
                    }}>
                      <p className="font-medium text-white truncate whitespace-nowrap">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-300 truncate whitespace-nowrap">{getUserEmail()}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-300 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Menu Dropdown - Only show when expanded */}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
