import { useState, useEffect, useCallback } from "react"
import Select from "react-select"
import { Loader2, UserPlus, User, Mail, Phone, Briefcase, Building2, AlertCircle, CheckCircle, RefreshCw, Copy, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { employeeService } from "../services/api/employees"
import { apiClient } from "../services/api/client"

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
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-gray-700 font-medium">
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
    password: "", // Added missing password field
    designation: "User",
    organization: null,
    confirmPPI: false,
  })
  const [loading, setLoading] = useState(false)
  const [orgOptions, setOrgOptions] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [copied, setCopied] = useState(false) // Added missing copied state

  const generatePassword = (length = 12) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-()_+"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const navigate = useNavigate()

  // Fetch organizations with caching using apiClient
  const fetchOrganizations = useCallback(async () => {
    setLoadingOrgs(true)
    try {
      let cached = cacheUtils.get("organizations")
      if (cached) {
        setOrgOptions(cached.map((org) => ({ value: org._id, label: org.name })))
        setLoadingOrgs(false)
        return
      }

      // Use apiClient instead of direct fetch
      const response = await apiClient.get("/org")
      const data = response?.data?.organizations || []

      cacheUtils.set("organizations", data)
      setOrgOptions(data.map((org) => ({ value: org._id, label: org.name })))
    } catch (err) {
      console.error("Error fetching organizations:", err)
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

      setTimeout(() => navigate("/"), 1000)
    } catch (error) {
      console.error("Error creating employee:", error)
      setMessage("Failed to create user")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8" aria-hidden="true" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Add New User</h1>
              <p className="text-green-100 mt-1">Create a new employee record</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              isSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <FormField label="First Name" icon={User} required>
            <input
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </FormField>

          <FormField label="Last Name" icon={User} required>
            <input
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </FormField>

          <FormField label="Email" icon={Mail} required>
            <input
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </FormField>

          <FormField label="Phone" icon={Phone}>
            <input
              type="text"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Password" icon={Mail} required>
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Generated password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
                required
              />
              <div className="absolute right-2 flex items-center space-x-2">
                {/* Random Password Button */}
                <button
                  type="button"
                  onClick={() => updateFormData("password", generatePassword())}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Generate random password"
                >
                  <RefreshCw size={18} />
                </button>
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (formData.password) {
                      navigator.clipboard.writeText(formData.password)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                  title="Copy password"
                  disabled={!formData.password}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </FormField>

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
            />
          </FormField>

          {formData.designation === "PPI" && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
              <input
                type="checkbox"
                checked={formData.confirmPPI}
                onChange={(e) => updateFormData("confirmPPI", e.target.checked)}
                id="confirmPPI"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="confirmPPI" className="text-sm text-gray-700">
                I confirm I want to make this user a <strong>PPI</strong>.
              </label>
            </div>
          )}

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
            />
          </FormField>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Add User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
