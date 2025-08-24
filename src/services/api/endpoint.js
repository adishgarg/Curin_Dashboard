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
    TASK_BY_ID: (id) => `/tasks/getOne/${id}`,
    TASK_UPDATE: (id) => `/tasks/update/${id}`,
    TASK_DELETE: (id) => `/tasks/delete/${id}`,

    ORGANIZATION_ALL: '/organizations/getAll',

    INDUSTRY_ALL: '/industries/getAll',

    USER_PROFILE: "/user/profile",
    USERS: "/users",
}