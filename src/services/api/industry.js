import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const industryService = {
    async getAllIndustries() {
        const response = await apiClient.get(ENDPOINTS.INDUSTRY_ALL)

      
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            return response.data.data 
        }
        
        // Fallback for different response structures
        return response.data?.industries || response.data || []
    }
}