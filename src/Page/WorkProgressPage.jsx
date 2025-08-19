import { useState, useEffect } from "react"

export default function WorkProgressPage({ sidebarOpen }) {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [editRow, setEditRow] = useState(null)
  const [summary, setSummary] = useState("")
  const [reason, setReason] = useState("")
  const [status, setStatus] = useState("Incomplete")

  // filters
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://c617a95b592b.ngrok-free.app/api/tasks")
        const json = await res.json()

        if (json.status === "success") {
          // map backend response to frontend table format
          const mapped = json.data.tasks.map((task) => ({
            id: task._id,
            task: task.workDone, // using workDone as Task Name
            partner: task.partnerOrganization,
            industries: task.industriesInvolved.join(", "),
            status: task.status === "completed" ? "Completed" : "Incomplete",
            date: task.userTimestamp.split("T")[0], // just YYYY-MM-DD
          }))

          setData(mapped)
          setFilteredData(mapped)
        }
      } catch (error) {
        console.error("Error fetching tasks:", error)
      }
    }

    fetchData()
  }, [])

  // apply filters
  useEffect(() => {
    let result = [...data]

    if (search.trim()) {
      result = result.filter(
        (row) =>
          row.task.toLowerCase().includes(search.toLowerCase()) ||
          row.partner.toLowerCase().includes(search.toLowerCase()) ||
          row.industries.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filterStatus !== "All") {
      result = result.filter((row) => row.status === filterStatus)
    }

    if (startDate) {
      result = result.filter((row) => row.date >= startDate)
    }

    if (endDate) {
      result = result.filter((row) => row.date <= endDate)
    }

    setFilteredData(result)
  }, [search, filterStatus, startDate, endDate, data])

  const handleUpdate = (rowId) => {
    if (status === "Incomplete" && reason.trim() === "") {
      alert("Reason is mandatory when status is Incomplete")
      return
    }

    setData((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, status, summary, reason } : row
      )
    )

    setEditRow(null)
    setSummary("")
    setReason("")
    setStatus("Incomplete")

    alert("Update submitted!")
  }

  return (
    <div
      className={`transition-all duration-300 p-4 md:p-6 ${
        sidebarOpen ? "md:ml-60" : "md:ml-20"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Work Progress</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by task, partner, industries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Incomplete">Incomplete</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-3 border border-gray-200">Sr. No</th>
                <th className="px-3 py-3 border border-gray-200">Task Name</th>
                <th className="px-3 py-3 border border-gray-200">Partner Organisation</th>
                <th className="px-3 py-3 border border-gray-200">Industries Involved</th>
                <th className="px-3 py-3 border border-gray-200">Status</th>
                <th className="px-3 py-3 border border-gray-200">Date</th>
                <th className="px-3 py-3 border border-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">{row.task}</td>
                  <td className="border border-gray-200 px-3 py-2">{row.partner}</td>
                  <td className="border border-gray-200 px-3 py-2">{row.industries}</td>
                  <td
                    className={`border border-gray-200 px-3 py-2 font-medium ${
                      row.status === "Completed"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">{row.date}</td>
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    <button
                      onClick={() => setEditRow(row.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
