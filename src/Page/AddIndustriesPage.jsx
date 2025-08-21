"use client"
import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Briefcase, AlertCircle, CheckCircle, Edit3, Trash2, Save, X, MapPin, User, Mail, Phone } from "lucide-react"
import ReusableTable from "../components/ReusableTable"


// API constants
const API_BASE_URL = "https://curin-backend.onrender.com/api"
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
  remove: (key) => {
    localStorage.removeItem(key)
  }
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

export default function AddIndustriesPage() {
  const [formData, setFormData] = useState({
    IndustryName: "",
    Location: "",
    ContactPoint: {
      Name: "",
      Email: "",
      Phone: ""
    }
  })
  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState([])
  const [loadingIndustries, setLoadingIndustries] = useState(true)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Fetch industries
  const fetchIndustries = useCallback(async () => {
    setLoadingIndustries(true)
    try {
      // Try cache first
      let cached = cacheUtils.get("industries")
      if (cached) {
        setIndustries(cached)
        setLoadingIndustries(false)
        // Still fetch fresh data in background
      }

      const response = await fetch(`${API_BASE_URL}/industries`)
      if (!response.ok) throw new Error("Failed to fetch industries")

      const json = await response.json()
      const data = json?.data?.industries || []

      cacheUtils.set("industries", data)
      setIndustries(data)
    } catch (err) {
      console.error("Error fetching industries:", err)
      setMessage("Failed to load industries")
      setIsSuccess(false)
    } finally {
      setLoadingIndustries(false)
    }
  }, [])

  useEffect(() => {
    fetchIndustries()
  }, [fetchIndustries])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Handle form change
  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Validate form
  const validateForm = () => {
    if (!formData.IndustryName.trim()) {
      setMessage("Industry name is required")
      setIsSuccess(false)
      return false
    }
    if (!formData.Location.trim()) {
      setMessage("Location is required")
      setIsSuccess(false)
      return false
    }
    if (!formData.ContactPoint.Name.trim()) {
      setMessage("Contact person name is required")
      setIsSuccess(false)
      return false
    }
    if (!formData.ContactPoint.Email.trim()) {
      setMessage("Contact email is required")
      setIsSuccess(false)
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.ContactPoint.Email)) {
      setMessage("Please enter a valid email address")
      setIsSuccess(false)
      return false
    }
    return true
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/industries/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IndustryName: formData.IndustryName.trim(),
          Location: formData.Location.trim(),
          ContactPoint: [{
            Name: formData.ContactPoint.Name.trim(),
            Email: formData.ContactPoint.Email.trim(),
            Phone: formData.ContactPoint.Phone.trim() || undefined
          }],
          createdBy: "Admin" // You can change this to current user
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage("Industry created successfully!")
        setIsSuccess(true)
        setFormData({
          IndustryName: "",
          Location: "",
          ContactPoint: {
            Name: "",
            Email: "",
            Phone: ""
          }
        })
        
        // Refresh industries list
        await fetchIndustries()
        
        // Clear cache to ensure fresh data
        cacheUtils.remove("industries")
      } else {
        setMessage(data.message || "Failed to create industry")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Error creating industry:", error)
      setMessage("Server error, please try again")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (industry) => {
    setEditingId(industry._id)
    setEditData({
      IndustryName: industry.IndustryName,
      Location: industry.Location,
      ContactPoint: industry.ContactPoint?.[0] || { Name: "", Email: "", Phone: "" }
    })
  }

  // Handle save edit
  const handleSaveEdit = async (industryId) => {
    if (!editData.IndustryName?.trim() || !editData.Location?.trim() || !editData.ContactPoint?.Name?.trim() || !editData.ContactPoint?.Email?.trim()) {
      setMessage("All required fields must be filled")
      setIsSuccess(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/industries/${industryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IndustryName: editData.IndustryName.trim(),
          Location: editData.Location.trim(),
          ContactPoint: [{
            Name: editData.ContactPoint.Name.trim(),
            Email: editData.ContactPoint.Email.trim(),
            Phone: editData.ContactPoint.Phone?.trim() || ""
          }]
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage("Industry updated successfully!")
        setIsSuccess(true)
        setEditingId(null)
        setEditData({})
        
        // Update local state
        setIndustries(industries => 
          industries.map(industry => 
            industry._id === industryId ? { 
              ...industry, 
              IndustryName: editData.IndustryName.trim(),
              Location: editData.Location.trim(),
              ContactPoint: [{
                ...industry.ContactPoint?.[0],
                Name: editData.ContactPoint.Name.trim(),
                Email: editData.ContactPoint.Email.trim(),
                Phone: editData.ContactPoint.Phone?.trim() || ""
              }]
            } : industry
          )
        )
        
        // Clear cache
        cacheUtils.remove("industries")
      } else {
        setMessage(data.message || "Failed to update industry")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Error updating industry:", error)
      setMessage("Server error, please try again")
      setIsSuccess(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  // Handle delete
  const handleDelete = async (industryId, industryName) => {
    if (!confirm(`Are you sure you want to delete "${industryName}"? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(industryId)
    try {
      const response = await fetch(`${API_BASE_URL}/industries/${industryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage("Industry deleted successfully!")
        setIsSuccess(true)
        
        // Update local state
        setIndustries(industries => industries.filter(industry => industry._id !== industryId))
        
        // Clear cache
        cacheUtils.remove("industries")
      } else {
        const data = await response.json()
        setMessage(data.message || "Failed to delete industry")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Error deleting industry:", error)
      setMessage("Server error, please try again")
      setIsSuccess(false)
    } finally {
      setDeleteLoading(null)
    }
  }

  // Table columns configuration
  const columns = [
    {
      header: "Sr No.",
      render: (_, index) => (
        <div className="font-medium text-gray-900">
          {index + 1}
        </div>
      ),
      className: "w-20"
    },
    {
      header: "Industry Name",
      render: (industry) => {
        if (editingId === industry._id) {
          return (
            <div className="relative">
              <input
                type="text"
                value={editData.IndustryName || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, IndustryName: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-sm bg-blue-50/50"
                placeholder="Industry name"
                autoFocus
              />
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )
        }
        return (
          <div className="font-medium text-gray-900">
            {industry.IndustryName}
          </div>
        )
      },
      className: "min-w-[200px]"
    },
    {
      header: "Location",
      render: (industry) => {
        if (editingId === industry._id) {
          return (
            <input
              type="text"
              value={editData.Location || ""}
              onChange={(e) => setEditData(prev => ({ ...prev, Location: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Location"
            />
          )
        }
        return (
          <div className="flex items-center gap-1 text-gray-700">
            <MapPin size={14} className="text-gray-400" />
            {industry.Location}
          </div>
        )
      },
      className: "min-w-[150px]"
    },
    {
      header: "Contact Person",
      render: (industry) => {
        const contact = industry.ContactPoint?.[0]
        if (editingId === industry._id) {
          return (
            <div className="space-y-1">
              <input
                type="text"
                value={editData.ContactPoint?.Name || ""}
                onChange={(e) => setEditData(prev => ({ 
                  ...prev, 
                  ContactPoint: { ...prev.ContactPoint, Name: e.target.value }
                }))}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                placeholder="Contact name"
              />
              <input
                type="email"
                value={editData.ContactPoint?.Email || ""}
                onChange={(e) => setEditData(prev => ({ 
                  ...prev, 
                  ContactPoint: { ...prev.ContactPoint, Email: e.target.value }
                }))}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                placeholder="Email"
              />
              <input
                type="text"
                value={editData.ContactPoint?.Phone || ""}
                onChange={(e) => setEditData(prev => ({ 
                  ...prev, 
                  ContactPoint: { ...prev.ContactPoint, Phone: e.target.value }
                }))}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                placeholder="Phone (optional)"
              />
            </div>
          )
        }
        return contact ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-900 font-medium text-sm">
              <User size={12} className="text-gray-400" />
              {contact.Name}
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <Mail size={12} className="text-gray-400" />
              {contact.Email}
            </div>
            {contact.Phone && (
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Phone size={12} className="text-gray-400" />
                {contact.Phone}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No contact info</span>
        )
      },
      className: "min-w-[200px]"
    },
    {
      header: "Actions",
      render: (industry) => {
        if (editingId === industry._id) {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveEdit(industry._id)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(industry)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={() => handleDelete(industry._id, industry.IndustryName)}
              disabled={deleteLoading === industry._id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleteLoading === industry._id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>
          </div>
        )
      },
      className: "min-w-[150px]"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8" aria-hidden="true" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Manage Industries</h1>
              <p className="text-green-100 mt-1">Add new industries and manage existing ones</p>
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
            role="alert"
            aria-live="polite"
          >
            {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Add Industry Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Industry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Industry Name" icon={Briefcase} required>
                <input
                  type="text"
                  placeholder="Enter industry name"
                  value={formData.IndustryName}
                  onChange={(e) => updateFormData("IndustryName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </FormField>

              <FormField label="Location" icon={MapPin} required>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={formData.Location}
                  onChange={(e) => updateFormData("Location", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </FormField>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Contact Person Name" icon={User} required>
                  <input
                    type="text"
                    placeholder="Enter contact name"
                    value={formData.ContactPoint.Name}
                    onChange={(e) => updateFormData("ContactPoint.Name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                  />
                </FormField>

                <FormField label="Email Address" icon={Mail} required>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.ContactPoint.Email}
                    onChange={(e) => updateFormData("ContactPoint.Email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>

                <FormField label="Phone Number" icon={Phone}>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={formData.ContactPoint.Phone}
                    onChange={(e) => updateFormData("ContactPoint.Phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Industry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Industries Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Industries</h2>
            <div className="text-sm text-gray-500">
              {industries.length} industr{industries.length !== 1 ? 'ies' : 'y'} total
            </div>
          </div>

          {loadingIndustries ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading industries...</span>
            </div>
          ) : (
            <ReusableTable
              columns={columns}
              data={industries}
              emptyText="No industries found. Add your first industry above."
              minWidth="800px"
            />
          )}
        </div>
      </div>
    </div>
  )
}
