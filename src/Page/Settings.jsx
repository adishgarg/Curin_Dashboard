import { useState, useEffect } from "react"
import { Lock, User, Shield, Eye, EyeOff, Check, X, AlertCircle, Mail } from "lucide-react"
import { employeeService } from "../services/api/employees"
import { userService } from "../services/api/user"

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile related state
  const [userData, setUserData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' })
  }

  // Fetch user data for profile tab
  const fetchUserData = async () => {
    if (userData) return // Don't fetch if already loaded
    
    try {
      setProfileLoading(true)
      setProfileError(null)
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
          role: user.designation || "User",
        }
        
        setUserData(transformedUserData)
      } else {
        throw new Error("Invalid response structure from API")
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setProfileError("Failed to load profile data")
      
      // Fallback data
      setUserData({
        name: "Guest User",
        email: "guest@example.com",
        role: "User",
        designation: "Not specified",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  // Load profile data when profile tab is accessed
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchUserData()
    }
  }, [activeTab])

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    }
  }

  const handleSubmitPassword = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!passwordData.oldPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password' })
      return
    }
    
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: 'Please enter a new password' })
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    const passwordValidation = validatePassword(passwordData.newPassword)
    if (!passwordValidation.isValid) {
      setMessage({ type: 'error', text: 'Password does not meet security requirements' })
      return
    }
    
    if (passwordData.oldPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' })
      return
    }
    
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      
      await employeeService.updatePass({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })
      
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
    } catch (error) {
      console.error('Password update error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to update password'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const passwordValidation = validatePassword(passwordData.newPassword)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h2>
                  <p className="text-gray-600">View your account information and details</p>
                </div>

                {profileLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                  </div>
                ) : profileError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-red-800 font-medium">Error loading profile</p>
                        <p className="text-red-600">{profileError}</p>
                        <button 
                          onClick={() => {
                            setUserData(null)
                            fetchUserData()
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                ) : userData ? (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{userData.name}</h3>
                          <p className="text-gray-600">{userData.role}</p>
                          {userData.designation && userData.designation !== userData.role && (
                            <p className="text-sm text-gray-500">{userData.designation}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail size={20} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Email Address</p>
                            <p className="text-gray-900">{userData.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <User size={20} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Full Name</p>
                            <p className="text-gray-900">{userData.name}</p>
                          </div>
                        </div>


                        {userData.designation && (
                          <div className="flex items-center gap-3">
                            <Shield size={20} className="text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Designation</p>
                              <p className="text-gray-900">{userData.designation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600">Update your password to keep your account secure</p>
                </div>

                {/* Message Alert */}
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.type === 'success' ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitPassword} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        id="oldPassword"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('old')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.old ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Requirements */}
                    {passwordData.newPassword && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                        <ul className="space-y-1 text-sm">
                          <li className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            At least 8 characters
                          </li>
                          <li className={`flex items-center gap-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasUpper ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One uppercase letter
                          </li>
                          <li className={`flex items-center gap-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasLower ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One lowercase letter
                          </li>
                          <li className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One number
                          </li>
                          <li className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One special character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                            ? 'border-red-300' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !passwordValidation.isValid || passwordData.newPassword !== passwordData.confirmPassword}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating Password...
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
