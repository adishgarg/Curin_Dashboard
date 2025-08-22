import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const employeeService = {
    async getAllEmployees() {
        try {
            console.log("Making API call to:", ENDPOINTS.EMPLOYEES_ALL)
            const response = await apiClient.get(ENDPOINTS.EMPLOYEES_ALL)
            
            // Comprehensive debug logging
            console.log("Full API Response:", response)
            console.log("Response type:", typeof response)
            console.log("Is response an array?", Array.isArray(response))
            console.log("Response.data:", response.data)
            console.log("Response.data type:", typeof response.data)
            console.log("Is response.data an array?", Array.isArray(response.data))
            
            // Handle the actual response structure based on your logs
            if (Array.isArray(response)) {
                // Response itself is the array (most likely case based on logs)
                console.log("Response itself is an array, returning:", response)
                return response
            } else if (Array.isArray(response.data)) {
                // Data is in response.data
                console.log("Response.data is an array, returning:", response.data)
                return response.data
            } else if (response.data && Array.isArray(response.data.data)) {
                // Nested in data.data
                console.log("Response is nested in data.data, returning:", response.data.data)
                return response.data.data
            } else if (response.data && Array.isArray(response.data.employees)) {
                // Nested in data.employees
                console.log("Response is nested in data.employees, returning:", response.data.employees)
                return response.data.employees
            } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // Success wrapper
                console.log("Response has success wrapper, returning:", response.data.data)
                return response.data.data
            } else {
                // Log everything to understand the structure
                console.error("Could not determine response structure:")
                console.error("Response:", response)
                console.error("Type of response:", typeof response)
                console.error("Response keys:", Object.keys(response || {}))
                if (response && typeof response === 'object') {
                    console.error("Response.data:", response.data)
                    console.error("Response.data keys:", Object.keys(response.data || {}))
                }
                return []
            }
        } catch (error) {
            console.error("Error in getAllEmployees:", error)
            console.error("Error response:", error.response)
            throw error
        }
    },

    async getEmployeeById(id) {
        const response = await apiClient.get(ENDPOINTS.EMPLOYEE_BY_ID(id))
        return response.data?.employee
    },

    async createEmployee(employeeData) {
        return await apiClient.post(ENDPOINTS.EMPLOYEE_CREATE, employeeData)
    },

    async updateEmployee(id, updates){
        return await apiClient.put(ENDPOINTS.EMPLOYEES_UPDATE(id), updates)
    },

    async deleteEmployee(id) {
        return await apiClient.delete(ENDPOINTS.EMPLOYEES_DELETE(id))
    },

    async updatePass(pass) {
        return await apiClient.put(ENDPOINTS.EMPLOYEES_UPDATEPASS, pass)
    }
}