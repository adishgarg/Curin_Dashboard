export const ENDPOINTS = {
    EMPLOYEE_CREATE: '/employees/create',
    EMPLOYEE_BY_ID: (id) => `/employees/get/${id}`,
    EMPLOYEES_ALL: '/employees/getAll',
    EMPLOYEES_DELETE: (id) => `/employees/delete/${id}`,
    EMPLOYEES_UPDATE: (id) => `/employees/update/${id}`,
    EMPLOYEES_UPDATEPASS: '/employees/updatePass',
    
    AUTH_LOGIN: '/auth/login',

    TASK_ALL: '/tasks/getAll',
    TASK_CREATE: '/tasks/create',
    TASK_BY_ID: (id) => `/tasks/get/${id}`,
    TASK_UPDATE: (id) => `/tasks/update/${id}`,
    TASK_DELETE: (id) => `/tasks/delete/${id}`,
    TASK_ASSIGNED_TO_ME: '/tasks/assignedToMe',

    ORGANIZATION_ALL: '/organizations/getAll',

    INDUSTRY_ALL: '/industries/getAll',
    INDUSTRY_CREATE: '/industries/create',

    USER_PROFILE: "/auth/me",
    USERS: "/users",

    ORGANIZATION_CREATE: "/organizations/create",

    ORGANIZATION_UPDATE: (id) => `/organizations/update/${id}`,
    ORGANIZATION_DELETE: (id) => `/organizations/delete/${id}`,

    EVENT_CREATE: '/events/create',
    EVENT_ALL: '/events/getAll',
    EVENT_BY_ID: (id) => `/events/getOne/${id}`,
    EVENT_UPDATE: (id) => `/events/update/${id}`,
    EVENT_DELETE: (id) => `/events/delete/${id}`,
    EVENT_BOOKED_DATES: '/events/booked-dates',
}