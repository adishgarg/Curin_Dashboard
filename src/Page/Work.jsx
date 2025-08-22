"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import {
  Edit3,
  X,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Building2,
  Briefcase,
  ChevronDown,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react"
import ReusableTable from "../components/ReusableTable"
import { taskService } from "../services/api/task"

// Constants
const DEBOUNCE_DELAY = 300
const DEFAULT_DATE_RANGE = {
  startDate: new Date(2025, 0, 15, 9, 0), // Jan 15, 2025 9:00 AM
  endDate: new Date(2025, 0, 20, 17, 30), // Jan 20, 2025 5:30 PM
}

// Status configuration
const STATUS_CONFIG = {
  active: {
    icon: Clock,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    text: "Active",
    buttonColor: "border-blue-500 bg-blue-50 text-blue-700",
  },
  completed: {
    icon: CheckCircle,
    color: "bg-green-50 text-green-700 border-green-200",
    text: "Completed",
    buttonColor: "border-green-500 bg-green-50 text-green-700",
  },
  cancelled: {
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200",
    text: "Cancelled",
    buttonColor: "border-red-500 bg-red-50 text-red-700",
  },
  remarks: {
    icon: MessageSquare,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    text: "Add Remarks",
    buttonColor: "border-yellow-500 bg-yellow-50 text-yellow-700",
  },
}

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Custom hook for tasks data management using taskService
const useTasksData = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use taskService instead of direct fetch
      const data = await taskService.getAllTasks()
      
      console.log("Tasks from service:", data) // Debug log
      
      if (Array.isArray(data)) {
        const tasksWithDates = data.map((task) => ({
          ...task,
          startDate: task.startDate || DEFAULT_DATE_RANGE.startDate,
          endDate: task.endDate || DEFAULT_DATE_RANGE.endDate,
        }))
        setTasks(tasksWithDates)
      } else {
        throw new Error("Invalid data format received from service")
      }
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err.message || "Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, ...updates } : task)))
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, refetch: fetchTasks, updateTask }
}

// Custom hook for task filtering
const useTaskFiltering = (tasks, searchTerm, statusFilter) => {
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY)

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (debouncedSearchTerm) {
      const lowerSearch = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.taskName?.toLowerCase().includes(lowerSearch) ||
          task.partnerOrganizations?.some((p) => p.name?.toLowerCase().includes(lowerSearch)) ||
          task.employeesAssigned?.some((e) => e.name?.toLowerCase().includes(lowerSearch)) ||
          task.industriesInvolved?.some((i) => i.name?.toLowerCase().includes(lowerSearch)),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    return filtered
  }, [tasks, debouncedSearchTerm, statusFilter])

  return filteredTasks
}

// Utility functions
const formatDate = (date) => {
  if (!date) return "No date set"
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return "Invalid date"
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")

  return `${day} ${month} ${year} | ${hours}:${minutes}`
}

const getStatusBadge = (status) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}
      aria-label={`Status: ${config.text}`}
    >
      <Icon size={12} aria-hidden="true" />
      {config.text}
    </span>
  )
}

export default function Work() {
  const [selectedTask, setSelectedTask] = useState(null)
  const [status, setStatus] = useState("")
  const [remarks, setRemarks] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dropdownStates, setDropdownStates] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)

  const { tasks, loading, error, refetch, updateTask } = useTasksData()
  const filteredTasks = useTaskFiltering(tasks, searchTerm, statusFilter)
  const modalRef = useRef(null)

  // Optimized dropdown toggle
  const toggleDropdown = useCallback((taskId, type) => {
    const key = `${taskId}-${type}`
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-dropdown]")) {
        setDropdownStates({})
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  // Optimized task update handler using taskService
  const handleUpdate = useCallback(
    async (taskId) => {
      if (!status) {
        alert("Please select an option")
        return
      }
      if (status === "cancelled" && !remarks.trim()) {
        alert("Remarks are required when cancelling a task")
        return
      }
      if (status === "remarks" && !remarks.trim()) {
        alert("Please add remarks")
        return
      }

      setUpdateLoading(true)
      try {
        const updateData = {
          remarks,
          modifiedBy: "AdminUser", // Replace with logged-in user
        }

        if (status === "remarks") {
          updateData.status = "active"
        } else {
          updateData.status = status
        }

        // Use taskService instead of direct fetch
        const result = await taskService.updateTask(taskId, updateData)
        
        console.log("Update result:", result) // Debug log
        
        // Update local state
        const updates = { remarks }
        if (status === "remarks") {
          updates.status = "active"
        } else {
          updates.status = status
        }
        updateTask(taskId, updates)

        setSelectedTask(null)
        setStatus("")
        setRemarks("")
        console.log("Task updated successfully")
        
      } catch (err) {
        console.error("Error updating task:", err)
        alert("Error: " + err.message)
      } finally {
        setUpdateLoading(false)
      }
    },
    [status, remarks, updateTask],
  )

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && selectedTask) {
        setSelectedTask(null)
      }
    }

    if (selectedTask) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedTask])

  // Memoized ArrayDisplay component
  const ArrayDisplay = useCallback(
    ({ items, taskId, type, icon: Icon, emptyText = "-" }) => {
      if (!items || items.length === 0) {
        return <span className="text-gray-500">{emptyText}</span>
      }

      const key = `${taskId}-${type}`
      const isOpen = dropdownStates[key]
      const displayItems = Array.isArray(items) ? items : []

      if (displayItems.length === 1) {
        const item = displayItems[0]
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icon size={14} className="text-gray-500" aria-hidden="true" />
            <span>{typeof item === "object" ? (item.name || item.label || "Unknown") : item}</span>
          </div>
        )
      }

      return (
        <div className="relative" data-dropdown>
          <button
            onClick={() => toggleDropdown(taskId, type)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Icon size={14} className="text-gray-500" aria-hidden="true" />
            <span>
              {displayItems.length} {type}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <div className="p-2 max-h-32 overflow-y-auto">
                {displayItems.map((item, index) => (
                  <div key={index} className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    {typeof item === "object" ? (item.name || item.label || "Unknown") : item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    [dropdownStates, toggleDropdown],
  )

  // Table columns configuration
  const columns = [
    {
      header: "Sr No.",
      render: (_, index) => (
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-gray-400" aria-hidden="true" />
          {index + 1}
        </div>
      ),
      className: "w-16",
    },
    {
      header: "Name",
      render: (task) => (
        <div>
          <div className="font-medium text-gray-900">{task.taskName || "Unnamed Task"}</div>
          {task.description && (
            <div className="text-sm text-gray-500 mt-1 max-w-xs truncate" title={task.description}>
              {task.description}
            </div>
          )}
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      header: "Employees",
      render: (task) => (
        <ArrayDisplay
          items={task.employeesAssigned}
          taskId={task._id}
          type="employees"
          icon={Users}
          emptyText="No employees"
        />
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Industries",
      render: (task) => (
        <ArrayDisplay
          items={task.industriesInvolved}
          taskId={task._id}
          type="industries"
          icon={Briefcase}
          emptyText="No industries"
        />
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Organizations",
      render: (task) => (
        <ArrayDisplay
          items={task.partnerOrganizations}
          taskId={task._id}
          type="organizations"
          icon={Building2}
          emptyText="No organizations"
        />
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Status",
      render: (task) => getStatusBadge(task.status),
      className: "min-w-[100px] whitespace-nowrap",
    },
    {
      header: "Remarks",
      render: (task) => (
        <div className="text-sm text-gray-700 max-w-xs">
          {task.remarks ? (
            <span className="truncate block" title={task.remarks}>
              {task.remarks}
            </span>
          ) : (
            <span className="text-gray-400 italic">No remarks</span>
          )}
        </div>
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Start Date",
      render: (task) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar size={14} className="text-green-600" aria-hidden="true" />
          <span>{formatDate(task.startDate)}</span>
        </div>
      ),
      className: "min-w-[180px]",
    },
    {
      header: "Deadline",
      render: (task) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar size={14} className="text-red-600" aria-hidden="true" />
          <span>{formatDate(task.endDate)}</span>
        </div>
      ),
      className: "min-w-[180px]",
    },
    {
      header: "Actions",
      render: (task) => (
        <button
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={() => {
            setSelectedTask(task)
            setStatus(task.status)
            setRemarks(task.remarks || "")
          }}
          aria-label={`Update task: ${task.taskName}`}
        >
          <Edit3 size={16} />
          Update
        </button>
      ),
      className: "min-w-[100px] whitespace-nowrap",
    },
  ]

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    </div>
  )

  // Error component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load tasks</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  )

  // Debug information (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log("Tasks loaded:", tasks.length)
    console.log("Filtered tasks:", filteredTasks.length)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Task Management</h1>
          <p className="text-gray-600">Monitor and update your team's progress ({tasks.length} tasks total)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks, partners, employees, or industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search tasks"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Filter Status */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-800 font-medium">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ReusableTable 
            columns={columns} 
            data={filteredTasks} 
            emptyText="No tasks found matching your filters" 
            minWidth="1400px" 
          />
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setSelectedTask(null)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                    Update Task
                  </h3>
                  <p id="modal-description" className="text-sm text-gray-600 mt-1">
                    Make changes to task status and add remarks
                  </p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all duration-200"
                  onClick={() => setSelectedTask(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Edit3 size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{selectedTask.taskName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">Current Status:</span>
                    {getStatusBadge(selectedTask.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Update Options</label>
                <div className="grid grid-cols-1 gap-3">
                  {["completed", "cancelled", "remarks"].map((statusOption) => {
                    const config = STATUS_CONFIG[statusOption]
                    const Icon = config.icon
                    return (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => setStatus(statusOption)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          status === statusOption
                            ? config.buttonColor
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        aria-pressed={status === statusOption}
                      >
                        <Icon size={20} />
                        <div className="text-left">
                          <div className="text-sm font-medium">{config.text}</div>
                          {statusOption === "remarks" && (
                            <div className="text-xs text-gray-500 mt-1">Add remarks without changing status</div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Remarks {(status === "cancelled" || status === "remarks") && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add detailed remarks about the task update..."
                    maxLength={500}
                    aria-describedby="remarks-help"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">{remarks.length}/500</div>
                </div>
                {((status === "cancelled" && !remarks.trim()) || (status === "remarks" && !remarks.trim())) && (
                  <p className="text-red-500 text-sm mt-2" role="alert">
                    {status === "cancelled" ? "Remarks are required when cancelling a task" : "Please add remarks"}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(selectedTask._id)}
                  disabled={
                    updateLoading || !status || ((status === "cancelled" || status === "remarks") && !remarks.trim())
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
