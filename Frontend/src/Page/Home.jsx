import { useEffect, useState } from "react"
import { BarChart3, Plus, Users, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"

export default function Home() {
  const [totalTasks, setTotalTasks] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  const [employees, setEmployees] = useState(0)

  useEffect(() => {
    // Fetch total + completed tasks
    const fetchTasks = async () => {
      try {
        const res = await fetch("https://curin-backend.onrender.com/api/tasks")
        const json = await res.json()
        if (json.status === "success") {
          const tasks = json.data.tasks || []
          setTotalTasks(tasks.length)
          setCompletedTasks(tasks.filter((t) => t.status === "completed").length)
        }
      } catch (err) {
        console.error("Error fetching tasks:", err)
      }
    }

    // Fetch employees
    const fetchEmployees = async () => {
      try {
        const res = await fetch("https://curin-backend.onrender.com/api/employees")
        const json = await res.json()
        if (json.status === "success") {
          const emps = json.data.employees || []
          setEmployees(emps.length)
        }
      } catch (err) {
        console.error("Error fetching employees:", err)
      }
    }

    fetchTasks()
    fetchEmployees()
  }, [])

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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{totalTasks}</h3>
                <p className="text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{completedTasks}</h3>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="text-gray-600" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{employees}</h3>
                <p className="text-gray-600">Employees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/create-task"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Plus className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Create New Task</h3>
                <p className="text-gray-600">Start a new task and assign team members</p>
              </div>
            </div>
          </Link>

          <Link
            to="/work-progress"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <BarChart3 className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">View Progress</h3>
                <p className="text-gray-600">Monitor and update task progress</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
