import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoint";

export const eventService = {
    async createEvent(eventData, posterFile) {
        const formData = new FormData();
        
        console.log("Raw eventData received:", eventData);
        console.log("Conveners array:", eventData.conveners);
        console.log("Conveners length:", eventData.conveners?.length);
        
        // Append each field individually (as your backend expects)
        formData.append('eventName', eventData.eventName);
        formData.append('proposedDateFrom', eventData.proposedDateFrom);
        formData.append('proposedDateTo', eventData.proposedDateTo);
        formData.append('fromTime', eventData.fromTime);
        formData.append('toTime', eventData.toTime);
        formData.append('organizedBy', eventData.organizedBy);
        formData.append('venue', eventData.venue);
        formData.append('budget', eventData.budget);
        
        // Handle conveners array - append each convener separately
        if (eventData.conveners && Array.isArray(eventData.conveners)) {
            console.log("Processing conveners array:", eventData.conveners);
            eventData.conveners.forEach((convenerId, index) => {
                console.log(`Adding convener[${index}]:`, convenerId);
                formData.append(`conveners[${index}]`, convenerId);
            });
        } else {
            console.warn("No conveners found or conveners is not an array:", eventData.conveners);
        }
        
        // Append poster file if provided
        if (posterFile) {
            formData.append('poster', posterFile);
        }

        console.log("Creating event with FormData:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        return await apiClient.request(ENDPOINTS.EVENT_CREATE, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type for FormData, let browser set it with boundary
        });
    },

    async getAllEvents() {
        const response = await apiClient.get(ENDPOINTS.EVENT_ALL);
        console.log("Raw API response for getAllEvents:", response);
        
        // Handle different response structures
        if (Array.isArray(response)) {
            console.log("Response is direct array:", response.length, "events");
            return response;
        } else if (response.data && Array.isArray(response.data)) {
            console.log("Response.data is array:", response.data.length, "events");
            return response.data;
        } else if (response.events && Array.isArray(response.events)) {
            console.log("Response.events is array:", response.events.length, "events");
            return response.events;
        } else {
            console.warn("Unexpected response structure:", response);
            return [];
        }
    },

    async getBookedDates() {
        const response = await apiClient.get(ENDPOINTS.EVENT_BOOKED_DATES);
        console.log("Raw API response for getBookedDates:", response);
        return response.data?.bookedDates || response.bookedDates || [];
    },

    async getEventById(id) {
        const response = await apiClient.get(ENDPOINTS.EVENT_BY_ID(id));
        console.log("Raw API response for getEventById:", response);
        
        // Handle different response structures
        if (response && response._id) {
            // Direct event object
            console.log("Response is direct event object");
            return response;
        } else if (response.data && response.data._id) {
            // Event in data property
            console.log("Event in response.data");
            return response.data;
        } else if (response.event && response.event._id) {
            // Event in event property
            console.log("Event in response.event");
            return response.event;
        } else {
            console.warn("Unexpected response structure for getEventById:", response);
            throw new Error("Event not found");
        }
    }
}