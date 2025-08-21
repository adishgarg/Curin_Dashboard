import React from 'react'
import { Trash2, Loader2 } from 'lucide-react'

const DeleteButton = ({ 
  onDelete, 
  isLoading = false, 
  disabled = false,
  confirmMessage = "Are you sure you want to delete this item?",
  itemName = "",
  className = "",
  size = "sm",
  showConfirm = true 
}) => {
  const baseClasses = "inline-flex items-center gap-1 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1"
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-5 py-2.5 text-lg"
  }

  const handleClick = () => {
    if (showConfirm) {
      const message = itemName 
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : confirmMessage
      
      if (window.confirm(message)) {
        onDelete()
      }
    } else {
      onDelete()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
      title={isLoading ? "Deleting..." : "Delete item"}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="animate-spin" />
          <span className="hidden sm:inline">Deleting...</span>
        </>
      ) : (
        <>
          <Trash2 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
          <span className="hidden sm:inline">Delete</span>
        </>
      )}
    </button>
  )
}

export default DeleteButton