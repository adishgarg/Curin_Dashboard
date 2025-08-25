import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { userService } from "../services/api/user"

// Define routes that require admin access (PPI/LPI)
const ADMIN_ROUTES = [
  "/add-users",
  "/manage-users", 
  "/manage-organizations",
  "/manage-industries",
  "/create-task",
  "/work-progress",
  "/overall-progress",
  "/user-progress",
  "/create-event",
  "/manage-events",
  "/manage-finance"
]

// Define routes that regular users can access
const USER_ROUTES = [
  "/",
  "/profile",
  "/settings",
  "/my-tasks",
  "/my-events", 
  "/events",
  "/my-progress",
  "/no-access"  // Allow access to no-access page for all users
]

export default function RoleBasedRoute({ children, path }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await userService.getCurrentUser()
        
        if (response && response.status === "success" && response.data && response.data.user) {
          const user = response.data.user
          setUserData(user)
          
          const designation = user.designation?.toUpperCase()
          const isAdmin = designation === "PPI" || designation === "LPI"
          const isUser = designation === "USER"
          
          // Check access based on route and user role
          if (isAdmin) {
            // Admins can access all routes
            setHasAccess(true)
          } else if (isUser) {
            // Regular users can only access USER_ROUTES
            setHasAccess(USER_ROUTES.includes(path))
          } else {
            // Unknown role, redirect to no-access
            setHasAccess(path === "/" || path === "/no-access")
          }
        } else {
          // No user data, redirect to no-access unless it's home or no-access page
          setHasAccess(path === "/" || path === "/no-access")
        }
      } catch (error) {
        console.error("Failed to check user access:", error)
        // On error, allow home and no-access page only
        setHasAccess(path === "/" || path === "/no-access")
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [path])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    // Redirect to no-access page if user doesn't have permission
    return <Navigate to="/no-access" replace />
  }

  return children
}
