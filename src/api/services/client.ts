import axios from "axios";


const $auth_api_host = axios.create(
    {
        baseURL: import.meta.env.VITE_AUTH_API_URL
    }
)

// const $authHost = axios.create(
//     {
//         baseURL: import.meta.env.VITE_AUTH_API_URL
//     }
// )
//
// const authInterceptor = function (config: any) {
//     config.headers.authorization = `Bearer ${cookie.get('token')}`
//     return config
// }
//
// $authHost.interceptors.request.use(authInterceptor)

export {
    $auth_api_host
}