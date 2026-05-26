import axiosInstance from './axiosInstance'

export const getWishlist = () => axiosInstance.get('/wishlist/')
export const toggleWishlist = (productId) => axiosInstance.post('/wishlist/toggle/', { product_id: productId })
