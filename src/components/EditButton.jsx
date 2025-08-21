import React from 'react'
import { Edit3, Save, X } from 'lucide-react'

const EditButton = ({ 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  disabled = false,
  className = "",
  size = "sm" 
}) => {
  const baseClasses = "inline-flex items-center gap-1 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg"
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={disabled}
          className={`${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
          title="Save changes"
        >
          <Save size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          onClick={onCancel}
          className={`${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 focus:ring-gray-500 shadow-lg hover:shadow-xl ${className}`}
          title="Cancel editing"
        >
          <X size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onEdit}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
      title="Edit item"
    >
      <Edit3 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
      <span className="hidden sm:inline">Edit</span>
    </button>
  )
}

export default EditButton