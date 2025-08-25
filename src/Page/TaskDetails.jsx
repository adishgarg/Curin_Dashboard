import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Edit3,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Building2,
  Briefcase,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
  MessageSquare,
  FileText,
  MapPin,
  Download,
  File,
  ExternalLink,
} from "lucide-react"
import { taskService } from "../services/api/task"

// Status configuration
const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "bg-gray-50 text-gray-700 border-gray-200",
    text: "Pending",
    buttonColor: "border-gray-500 bg-gray-50 text-gray-700",
  },
  "in-progress": {
    icon: Clock,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    text: "In Progress",
    buttonColor: "border-blue-500 bg-blue-50 text-blue-700",
  },
  "In Progress": {
    icon: Clock,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    text: "In Progress",
    buttonColor: "border-blue-500 bg-blue-50 text-blue-700",
  },
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
  "on-hold": {
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200",
    text: "On Hold",
    buttonColor: "border-red-500 bg-red-50 text-red-700",
  },
  cancelled: {
    icon: XCircle,
    color: "bg-gray-50 text-gray-700 border-gray-300",
    text: "Cancelled",
    buttonColor: "border-gray-500 bg-gray-50 text-gray-700",
  },
}

export default function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [status, setStatus] = useState("")
  const [remarks, setRemarks] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  
  const modalRef = useRef(null)

  // Fetch task details
  const fetchTask = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching task with ID:", id);
      const taskData = await taskService.getTaskById(id)
      console.log("Fetched task data:", taskData) // Debug log
      
      if (!taskData) {
        throw new Error("No task data received")
      }
      
      setTask(taskData)
    } catch (err) {
      console.error("Error fetching task:", err)
      setError("Failed to load task details")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  // Handle update task
  const handleUpdate = useCallback(async (taskId, status, remarks) => {
    if (!taskId || updateLoading) return

    try {
      setUpdateLoading(true)
      
      const updateData = {
        remarks: remarks || "",
      }
      
      if (status === "active") {
        updateData.status = "active"
      } else if (status) {
        updateData.status = status
      }
      
      console.log("Updating task with data:", updateData) // Debug log
      const result = await taskService.updateTask(taskId, updateData)
      console.log("Update result:", result)
      
      // Update local state - handle remarks array
      setTask(prev => {
        const updatedTask = {
          ...prev,
          status: status === "active" ? "active" : status || prev.status
        }
        
        // If we have new remarks, add it to the remarks array
        if (remarks && remarks.trim()) {
          const newRemark = {
            text: remarks,
            createdAt: new Date().toISOString(),
            files: [],
            _id: Date.now().toString() // Temporary ID
          }
          updatedTask.remarks = [...(prev.remarks || []), newRemark]
        }
        
        return updatedTask
      })
      
      setShowUpdateModal(false)
      setStatus("")
      setRemarks("")
      
    } catch (err) {
      console.error("Error updating task:", err)
      alert("Failed to update task. Please try again.")
    } finally {
      setUpdateLoading(false)
    }
  }, [updateLoading])

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowUpdateModal(false)
      }
    }

    if (showUpdateModal) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUpdateModal])

  // Get status configuration
  const getStatusConfig = (status) => {
    if (!status) return STATUS_CONFIG.pending
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
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="text-lg text-gray-600">Loading task details...</span>
      </div>
    </div>
  )

  // Error component
  const ErrorMessage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <div className="flex gap-4">
        <button
          onClick={fetchTask}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate("/work-progress")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Tasks
        </button>
      </div>
    </div>
  )

  if (loading) return <LoadingSpinner />
  if (error || !task) return <ErrorMessage />

  const statusConfig = getStatusConfig(task?.status)
  const StatusIcon = statusConfig?.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/work-progress")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Tasks
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
          </div>
          <button
            onClick={() => {
              setStatus(task.status)
              // For remarks, use empty string for new remark input
              setRemarks("")
              setShowUpdateModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Edit3 size={16} />
            Update Task
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.taskName}</h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}
                    >
                      <StatusIcon size={16} />
                      {statusConfig.text}
                    </span>
                    
                  </div>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Remarks */}
              {task.remarks && task.remarks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h3>
                  <div className="space-y-3">
                    {task.remarks.map((remark, index) => (
                      <div key={remark._id || index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 mb-2">{remark.text}</p>
                        {remark.createdAt && (
                          <p className="text-xs text-gray-500">
                            {formatDate(remark.createdAt)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Files Section */}
            {task.files && task.files.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attached Files</h3>
                <div className="space-y-3">
                  {task.files.map((file, index) => (
                    <div key={file._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {file.mimetype} • {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                          >
                            <ExternalLink size={12} />
                            View
                          </a>
                        )}
                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 border border-green-200 rounded hover:bg-green-50 transition-colors"
                          >
                            <Download size={12} />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Meta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Task ID</p>
                    <p className="text-sm text-gray-600">{task.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(task.createdAt)}</p>
                  </div>
                </div>

                {task.updatedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">{formatDate(task.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {(task.startDate || task.endDate) && (
                  <>
                    {task.startDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Start Date</p>
                          <p className="text-sm text-gray-600">{formatDate(task.startDate)}</p>
                        </div>
                      </div>
                    )}

                    {task.endDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">End Date</p>
                          <p className="text-sm text-gray-600">{formatDate(task.endDate)}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Assignment Info */}
            {(task.employeesAssigned?.length > 0 || task.partnerOrganizations?.length > 0 || task.industriesInvolved?.length > 0 || task.createdBy) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
                <div className="space-y-4">
                  {task.createdBy && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created By</p>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">{task.createdBy.name || 'Unknown Name'}</div>
                          <div className="text-gray-500">{task.createdBy.email || 'No email'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {task.employeesAssigned?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Assigned To</p>
                        <div className="text-sm text-gray-600">
                          {task.employeesAssigned.map((employee, index) => (
                            <div key={employee.id || index} className="mt-1">
                              <div className="font-medium">{employee.name || 'Unknown Name'}</div>
                              <div className="text-gray-500">{employee.email || 'No email'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {task.partnerOrganizations?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Partner Organizations</p>
                        <div className="text-sm text-gray-600">
                          {task.partnerOrganizations.map((org, index) => (
                            <div key={org.id || index} className="mt-1">
                              {org.name || `Organization ID: ${org.id}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {task.industriesInvolved?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Industries Involved</p>
                        <div className="text-sm text-gray-600">
                          {task.industriesInvolved.map((industry, index) => (
                            <div key={industry.id || index} className="mt-1">
                              {industry.name || `Industry ID: ${industry.id}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Update Task</h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Remark</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                  placeholder="Add your new remark here..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(task.id, status, remarks)}
                disabled={updateLoading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Task"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
