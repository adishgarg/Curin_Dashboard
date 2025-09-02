import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Calendar, User, Building2, IndianRupee, Users, Plus } from "lucide-react"
import ReusableTable from "../components/ReusableTable"
import { eventService } from "../services/api/event"

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllEvents()
  }, [])

  const fetchAllEvents = async () => {
    try {
      setLoading(true)
      console.log("Fetching events from eventService...")
      const response = await eventService.getAllEvents()
      console.log("Events response:", response)
      console.log("Events response type:", typeof response)
      console.log("Is response array?", Array.isArray(response))
      console.log("Events count:", response?.length || 0)
      
      if (Array.isArray(response)) {
        setEvents(response)
        console.log("Set events successfully:", response.length, "events")
      } else {
        console.warn("Response is not an array:", response)
        setEvents([])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to fetch events")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Status configuration for styling
  const STATUS_CONFIG = {
    planned: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      text: "Planned",
    },
    ongoing: {
      color: "bg-green-50 text-green-700 border-green-200",
      text: "Ongoing",
    },
    completed: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      text: "Completed",
    },
    cancelled: {
      color: "bg-red-50 text-red-700 border-red-200",
      text: "Cancelled",
    },
    pending: {
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      text: "Pending",
    },
  }

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Table columns configuration
  const columns = [
    {
      header: "Event",
      key: "name",
      render: (event) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{event.name}</span>
          <span className="text-sm text-gray-500">
            {event.location || "Location TBD"}
          </span>
        </div>
      ),
    },
    {
      header: "Dates",
      key: "dates",
      render: (event) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">
              From: {formatDate(event.startDate)}
            </span>
            <span className="text-sm text-gray-500">
              To: {formatDate(event.endDate)}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Organization",
      key: "organization",
      render: (event) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {event.organizations?.[0]?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Budget",
      key: "budget",
      render: (event) => (
        <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {formatCurrency(event.budget)}
          </span>
        </div>
      ),
    },
    {
      header: "Created By",
      key: "createdBy",
      render: (event) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {event.createdBy?.fullName || "Unknown"}
            </span>
            <span className="text-xs text-gray-500">
              {event.createdBy?.email || ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Employees",
      key: "employees",
      render: (event) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {event.employees?.length || 0} assigned
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (event) => (
        <button
          onClick={() => navigate(`/event/${event._id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Event
        </button>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">Error</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAllEvents}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <title>Manage Events</title>
        
        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-3 rounded text-xs mb-4">
            <strong>Debug:</strong> 
            Events loaded: {events.length}, 
            Loading: {loading.toString()}, 
            Error: {error || 'none'}
            {events.length > 0 && (
              <div className="mt-1">
                First event: {JSON.stringify({
                  id: events[0]._id,
                  name: events[0].name,
                  location: events[0].location
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-gray-600 mt-1">
              All events in the system ({events.length} total)
            </p>
          </div>
          
          {/* Create Event Button */}
          <button
            onClick={() => navigate("/create-event")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>

        {/* Events Table */}
        <ReusableTable
          columns={columns}
          data={events}
          emptyText="No events found. Create your first event!"
          minWidth="1000px"
        />
      </div>
    </div>
  )
}
