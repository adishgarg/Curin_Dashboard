import { apiClient } from './client.js'

export const fileUploadService = {
  // Upload a single file
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Use the file upload endpoint - update this URL to match your backend
      const response = await apiClient.request('/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        requireAuth: true, // Files usually need authentication
      })
      
      return {
        success: true,
        url: response.data?.url || response.url,
        filename: response.data?.filename || file.name,
      }
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }
  },

  // Upload multiple files
  async uploadFiles(files) {
    const uploadPromises = files.map(file => this.uploadFile(file))
    
    try {
      const results = await Promise.allSettled(uploadPromises)
      
      const successful = []
      const failed = []
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push({
            ...result.value,
            originalFile: files[index],
          })
        } else {
          failed.push({
            file: files[index],
            error: result.reason.message,
          })
        }
      })
      
      return { successful, failed }
    } catch (error) {
      throw new Error('Batch file upload failed')
    }
  },

  // Delete a file
  async deleteFile(fileUrl) {
    try {
      await apiClient.delete(`/files/delete`, {
        data: { url: fileUrl }
      })
      return { success: true }
    } catch (error) {
      console.error('File deletion failed:', error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  },

  // Get file info
  async getFileInfo(fileUrl) {
    try {
      const response = await apiClient.get(`/files/info`, {
        params: { url: fileUrl }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get file info:', error)
      throw new Error(`Failed to get file info: ${error.message}`)
    }
  },

  // Validate file before upload
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [], // Empty array means all types allowed
      maxFiles = 10,
    } = options

    const errors = []

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File ${file.name} is too large. Maximum size is ${this.formatFileSize(maxSize)}.`)
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase()
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      const isAllowed = allowedTypes.some(type => 
        fileType.includes(type.toLowerCase()) || 
        fileExtension === type.toLowerCase().replace('.', '')
      )
      
      if (!isAllowed) {
        errors.push(`File type ${fileType || fileExtension} is not allowed.`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
}
