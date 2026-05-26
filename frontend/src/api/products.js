import axiosInstance from './axiosInstance'

export const getProducts = (params) => axiosInstance.get('/products/', { params })
export const getProduct = (slug) => axiosInstance.get(`/products/${slug}/`)
export const getFeaturedProducts = () => axiosInstance.get('/products/featured/')
export const getNewArrivals = () => axiosInstance.get('/products/new-arrivals/')
export const getBestSellers = () => axiosInstance.get('/products/best-sellers/')
export const getCategories = () => axiosInstance.get('/products/categories/')
export const getBrands = () => axiosInstance.get('/products/brands/')
export const getColors = () => axiosInstance.get('/products/colors/')
export const getSizes = () => axiosInstance.get('/products/sizes/')
export const getProductReviews = (slug) => axiosInstance.get(`/reviews/${slug}/`)
export const createProductReview = (slug, data) => axiosInstance.post(`/reviews/${slug}/create/`, data)
