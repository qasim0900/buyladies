import axiosInstance from './axiosInstance'

export const getCart = () => axiosInstance.get('/cart/')
export const addToCart = (variantId, quantity = 1) => axiosInstance.post('/cart/add/', { variant_id: variantId, quantity })
export const updateCartItem = (itemId, quantity) => axiosInstance.patch(`/cart/items/${itemId}/update/`, { quantity })
export const removeCartItem = (itemId) => axiosInstance.delete(`/cart/items/${itemId}/remove/`)
export const clearCart = () => axiosInstance.delete('/cart/clear/')
