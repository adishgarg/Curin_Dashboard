import { useState, useEffect, useCallback } from "react"
import Select from "react-select"
import { Loader2, UserPlus, User, Mail, Phone, Briefcase, Building2, AlertCircle, CheckCircle, RefreshCw, Copy, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { employeeService } from "../services/api/employees"
import { organizationService } from "../services/api/organization"

const CACHE_DURATION = 3600 * 1000 // 1 hour

// Cache utilities
const cacheUtils = {
  get: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp > CACHE_DURATION) {
        localStorage.removeItem(key)
        return null
      }
      return parsed.data
    } catch {
      localStorage.removeItem(key)
      return null
    }
  },
  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {
      console.warn(`Failed to cache ${key}`)
    }
  },
}

// Form field wrapper with icon + label
function FormField({ label, icon: Icon, children, error, required }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-gray-700 font-medium text-sm">
        <Icon className="h-4 w-4 text-gray-500" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default function AddUsersPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    designation: "User",
    organization: null,
    confirmPPI: false,
  })
  const [loading, setLoading] = useState(false)
  const [orgOptions, setOrgOptions] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const generatePassword = (length = 12) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-()_+"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const navigate = useNavigate()

  // Fetch organizations with caching using organizationService
  const fetchOrganizations = useCallback(async () => {
    setLoadingOrgs(true)
    try {
      let cached = cacheUtils.get("organizations")
      if (cached) {
        setOrgOptions(cached.map((org) => ({ value: org._id, label: org.name })))
        setLoadingOrgs(false)
        return
      }

      // Use organizationService instead of apiClient
      const response = await organizationService.getAllOrganizations()

      // Handle the actual response structure
      let organizationData = []

      if (response && response.success && Array.isArray(response.data)) {
        organizationData = response.data
      } else if (response && Array.isArray(response.organizations)) {
        organizationData = response.organizations
      } else if (Array.isArray(response)) {
        organizationData = response
      }

      console.log("Organizations fetched:", organizationData) // Debug log

      cacheUtils.set("organizations", organizationData)
      setOrgOptions(organizationData.map((org) => ({ value: org._id, label: org.name })))
    } catch (err) {
      console.error("Error fetching organizations:", err)
      setMessage("Failed to load organizations")
      setIsSuccess(false)
    } finally {
      setLoadingOrgs(false)
    }
  }, [])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  // Handle change
  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.designation === "PPI" && !formData.confirmPPI) {
      alert("Please confirm that you are making this user PPI.")
      return
    }

    setLoading(true)
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        organization: formData.organization?.value || null, // Extract the value from Select option
      }

      const response = await employeeService.createEmployee(submitData)

      console.log("Created Employee:", response)

      setMessage("User created successfully!")
      setIsSuccess(true)

      setTimeout(() => navigate("/manage-users"), 1500)
    } catch (error) {
      console.error("Error creating employee:", error)
      setMessage(error.message || "Failed to create user")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <title>Manage Users</title>
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b7280' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Header */}
        <div className="white-header border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                <UserPlus className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New User</h1>
                <p className="text-gray-600 text-lg">Create a new employee record for your team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Success/Error Message */}
          {message && (
            <div className="mb-6">
              <div
                className={`white-card ${
                  isSuccess
                    ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
                    : "border-red-200 bg-gradient-to-r from-red-50 to-pink-50"
                } flex items-center gap-3`}
                role="alert"
                aria-live="polite"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSuccess ? "bg-green-100" : "bg-red-100"
                }`}>
                  {isSuccess ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle className="text-red-600" size={20} />
                  )}
                </div>
                <span className={`font-medium ${
                  isSuccess ? "text-green-800" : "text-red-800"
                }`}>{message}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="white-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="First Name" icon={User} required>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  required
                />
              </FormField>

              <FormField label="Last Name" icon={User} required>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  required
                />
              </FormField>
            </div>

            <FormField label="Email" icon={Mail} required>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                required
              />
            </FormField>

            <FormField label="Phone" icon={Phone}>
              <input
                type="text"
                placeholder="Enter phone number (optional)"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
              />
            </FormField>

            <FormField label="Password" icon={Mail} required>
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Generated password will appear here"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                  required
                />
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => updateFormData("password", generatePassword())}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="Generate random password"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.password) {
                        navigator.clipboard.writeText(formData.password)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                    title="Copy password"
                    disabled={!formData.password}
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Designation" icon={Briefcase} required>
                <Select
                  options={[
                    { value: "User", label: "User" },
                    { value: "PPI", label: "PPI" },
                  ]}
                  value={{ value: formData.designation, label: formData.designation }}
                  onChange={(opt) => updateFormData("designation", opt.value)}
                  placeholder="Select designation"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(4px)',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9ca3af' },
                      '&:focus-within': { 
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                      }
                    })
                  }}
                />
              </FormField>

              <FormField label="Organization" icon={Building2} required>
                <Select
                  options={orgOptions}
                  value={formData.organization}
                  onChange={(opt) => updateFormData("organization", opt)}
                  placeholder={loadingOrgs ? "Loading organizations..." : "Select organization"}
                  isDisabled={loadingOrgs}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={loadingOrgs}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(4px)',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9ca3af' },
                      '&:focus-within': { 
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                      }
                    })
                  }}
                />
              </FormField>
            </div>

            {formData.designation === "PPI" && (
              <div className="flex items-center gap-3 p-4 border rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <input
                  type="checkbox"
                  checked={formData.confirmPPI}
                  onChange={(e) => updateFormData("confirmPPI", e.target.checked)}
                  id="confirmPPI"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="confirmPPI" className="text-sm text-amber-800 font-medium">
                  I confirm I want to make this user a <strong>PPI (Primary Point of Interest)</strong>.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Add User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .white-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(229, 231, 235, 0.8);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .white-card:hover {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: rgba(229, 231, 235, 1);
        }

        .white-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* React Select custom styles */
        .react-select-container .react-select__control {
          border-radius: 8px;
          padding: 4px 8px;
          transition: all 0.2s ease;
        }

        .react-select-container .react-select__control:hover {
          border-color: #9ca3af;
        }

        .react-select-container .react-select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .react-select-container .react-select__option {
          transition: all 0.2s ease;
        }

        .react-select-container .react-select__option:hover {
          background-color: #f3f4f6;
        }

        .react-select-container .react-select__option--is-selected {
          background-color: #3b82f6;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(229, 231, 235, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  )
}
