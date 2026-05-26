import axiosInstance from './axiosInstance'

export const register = (data) => axiosInstance.post('/auth/register/', data)
export const login = (data) => axiosInstance.post('/auth/login/', data)
export const logout = (refresh) => axiosInstance.post('/auth/logout/', { refresh })
export const getProfile = () => axiosInstance.get('/auth/profile/')
export const updateProfile = (data) => axiosInstance.patch('/auth/profile/', data)
export const getAddresses = () => axiosInstance.get('/auth/addresses/')
export const createAddress = (data) => axiosInstance.post('/auth/addresses/', data)
export const updateAddress = (id, data) => axiosInstance.patch(`/auth/addresses/${id}/`, data)
export const deleteAddress = (id) => axiosInstance.delete(`/auth/addresses/${id}/`)
