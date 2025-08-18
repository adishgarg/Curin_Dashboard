"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"

export default function Work() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [status, setStatus] = useState("")
  const [remarks, setRemarks] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dropdownStates, setDropdownStates] = useState({})

  // Fetch tasks from backend
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("https://curin-backend.onrender.com/api/tasks/")
        const data = await res.json()
        if (data.status === "success") {
          const tasksWithDates = data.data.tasks.map((task) => ({
            ...task,
            startDate: task.startDate || new Date(2025, 0, 15, 9, 0), // Jan 15, 2025 9:00 AM
            endDate: task.endDate || new Date(2025, 0, 20, 17, 30), // Jan 20, 2025 5:30 PM
          }))
          setTasks(tasksWithDates)
        }
      } catch (err) {
        console.error("Error fetching tasks:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const formatDate = (date) => {
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = d.getDate()
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, "0")
    const minutes = d.getMinutes().toString().padStart(2, "0")

    return `${day} ${month} ${year} | ${hours}:${minutes}`
  }

  const toggleDropdown = (taskId, type) => {
    const key = `${taskId}-${type}`
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const ArrayDisplay = ({ items, taskId, type, icon: Icon, emptyText = "-" }) => {
    if (!items || items.length === 0) return <span className="text-gray-500">{emptyText}</span>

    const key = `${taskId}-${type}`
    const isOpen = dropdownStates[key]
    const displayItems = Array.isArray(items) ? items : []

    if (displayItems.length === 1) {
      const item = displayItems[0]
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Icon size={14} className="text-gray-500" />
          <span>{typeof item === "object" ? item.name : item}</span>
        </div>
      )
    }

    return (
      <div className="relative">
        <button
          onClick={() => toggleDropdown(taskId, type)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Icon size={14} className="text-gray-500" />
          <span>
            {displayItems.length} {type}
          </span>
          <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
            <div className="p-2 max-h-32 overflow-y-auto">
              {displayItems.map((item, index) => (
                <div key={index} className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                  {typeof item === "object" ? item.name : item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Handle update
  async function handleUpdate(taskId) {
    if (!status) {
      alert("Please select status")
      return
    }
    if (status === "cancelled" && !remarks.trim()) {
      alert("Remarks are required when cancelling a task")
      return
    }

    try {
      const res = await fetch(`https://curin-backend.onrender.com/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          remarks,
          modifiedBy: "AdminUser", // Replace with logged-in user
        }),
      })

      const result = await res.json()
      if (result.status === "success") {
        alert("Task updated successfully")
        setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status, remarks } : t)))
        setSelectedTask(null)
        setStatus("")
        setRemarks("")
      } else {
        alert("Error: " + result.message)
      }
    } catch (err) {
      console.error("Error updating task:", err)
    }
  }

  useEffect(() => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.partnerOrganizations?.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          task.employeesAssigned?.some((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    )

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { icon: Clock, color: "bg-blue-50 text-blue-700 border-blue-200", text: "Active" },
      completed: { icon: CheckCircle, color: "bg-green-50 text-green-700 border-green-200", text: "Completed" },
      cancelled: { icon: XCircle, color: "bg-red-50 text-red-700 border-red-200", text: "Cancelled" },
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}
      >
        <Icon size={12} />
        {config.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Task Management</h1>
          <p className="text-gray-600">Monitor and update your team's progress</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks, partners, or employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Sr No.
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Name
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Employees
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Industries
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Organizations
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Remarks
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Start Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Deadline
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task, index) => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-gray-400" />
                        {index + 1}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{task.taskName}</div>
                      {task.remarks && (
                        <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">{task.description}</div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <ArrayDisplay
                        items={task.employeesAssigned}
                        taskId={task._id}
                        type="employees"
                        icon={Users}
                        emptyText="No employees"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <ArrayDisplay
                        items={task.industriesInvolved}
                        taskId={task._id}
                        type="industries"
                        icon={Briefcase}
                        emptyText="No industries"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <ArrayDisplay
                        items={task.partnerOrganizations}
                        taskId={task._id}
                        type="organizations"
                        icon={Building2}
                        emptyText="No organizations"
                      />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(task.status)}</td>

                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {task.remarks ? (
                          <span className="truncate block" title={task.remarks}>
                            {task.remarks}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No remarks</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar size={14} className="text-green-600" />
                        <span>{formatDate(task.startDate)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar size={14} className="text-red-600" />
                        <span>{formatDate(task.endDate)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => {
                          setSelectedTask(task)
                          setStatus(task.status)
                          setRemarks(task.remarks || "")
                        }}
                      >
                        <Edit3 size={16} />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500">No tasks found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Update Task</h3>
                  <p className="text-sm text-gray-600 mt-1">Make changes to task status and add remarks</p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all duration-200"
                  onClick={() => setSelectedTask(null)}
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">Update Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStatus("completed")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      status === "completed"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <CheckCircle size={20} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">Completed</span>
                  </button>
                  <button
                    onClick={() => setStatus("cancelled")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      status === "cancelled"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                    }`}
                  >
                    <XCircle size={20} className="mx-auto mb-2" />
                    <span className="text-sm font-medium">Cancelled</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Remarks {status === "cancelled" && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add detailed remarks about the task update..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">{remarks.length}/500</div>
                </div>
                {status === "cancelled" && !remarks.trim() && (
                  <p className="text-red-500 text-sm mt-2">Remarks are required when cancelling a task</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(selectedTask._id)}
                  disabled={!status || (status === "cancelled" && !remarks.trim())}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
