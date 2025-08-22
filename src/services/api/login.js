import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const loginService = {
    async login(loginData){
        const response = await apiClient.post(ENDPOINTS.AUTH_LOGIN, loginData)
        
        // Store user data in localStorage if available in response
        if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user))
        }
        
        return response
    }
}