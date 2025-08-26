"use client"
import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Building2, AlertCircle, CheckCircle, Edit3, Trash2, Save, X } from "lucide-react"
import ReusableTable from "../components/ReusableTable"
import { organizationService } from "../services/api/organization"

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

export default function AddOrganizationsPage() {
  const [formData, setFormData] = useState({
    name: "",
  })
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Fetch organizations using the service
  const fetchOrganizations = useCallback(async () => {
    setLoadingOrgs(true)
    try {
      const data = await organizationService.getAllOrganizations()
      console.log("Organizations from service:", data) // Debug log
      setOrganizations(Array.isArray(data) ? data : [])
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

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Handle form change
  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  // Handle form submit using the service
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setMessage("Organization name is required")
      setIsSuccess(false)
      return
    }

    setLoading(true)
    try {
      const result = await organizationService.createOrganization({
        name: formData.name.trim(),
        createdBy: "Admin" // You can change this to current user
      })

      if (result && (result.success || result.data)) {
        setMessage("Organization created successfully!")
        setIsSuccess(true)
        setFormData({ name: "" })
        
        // Refresh organizations list
        await fetchOrganizations()
      } else {
        setMessage(result.message || "Failed to create organization")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Error creating organization:", error)
      setMessage(error.message || "Server error, please try again")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (org) => {
    setEditingId(org._id)
    setEditName(org.name)
  }

  // Handle save edit using the service
  const handleSaveEdit = async (orgId) => {
    if (!editName.trim()) {
      setMessage("Organization name cannot be empty")
      setIsSuccess(false)
      return
    }

    try {
      const result = await organizationService.updateOrganization(orgId, {
        name: editName.trim(),
      })

      if (result && (result.success || result.data)) {
        setMessage("Organization updated successfully!")
        setIsSuccess(true)
        setEditingId(null)
        setEditName("")
        
        // Update local state
        setOrganizations(orgs => 
          orgs.map(org => 
            org._id === orgId ? { ...org, name: editName.trim() } : org
          )
        )
      } else {
        setMessage(result.message || "Failed to update organization")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Error updating organization:", error)
      setMessage(error.message || "Server error, please try again")
      setIsSuccess(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  // Handle delete using the service
  const handleDelete = async (orgId, orgName) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
      return
    }

    setDeleteLoading(orgId)
    try {
      const result = await organizationService.deleteOrganization(orgId)

      if (result && (result.success || result.status === 200)) {
        setMessage("Organization deleted successfully!")
        setIsSuccess(true)
        
        // Update local state
        setOrganizations(orgs => orgs.filter(org => org._id !== orgId))
      } else {
        setMessage(result.message || "Failed to delete organization")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Error deleting organization:", error)
      setMessage(error.message || "Server error, please try again")
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
      header: "Organization Name",
      render: (org) => {
        if (editingId === org._id) {
          return (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          )
        }
        return (
          <div className="font-medium text-gray-900">
            {org.name}
          </div>
        )
      },
      className: "min-w-[200px]"
    },
    {
      header: "Created Date",
      render: (org) => (
        <div className="text-sm text-gray-500">
          {new Date(org.createdAt || org.userTimestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
      className: "min-w-[120px]"
    },
    {
      header: "Actions",
      render: (org) => {
        if (editingId === org._id) {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveEdit(org._id)}
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
              onClick={() => handleEdit(org)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={() => handleDelete(org._id, org.name)}
              disabled={deleteLoading === org._id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleteLoading === org._id ? (
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
      <div className="max-w-6xl mx-auto">
        <title>Manage Organizations</title>
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8" aria-hidden="true" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Manage Organizations</h1>
              <p className="text-green-100 mt-1">Add new organizations and manage existing ones</p>
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

        {/* Add Organization Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Organization</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Organization Name" icon={Building2} required>
              <input
                type="text"
                placeholder="Enter organization name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
            </FormField>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
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
                    Add Organization
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Organizations</h2>
            <div className="text-sm text-gray-500">
              {organizations.length} organization{organizations.length !== 1 ? 's' : ''} total
            </div>
          </div>

          {loadingOrgs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading organizations...</span>
            </div>
          ) : (
            <ReusableTable
              columns={columns}
              data={organizations}
              emptyText="No organizations found. Add your first organization above."
              minWidth="600px"
            />
          )}
        </div>
      </div>
    </div>
  )
}
