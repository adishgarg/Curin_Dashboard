import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const organizationService = {
    async getAllOrganizations() {
        const response = await apiClient.get(ENDPOINTS.ORGANIZATION_ALL)
        
        // Handle the response structure: {"success":true,"data":[...]}
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            return response.data.data // Return just the organizations array
        }
        
        // Fallback for different response structures
        return response.data?.organizations || response.data || []
    }
}