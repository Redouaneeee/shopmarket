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
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const normalizedEmail = email.toLowerCase().trim()
      const user = predefinedUsers[normalizedEmail]
      
      if (user && user.password === password) {
        const userData = {
          email: normalizedEmail,
          role: user.role,
          name: user.name,
          id: `user-${Date.now()}`,
          isAuthenticated: true
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Show different welcome message based on role
        if (user.role === 'admin') {
          toast.success('👑 Welcome back, Admin!')
        } else {
          toast.success(`✨ Welcome back, ${user.name}!`)
        }
        
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
        const userData = JSON.parse(storedUser)
        // Ensure role is preserved
        if (userData.role) {
          return { ...userData, isAuthenticated: true }
        }
      } catch (error) {
        localStorage.removeItem('user')
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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
        console.log('Redux state updated - User role:', action.payload.role) // Debug log
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = !!action.payload
        if (action.payload) {
          console.log('Auth checked - User role:', action.payload.role) // Debug log
        }
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer