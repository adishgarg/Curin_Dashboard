
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const taskService = {
    async getAllTasks() {
        const response = await apiClient.get(ENDPOINTS.TASK_ALL);
        console.log("Raw API response:", response); // Debug log
        // Handle both possible response formats
        return response.data || response.tasks || [];
    },

    async getTaskById(id) {
        const response = await apiClient.get(ENDPOINTS.TASK_BY_ID(id));
        return response.data?.task;
    },

    async createTask(taskData) {
        return await apiClient.post(ENDPOINTS.TASK_CREATE, taskData);
    },

    async updateTask(id, updates) {
        return await apiClient.put(ENDPOINTS.TASK_UPDATE(id), updates);
    },

    async deleteTask(id) {
        return await apiClient.delete(ENDPOINTS.TASK_DELETE(id));
    }
}