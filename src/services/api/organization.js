import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const organizationService = {
    async getAllOrganizations() {
        const response = await apiClient.get(ENDPOINTS.ORGANIZATION_ALL)
        return response.data?.organizations || []
    }
}