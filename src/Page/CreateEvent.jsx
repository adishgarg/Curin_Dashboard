import { useState, useEffect, useCallback } from "react"
import Select from "react-select"
import { Loader2, CalendarPlus, Calendar, MapPin, Users, DollarSign, Image, User, AlertCircle, CheckCircle, Upload, X, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { eventService } from "../services/api/event"
import { organizationService } from "../services/api/organization"
import { employeeService } from "../services/api/employees"

const CACHE_DURATION = 3600 * 1000 // 1 hour

// Cache utilities
const cacheUtils = {
  get: (key) => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp > CACHE_DURATION) {
        localStorage.removeItem(key)
        return null
      }
      return parsed.data
    } catch {
      localStorage.removeItem(key)
      return null
    }
  },
  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {
      console.warn(`Failed to cache ${key}`)
    }
  },
}

// Form field wrapper with icon + label
function FormField({ label, icon: Icon, children, error, required }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-gray-700 font-medium">
        <Icon className="h-4 w-4 text-gray-500" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

// Display-only Calendar Component
function EventCalendar({ bookedDates, selectedFromDate, selectedToDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const isDateBooked = (date) => {
    if (!date) return false
    return bookedDates.some(bookedDate => 
      new Date(bookedDate).toDateString() === date.toDateString()
    )
  }

  const isDateSelected = (date) => {
    if (!date) return false
    const dateStr = date.toDateString()
    return (selectedFromDate && new Date(selectedFromDate).toDateString() === dateStr) ||
           (selectedToDate && new Date(selectedToDate).toDateString() === dateStr)
  }

  const isInSelectedRange = (date) => {
    if (!date || !selectedFromDate || !selectedToDate) return false
    const dateTime = date.getTime()
    const fromTime = new Date(selectedFromDate).getTime()
    const toTime = new Date(selectedToDate).getTime()
    return dateTime > fromTime && dateTime < toTime
  }

  const isPastDate = (date) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Navigate to today's month
  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Previous month"
        >
          ‹
        </button>
        
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">{monthYear}</h3>
          <button
            type="button"
            onClick={goToToday}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors"
            title="Go to current month"
          >
            Today
          </button>
        </div>
        
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Next month"
        >
          ›
        </button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid - Display only */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date && (
              <div
                className={`w-full h-full rounded text-sm flex items-center justify-center font-medium ${
                  isDateBooked(date)
                    ? 'bg-red-100 text-red-500 border border-red-200'
                    : isPastDate(date)
                    ? 'bg-gray-50 text-gray-300'
                    : isDateSelected(date)
                    ? 'bg-blue-500 text-white shadow-md'
                    : isInSelectedRange(date)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span className="text-gray-600">Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
      </div>

      {/* Selection info */}
      {(selectedFromDate || selectedToDate) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Selected Period:</strong>
            <div className="mt-1">
              {selectedFromDate && (
                <span>From: {new Date(selectedFromDate).toLocaleDateString()}</span>
              )}
              {selectedFromDate && selectedToDate && <span className="mx-2">→</span>}
              {selectedToDate && (
                <span>To: {new Date(selectedToDate).toLocaleDateString()}</span>
              )}
            </div>
            {selectedFromDate && selectedToDate && (
              <div className="mt-1 text-xs text-blue-600">
                Duration: {Math.ceil((new Date(selectedToDate) - new Date(selectedFromDate)) / (1000 * 60 * 60 * 24)) + 1} days
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    eventName: "",
    proposedDateFrom: "",
    proposedDateTo: "",
    fromTime: "09:00",
    toTime: "17:00",
    organizedBy: null,
    venue: "",
    poster: null,
    budget: "",
    conveners: []
  })
  const [loading, setLoading] = useState(false)
  const [orgOptions, setOrgOptions] = useState([])
  const [convenerOptions, setConvenerOptions] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [loadingConveners, setLoadingConveners] = useState(true)
  const [bookedDates, setBookedDates] = useState([])
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [posterPreview, setPosterPreview] = useState(null)

  const navigate = useNavigate()

  // Fetch organizations with caching (matching CreateTaskPage pattern)
  const fetchOrganizations = useCallback(async () => {
    setLoadingOrgs(true)
    try {
      let cached = cacheUtils.get("organizations")
      if (cached) {
        console.log("Using cached organizations:", cached)
        setOrgOptions(cached.map((org) => ({ value: org._id, label: org.name })))
        setLoadingOrgs(false)
        return
      }

      console.log("Fetching organizations from API...")
      const organizations = await organizationService.getAllOrganizations()
      console.log("Full organizations response:", organizations)
      
      // Process organizations (matching CreateTaskPage pattern)
      let organizationData = []
      if (organizations && organizations.success && Array.isArray(organizations.data)) {
        organizationData = organizations.data
      } else if (Array.isArray(organizations)) {
        organizationData = organizations
      }
      
      console.log("Processed organizations data:", organizationData)

      if (organizationData && organizationData.length > 0) {
        cacheUtils.set("organizations", organizationData)
        const options = organizationData.map((org) => ({ 
          value: org._id || org.id, 
          label: org.name || org.organizationName || 'Unknown Org'
        }))
        console.log("Mapped organization options:", options)
        setOrgOptions(options)
      } else {
        console.warn("No organizations found in response")
        setOrgOptions([])
      }
    } catch (err) {
      console.error("Error fetching organizations:", err)
      setOrgOptions([])
    } finally {
      setLoadingOrgs(false)
    }
  }, [])

  // Fetch conveners (Head of Departments) - using employeeService like CreateTaskPage
  const fetchConveners = useCallback(async () => {
    setLoadingConveners(true)
    try {
      let cached = cacheUtils.get("conveners")
      if (cached) {
        console.log("Using cached conveners:", cached)
        setConvenerOptions(cached.map((user) => ({ 
          value: user._id, 
          label: `${user.firstName} ${user.lastName} - ${user.designation}` 
        })))
        setLoadingConveners(false)
        return
      }

      console.log("Fetching employees from API...")
      const employees = await employeeService.getAllEmployees()
      console.log("Full employees response:", employees)
      
      // Process employees (matching CreateTaskPage pattern)
      let employeeData = []
      if (Array.isArray(employees)) {
        employeeData = employees
      } else if (employees && employees.success && Array.isArray(employees.data)) {
        employeeData = employees.data
      }
      
      console.log("Processed employees data:", employeeData)
      
      // Filter for Head of Departments or similar roles
      const conveners = employeeData.filter(emp => 
        emp.designation && (
          emp.designation.toLowerCase().includes('head') ||
          emp.designation.toLowerCase().includes('hod') ||
          emp.designation.toLowerCase().includes('director') ||
          emp.designation.toLowerCase().includes('manager')
        )
      )

      console.log("All employees fetched:", employeeData.length)
      console.log("Sample employee:", employeeData[0])
      console.log("Filtered conveners:", conveners.length, conveners)

      if (conveners.length > 0) {
        cacheUtils.set("conveners", conveners)
        const options = conveners.map((user) => ({ 
          value: user._id, 
          label: `${user.firstName} ${user.lastName} - ${user.designation}` 
        }))
        console.log("Mapped convener options:", options)
        setConvenerOptions(options)
      } else {
        console.warn("No conveners found after filtering")
        // Fallback: use all employees as conveners for testing
        const allOptions = employeeData.map((user) => ({ 
          value: user._id, 
          label: `${user.firstName} ${user.lastName} - ${user.designation || 'No designation'}` 
        }))
        console.log("Using all employees as convener options:", allOptions.length)
        setConvenerOptions(allOptions)
      }
    } catch (err) {
      console.error("Error fetching conveners:", err)
      setConvenerOptions([])
    } finally {
      setLoadingConveners(false)
    }
  }, [])

  // Fetch booked dates for calendar (using eventService)
  const fetchBookedDates = useCallback(async () => {
    try {
      console.log("Fetching booked dates...")
      const bookedDatesData = await eventService.getBookedDates()
      console.log("Processed booked dates:", bookedDatesData)
      setBookedDates(bookedDatesData)
    } catch (err) {
      console.error("Error fetching booked dates:", err)
      setBookedDates([]) // Set empty array on error
    }
  }, [])

  useEffect(() => {
    fetchOrganizations()
    fetchConveners()
    fetchBookedDates()
  }, [fetchOrganizations, fetchConveners, fetchBookedDates])

  // Handle form data updates
  const updateFormData = (field, value) => {
    console.log(`Updating ${field}:`, value);
    if (field === 'conveners') {
      console.log('Selected conveners:', value);
      console.log('Conveners count:', value?.length || 0);
    }
    setFormData({ ...formData, [field]: value })
  }

  // Handle poster upload
  const handlePosterUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      updateFormData("poster", file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPosterPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Remove poster
  const removePoster = () => {
    updateFormData("poster", null)
    setPosterPreview(null)
  }

  // Handle form submission (using eventService)
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.conveners || formData.conveners.length === 0) {
      alert("Please select at least one convener.")
      return
    }

    setLoading(true)
    setMessage("")
    setIsSuccess(false)

    try {
      console.log("Form data before processing:", formData);
      console.log("Form data conveners:", formData.conveners);
      console.log("Is conveners array?", Array.isArray(formData.conveners));
      
      // Prepare event data object
      const eventData = {
        eventName: formData.eventName,
        proposedDateFrom: formData.proposedDateFrom,
        proposedDateTo: formData.proposedDateTo,
        fromTime: formData.fromTime,
        toTime: formData.toTime,
        organizedBy: formData.organizedBy?.value || "",
        venue: formData.venue,
        budget: formData.budget,
        conveners: formData.conveners.map(c => c.value)
      }

      console.log("Submitting event data:", eventData)
      console.log("Event data conveners:", eventData.conveners)
      if (formData.poster) {
        console.log("Poster file:", formData.poster.name, formData.poster.size)
      }

      // Use eventService to create event
      const response = await eventService.createEvent(eventData, formData.poster)

      console.log("Created Event:", response)

      // Handle success - response might be empty or have various formats from FormData
      if (response && response.success !== false && !response.error) {
        setMessage("Event created successfully!")
        setIsSuccess(true)
        
        // Reset form
        setFormData({
          eventName: "",
          proposedDateFrom: "",
          proposedDateTo: "",
          fromTime: "09:00",
          toTime: "17:00",
          organizedBy: null,
          venue: "",
          poster: null,
          budget: "",
          conveners: []
        })
        setPosterPreview(null)

        setTimeout(() => navigate("/events"), 1000)
      } else {
        throw new Error(response?.message || "Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      setMessage(error.message || "Failed to create event")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <CalendarPlus className="h-8 w-8" aria-hidden="true" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Create New Event</h1>
              <p className="text-green-100 mt-1">Plan and organize your event</p>
            </div>
          </div>
        </div>

        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-3 rounded text-xs mb-4">
            <strong>Debug:</strong> 
            Organizations: {orgOptions.length}, 
            Conveners: {convenerOptions.length}, 
            Booked Dates: {bookedDates.length}
            {orgOptions.length > 0 && (
              <div className="mt-1">
                First organization: {JSON.stringify(orgOptions[0])}
              </div>
            )}
            {convenerOptions.length > 0 && (
              <div className="mt-1">
                First convener: {JSON.stringify(convenerOptions[0])}
              </div>
            )}
          </div>
        )}

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              isSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Event Name" icon={CalendarPlus} required>
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={(e) => updateFormData("eventName", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="From Date" icon={Calendar} required>
                  <input
                    type="date"
                    value={formData.proposedDateFrom}
                    onChange={(e) => updateFormData("proposedDateFrom", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </FormField>

                <FormField label="To Date" icon={Calendar} required>
                  <input
                    type="date"
                    value={formData.proposedDateTo}
                    onChange={(e) => updateFormData("proposedDateTo", e.target.value)}
                    min={formData.proposedDateFrom}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </FormField>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="From Time" icon={Clock} required>
                  <input
                    type="time"
                    value={formData.fromTime}
                    onChange={(e) => updateFormData("fromTime", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </FormField>

                <FormField label="To Time" icon={Clock} required>
                  <input
                    type="time"
                    value={formData.toTime}
                    onChange={(e) => updateFormData("toTime", e.target.value)}
                    min={formData.fromTime}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Organized By" icon={User} required>
                <Select
                  options={orgOptions}
                  value={formData.organizedBy}
                  onChange={(opt) => updateFormData("organizedBy", opt)}
                  placeholder={loadingOrgs ? "Loading organizations..." : "Select organization"}
                  isDisabled={loadingOrgs}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={loadingOrgs}
                />
              </FormField>

              <FormField label="Venue" icon={MapPin} required>
                <input
                  type="text"
                  placeholder="Enter event venue"
                  value={formData.venue}
                  onChange={(e) => updateFormData("venue", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </FormField>

              <FormField label="Budget" icon={DollarSign} required>
                <input
                  type="number"
                  placeholder="Enter budget amount"
                  value={formData.budget}
                  onChange={(e) => updateFormData("budget", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </FormField>

              <FormField label="Conveners (Head of Departments)" icon={Users} required>
                <Select
                  isMulti
                  options={convenerOptions}
                  value={formData.conveners}
                  onChange={(opts) => updateFormData("conveners", opts || [])}
                  placeholder={loadingConveners ? "Loading conveners..." : "Select conveners"}
                  isDisabled={loadingConveners}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isLoading={loadingConveners}
                />
              </FormField>

              <FormField label="Event Poster" icon={Image}>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> poster
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePosterUpload}
                      />
                    </label>
                  </div>

                  {posterPreview && (
                    <div className="relative">
                      <img
                        src={posterPreview}
                        alt="Poster preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removePoster}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </FormField>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <CalendarPlus size={18} />
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Calendar Section - Display Only */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Event Calendar
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Visual calendar showing selected dates and booked dates. Use the date inputs above to select your event dates.
            </p>
            <EventCalendar
              bookedDates={bookedDates}
              selectedFromDate={formData.proposedDateFrom}
              selectedToDate={formData.proposedDateTo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}