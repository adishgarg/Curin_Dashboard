import { useState, useEffect, useCallback, useMemo } from "react"
import Select from "react-select"
import { Calendar, Users, Building2, Briefcase, FileText, Plus, CheckCircle, AlertCircle, Loader2, Upload, X, File } from "lucide-react"
import { taskService } from "../services/api/task"
import { organizationService } from "../services/api/organization"
import { employeeService } from "../services/api/employees"
import { industryService } from "../services/api/industry"
import { fileUploadService } from "../services/api/fileUpload"

// Constants
const INITIAL_FORM_DATA = {
  taskName: "",
  partnerOrganizations: [],
  employeesAssigned: [],
  industriesInvolved: [],
  status: "in-progress",
  description: "",
  createdBy: { id: "", name: "" },
  startDate: "",
  endDate: "",
  files: [],
}

// Custom hook for fetching dropdown data
const useDropdownData = () => {
  const [options, setOptions] = useState({
    partners: [],
    industries: [],
    employees: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDropdownData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel using the services
      const [organizations, industries, employees] = await Promise.all([
        organizationService.getAllOrganizations(),
        industryService.getAllIndustries(),
        employeeService.getAllEmployees()
      ])

      console.log("Fetched data:", { organizations, industries, employees }) // Debug log

      // Process organizations
      let organizationData = []
      if (organizations && organizations.success && Array.isArray(organizations.data)) {
        organizationData = organizations.data
      } else if (Array.isArray(organizations)) {
        organizationData = organizations
      }

      // Process industries - Updated to handle the actual data structure
      let industryData = []
      if (Array.isArray(industries)) {
        industryData = industries
      } else if (industries && industries.success && Array.isArray(industries.data)) {
        industryData = industries.data
      } else if (industries && Array.isArray(industries.industries)) {
        industryData = industries.industries
      }

      console.log("Processed industry data:", industryData) // Debug log

      // Process employees
      let employeeData = []
      if (Array.isArray(employees)) {
        employeeData = employees
      }

      // Map data to select options
      const partnerOptions = organizationData.map((org) => ({
        value: org._id,
        label: org.name,
      }))

      // Updated industry mapping to handle the correct field name
      const industryOptions = industryData.map((ind) => ({
        value: ind._id,
        label: ind.IndustryName, // This matches your backend data structure
      }))

      console.log("Industry options:", industryOptions) // Debug log

      const employeeOptions = employeeData.map((emp) => ({
        value: emp._id,
        label: emp.fullName || `${emp.firstName} ${emp.lastName}`,
      }))

      setOptions({
        partners: partnerOptions,
        industries: industryOptions,
        employees: employeeOptions
      })

      console.log("Final options set:", {
        partners: partnerOptions.length,
        industries: industryOptions.length,
        employees: employeeOptions.length
      }) // Debug log

    } catch (err) {
      console.error("Error fetching dropdown data:", err)
      setError("Failed to load dropdown options. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDropdownData()
  }, [fetchDropdownData])

  return { options, loading, error, refetch: fetchDropdownData }
}

// Reusable form field component (moved outside to prevent re-creation)
const FormField = ({ label, icon: Icon, error, children, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <Icon className="inline w-4 h-4 mr-1" aria-hidden="true" />
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
        {error}
      </p>
    )}
  </div>
)

// File Upload component
const FileUpload = ({ files, onFilesChange, error }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState(files || [])
  const [uploading, setUploading] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    
    // Validate files
    const validFiles = []
    const invalidFiles = []
    
    fileArray.forEach(file => {
      const validation = fileUploadService.validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [], // Allow all types
      })
      
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        invalidFiles.push({ file, errors: validation.errors })
      }
    })
    
    // Show validation errors
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.join(', ')}`
      ).join('\n')
      alert(`Some files were rejected:\n${errorMessages}`)
    }
    
    if (validFiles.length === 0) return
    
    setUploading(true)
    
    try {
      // Try to upload files immediately (optional - can also upload on form submit)
      const uploadResults = await fileUploadService.uploadFiles(validFiles)
      
      const newFiles = [
        // Successfully uploaded files
        ...uploadResults.successful.map(result => ({
          name: result.filename,
          size: result.originalFile.size,
          url: result.url,
          uploaded: true,
          file: null, // Clear file object after upload
        })),
        // Files that failed to upload (keep for retry)
        ...uploadResults.failed.map(({ file, error }) => ({
          file,
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          uploaded: false,
          error,
        }))
      ]
      
      const updatedFiles = [...uploadedFiles, ...newFiles]
      setUploadedFiles(updatedFiles)
      onFilesChange(updatedFiles)
    } catch (error) {
      console.warn("Upload failed, files will be uploaded on form submit:", error)
      
      // Fallback: Add files to queue for upload on form submit
      const newFiles = validFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        uploaded: false
      }))
      
      const updatedFiles = [...uploadedFiles, ...newFiles]
      setUploadedFiles(updatedFiles)
      onFilesChange(updatedFiles)
    } finally {
      setUploading(false)
    }
  }, [uploadedFiles, onFilesChange])

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }, [handleFileSelect])

  // Remove file
  const removeFile = useCallback(async (index) => {
    const fileToRemove = uploadedFiles[index]
    
    // If file was uploaded, try to delete it from server
    if (fileToRemove.uploaded && fileToRemove.url) {
      try {
        await fileUploadService.deleteFile(fileToRemove.url)
      } catch (error) {
        console.warn("Failed to delete file from server:", error)
      }
    }
    
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [uploadedFiles, onFilesChange])

  // Format file size
  const formatFileSize = (bytes) => {
    return fileUploadService.formatFileSize(bytes)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Click to upload</span> or drag and drop files here
        </div>
        <div className="text-xs text-gray-500">
          Support for images, documents, and other file types (Max 10MB each)
        </div>
        <input
          type="file"
          multiple
          accept="*/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={`mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </>
          )}
        </label>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Attached Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedFiles.map((fileObj, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  fileObj.uploaded 
                    ? 'bg-green-50 border-green-200' 
                    : fileObj.error
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <File className={`h-5 w-5 flex-shrink-0 ${
                    fileObj.uploaded 
                      ? 'text-green-500' 
                      : fileObj.error
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileObj.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileObj.size)}
                      </p>
                      {fileObj.uploaded && (
                        <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                      )}
                      {fileObj.error && (
                        <span className="text-xs text-red-600 font-medium">✗ Failed</span>
                      )}
                    </div>
                    {fileObj.error && (
                      <p className="text-xs text-red-500 mt-1">{fileObj.error}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-3 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${fileObj.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading form options...</span>
  </div>
)

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-3">
      <AlertCircle className="text-red-600" size={20} />
      <div className="flex-1">
        <p className="text-red-800 font-medium">Error loading form</p>
        <p className="text-red-600 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
)

export default function CreateTaskPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { options, loading: optionsLoading, error: optionsError, refetch } = useDropdownData()

  // Updated useEffect to set both name and id
  useEffect(() => {
    try {
      const user = localStorage.getItem('user')
      if (user) {
        const parsedUser = JSON.parse(user)
        const createdBy = {
          id: parsedUser._id || parsedUser.id || '',
          name: parsedUser.fullName || parsedUser.name || 'Unknown User'
        }
        setFormData(prev => ({ ...prev, createdBy }))
      } else {
        // Fallback - try to get separate values
        const userId = localStorage.getItem('userId') || ''
        const fullName = localStorage.getItem('fullName') || 'Unknown User'
        setFormData(prev => ({ 
          ...prev, 
          createdBy: { id: userId, name: fullName }
        }))
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      // Fallback
      const userId = localStorage.getItem('userId') || ''
      const fullName = localStorage.getItem('fullName') || 'Unknown User'
      setFormData(prev => ({ 
        ...prev, 
        createdBy: { id: userId, name: fullName }
      }))
    }
  }, [])

  // Updated validation function
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.taskName.trim()) {
      newErrors.taskName = "Task name is required"
    }

    if (!formData.createdBy.name.trim()) {
      newErrors.createdBy = "Creator name is required"
    }

    if (!formData.createdBy.id.trim()) {
      newErrors.createdBy = "Creator ID is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (formData.partnerOrganizations.length === 0) {
      newErrors.partnerOrganizations = "At least one partner organization is required"
    }

    if (formData.employeesAssigned.length === 0) {
      newErrors.employeesAssigned = "At least one employee must be assigned"
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Updated form update handler for createdBy
  const updateFormData = useCallback((field, value) => {
    if (field === 'createdBy') {
      // Handle createdBy updates specially
      setFormData(prev => ({ 
        ...prev, 
        createdBy: { ...prev.createdBy, ...value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Updated submit handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage("")
    setIsSuccess(false)

    try {
      // Process files - upload them if they haven't been uploaded yet
      let processedFiles = []
      
      if (formData.files && formData.files.length > 0) {
        console.log("Processing files for task creation...") // Debug log
        
        // Check if your backend supports file upload
        const hasFileUploadEndpoint = true // Set this based on your backend capabilities
        
        if (hasFileUploadEndpoint) {
          try {
            // Method 1: Upload files to your server first
            const filesToUpload = formData.files.filter(fileObj => !fileObj.uploaded && fileObj.file)
            
            if (filesToUpload.length > 0) {
              console.log(`Uploading ${filesToUpload.length} files...`)
              const uploadResults = await fileUploadService.uploadFiles(
                filesToUpload.map(fileObj => fileObj.file)
              )
              
              // Combine uploaded URLs with already uploaded files
              processedFiles = [
                ...uploadResults.successful.map(result => result.url),
                ...formData.files.filter(fileObj => fileObj.uploaded).map(fileObj => fileObj.url)
              ]
              
              // Log failed uploads
              if (uploadResults.failed.length > 0) {
                console.warn("Some files failed to upload:", uploadResults.failed)
                // You could show a warning to the user here
              }
            } else {
              // All files already uploaded
              processedFiles = formData.files.map(fileObj => fileObj.url)
            }
          } catch (uploadError) {
            console.error("File upload failed:", uploadError)
            throw new Error(`File upload failed: ${uploadError.message}`)
          }
        } else {
          // Method 2: Send files as base64 in the request (for small files only)
          console.log("Converting files to base64...")
          processedFiles = await Promise.all(
            formData.files.map(async (fileObj) => {
              if (fileObj.uploaded && fileObj.url) {
                return fileObj.url // Already uploaded
              }
              
              // Convert file to base64 (only for small files < 1MB)
              if (fileObj.file && fileObj.file.size < 1024 * 1024) {
                return new Promise((resolve) => {
                  const reader = new FileReader()
                  reader.onload = () => resolve(reader.result)
                  reader.readAsDataURL(fileObj.file)
                })
              }
              
              // For larger files, just send the filename (backend needs to handle this)
              return fileObj.name
            })
          )
        }
      }

      const taskData = {
        taskName: formData.taskName,
        description: formData.description,
        createdBy: formData.createdBy,
        employeesAssigned: formData.employeesAssigned.map((emp) => ({
          id: emp.value,
          name: emp.label,
        })),
        status: formData.status,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        files: processedFiles,
        partnerOrganizations: formData.partnerOrganizations.map((org) => ({
          id: org.value,
          name: org.label,
        })),
        industriesInvolved: formData.industriesInvolved.map((i) => ({
          id: i.value,
          name: i.label,
        })),
      }

      console.log("Sending task data:", taskData) // Debug log

      const response = await taskService.createTask(taskData)
      
      if (response && (response.success || response.data)) {
        setMessage("Task created successfully!")
        setIsSuccess(true)
        // Reset form but keep createdBy info
        const currentCreatedBy = formData.createdBy
        setFormData({ ...INITIAL_FORM_DATA, createdBy: currentCreatedBy })
        setErrors({})
      } else {
        setMessage(response.message || "Failed to create task")
        setIsSuccess(false)
      }
    } catch (err) {
      console.error("Error creating task:", err)
      setMessage(err.message || "Server error, please try again")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm])

  // Memoized select styles
  const selectStyles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#EFF6FF",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1E40AF",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#1E40AF",
      "&:hover": {
        backgroundColor: "#DBEAFE",
        color: "#1E40AF",
      },
    }),
  }), [])

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <Plus className="h-8 w-8" aria-hidden="true" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Create New Task</h1>
              <p className="text-green-100 mt-1">Set up a new task for your team</p>
            </div>
          </div>
        </div>

        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-3 rounded text-xs mb-4">
            <strong>Debug:</strong> 
            Partners: {options.partners.length}, 
            Industries: {options.industries.length}, 
            Employees: {options.employees.length},
            Created By: {JSON.stringify(formData.createdBy)}
            {options.industries.length > 0 && (
              <div className="mt-1">
                First industry: {JSON.stringify(options.industries[0])}
              </div>
            )}
          </div>
        )}

        {/* Options Loading/Error States */}
        {optionsLoading && <LoadingSpinner />}
        {optionsError && <ErrorMessage message={optionsError} onRetry={refetch} />}

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              isSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
            role="alert"
            aria-live="polite"
          >
            {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Form */}
        {!optionsLoading && !optionsError && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            {/* Task Name */}
            <FormField label="Task Name" icon={FileText} error={errors.taskName} required>
              <input
                type="text"
                placeholder="Enter task name"
                value={formData.taskName}
                onChange={(e) => updateFormData('taskName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.taskName ? "border-red-300" : "border-gray-300"
                }`}
                aria-describedby={errors.taskName ? "taskName-error" : undefined}
              />
            </FormField>

            {/* Partner Organizations */}
            <FormField label="Partner Organizations" icon={Building2} error={errors.partnerOrganizations} required>
              <Select
                isMulti
                options={options.partners}
                value={formData.partnerOrganizations}
                onChange={(opt) => updateFormData('partnerOrganizations', opt || [])}
                placeholder="Select partner organizations"
                styles={selectStyles}
                className={errors.partnerOrganizations ? "border-red-300" : ""}
                aria-describedby={errors.partnerOrganizations ? "partnerOrganizations-error" : undefined}
                isDisabled={options.partners.length === 0}
              />
            </FormField>

            {/* Employees */}
            <FormField label="Assign Employees" icon={Users} error={errors.employeesAssigned} required>
              <Select
                isMulti
                options={options.employees}
                value={formData.employeesAssigned}
                onChange={(opt) => updateFormData('employeesAssigned', opt || [])}
                placeholder="Select employees to assign"
                styles={selectStyles}
                className={errors.employeesAssigned ? "border-red-300" : ""}
                aria-describedby={errors.employeesAssigned ? "employeesAssigned-error" : undefined}
                isDisabled={options.employees.length === 0}
              />
            </FormField>

            {/* Industries */}
            <FormField label="Industries Involved" icon={Briefcase} error={errors.industriesInvolved}>
              <Select
                isMulti
                options={options.industries}
                value={formData.industriesInvolved}
                onChange={(opt) => updateFormData('industriesInvolved', opt || [])}
                placeholder="Select relevant industries"
                styles={selectStyles}
                isDisabled={options.industries.length === 0}
                noOptionsMessage={() => "No industries available"}
              />
              {/* Debug info for industries */}
              {process.env.NODE_ENV === 'development' && options.industries.length === 0 && (
                <div className="text-xs text-red-500 mt-1">
                  Debug: No industries loaded. Check console for errors.
                </div>
              )}
            </FormField>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Start Date" icon={Calendar}>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </FormField>
              
              <FormField label="Deadline" icon={Calendar} error={errors.endDate}>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? "border-red-300" : "border-gray-300"
                  }`}
                  min={formData.startDate}
                  aria-describedby={errors.endDate ? "endDate-error" : undefined}
                />
              </FormField>
            </div>

            {/* Description */}
            <FormField label="Detailed Description" icon={FileText} error={errors.description} required>
              <textarea
                placeholder="Provide detailed description of the task"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows="4"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.description.length} characters
              </div>
            </FormField>

            {/* File Upload */}
            <FormField label="Attachments" icon={Upload} error={errors.files}>
              <FileUpload
                files={formData.files}
                onFilesChange={(files) => updateFormData('files', files)}
                error={errors.files}
              />
            </FormField>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || optionsLoading}
                className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-describedby="submit-button-status"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Task
                  </>
                )}
              </button>
            </div>
            <div id="submit-button-status" className="sr-only">
              {loading ? "Creating task, please wait" : "Ready to create task"}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}