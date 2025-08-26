import { useState, useEffect, useMemo, useRef } from "react"
import { Calendar, Clock, CheckCircle, XCircle, Users, Building2, Briefcase, Filter, RefreshCw, Eye, Download, FileImage, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { taskService } from "../services/api/task"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { format, addDays, differenceInDays, startOfDay, endOfDay } from "date-fns"

// Status configuration
const STATUS_CONFIG = {
  pending: {
    color: "#6b7280",
    bgColor: "#f3f4f6",
    text: "Pending",
  },
  "in-progress": {
    color: "#3b82f6",
    bgColor: "#dbeafe",
    text: "In Progress",
  },
  active: {
    color: "#3b82f6",
    bgColor: "#dbeafe",
    text: "Active",
  },
  completed: {
    color: "#10b981",
    bgColor: "#d1fae5",
    text: "Completed",
  },
  cancelled: {
    color: "#ef4444",
    bgColor: "#fee2e2",
    text: "Cancelled",
  },
}

// Utility functions
const formatDate = (date) => {
  if (!date) return "No date"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "Invalid date"
  
  return format(d, "MMM dd, yyyy")
}

const formatDateShort = (date) => {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""
  
  return format(d, "M/d")
}

const getDateRange = (tasks) => {
  if (!tasks || tasks.length === 0) {
    const now = new Date()
    return { 
      start: startOfDay(addDays(now, -30)), 
      end: endOfDay(addDays(now, 60)) 
    }
  }
  
  const dates = tasks.flatMap(task => [
    new Date(task.startDate),
    new Date(task.endDate)
  ]).filter(date => !isNaN(date.getTime()))
  
  if (dates.length === 0) {
    const now = new Date()
    return { 
      start: startOfDay(addDays(now, -30)), 
      end: endOfDay(addDays(now, 60)) 
    }
  }
  
  const start = new Date(Math.min(...dates))
  const end = new Date(Math.max(...dates))
  
  return { 
    start: startOfDay(addDays(start, -7)), 
    end: endOfDay(addDays(end, 14)) 
  }
}

const generateTimelineColumns = (startDate, endDate) => {
  const columns = []
  const totalDays = differenceInDays(endDate, startDate)
  const dayWidth = Math.max(30, Math.min(50, 1200 / totalDays)) // Responsive day width
  
  for (let i = 0; i <= totalDays; i++) {
    const currentDate = addDays(startDate, i)
    columns.push({
      date: currentDate,
      dayOfWeek: currentDate.getDay(),
      width: dayWidth,
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      isToday: format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    })
  }
  
  return columns
}

const calculateTaskBar = (task, startDate, endDate, dayWidth) => {
  const taskStart = new Date(task.startDate)
  const taskEnd = new Date(task.endDate)
  
  const startDayOffset = Math.max(0, differenceInDays(taskStart, startDate))
  const endDayOffset = Math.min(differenceInDays(endDate, startDate), differenceInDays(taskEnd, startDate))
  const duration = Math.max(1, endDayOffset - startDayOffset + 1)
  
  return {
    left: startDayOffset * dayWidth,
    width: duration * dayWidth,
    startDayOffset,
    duration
  }
}

const ProfessionalGanttChart = ({ tasks, onTaskClick, onDownload }) => {
  const navigate = useNavigate()
  const chartRef = useRef(null)
  const dateRange = useMemo(() => getDateRange(tasks), [tasks])
  const timelineColumns = useMemo(() => generateTimelineColumns(dateRange.start, dateRange.end), [dateRange])
  const dayWidth = timelineColumns[0]?.width || 40
  
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks to Display</h3>
        <p className="text-gray-600">There are no tasks available to show in the Gantt chart.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-gantt-chart>
      {/* Chart Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Project Gantt Chart</h3>
            <p className="text-sm text-gray-600 mb-2">
              Timeline: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {tasks.length} Tasks
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {differenceInDays(dateRange.end, dateRange.start)} Days
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onDownload('png')}
              disabled={!tasks.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <FileImage className="h-4 w-4" />
              Export PNG
            </button>
            <button
              onClick={() => onDownload('pdf')}
              disabled={!tasks.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div 
        data-gantt-chart 
        className="overflow-x-auto bg-white" 
        style={{ maxHeight: '80vh' }}
      >
        <div style={{ minWidth: `${420 + timelineColumns.length * dayWidth}px` }}>
          
          {/* Timeline Header - Month/Week Overview */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-20">
            <div className="flex">
              {/* Task Column Header */}
              <div className="w-96 p-4 font-bold text-gray-900 border-r-2 border-gray-400 bg-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span>Task Information</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Duration & Status
                  </div>
                </div>
              </div>
              
              {/* Month Headers */}
              <div className="flex">
                {(() => {
                  const monthGroups = {}
                  timelineColumns.forEach((col, index) => {
                    const monthKey = format(col.date, 'yyyy-MM')
                    if (!monthGroups[monthKey]) {
                      monthGroups[monthKey] = { start: index, count: 0, date: col.date }
                    }
                    monthGroups[monthKey].count++
                  })
                  
                  return Object.values(monthGroups).map((month, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${month.count * dayWidth}px` }}
                      className="bg-blue-100 border-r border-blue-300 p-2 text-center font-semibold text-blue-800 text-sm"
                    >
                      {format(month.date, 'MMMM yyyy')}
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
          
          {/* Day Headers */}
          <div className="flex border-b-2 border-gray-300 bg-gray-50 sticky top-16 z-10">
            {/* Task Column Subheader */}
            <div className="w-96 p-2 text-sm font-medium text-gray-700 border-r-2 border-gray-300 bg-gray-100">
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span>Name</span>
                <span>Team</span>
                <span>Progress</span>
              </div>
            </div>
            
            {/* Date Headers */}
            <div className="flex">
              {timelineColumns.map((col, index) => (
                <div
                  key={index}
                  style={{ width: `${col.width}px` }}
                  className={`
                    border-r border-gray-200 p-1 text-center text-xs font-medium min-h-[60px] flex flex-col justify-center
                    ${col.isWeekend ? 'bg-red-50 text-red-600' : 'bg-white text-gray-700'}
                    ${col.isToday ? 'bg-yellow-100 text-yellow-800 font-bold border-yellow-400' : ''}
                  `}
                >
                  <div className="font-semibold">
                    {format(col.date, 'dd')}
                  </div>
                  <div className="text-xs opacity-75">
                    {format(col.date, 'EEE')}
                  </div>
                  {col.isToday && (
                    <div className="text-xs font-bold text-yellow-700">
                      TODAY
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-200">
            {tasks.map((task, taskIndex) => {
              const taskBar = calculateTaskBar(task, dateRange.start, dateRange.end, dayWidth)
              const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.active
              const progressPercentage = task.status === 'completed' ? 100 : 
                                       task.status === 'in-progress' || task.status === 'active' ? 65 : 
                                       task.status === 'cancelled' ? 0 : 25
              const taskDuration = differenceInDays(new Date(task.endDate), new Date(task.startDate)) + 1
              
              return (
                <div key={task.id || taskIndex} className="flex hover:bg-blue-50 transition-colors group">
                  {/* Enhanced Task Information Column */}
                  <div className="w-96 p-4 border-r-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="space-y-3">
                      {/* Task Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-blue-700">
                            #{taskIndex + 1} {task.taskName || `Task ${taskIndex + 1}`}
                          </h4>
                          
                          {/* Task Metrics */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Users className="h-3 w-3" />
                                <span className="font-medium">{task.employeesAssigned?.length || 0} People</span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-green-600">
                                <Calendar className="h-3 w-3" />
                                <span className="font-medium">{taskDuration} Days</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              {task.partnerOrganizations?.[0]?.name && (
                                <div className="flex items-center gap-1 text-purple-600">
                                  <Building2 className="h-3 w-3" />
                                  <span className="font-medium truncate">{task.partnerOrganizations[0].name}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1 text-orange-600">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{progressPercentage}% Complete</span>
                              </div>
                              
                              {/* Progress Status Remarks */}
                              {(() => {
                                const today = new Date()
                                const taskStart = new Date(task.startDate)
                                const taskEnd = new Date(task.endDate)
                                const totalDays = differenceInDays(taskEnd, taskStart) + 1
                                const daysPassed = Math.max(0, differenceInDays(today, taskStart) + 1)
                                const expectedProgress = Math.min(100, (daysPassed / totalDays) * 100)
                                
                                let remarkColor = 'text-gray-600'
                                let remarkText = 'On Track'
                                let remarkIcon = '✓'
                                
                                if (task.status === 'completed') {
                                  remarkColor = 'text-green-600'
                                  remarkText = 'Completed Successfully'
                                  remarkIcon = '✅'
                                } else if (task.status === 'cancelled') {
                                  remarkColor = 'text-red-600'
                                  remarkText = 'Task Cancelled'
                                  remarkIcon = '❌'
                                } else if (today > taskEnd && progressPercentage < 100) {
                                  remarkColor = 'text-red-600'
                                  remarkText = 'Overdue'
                                  remarkIcon = '⚠️'
                                } else if (progressPercentage < expectedProgress - 10) {
                                  remarkColor = 'text-red-600'
                                  remarkText = 'Behind Schedule'
                                  remarkIcon = '🔴'
                                } else if (progressPercentage > expectedProgress + 10) {
                                  remarkColor = 'text-green-600'
                                  remarkText = 'Ahead of Schedule'
                                  remarkIcon = '🟢'
                                } else if (today >= taskStart && today <= taskEnd) {
                                  remarkColor = 'text-blue-600'
                                  remarkText = 'In Progress'
                                  remarkIcon = '🔄'
                                } else if (today < taskStart) {
                                  remarkColor = 'text-gray-600'
                                  remarkText = 'Not Started'
                                  remarkIcon = '⏳'
                                }
                                
                                return (
                                  <div className={`flex items-center gap-1 ${remarkColor} text-xs font-semibold`}>
                                    <span>{remarkIcon}</span>
                                    <span>{remarkText}</span>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                          
                          {/* Date Range */}
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">
                                Start: {formatDateShort(task.startDate)}
                              </span>
                              <span className="text-red-700 font-medium">
                                End: {formatDateShort(task.endDate)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                              style={{
                                backgroundColor: statusConfig.bgColor,
                                color: statusConfig.color,
                                borderColor: statusConfig.color,
                              }}
                            >
                              {statusConfig.text}
                            </span>
                            
                            <button
                              onClick={() => navigate(`/Task/${task.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              title="View Task Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Timeline Column */}
                  <div className="relative flex bg-white">
                    {/* Timeline Grid Background */}
                    {timelineColumns.map((col, colIndex) => (
                      <div
                        key={colIndex}
                        style={{ width: `${col.width}px` }}
                        className={`
                          border-r border-gray-200 h-32 relative
                          ${col.isWeekend ? 'bg-red-50' : 'bg-white'}
                          ${col.isToday ? 'bg-yellow-100 border-yellow-400 border-r-2' : ''}
                        `}
                      >
                        {/* Today Indicator Line */}
                        {col.isToday && (
                          <div className="absolute inset-y-0 left-1/2 w-1 bg-yellow-500 z-30 shadow-sm"></div>
                        )}
                        
                        {/* Weekend Pattern */}
                        {col.isWeekend && (
                          <div className="absolute inset-0 opacity-20">
                            <div className="w-full h-full" style={{
                              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(239, 68, 68, 0.1) 2px, rgba(239, 68, 68, 0.1) 4px)'
                            }}></div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Enhanced Task Bar */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 rounded-lg shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 z-20 group-hover:z-30"
                      style={{
                        left: `${taskBar.left + 4}px`,
                        width: `${Math.max(taskBar.width - 8, 30)}px`,
                        height: '48px',
                        backgroundColor: statusConfig.color,
                        borderColor: statusConfig.color,
                      }}
                      onClick={() => navigate(`/Task/${task.id}`)}
                      title={`${task.taskName}\nDuration: ${taskDuration} days\nProgress: ${progressPercentage}%\nClick to view details`}
                    >
                      {/* Progress Indicator */}
                      <div className="relative h-full overflow-hidden rounded-md">
                        {/* Progress Background */}
                        <div className="h-full bg-gray-200 opacity-30"></div>
                        
                        {/* Progress Fill */}
                        <div
                          className="absolute top-0 left-0 h-full transition-all duration-500 ease-in-out"
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: progressPercentage === 100 ? '#10b981' : 
                                           progressPercentage >= 75 ? '#3b82f6' :
                                           progressPercentage >= 50 ? '#f59e0b' :
                                           progressPercentage >= 25 ? '#f97316' : '#ef4444'
                          }}
                        ></div>
                        
                        {/* Progress Stripes for Active Tasks */}
                        {(task.status === 'in-progress' || task.status === 'active') && (
                          <div 
                            className="absolute top-0 left-0 h-full opacity-20 animate-pulse"
                            style={{ 
                              width: `${progressPercentage}%`,
                              background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)'
                            }}
                          ></div>
                        )}
                        
                        {/* Task Label */}
                        <div className="absolute inset-0 flex items-center justify-center px-2">
                          <span className="text-white text-xs font-bold truncate text-center drop-shadow-md">
                            {taskBar.width > 60 ? task.taskName : `#${taskIndex + 1}`}
                          </span>
                        </div>
                        
                        {/* Progress Percentage Badge */}
                        {taskBar.width > 40 && (
                          <div className="absolute top-1 right-1 bg-white bg-opacity-95 text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm border">
                            {progressPercentage}%
                          </div>
                        )}
                        
                        {/* Progress Milestone Markers */}
                        {[25, 50, 75].map(milestone => (
                          <div
                            key={milestone}
                            className={`absolute top-0 h-full w-0.5 ${
                              progressPercentage >= milestone ? 'bg-green-400' : 'bg-gray-300'
                            } opacity-60`}
                            style={{ left: `${milestone}%` }}
                            title={`${milestone}% Milestone`}
                          ></div>
                        ))}
                        
                        {/* Today's Progress Indicator */}
                        {(() => {
                          const today = new Date()
                          const taskStart = new Date(task.startDate)
                          const taskEnd = new Date(task.endDate)
                          
                          if (today >= taskStart && today <= taskEnd) {
                            const totalDays = differenceInDays(taskEnd, taskStart) + 1
                            const daysPassed = differenceInDays(today, taskStart) + 1
                            const expectedProgress = Math.min(100, (daysPassed / totalDays) * 100)
                            
                            return (
                              <div
                                className="absolute top-0 h-full w-1 bg-yellow-400 opacity-80 shadow-lg"
                                style={{ left: `${expectedProgress}%` }}
                                title={`Today's Expected Progress: ${Math.round(expectedProgress)}%`}
                              >
                                <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-md"></div>
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Footer with Legends and Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300 p-6">
        <div className="space-y-4">
          {/* Status Legend */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Task Status Legend:</h4>
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border-2"
                    style={{ backgroundColor: config.color, borderColor: config.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{config.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline Legend */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Timeline & Progress Indicators:</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400" />
                <span className="text-sm text-gray-700">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200" />
                <span className="text-sm text-gray-700">Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-yellow-400 rounded" />
                <span className="text-sm text-gray-700">Today's Expected Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-green-400 rounded" />
                <span className="text-sm text-gray-700">Progress Milestones (25%, 50%, 75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-gradient-to-r from-red-500 to-green-500 rounded" />
                <span className="text-sm text-gray-700">Progress Bar (Red=Low, Green=Complete)</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">Click to view details</span>
              </div>
            </div>
          </div>
          
          {/* Progress Remarks Legend */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Progress Status Remarks:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span className="text-green-600 font-semibold">Completed Successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🟢</span>
                <span className="text-green-600 font-semibold">Ahead of Schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span className="text-gray-600 font-semibold">On Track</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span className="text-blue-600 font-semibold">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔴</span>
                <span className="text-red-600 font-semibold">Behind Schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-red-600 font-semibold">Overdue</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏳</span>
                <span className="text-gray-600 font-semibold">Not Started</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❌</span>
                <span className="text-red-600 font-semibold">Task Cancelled</span>
              </div>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-300">
            <div className="text-sm text-gray-600">
              <strong>Chart Summary:</strong> {tasks.length} tasks spanning {differenceInDays(dateRange.end, dateRange.start)} days
            </div>
            <div className="text-xs text-gray-500">
              Hover over tasks for details • Click task bars to open • Export options available above
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default function OverallProgress() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [downloading, setDownloading] = useState(false)
  const navigate = useNavigate()
  const chartRef = useRef(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await taskService.getAllTasks()
      console.log("Overall progress tasks:", response)
      
      if (Array.isArray(response)) {
        const tasksWithDates = response.map((task) => ({
          ...task,
          startDate: task.startDate ? new Date(task.startDate) : new Date(),
          endDate: task.endDate ? new Date(task.endDate) : new Date(),
        }))
        setTasks(tasksWithDates)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (downloadFormat) => {
    const chartElement = chartRef.current?.querySelector('[data-gantt-chart]')
    
    if (!chartElement) {
      alert('Chart not found. Please wait for the chart to load completely.')
      return
    }

    try {
      setDownloading(true)
      
      // Add a small delay to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Scroll to top of chart to ensure it's in view
      chartElement.scrollIntoView({ block: 'start' })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        removeContainer: false,
        scrollX: 0,
        scrollY: 0,
        width: chartElement.scrollWidth,
        height: chartElement.scrollHeight,
        logging: false, // Disable console logs
        imageTimeout: 30000, // 30 second timeout
        onclone: (clonedDoc, element) => {
          // Ensure all elements are visible in clone
          const clonedElement = clonedDoc.querySelector('[data-gantt-chart]')
          if (clonedElement) {
            clonedElement.style.transform = 'none'
            clonedElement.style.position = 'static'
            clonedElement.style.overflow = 'visible'
            clonedElement.style.height = 'auto'
            clonedElement.style.maxHeight = 'none'
          }
          
          // Ensure fonts are loaded
          const style = clonedDoc.createElement('style')
          style.innerHTML = `
            * { font-family: system-ui, -apple-system, sans-serif !important; }
            .animate-pulse { animation: none !important; }
          `
          clonedDoc.head.appendChild(style)
        }
      })

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to generate chart image. Canvas is empty.')
      }

      const timestamp = Date.now()

      if (downloadFormat === 'png') {
        // Create download link for PNG
        const link = document.createElement('a')
        link.download = `gantt-chart-${timestamp}.png`
        link.href = canvas.toDataURL('image/png', 1.0)
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        alert('PNG downloaded successfully!')
        
      } else if (downloadFormat === 'pdf') {
        const imgData = canvas.toDataURL('image/png', 1.0)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a3' // Use A3 for better chart visibility
        })
        
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        
        // Calculate scaling with margins
        const margin = 15
        const availableWidth = pageWidth - (2 * margin)
        const availableHeight = pageHeight - (2 * margin) - 30 // Reserve space for title
        
        const widthRatio = availableWidth / (imgWidth * 0.264583) // Convert px to mm
        const heightRatio = availableHeight / (imgHeight * 0.264583)
        const scale = Math.min(widthRatio, heightRatio, 1) // Don't upscale
        
        const scaledWidth = imgWidth * 0.264583 * scale
        const scaledHeight = imgHeight * 0.264583 * scale
        
        const x = (pageWidth - scaledWidth) / 2
        const y = margin + 30 // Leave space for title
        
        // Add title
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Project Gantt Chart', pageWidth / 2, 20, { align: 'center' })
        
        // Add date
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        const currentDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 30, { align: 'center' })
        
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
        pdf.save(`gantt-chart-${timestamp}.pdf`)
        
        alert('PDF downloaded successfully!')
      }
      
    } catch (error) {
      console.error('Download error:', error)
      alert(`Download failed: ${error.message}. Please ensure the chart is fully loaded and try again.`)
    } finally {
      setDownloading(false)
    }
  }

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks
    return tasks.filter(task => task.status === statusFilter)
  }, [tasks, statusFilter])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === "completed").length
    const inProgress = tasks.filter(t => t.status === "in-progress" || t.status === "active").length
    const pending = tasks.filter(t => t.status === "pending").length
    const cancelled = tasks.filter(t => t.status === "cancelled").length
    
    return { total, completed, inProgress, pending, cancelled }
  }, [tasks])

  const handleTaskClick = (task) => {
    navigate(`/Task/${task.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Overall Progress</h1>
          <p className="text-gray-600 mt-2">
            Track project timeline and task progress across all teams
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            icon={Briefcase}
            title="Total Tasks"
            value={stats.total}
            color="gray"
          />
          <StatsCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completed}
            subtitle={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% complete`}
            color="green"
          />
          <StatsCard
            icon={Clock}
            title="In Progress"
            value={stats.inProgress}
            subtitle={`${stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}% active`}
            color="blue"
          />
          <StatsCard
            icon={Clock}
            title="Pending"
            value={stats.pending}
            subtitle={`${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}% waiting`}
            color="yellow"
          />
          <StatsCard
            icon={XCircle}
            title="Cancelled"
            value={stats.cancelled}
            subtitle={`${stats.total ? Math.round((stats.cancelled / stats.total) * 100) : 0}% cancelled`}
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tasks ({tasks.length})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="in-progress">In Progress ({stats.inProgress})</option>
              <option value="completed">Completed ({stats.completed})</option>
              <option value="cancelled">Cancelled ({stats.cancelled})</option>
            </select>
            {statusFilter !== "all" && (
              <span className="text-sm text-gray-600">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
            )}
          </div>
        </div>

        {/* Gantt Chart */}
        <div ref={chartRef}>
          <ProfessionalGanttChart 
            tasks={filteredTasks} 
            onTaskClick={handleTaskClick} 
            onDownload={handleDownload}
          />
        </div>

        {/* Download Status */}
        {downloading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Preparing download...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
