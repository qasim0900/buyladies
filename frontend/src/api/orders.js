import axiosInstance from './axiosInstance'

export const getOrders = () => axiosInstance.get('/orders/')
export const getOrder = (id) => axiosInstance.get(`/orders/${id}/`)
export const createOrder = (data) => axiosInstance.post('/orders/create/', data)
export const cancelOrder = (id) => axiosInstance.post(`/orders/${id}/cancel/`)
export const validateCoupon = (code, orderAmount) => axiosInstance.post('/coupons/validate/', { code, order_amount: orderAmount })
