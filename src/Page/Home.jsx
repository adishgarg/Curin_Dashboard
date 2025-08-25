import { useEffect, useState, useCallback, useMemo } from "react"
import { BarChart3, Plus, Users, CheckCircle, AlertCircle, Loader2, TrendingUp, Clock, Target, ArrowRight, Activity } from "lucide-react"
import { Link } from "react-router-dom"
import { taskService } from "../services/api/task"
import { employeeService } from "../services/api/employees"
import { userService } from "../services/api/user"

// Custom hook for user data fetching
const useUserData = () => {
  const [userData, setUserData] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getCurrentUser()
        
        if (response && response.status === "success" && response.data && response.data.user) {
          const user = response.data.user
          setUserData({
            firstName: user.name ? user.name.split(' ')[0] : 'User',
            fullName: user.fullName || user.name,
            email: user.email,
            designation: user.designation
          })
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        setUserData({ firstName: 'User', fullName: 'User' })
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return { userData, userLoading }
}

// Custom hook for API data fetching using services
const useApiData = () => {
  const [data, setData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    employees: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch both endpoints in parallel using services
      const [tasks, employees] = await Promise.all([
        taskService.getAllTasks(),
        employeeService.getAllEmployees()
      ])

      const newData = {
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        employees: 0
      }

      // Process tasks data
      if (Array.isArray(tasks)) {
        newData.totalTasks = tasks.length
        newData.completedTasks = tasks.filter((t) => t.status === "completed").length
        newData.activeTasks = tasks.filter((t) => t.status === "active").length
      }

      // Process employees data
      if (Array.isArray(employees)) {
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
  const { userData, userLoading } = useUserData()
  const { totalTasks, completedTasks, activeTasks, employees } = data

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Memoized stats configuration for better performance
  const statsConfig = useMemo(() => [
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: totalTasks,
      icon: Target,
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-50'
    },
    {
      id: 'active-tasks',
      title: 'Active Tasks',
      value: activeTasks,
      icon: Clock,
      iconColor: 'text-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-50'
    },
    {
      id: 'completed-tasks',
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-50'
    },
    {
      id: 'employees',
      title: 'Team Members',
      value: employees,
      icon: Users,
      iconColor: 'text-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-50'
    }
  ], [totalTasks, completedTasks, activeTasks, employees])

  // Memoized action cards configuration
  const actionCards = useMemo(() => [
    {
      id: 'create-task',
      to: '/create-task',
      title: 'Create New Task',
      description: 'Start a new project and assign team members',
      icon: Plus,
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-50'
    },
    {
      id: 'view-progress',
      to: '/work-progress',
      title: 'Monitor Progress',
      description: 'Track and update ongoing tasks',
      icon: Activity,
      iconColor: 'text-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      hoverBg: 'hover:bg-emerald-50'
    },
    {
      id: 'analytics',
      to: '/overall-progress',
      title: 'View Analytics',
      description: 'Analyze team performance and insights',
      icon: TrendingUp,
      iconColor: 'text-violet-600',
      bgGradient: 'from-violet-50 to-violet-100',
      borderColor: 'border-violet-200',
      hoverBg: 'hover:bg-violet-50'
    }
  ], [])

  // Loading component
  const LoadingCard = () => (
    <div className="white-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )

  // Error component
  const ErrorMessage = () => (
    <div className="white-card border-red-200 bg-red-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <div className="flex-1">
          <p className="text-gray-900 font-medium">Unable to load dashboard data</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-all duration-200 border border-red-300"
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
        className={`white-card ${stat.borderColor} ${stat.hoverBg} group hover:scale-105 transition-all duration-300 hover:shadow-lg`}
        role="region"
        aria-labelledby={`${stat.id}-title`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
            <h3 
              id={`${stat.id}-title`}
              className="text-3xl font-bold text-gray-900 mb-2"
              aria-live="polite"
            >
              {stat.value}
            </h3>
            {stat.id === 'completed-tasks' && totalTasks > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="text-gray-600 text-xs">{completionRate}%</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${stat.bgGradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            <IconComponent className={stat.iconColor} size={28} aria-hidden="true" />
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
        className={`white-card ${action.borderColor} ${action.hoverBg} group hover:scale-105 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        aria-describedby={`${action.id}-description`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${action.bgGradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            <IconComponent className={action.iconColor} size={32} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-gray-800">{action.title}</h3>
            <p id={`${action.id}-description`} className="text-gray-600 group-hover:text-gray-700">{action.description}</p>
          </div>
          <ArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" size={20} />
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Subtle Pattern Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b7280' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Header */}
        <div className="white-header border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {userLoading ? 'Loading...' : userData?.firstName || 'User'}
                </h1>
                <p className="text-gray-600 text-lg">
                  Here's what's happening with your projects today
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Today</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage />
            </div>
          )}

          {/* Quick Stats */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={28} />
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <LoadingCard key={index} />
                ))
              ) : (
                statsConfig.map((stat) => (
                  <StatCard key={stat.id} stat={stat} />
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Plus className="text-emerald-600" size={28} />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actionCards.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>

          {/* Recent Activity Preview */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <Activity className="text-purple-600" size={28} />
              Recent Activity
            </h2>
            <div className="white-card">
              <div className="text-center py-12">
                <Activity className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-600 mb-4">No recent activity to display</p>
                <Link 
                  to="/work-progress" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 border border-blue-300"
                >
                  View All Tasks
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .white-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(229, 231, 235, 0.8);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .white-card:hover {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: rgba(229, 231, 235, 1);
        }

        .white-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .white-card:nth-child(odd) {
          animation: float 6s ease-in-out infinite;
        }

        .white-card:nth-child(even) {
          animation: float 6s ease-in-out infinite;
          animation-delay: -3s;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(229, 231, 235, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  )
}
