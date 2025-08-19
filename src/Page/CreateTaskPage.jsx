
import { useState, useEffect, useCallback, useMemo } from "react"
import Select from "react-select"
import { Calendar, Users, Building2, Briefcase, FileText, Plus, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

// Constants
const API_BASE_URL = "https://curin-backend.onrender.com/api"
const CACHE_DURATION = 3600 * 1000 // 1 hour
const INITIAL_FORM_DATA = {
  taskName: "",
  partnerOrganizations: [],
  employeesAssigned: [],
  industriesInvolved: [],
  status: "active",
  description: "",
  createdBy: "AKsHaT",
  startDate: "",
  endDate: "",
}

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
      // Handle storage quota exceeded
      console.warn(`Failed to cache ${key}`)
    }
  }
}

// Custom hook for fetching dropdown data
const useDropdownData = () => {
  const [options, setOptions] = useState({
    partners: [],
    industries: [],
    employees: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDropdownData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Define fetch functions
      const fetchWithCache = async (endpoint, cacheKey, mapFn) => {
        let cached = cacheUtils.get(cacheKey)
        if (cached) return cached.map(mapFn)

        const response = await fetch(`${API_BASE_URL}/${endpoint}`)
        if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`)
        
        const json = await response.json()
        const data = json?.data?.[cacheKey] || []
        
        if (Array.isArray(data)) {
          cacheUtils.set(cacheKey, data)
          return data.map(mapFn)
        }
        return []
      }

      // Fetch all data in parallel
      const [partnerOptions, industryOptions, employeeOptions] = await Promise.all([
        fetchWithCache('org', 'organizations', (org) => ({
          value: org._id,
          label: org.name,
        })),
        fetchWithCache('industries', 'industries', (ind) => ({
          value: ind._id,
          label: ind.IndustryName,
        })),
        fetchWithCache('employees', 'employees', (emp) => ({
          value: emp._id,
          label: emp.fullName || `${emp.firstName} ${emp.lastName}`,
        }))
      ])

      setOptions({
        partners: partnerOptions,
        industries: industryOptions,
        employees: employeeOptions
      })
    } catch (err) {
      console.error("Error fetching dropdown data:", err)
      setError("Failed to load dropdown options. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDropdownData()
  }, [fetchDropdownData])

  return { options, loading, error, refetch: fetchDropdownData }
}

// Reusable form field component (moved outside to prevent re-creation)
const FormField = ({ label, icon: Icon, error, children, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <Icon className="inline w-4 h-4 mr-1" aria-hidden="true" />
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
        {error}
      </p>
    )}
  </div>
)

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading form options...</span>
  </div>
)

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-3">
      <AlertCircle className="text-red-600" size={20} />
      <div className="flex-1">
        <p className="text-red-800 font-medium">Error loading form</p>
        <p className="text-red-600 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
)

export default function CreateTaskPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { options, loading: optionsLoading, error: optionsError, refetch } = useDropdownData()
  // Memoized validation function
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.taskName.trim()) {
      newErrors.taskName = "Task name is required"
    }

    if (formData.partnerOrganizations.length === 0) {
      newErrors.partnerOrganizations = "At least one partner organization is required"
    }

    if (formData.employeesAssigned.length === 0) {
      newErrors.employeesAssigned = "At least one employee must be assigned"
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Optimized form update handler
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Optimized submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage("")
    setIsSuccess(false)

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: formData.taskName,
          partnerOrganizations: formData.partnerOrganizations.map((org) => ({
            id: org.value,
            name: org.label,
          })),
          employeesAssigned: formData.employeesAssigned.map((emp) => ({
            id: emp.value,
            name: emp.label,
          })),
          industriesInvolved: formData.industriesInvolved.map((i) => ({
            id: i.value,
            name: i.label,
          })),
          status: formData.status,
          createdBy: formData.createdBy,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          description: formData.description,
          userTimestamp: new Date(),
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage("Task created successfully!")
        setIsSuccess(true)
        setFormData(INITIAL_FORM_DATA)
        setErrors({})
      } else {
        setMessage(data.message || "Failed to create task")
        setIsSuccess(false)
      }
    } catch (err) {
      console.error("Error creating task:", err)
      setMessage("Server error, please try again")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm])

  // Memoized select styles
  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#EFF6FF",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1E40AF",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#1E40AF",
      "&:hover": {
        backgroundColor: "#DBEAFE",
        color: "#1E40AF",
      },
    }),
  }), [])

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <Plus className="h-8 w-8" aria-hidden="true" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Create New Task</h1>
              <p className="text-green-100 mt-1">Set up a new task for your team</p>
            </div>
          </div>
        </div>

        {/* Options Loading/Error States */}
        {optionsLoading && <LoadingSpinner />}
        {optionsError && <ErrorMessage message={optionsError} onRetry={refetch} />}

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              isSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
            role="alert"
            aria-live="polite"
          >
            {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Form */}
        {!optionsLoading && !optionsError && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* Task Name */}
            <FormField label="Task Name" icon={FileText} error={errors.taskName} required>
              <input
                type="text"
                placeholder="Enter task name"
                value={formData.taskName}
                onChange={(e) => updateFormData('taskName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.taskName ? "border-red-300" : "border-gray-300"
                }`}
                aria-describedby={errors.taskName ? "taskName-error" : undefined}
              />
            </FormField>

            {/* Partner Organizations */}
            <FormField label="Partner Organizations" icon={Building2} error={errors.partnerOrganizations} required>
              <Select
                isMulti
                options={options.partners}
                value={formData.partnerOrganizations}
                onChange={(opt) => updateFormData('partnerOrganizations', opt || [])}
                placeholder="Select partner organizations"
                styles={selectStyles}
                className={errors.partnerOrganizations ? "border-red-300" : ""}
                aria-describedby={errors.partnerOrganizations ? "partnerOrganizations-error" : undefined}
                isDisabled={options.partners.length === 0}
              />
            </FormField>

            {/* Employees */}
            <FormField label="Assign Employees" icon={Users} error={errors.employeesAssigned} required>
              <Select
                isMulti
                options={options.employees}
                value={formData.employeesAssigned}
                onChange={(opt) => updateFormData('employeesAssigned', opt || [])}
                placeholder="Select employees to assign"
                styles={selectStyles}
                className={errors.employeesAssigned ? "border-red-300" : ""}
                aria-describedby={errors.employeesAssigned ? "employeesAssigned-error" : undefined}
                isDisabled={options.employees.length === 0}
              />
            </FormField>

            {/* Industries */}
            <FormField label="Industries Involved" icon={Briefcase} error={errors.industriesInvolved}>
              <Select
                isMulti
                options={options.industries}
                value={formData.industriesInvolved}
                onChange={(opt) => updateFormData('industriesInvolved', opt || [])}
                placeholder="Select relevant industries"
                styles={selectStyles}
                isDisabled={options.industries.length === 0}
              />
            </FormField>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Start Date" icon={Calendar}>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </FormField>
              
              <FormField label="Deadline" icon={Calendar} error={errors.endDate}>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? "border-red-300" : "border-gray-300"
                  }`}
                  min={formData.startDate}
                  aria-describedby={errors.endDate ? "endDate-error" : undefined}
                />
              </FormField>
            </div>

            {/* Description */}
            <FormField label="Detailed Description" icon={FileText}>
              <textarea
                placeholder="Provide detailed description of the task (optional)"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </div>
            </FormField>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || optionsLoading}
                className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-describedby="submit-button-status"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Task
                  </>
                )}
              </button>
            </div>
            <div id="submit-button-status" className="sr-only">
              {loading ? "Creating task, please wait" : "Ready to create task"}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}