import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const userService = {
    async getCurrentUser() {
        return await apiClient.get(ENDPOINTS.USER_PROFILE)
    },
    
    async getUserById(userId) {
        return await apiClient.get(`${ENDPOINTS.USERS}/${userId}`)
    }
}