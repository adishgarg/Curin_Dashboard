import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const logoutService = {
    async logout() {
        try {
            // Call API logout endpoint if your backend has one
            await apiClient.post(ENDPOINTS.AUTH_LOGOUT)
        } catch (error) {
            // Even if API call fails, we'll clear local storage
            console.warn("Logout API call failed:", error)
        } finally {
            // Clear local storage
            localStorage.removeItem("token")
            localStorage.removeItem("user")
        }
    },
    
    // Quick logout without API call
    logoutLocal() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }
}