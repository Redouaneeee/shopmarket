import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

const loadWishlist = () => {
  try {
    const savedWishlist = localStorage.getItem('wishlist')
    return savedWishlist ? JSON.parse(savedWishlist) : []
  } catch (error) {
    console.error('Error loading wishlist:', error)
    return []
  }
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadWishlist(),
    isOpen: false
  },
  reducers: {
    openWishlist: (state) => {
      state.isOpen = true
    },
    closeWishlist: (state) => {
      state.isOpen = false
    },
    toggleWishlist: (state) => {
      state.isOpen = !state.isOpen
    },
    
    toggleWishlistItem: (state, action) => {
      const product = action.payload
      const exists = state.items.find(item => item.id === product.id)
      
      if (exists) {
        state.items = state.items.filter(item => item.id !== product.id)
        toast.info(`💔 Removed ${product.title} from wishlist`)
      } else {
        state.items.push(product)
        toast.success(`❤️ Added ${product.title} to wishlist`)
      }
      localStorage.setItem('wishlist', JSON.stringify(state.items))
    },
    
    removeFromWishlist: (state, action) => {
      const productId = action.payload
      const product = state.items.find(i => i.id === productId)
      state.items = state.items.filter(item => item.id !== productId)
      toast.info(`💔 Removed ${product?.title || 'item'} from wishlist`)
      localStorage.setItem('wishlist', JSON.stringify(state.items))
    },
    
    clearWishlist: (state) => {
      state.items = []
      localStorage.setItem('wishlist', JSON.stringify([]))
      toast.info('💔 Wishlist cleared')
    }
  }
})

export const { 
  openWishlist, closeWishlist, toggleWishlist,
  toggleWishlistItem, removeFromWishlist, clearWishlist 
} = wishlistSlice.actions

export default wishlistSlice.reducer