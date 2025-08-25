import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Calendar, Edit3 } from "lucide-react"
import { userService } from "../services/api/user"

export default function Profile() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data for profile...")
        const response = await userService.getCurrentUser()
        
        if (response && response.status === "success" && response.data && response.data.user) {
          const user = response.data.user
          console.log("Profile - User data received:", user)
          
          // Transform the API response
          const transformedUserData = {
            id: user.id,
            name: user.fullName || user.name,
            email: user.email,
            designation: user.designation,
            // Add default values for fields not in API
           
            role: user.designation || "User",
         
          }
          
          setUserData(transformedUserData)
        } else {
          throw new Error("Invalid response structure from API")
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setError("Failed to load profile data")
        
        // Fallback data
        setUserData({
          name: "Guest User",
          email: "guest@example.com",
          phone: "Not provided",
          location: "Not provided",
          joinDate: "Not available",
          role: "User",
          department: "Not specified",
          avatar: null
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{userData?.name}</h3>
                <p className="text-gray-600">{userData?.role}</p>
                <p className="text-sm text-gray-500">{userData?.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{userData?.email}</p>
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
