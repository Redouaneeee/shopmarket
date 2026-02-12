import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { 
  loginUser, 
  logoutUser, 
  checkAuth,
  clearError 
} from '../store/authSlice'
import { 
  openCart, closeCart, toggleCart,
  addToCart, removeFromCart, updateQuantity, clearCart,
  applyCoupon, removeCoupon,
  saveCartForLater, restoreSavedCart
} from '../store/cartSlice'
import {
  openWishlist, closeWishlist, toggleWishlist,
  toggleWishlistItem, removeFromWishlist, clearWishlist
} from '../store/wishlistSlice'

// ============ AUTH HOOK ============
export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user, isLoading, error, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.role
      navigate(role === 'admin' ? '/admin' : '/client')
      return role
    }
    return null
  }

  const logout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError: () => dispatch(clearError())
  }
}

// ============ CART HOOK ============
export const useCart = () => {
  const dispatch = useDispatch()
  
  const items = useSelector(state => state.cart?.items || [])
  const isOpen = useSelector(state => state.cart?.isOpen || false)
  const isLoading = useSelector(state => state.cart?.isLoading || false)
  const couponCode = useSelector(state => state.cart?.couponCode || null)
  const discount = useSelector(state => state.cart?.discount || 0)
  
  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  return {
    items,
    count,
    subtotal,
    discount: discountAmount,
    total,
    isOpen,
    isLoading,
    couponCode,
    discountPercent: discount,
    
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
    toggleCart: () => dispatch(toggleCart()),
    setCartOpen: (open) => open ? dispatch(openCart()) : dispatch(closeCart()), // ✅ Added
    
    addToCart: (product, quantity = 1) => 
      dispatch(addToCart({ product, quantity })),
    
    removeFromCart: (productId) => 
      dispatch(removeFromCart(productId)),
    
    updateQuantity: (productId, quantity) => 
      dispatch(updateQuantity({ productId, quantity })),
    
    clearCart: () => dispatch(clearCart()),
    
    applyCoupon: (code) => dispatch(applyCoupon(code)),
    removeCoupon: () => dispatch(removeCoupon()),
    
    saveCartForLater: () => dispatch(saveCartForLater()),
    restoreSavedCart: () => dispatch(restoreSavedCart()),
    
    isInCart: (productId) => items.some(item => item.id === productId),
    getItemQuantity: (productId) => 
      items.find(item => item.id === productId)?.quantity || 0,
    
    cart: items,  
    cartCount: count, 
    cartTotal: total,  
    cartOpen: isOpen,  
    setCartOpen: (open) => open ? dispatch(openCart()) : dispatch(closeCart()) // ✅ Alias
  }
}


export const useWishlist = () => {
  const dispatch = useDispatch()
  
  const items = useSelector(state => state.wishlist?.items || [])
  const isOpen = useSelector(state => state.wishlist?.isOpen || false)
  const count = items.length

  return {
    items,
    count,
    isOpen,
    wishlist: items, 
    wishlistCount: count, 
    wishlistOpen: isOpen, 
    
    openWishlist: () => dispatch(openWishlist()),
    closeWishlist: () => dispatch(closeWishlist()),
    toggleWishlist: () => dispatch(toggleWishlist()),
    setWishlistOpen: (open) => open ? dispatch(openWishlist()) : dispatch(closeWishlist()), // ✅ Added
    
    toggleItem: (product) => dispatch(toggleWishlistItem(product)),
    toggleWishlistItem: (product) => dispatch(toggleWishlistItem(product)), // ✅ Alias
    removeItem: (productId) => dispatch(removeFromWishlist(productId)),
    removeFromWishlist: (productId) => dispatch(removeFromWishlist(productId)), // ✅ Alias
    clearWishlist: () => dispatch(clearWishlist()),
    
    isInWishlist: (productId) => items.some(item => item.id === productId)
  }
}