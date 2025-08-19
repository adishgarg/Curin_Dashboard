
import { useState, useEffect } from "react"
import Select from "react-select"
import { Calendar, Users, Building2, Briefcase, FileText, Plus, CheckCircle, AlertCircle } from "lucide-react"

export default function CreateTaskPage() {
  const [formData, setFormData] = useState({
    taskName: "",
    partnerOrganizations: [],
    employeesAssigned: [],
    industriesInvolved: [],
    status: "active",
    description: "",
    createdBy: "AKsHaT",
    startDate: "",
    endDate: "",
  })

  const [partnerOptions, setPartnerOptions] = useState([])
  const [industryOptions, setIndustryOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)

  // ✅ Cache helpers
  const getCachedData = (key) => {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    try {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp > 3600 * 1000) return null
      return parsed.data
    } catch {
      return null
    }
  }

  const setCachedData = (key, data) => {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  }

  // ✅ Fetch dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- Organizations ---
        let partners = getCachedData("partners")
        if (!partners) {
          const res = await fetch("https://curin-backend.onrender.com/api/org")
          const json = await res.json()
          partners = Array.isArray(json?.data?.organizations) ? json.data.organizations : []
          setCachedData("partners", partners)
        }
        setPartnerOptions(
          partners.map((org) => ({
            value: org._id,
            label: org.name,
          })),
        )
        console.log("✅ Organizations:", partners)

        // --- Industries ---
        let industries = getCachedData("industries")
        if (!industries || industries.length === 0) {
          const res = await fetch("https://curin-backend.onrender.com/api/industries")
          const json = await res.json()
          industries = Array.isArray(json?.data?.industries) ? json.data.industries : []
          setCachedData("industries", industries)
        }
        setIndustryOptions(
          industries.map((ind) => ({
            value: ind._id,
            label: ind.IndustryName,
          })),
        )
        console.log("✅ Industries:", industries)

        // --- Employees ---
        let employees = getCachedData("employees")
        if (!employees) {
          const res = await fetch("https://curin-backend.onrender.com/api/employees")
          const json = await res.json()
          employees = Array.isArray(json?.data?.employees) ? json.data.employees : []
          setCachedData("employees", employees)
        }
        setEmployeeOptions(
          employees.map((emp) => ({
            value: emp._id,
            label: emp.fullName || `${emp.firstName} ${emp.lastName}`,
          })),
        )
        console.log("✅ Employees:", employees)
      } catch (err) {
        console.error("❌ Error fetching dropdown data:", err)
      }
    }

    fetchData()
  }, [])

  // ✅ Validation
  const validateForm = () => {
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage("")
    setIsSuccess(false)

    try {
      const res = await fetch("https://curin-backend.onrender.com/api/tasks/create", {
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

      const data = await res.json()
      if (res.ok) {
        setMessage("Task created successfully!")
        setIsSuccess(true)
        setFormData({
          taskName: "",
          partnerOrganizations: [],
          employeesAssigned: [],
          industriesInvolved: [],
          status: "active",
          description: "",
          createdBy: "AKsHaT",
          startDate: "",
          endDate: "",
        })
        setErrors({})
      } else {
        setMessage("Error: " + (data.message || "Failed to create task"))
        setIsSuccess(false)
      }
    } catch (err) {
      setMessage("Server error, please try again")
      setIsSuccess(false)
    }

    setLoading(false)
  }

  const selectStyles = {
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
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <Plus className="h-8 w-8" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Create New Task</h1>
              <p className="text-green-100 mt-1">Set up a new task for your team</p>
            </div>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Task Name *
            </label>
            <input
              type="text"
              placeholder="Enter task name"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.taskName ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.taskName && <p className="mt-1 text-sm text-red-600">{errors.taskName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="inline w-4 h-4 mr-1" />
              Partner Organizations *
            </label>
            <Select
              isMulti
              options={partnerOptions}
              value={formData.partnerOrganizations}
              onChange={(opt) => setFormData({ ...formData, partnerOrganizations: opt || [] })}
              placeholder="Select partner organizations"
              styles={selectStyles}
              className={errors.partnerOrganizations ? "border-red-300" : ""}
            />
            {errors.partnerOrganizations && <p className="mt-1 text-sm text-red-600">{errors.partnerOrganizations}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Assign Employees *
            </label>
            <Select
              isMulti
              options={employeeOptions}
              value={formData.employeesAssigned}
              onChange={(opt) => setFormData({ ...formData, employeesAssigned: opt || [] })}
              placeholder="Select employees to assign"
              styles={selectStyles}
              className={errors.employeesAssigned ? "border-red-300" : ""}
            />
            {errors.employeesAssigned && <p className="mt-1 text-sm text-red-600">{errors.employeesAssigned}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="inline w-4 h-4 mr-1" />
              Industries Involved
            </label>
            <Select
              isMulti
              options={industryOptions}
              value={formData.industriesInvolved}
              onChange={(opt) => setFormData({ ...formData, industriesInvolved: opt || [] })}
              placeholder="Select relevant industries"
              styles={selectStyles}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
            <textarea
              placeholder="Provide detailed description of the task (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
        </form>
      </div>
    </div>
  )
}
