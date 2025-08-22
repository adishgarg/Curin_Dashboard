import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const industryService = {
    async getAllIndustries() {
        try {
            const response = await apiClient.get(ENDPOINTS.INDUSTRY_ALL)
            
            console.log("Raw industry response:", response) // Debug log
            
            // Check if response is directly an array (which it is based on your logs)
            if (Array.isArray(response)) {
                console.log("Response is array, returning:", response) // Debug log
                return response
            }
            
            // Handle different response structures
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                console.log("Industries from response.data.data:", response.data.data) // Debug log
                return response.data.data 
            }
            
            // Check if response.data is directly an array
            if (Array.isArray(response.data)) {
                console.log("Response.data is array, returning:", response.data) // Debug log
                return response.data
            }
            
            // Fallback for different response structures
            const industries = response.data?.industries || response.industries || []
            console.log("Industries fallback:", industries) // Debug log
            return industries
        } catch (error) {
            console.error("Error in industryService.getAllIndustries:", error)
            throw error
        }
    }
}