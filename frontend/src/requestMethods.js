import axios from 'axios'

const BASE_URL = "http://localhost:8000/api/v1"

export const publicRequest = axios.create({
   baseURL: BASE_URL,
   withCredentials: true,
})

export const adminRequest = axios.create({
   baseURL: "http://localhost:8000/api/v1/admin",
   withCredentials: true,
});
