class ApiClient {
    constructor(){
        this.baseUrl = process.env.API_URL;
    }
    async request(endpoint, options = {}){
        const url = `${this.baseUrl}${endpoint}`
        const config = {
            headers: {
                "Content-Type":  "application/json",
                ...options.headers,
            },
            ...options,
        }

        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        try{
            const response = await fetch(url, config)
            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (process.env.NODE_ENV === 'development'){
                console.log(`API ${config.method ||  'GET'} ${endpoint}`, {
                    request: options.body ? JSON.parse(options.body) : null,
                    response: data,
                })
            }
            return data
        }catch(error){
            console.error(`API request failed: ${config.method || 'GET'} ${endpoint}`, error)
            throw error
        }
    }
    get (endpoint, options = {}){
        return this.request(endpoint, {method: 'GET', ...options})
    }
    post (endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        })
    }
    put (endpoint, data, options = {}){
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        })
    }
    delete (endpoint, options = {}){
        return this.request(endpoint, {method: 'DELETE', ...options})
    }
    patch(endpoint, data, options = {}){
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options,
        })
    }
}

export const apiClient = new ApiClient()
export default ApiClient