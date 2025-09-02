import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Select from "react-select"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  User, 
  Building2, 
  Users, 
  Clock,
  FileText,
  Image,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  CalendarPlus,
  DollarSign
} from "lucide-react"
import { eventService } from "../services/api/event"
import { organizationService } from "../services/api/organization"
import { employeeService } from "../services/api/employees"

// Form field wrapper with icon + label (like CreateEvent)
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

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [updating, setUpdating] = useState(false)
  
  // Dropdown options state
  const [orgOptions, setOrgOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  useEffect(() => {
    if (id) {
      fetchEventDetails()
    }
  }, [id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      console.log("Fetching event details for ID:", id)
      
      // Use the getEventById API call
      const eventDetails = await eventService.getEventById(id)
      
      if (eventDetails) {
        setEvent(eventDetails)
        console.log("Event details loaded:", eventDetails)
      } else {
        setError("Event not found")
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
      if (error.message.includes("Event not found")) {
        setError("Event not found")
      } else {
        setError("Failed to fetch event details")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch dropdown options for edit form
  const fetchDropdownOptions = async () => {
    setLoadingOptions(true)
    try {
      // Fetch organizations
      console.log("Fetching organizations...")
      const organizations = await organizationService.getAllOrganizations()
      let organizationData = []
      if (organizations && organizations.success && Array.isArray(organizations.data)) {
        organizationData = organizations.data
      } else if (Array.isArray(organizations)) {
        organizationData = organizations
      }
      
      const orgOpts = organizationData.map((org) => ({ 
        value: org._id || org.id, 
        label: org.name || org.organizationName || 'Unknown Org'
      }))
      setOrgOptions(orgOpts)

      // Fetch employees
      console.log("Fetching employees...")
      const employees = await employeeService.getAllEmployees()
      let employeeData = []
      if (Array.isArray(employees)) {
        employeeData = employees
      } else if (employees && employees.success && Array.isArray(employees.data)) {
        employeeData = employees.data
      }
      
      console.log("Sample employee data:", employeeData[0]) // Debug log to see structure
      
      const empOpts = employeeData.map((emp) => {
        // Create a more robust label with fallbacks
        const firstName = emp.firstName || emp.first_name || ''
        const lastName = emp.lastName || emp.last_name || ''
        const fullName = emp.fullName || `${firstName} ${lastName}`.trim()
        const designation = emp.designation || emp.role || emp.position || emp.title || ''
        const email = emp.email || ''
        
        // Build label with available information
        let label = fullName || email || 'Unknown User'
        if (designation) {
          label += ` - ${designation}`
        } else if (email && !fullName) {
          label = email
        } else if (email && fullName !== email) {
          label += ` (${email})`
        }
        
        return { 
          value: emp._id || emp.id, 
          label: label
        }
      })
      setEmployeeOptions(empOpts)
      
      console.log("Loaded organizations:", orgOpts.length)
      console.log("Loaded employees:", empOpts.length)
    } catch (error) {
      console.error("Error fetching dropdown options:", error)
    } finally {
      setLoadingOptions(false)
    }
  }

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Format date only
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  // Calculate event duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A"
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    } catch (error) {
      return "N/A"
    }
  }

  // Handle edit event
  const handleEditEvent = async () => {
    console.log("Current event data:", event)
    
    // Load dropdown options first
    await fetchDropdownOptions()
    
    // Format dates for input fields (YYYY-MM-DD format)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
      } catch (error) {
        return ''
      }
    }
    
    // Format time from date (HH:MM format)
    const formatTimeFromDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toTimeString().slice(0, 5) // HH:MM format
      } catch (error) {
        return ''
      }
    }

    // Map current organizations to select format
    const currentOrganizations = event.organizations?.map(org => ({
      value: org._id,
      label: org.name
    })) || []

    // Map current employees to select format
    const currentEmployees = event.employees?.map(emp => {
      const firstName = emp.firstName || emp.first_name || ''
      const lastName = emp.lastName || emp.last_name || ''
      const fullName = emp.fullName || `${firstName} ${lastName}`.trim()
      const designation = emp.designation || emp.role || emp.position || emp.title || ''
      const email = emp.email || ''
      
      let label = fullName || email || 'Unknown User'
      if (designation) {
        label += ` - ${designation}`
      } else if (email && !fullName) {
        label = email
      } else if (email && fullName !== email) {
        label += ` (${email})`
      }
      
      return {
        value: emp._id || emp.id,
        label: label
      }
    }) || []

    // Map current convener to select format
    const currentConvener = event.Conveners ? {
      value: event.Conveners._id || event.Conveners.id,
      label: (() => {
        const firstName = event.Conveners.firstName || event.Conveners.first_name || ''
        const lastName = event.Conveners.lastName || event.Conveners.last_name || ''
        const fullName = event.Conveners.fullName || `${firstName} ${lastName}`.trim()
        const designation = event.Conveners.designation || event.Conveners.role || event.Conveners.position || event.Conveners.title || ''
        const email = event.Conveners.email || ''
        
        let label = fullName || email || 'Unknown User'
        if (designation) {
          label += ` - ${designation}`
        } else if (email && !fullName) {
          label = email
        } else if (email && fullName !== email) {
          label += ` (${email})`
        }
        return label
      })()
    } : null
    
    const formData = {
      name: event.name || '',
      startDate: formatDateForInput(event.startDate),
      endDate: formatDateForInput(event.endDate),
      fromTime: formatTimeFromDate(event.startDate),
      toTime: formatTimeFromDate(event.endDate),
      location: event.location || '',
      budget: event.budget || '',
      description: event.description || '',
      organizations: currentOrganizations,
      employees: currentEmployees,
      convener: currentConvener
    }
    
    console.log("Initialized form data:", formData)
    setEditFormData(formData)
    setShowEditModal(true)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`Input changed - ${name}: ${value}`)
    
    setEditFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      }
      console.log("Updated form data:", updated)
      return updated
    })
  }

  // Handle update event
  const handleUpdateEvent = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      
      // Debug: Log the form data being sent
      console.log("Form data being sent:", editFormData)
      
      // Combine date and time for startDate and endDate
      const combineDateTime = (date, time) => {
        if (!date) return null
        if (time) {
          return new Date(`${date}T${time}:00.000Z`).toISOString()
        }
        return new Date(`${date}T00:00:00.000Z`).toISOString()
      }
      
      // Prepare the update data to match backend expectations
      const updateData = {
        name: editFormData.name,
        startDate: combineDateTime(editFormData.startDate, editFormData.fromTime),
        endDate: combineDateTime(editFormData.endDate, editFormData.toTime),
        location: editFormData.location,
        budget: parseFloat(editFormData.budget) || 0,
        description: editFormData.description
      }

      // Add organizations if selected
      if (editFormData.organizations && editFormData.organizations.length > 0) {
        updateData.organizations = editFormData.organizations.map(org => org.value)
      }

      // Add employees if selected
      if (editFormData.employees && editFormData.employees.length > 0) {
        updateData.employees = editFormData.employees.map(emp => emp.value)
      }

      // Add convener if selected
      if (editFormData.convener) {
        updateData.convener = editFormData.convener.value
      }
      
      // Remove empty fields to avoid overwriting with empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key]
        }
      })
      
      console.log("Cleaned update data:", updateData)
      
      const updatedEvent = await eventService.updateEvent(id, updateData)
      
      // Update the event state with new data
      setEvent(updatedEvent)
      
      // Show success message
      alert('Event updated successfully!')
      
      // Close modal
      setShowEditModal(false)
      
      // Refresh the page data
      await fetchEventDetails()
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // Handle delete event
  const handleDeleteEvent = async () => {
    try {
      setDeleting(true)
      const response = await eventService.deleteEvent(id)
      
      console.log("Delete response:", response)
      
      // Show success message
      alert('Event deleted successfully!')
      
      // Navigate back to events list
      navigate('/events')
    } catch (error) {
      console.error('Error deleting event:', error)
      
      // Handle specific backend errors
      if (error.message?.includes('event.remove is not a function')) {
        alert('Backend error: The delete function needs to be updated. Please contact the administrator.')
      } else if (error.message?.includes('Failed to delete event')) {
        alert('Failed to delete event. There might be a backend configuration issue.')
      } else {
        alert('Failed to delete event. Please try again.')
      }
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Confirm delete
  const confirmDelete = () => {
    setShowDeleteModal(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/events")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Events
              </button>
              <button
                onClick={fetchEventDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No event found
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-600 text-lg font-medium mb-2">Event Not Found</div>
            <p className="text-gray-500 mb-4">The event you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <title>{event.name} - Event Details</title>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Event Header */}
          <div className="bg-black text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{event.name}</h1>
                <div className="flex items-center gap-2 text-green-100">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={handleEditEvent}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6">
            {/* Date and Duration Info */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-blue-600 font-medium">Start Date</div>
                    <div className="text-gray-900">{formatDate(event.startDate)}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-green-600 font-medium">End Date</div>
                    <div className="text-gray-900">{formatDate(event.endDate)}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-purple-600 font-medium">Duration</div>
                    <div className="text-gray-900">{calculateDuration(event.startDate, event.endDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description
                  </h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                    {event.description || "No description available"}
                  </p>
                </div>

                {/* Budget */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Budget
                  </h3>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(event.budget)}
                  </div>
                </div>

                {/* Created By */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Created By
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-900">
                      {event.createdBy?.fullName || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.createdBy?.email || "No email"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {formatDateTime(event.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Organization */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Organization
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {event.organizations?.length > 0 ? (
                      event.organizations.map((org, index) => (
                        <div key={index} className="font-medium text-gray-900">
                          {org.name}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No organization specified</div>
                    )}
                  </div>
                </div>

                {/* Assigned Employees */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Employees ({event.employees?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {event.employees?.length > 0 ? (
                      event.employees.map((employee, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900">
                            {employee.fullName || "Unknown Employee"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 bg-gray-50 rounded-lg p-3">
                        No employees assigned
                      </div>
                    )}
                  </div>
                </div>

                {/* Convener */}
                {event.Conveners && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Convener
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">
                        {event.Conveners.fullName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.Conveners.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Poster */}
            {event.poster?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Event Poster
                </h3>
                <div className="grid gap-4">
                  {event.poster.map((poster, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {poster.originalName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {poster.mimetype} • {(poster.size / 1024).toFixed(1)} KB
                            </div>
                            <div className="text-xs text-gray-400">
                              Uploaded: {formatDateTime(poster.uploadedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={poster.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </a>
                          <a
                            href={poster.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 bg-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Debug Information</h4>
                <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{event.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-black text-white p-6">
                <div className="flex items-center gap-3">
                  <Edit className="h-6 w-6" />
                  <div>
                    <h3 className="text-xl font-bold">Edit Event</h3>
                    <p className="text-green-100 text-sm">Update event details</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <form onSubmit={handleUpdateEvent} className="space-y-6">
                  {/* Event Name */}
                  <FormField label="Event Name" icon={CalendarPlus} required>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </FormField>

                  {/* Date Range */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Start Date" icon={Calendar} required>
                      <input
                        type="date"
                        name="startDate"
                        value={editFormData.startDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </FormField>
                    <FormField label="End Date" icon={Calendar} required>
                      <input
                        type="date"
                        name="endDate"
                        value={editFormData.endDate || ''}
                        onChange={handleInputChange}
                        min={editFormData.startDate}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </FormField>
                  </div>

                  {/* Time Range */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Start Time" icon={Clock}>
                      <input
                        type="time"
                        name="fromTime"
                        value={editFormData.fromTime || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormField>
                    <FormField label="End Time" icon={Clock}>
                      <input
                        type="time"
                        name="toTime"
                        value={editFormData.toTime || ''}
                        onChange={handleInputChange}
                        min={editFormData.fromTime}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormField>
                  </div>

                  {/* Location */}
                  <FormField label="Location" icon={MapPin} required>
                    <input
                      type="text"
                      name="location"
                      value={editFormData.location || ''}
                      onChange={handleInputChange}
                      placeholder="Enter event location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </FormField>

                  {/* Organizations */}
                  <FormField label="Organizations" icon={Building2}>
                    <Select
                      isMulti
                      options={orgOptions}
                      value={editFormData.organizations || []}
                      onChange={(opts) => setEditFormData(prev => ({ ...prev, organizations: opts || [] }))}
                      placeholder={loadingOptions ? "Loading organizations..." : "Select organizations"}
                      isDisabled={loadingOptions}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isLoading={loadingOptions}
                    />
                  </FormField>

                  {/* Employees */}
                  <FormField label="Assigned Employees" icon={Users}>
                    <Select
                      isMulti
                      options={employeeOptions}
                      value={editFormData.employees || []}
                      onChange={(opts) => setEditFormData(prev => ({ ...prev, employees: opts || [] }))}
                      placeholder={loadingOptions ? "Loading employees..." : "Select employees"}
                      isDisabled={loadingOptions}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isLoading={loadingOptions}
                    />
                  </FormField>

                  {/* Convener */}
                  <FormField label="Convener" icon={User}>
                    <Select
                      options={employeeOptions}
                      value={editFormData.convener || null}
                      onChange={(opt) => setEditFormData(prev => ({ ...prev, convener: opt }))}
                      placeholder={loadingOptions ? "Loading conveners..." : "Select convener"}
                      isDisabled={loadingOptions}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isLoading={loadingOptions}
                      isClearable
                    />
                  </FormField>

                  {/* Description */}
                  <FormField label="Description" icon={FileText}>
                    <textarea
                      name="description"
                      value={editFormData.description || ''}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter event description"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>

                  {/* Budget */}
                  <FormField label="Budget" icon={IndianRupee}>
                    <input
                      type="number"
                      name="budget"
                      value={editFormData.budget || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Enter budget amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>

                  {/* Form Actions */}
                  <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      disabled={updating}
                      className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4" />
                          Update Event
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
