
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
        console.log("getTaskById response:", response); // Debug log
        
        // Handle the response structure: response should have success and data properties
        if (response.success && response.data) {
            return response.data;
        }
        
        // Fallback for other possible structures
        return response.data?.data || response.data || response;
    },

    async getAssignedToMeTasks() {
        const response = await apiClient.get(ENDPOINTS.TASK_ASSIGNED_TO_ME);
        console.log("getAssignedToMeTasks response:", response); // Debug log
        
        // Handle the response structure
        if (response.success && response.data) {
            return response.data;
        }
        
        // Fallback for other possible structures
        return response.data || response.tasks || [];
    },

    async createTask(taskData) {
        return await apiClient.post(ENDPOINTS.TASK_CREATE, taskData);
    },

    // New method for creating task with files
    async createTaskWithFiles(taskData, files = []) {
        // Create FormData to handle both task data and files
        const formData = new FormData();
        
        // Add task data as JSON with key 'data' (as specified)
        formData.append('data', JSON.stringify(taskData));
        
        // Add files with key 'files' (multiple files with same key)
        files.forEach((fileObj) => {
            if (fileObj.file) {
                formData.append('files', fileObj.file);
            }
        });

        console.log("FormData contents:", {
            data: JSON.stringify(taskData),
            filesCount: files.length
        }); // Debug log

        // Send multipart request
        return await apiClient.request(ENDPOINTS.TASK_CREATE, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type, let browser set it for FormData
            },
            requireAuth: true
        });
    },

    async updateTask(id, updates) {
        return await apiClient.put(ENDPOINTS.TASK_UPDATE(id), updates);
    },

    async deleteTask(id) {
        return await apiClient.delete(ENDPOINTS.TASK_DELETE(id));
    }
}