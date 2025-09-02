import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  Building2, 
  Users, 
  Clock,
  FileText,
  Image,
  Download,
  ExternalLink,
  Edit,
  Trash2
} from "lucide-react"
import { eventService } from "../services/api/event"

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                  Delete
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
                    <DollarSign className="h-5 w-5" />
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
      </div>
    </div>
  )
}
