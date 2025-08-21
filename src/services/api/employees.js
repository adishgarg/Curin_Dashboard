import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const employeeService = {
    async getAllEmployees() {
        const response = await apiClient.get(ENDPOINTS.EMPLOYEES_ALL)
        return response.data?.employees || []
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

    async deleteEmployees(id) {
        return await apiClient.delete(ENDPOINTS.EMPLOYEES_DELETE(id))
    },

    async updatePass(pass) {
        return await apiClient.put(ENDPOINTS.EMPLOYEES_UPDATEPASS, pass)
    }
}