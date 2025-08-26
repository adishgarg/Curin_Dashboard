import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Calendar, User, Building2, Briefcase } from "lucide-react"
import ReusableTable from "../components/ReusableTable"
import { taskService } from "../services/api/task"

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyTasks()
  }, [])

  const fetchMyTasks = async () => {
    try {
      setLoading(true)
      const response = await taskService.getAssignedToMeTasks()
      console.log("My tasks response:", response)
      setTasks(response || [])
    } catch (error) {
      console.error("Error fetching my tasks:", error)
      setError("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  // Status configuration for styling
  const STATUS_CONFIG = {
    pending: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      text: "Pending",
    },
    "in-progress": {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      text: "In Progress",
    },
    completed: {
      color: "bg-green-50 text-green-700 border-green-200",
      text: "Completed",
    },
    cancelled: {
      color: "bg-red-50 text-red-700 border-red-200",
      text: "Cancelled",
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

  // Table columns configuration
  const columns = [
    {
      header: "Task",
      key: "taskName",
      render: (task) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{task.taskName}</span>
          <span className="text-sm text-gray-500 truncate max-w-xs">
            {task.description}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (task) => {
        const statusConfig = getStatusConfig(task.status)
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
          >
            {statusConfig.text}
          </span>
        )
      },
    },
    {
      header: "Created By",
      key: "createdBy",
      render: (task) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {task.createdBy?.name || "Unknown"}
            </span>
            <span className="text-xs text-gray-500">
              {task.createdBy?.email || ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Dates",
      key: "dates",
      render: (task) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">
              Start: {formatDate(task.startDate)}
            </span>
            <span className="text-sm text-gray-500">
              End: {formatDate(task.endDate)}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Organization",
      key: "organization",
      render: (task) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {task.partnerOrganizations?.[0]?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Industry",
      key: "industry",
      render: (task) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {task.industriesInvolved?.[0]?.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (task) => (
        <button
          onClick={() => navigate(`/Task/${task.id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Task
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
              onClick={fetchMyTasks}
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
      <title>My Tasks</title>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            Tasks assigned to you ({tasks.length} total)
          </p>
        </div>

        {/* Tasks Table */}
        <ReusableTable
          columns={columns}
          data={tasks}
          emptyText="No tasks assigned to you yet"
          minWidth="1200px"
        />
      </div>
    </div>
  )
}
