import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

const loadCart = () => {
  try {
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  } catch (error) {
    console.error('Error loading cart:', error)
    return []
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    isOpen: false,
    isLoading: false,
    couponCode: null,
    discount: 0
  },
  reducers: {
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
        toast.success(`🛒 Increased ${product.title} quantity`)
      } else {
        state.items.push({
          ...product,
          quantity,
          addedAt: new Date().toISOString()
        })
        toast.success(`✨ Added ${product.title} to cart`)
      }
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload
      const item = state.items.find(i => i.id === productId)
      state.items = state.items.filter(item => item.id !== productId)
      toast.info(`🗑️ Removed ${item?.title || 'item'} from cart`)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload
      if (quantity < 1) {
        state.items = state.items.filter(item => item.id !== productId)
      } else {
        const item = state.items.find(item => item.id === productId)
        if (item) {
          item.quantity = quantity
        }
      }
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    
    clearCart: (state) => {
      state.items = []
      state.couponCode = null
      state.discount = 0
      localStorage.setItem('cart', JSON.stringify([]))
      toast.info('🧹 Cart cleared')
    },
    
    applyCoupon: (state, action) => {
      const code = action.payload.toUpperCase()
      const validCoupons = {
        'SAVE10': 10,
        'SAVE20': 20,
        'WELCOME15': 15,
        'FLASH25': 25
      }
      
      if (validCoupons[code]) {
        state.couponCode = code
        state.discount = validCoupons[code]
        toast.success(`🎫 Coupon applied: ${code} (${validCoupons[code]}% off)`)
      } else {
        toast.error('❌ Invalid coupon code')
      }
    },
    
    removeCoupon: (state) => {
      state.couponCode = null
      state.discount = 0
      toast.info('Coupon removed')
    },
    
    saveCartForLater: (state) => {
      localStorage.setItem('savedCart', JSON.stringify(state.items))
      toast.success('💾 Cart saved for later')
    },
    
    restoreSavedCart: (state) => {
      const savedCart = localStorage.getItem('savedCart')
      if (savedCart) {
        state.items = JSON.parse(savedCart)
        toast.success('📦 Saved cart restored')
      }
    }
  }
})

export const { 
  openCart, closeCart, toggleCart,
  addToCart, removeFromCart, updateQuantity, clearCart,
  applyCoupon, removeCoupon,
  saveCartForLater, restoreSavedCart
} = cartSlice.actions

export default cartSlice.reducer