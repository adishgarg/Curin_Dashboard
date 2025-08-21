import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const loginService = {
    async login(loginData){
        return await apiClient.post(ENDPOINTS.AUTH_LOGIN, loginData)
    }
}