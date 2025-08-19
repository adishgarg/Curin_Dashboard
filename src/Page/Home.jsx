import { useEffect, useState, useCallback, useMemo } from "react"
import { BarChart3, Plus, Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

// Constants
const API_BASE_URL = "https://curin-backend.onrender.com/api"
const ENDPOINTS = {
  TASKS: `${API_BASE_URL}/tasks`,
  EMPLOYEES: `${API_BASE_URL}/employees`
}

// Custom hook for API data fetching
const useApiData = () => {
  const [data, setData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    employees: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch both endpoints in parallel for better performance
      const [tasksResponse, employeesResponse] = await Promise.all([
        fetch(ENDPOINTS.TASKS),
        fetch(ENDPOINTS.EMPLOYEES)
      ])

      const [tasksJson, employeesJson] = await Promise.all([
        tasksResponse.json(),
        employeesResponse.json()
      ])

      const newData = { ...data }

      // Process tasks data
      if (tasksJson.status === "success") {
        const tasks = tasksJson.data.tasks || []
        newData.totalTasks = tasks.length
        newData.completedTasks = tasks.filter((t) => t.status === "completed").length
      }

      // Process employees data
      if (employeesJson.status === "success") {
        const employees = employeesJson.data.employees || []
        newData.employees = employees.length
      }

      setData(newData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export default function Home() {
  const { data, loading, error, refetch } = useApiData()
  const { totalTasks, completedTasks, employees } = data

  // Memoized stats configuration for better performance
  const statsConfig = useMemo(() => [
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: totalTasks,
      icon: BarChart3,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'completed-tasks',
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'employees',
      title: 'Employees',
      value: employees,
      icon: Users,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ], [totalTasks, completedTasks, employees])

  // Memoized action cards configuration
  const actionCards = useMemo(() => [
    {
      id: 'create-task',
      to: '/create-task',
      title: 'Create New Task',
      description: 'Start a new task and assign team members',
      icon: Plus,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBgColor: 'group-hover:bg-blue-100'
    },
    {
      id: 'view-progress',
      to: '/work-progress',
      title: 'View Progress',
      description: 'Monitor and update task progress',
      icon: BarChart3,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBgColor: 'group-hover:bg-green-100'
    }
  ], [])

  // Loading component
  const LoadingCard = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )

  // Error component
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <AlertCircle className="text-red-600" size={20} />
        <div className="flex-1">
          <p className="text-red-800 font-medium">Unable to load dashboard data</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          aria-label="Retry loading data"
        >
          Retry
        </button>
      </div>
    </div>
  )

  // Stat card component
  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        role="region"
        aria-labelledby={`${stat.id}-title`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
            <IconComponent className={stat.iconColor} size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 
              id={`${stat.id}-title`}
              className="text-2xl font-bold text-gray-900"
              aria-live="polite"
            >
              {stat.value}
            </h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        </div>
      </div>
    )
  }

  // Action card component
  const ActionCard = ({ action }) => {
    const IconComponent = action.icon
    return (
      <Link
        to={action.to}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-describedby={`${action.id}-description`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${action.bgColor} rounded-lg flex items-center justify-center ${action.hoverBgColor} transition-colors`}>
            <IconComponent className={action.iconColor} size={32} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{action.title}</h3>
            <p id={`${action.id}-description`} className="text-gray-600">{action.description}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            Welcome to WorkFlow
          </h1>
          <p className="text-gray-600">
            Manage your tasks efficiently and track progress seamlessly
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Error Message */}
        {error && <ErrorMessage />}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            statsConfig.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actionCards.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </div>
    </div>
  )
}
