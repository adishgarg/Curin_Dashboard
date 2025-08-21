"use client"
import { useEffect, useState, useCallback } from "react"
import { User, Mail, Phone, Building2, Loader2, Filter, Copy, Check, X, Save, Search } from "lucide-react"
import ReusableTable from "../components/ReusableTable"
import EditButton from "../components/EditButton"
import DeleteButton from "../components/DeleteButton"

const API_BASE_URL = "https://curin-backend.onrender.com/api"
const CACHE_DURATION = 3600 * 1000 // 1 hour

// Cache utilities (same as CreateTaskPage)
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
  }
}

// Custom hook for fetching organizations (same pattern as CreateTaskPage)
const useOrganizations = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrganizations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check cache first
      let cached = cacheUtils.get('organizations')
      if (cached) {
        setOrganizations(cached)
        setLoading(false)
        return
      }

      // Fetch from API
      const response = await fetch(`${API_BASE_URL}/org`)
      if (!response.ok) throw new Error('Failed to fetch organizations')
      
      const json = await response.json()
      const data = json?.data?.organizations || []
      
      if (Array.isArray(data)) {
        cacheUtils.set('organizations', data)
        setOrganizations(data)
      }
    } catch (err) {
      console.error("Error fetching organizations:", err)
      setError("Failed to load organizations")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  return { organizations, loading, error, refetch: fetchOrganizations }
}

// Modal Component for Editing Users
const EditUserModal = ({ user, organizations, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    organization: null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        designation: user.designation || "",
        organization: user.organization || null
      })
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        // Clear cache to force refresh
        localStorage.removeItem('employees')
        onSave()
        onClose()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <select
              value={formData.organization?._id || ""}
              onChange={(e) => {
                const selectedOrg = organizations.find(org => org._id === e.target.value)
                setFormData(prev => ({ ...prev, organization: selectedOrg || null }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org._id} value={org._id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Email Export Modal with better filtering
const EmailExportModal = ({ users, organizations, isOpen, onClose }) => {
  const [filterType, setFilterType] = useState('all')
  const [selectedOrg, setSelectedOrg] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState('')
  const [copied, setCopied] = useState(false)

  const designations = [...new Set(users.map(user => user.designation).filter(Boolean))]

  const getFilteredEmails = () => {
    let filtered = users
    
    // Apply organization filter
    if (filterType === 'organization' && selectedOrg) {
      filtered = filtered.filter(user => user.organization?._id === selectedOrg)
    }
    
    // Apply designation filter  
    if (filterType === 'designation' && selectedDesignation) {
      filtered = filtered.filter(user => user.designation === selectedDesignation)
    }
    
    // Apply both filters if "both" is selected
    if (filterType === 'both') {
      if (selectedOrg) {
        filtered = filtered.filter(user => user.organization?._id === selectedOrg)
      }
      if (selectedDesignation) {
        filtered = filtered.filter(user => user.designation === selectedDesignation)
      }
    }
    
    return filtered.map(user => user.email).filter(Boolean)
  }

  const copyEmails = async () => {
    const emails = getFilteredEmails().join(', ')
    try {
      await navigator.clipboard.writeText(emails)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy emails:', error)
    }
  }

  const filteredEmails = getFilteredEmails()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Export Emails</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter By</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="filterType"
                  value="all"
                  checked={filterType === 'all'}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                All Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="filterType"
                  value="organization"
                  checked={filterType === 'organization'}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                By Organization
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="filterType"
                  value="designation"
                  checked={filterType === 'designation'}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                By Designation
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="filterType"
                  value="both"
                  checked={filterType === 'both'}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mr-2 text-blue-600"
                />
                Both Filters
              </label>
            </div>
          </div>

          {(filterType === 'organization' || filterType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Organization</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Choose Organization</option>
                {organizations.map(org => (
                  <option key={org._id} value={org._id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          {(filterType === 'designation' || filterType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Designation</label>
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Choose Designation</option>
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">Emails ({filteredEmails.length})</span>
              <button
                onClick={copyEmails}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto text-sm text-gray-600 bg-white p-3 rounded border">
              {filteredEmails.length > 0 ? (
                filteredEmails.join(', ')
              ) : (
                'No emails found for the selected filter'
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AllUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(null)
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Email export modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [organizationFilter, setOrganizationFilter] = useState("")
  const [designationFilter, setDesignationFilter] = useState("")

  // Use the custom hook for organizations (same as CreateTaskPage)
  const { organizations, loading: orgLoading, error: orgError } = useOrganizations()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check cache first (same as CreateTaskPage pattern)
      let cached = cacheUtils.get('employees')
      if (cached) {
        setUsers(cached)
        setLoading(false)
        return
      }

      // Fetch from API
      const response = await fetch(`${API_BASE_URL}/employees`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      const employees = data?.data?.employees || []
      
      if (Array.isArray(employees)) {
        cacheUtils.set('employees', employees)
        setUsers(employees)
      }
      setError("")
    } catch (error) {
      setError("Failed to load users")
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEdit = (user) => {
    setEditingUser(user)
    setEditModalOpen(true)
  }

  const handleDelete = async (userId, userName) => {
    setDeleteLoading(userId)
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Clear cache and update state
        localStorage.removeItem('employees')
        setUsers(prev => prev.filter(user => user._id !== userId))
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSaveEdit = () => {
    fetchUsers() // Refresh the users list
  }

  // Enhanced filtering - now supports both organization AND designation filters
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
    const email = (user.email || '').toLowerCase()
    const phone = (user.phone || '').toLowerCase()
    const designation = (user.designation || '').toLowerCase()
    const organization = (user.organization?.name || '').toLowerCase()
    
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase()) ||
      designation.includes(searchTerm.toLowerCase()) ||
      organization.includes(searchTerm.toLowerCase())

    const matchesOrg = organizationFilter === '' || user.organization?._id === organizationFilter
    const matchesDesignation = designationFilter === '' || user.designation === designationFilter

    // All filters must match (AND logic)
    return matchesSearch && matchesOrg && matchesDesignation
  })

  const designations = [...new Set(users.map(user => user.designation).filter(Boolean))]

  const columns = [
    {
      header: "Sr No.",
      render: (_, idx) => (
        <div className="font-semibold text-gray-900 text-center">
          {idx + 1}
        </div>
      ),
      className: "w-16"
    },
    {
      header: "Name",
      render: user => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">
            {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
          </span>
        </div>
      ),
      className: "min-w-[200px]"
    },
    {
      header: "Email",
      render: user => (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          <span className="text-blue-600 hover:text-blue-800 transition-colors">
            {user.email || <span className="text-gray-400">N/A</span>}
          </span>
        </div>
      ),
      className: "min-w-[220px]"
    },
    {
      header: "Phone",
      render: user => (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-gray-400" />
          <span className="text-gray-700">
            {user.phone || <span className="text-gray-400">N/A</span>}
          </span>
        </div>
      ),
      className: "min-w-[160px]"
    },
    {
      header: "Designation",
      render: user => (
        <span className="inline-flex px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium">
          {user.designation || "User"}
        </span>
      ),
      className: "min-w-[140px]"
    },
    {
      header: "Organization",
      render: user => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Building2 size={14} className="text-green-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {user.organization?.name || <span className="text-gray-400">N/A</span>}
          </span>
        </div>
      ),
      className: "min-w-[200px]"
    },
    {
      header: "Actions",
      render: (user) => (
        <div className="flex items-center gap-2">
          <EditButton
            isEditing={false}
            onEdit={() => handleEdit(user)}
            size="sm"
          />
          <DeleteButton
            onDelete={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
            isLoading={deleteLoading === user._id}
            itemName={`${user.firstName} ${user.lastName}`}
            size="sm"
          />
        </div>
      ),
      className: "min-w-[180px]"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          <p className="text-gray-600 mt-1">Manage and view all system users</p>
        </div>
        <button
          onClick={() => setEmailModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-transparent shadow-lg hover:shadow-xl"
        >
          <Mail size={20} />
          Get Emails
        </button>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-800">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Organization Filter with Loading State */}
          <div className="relative">
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              disabled={orgLoading || orgError}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                orgLoading || orgError ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">
                {orgLoading ? 'Loading organizations...' : 
                 orgError ? 'Error loading organizations' : 
                 'All Organizations'}
              </option>
              {!orgLoading && !orgError && organizations.map(org => (
                <option key={org._id} value={org._id}>{org.name}</option>
              ))}
            </select>
            {orgLoading && (
              <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
            )}
          </div>

          {/* Designation Filter */}
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">All Designations</option>
            {designations.map(designation => (
              <option key={designation} value={designation}>{designation}</option>
            ))}
          </select>
        </div>

        {/* Filter Status and Clear */}
        {(searchTerm || organizationFilter || designationFilter) && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-800 font-medium">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <button
              onClick={() => {
                setSearchTerm("")
                setOrganizationFilter("")
                setDesignationFilter("")
              }}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Organization Error Message */}
        {orgError && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            Failed to load organizations. Organization filter may not work properly.
          </div>
        )}
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <X className="text-red-600" size={24} />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Users</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ReusableTable
            columns={columns}
            data={filteredUsers}
            emptyText="No users found matching your filters"
            minWidth="1400px"
          />
        </div>
      )}

      {/* Edit Modal */}
      <EditUserModal
        user={editingUser}
        organizations={organizations}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveEdit}
      />

      {/* Email Export Modal */}
      <EmailExportModal
        users={users}
        organizations={organizations}
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </div>
  )
}