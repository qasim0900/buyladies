import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as cartApi from '../../api/cart'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart()
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

export const addItemToCart = createAsyncThunk('cart/add', async ({ variantId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartApi.addToCart(variantId, quantity)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

export const updateItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartApi.updateCartItem(itemId, quantity)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

export const removeItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartApi.removeCartItem(itemId)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total_items: 0, subtotal: '0.00', loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false
      state.items = action.payload.items || []
      state.total_items = action.payload.total_items || 0
      state.subtotal = action.payload.subtotal || '0.00'
    }
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(addItemToCart.fulfilled, setCart)
      .addCase(updateItem.fulfilled, setCart)
      .addCase(removeItem.fulfilled, setCart)
  },
})

export default cartSlice.reducer
