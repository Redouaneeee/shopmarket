import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

const predefinedUsers = {
  'client@exemple.com': { password: 'client123', role: 'client', name: 'Client' },
  'admin@exemple.com': { password: 'admin123', role: 'admin', name: 'Admin' }
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (predefinedUsers[email] && predefinedUsers[email].password === password) {
        const userData = {
          email,
          role: predefinedUsers[email].role,
          name: predefinedUsers[email].name,
          id: `user-${Date.now()}`
        }
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success(`✨ Welcome back, ${userData.name}!`)
        return userData
      } else {
        toast.error('❌ Invalid email or password')
        return rejectWithValue('Invalid credentials')
      }
    } catch (error) {
      toast.error('❌ Login failed')
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('user')
    toast.info('👋 Logged out successfully')
    return null
  }
)

export const checkAuth = createAsyncThunk(
  'auth/check',
  async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (error) {
        localStorage.removeItem('user')
        return null
      }
    }
    return null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer