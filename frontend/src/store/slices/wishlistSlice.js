import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as wishlistApi from '../../api/wishlist'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistApi.getWishlist()
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

export const toggleWishlistItem = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    await wishlistApi.toggleWishlist(productId)
    const res = await wishlistApi.getWishlist()
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], count: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    const setWishlist = (state, action) => {
      state.loading = false
      state.items = action.payload.items || []
      state.count = action.payload.count || 0
    }
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true })
      .addCase(fetchWishlist.fulfilled, setWishlist)
      .addCase(toggleWishlistItem.fulfilled, setWishlist)
  },
})

export default wishlistSlice.reducer
