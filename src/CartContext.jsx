import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    if (!product || !product.id) {
      toast.error('Invalid product')
      return
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      )

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        const updatedCart = [...prevCart]
        const newQuantity = updatedCart[existingItemIndex].quantity + quantity
        
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQuantity
        }

        toast.success(
          <div className="cart-toast">
            <div className="toast-icon">🛒</div>
            <div className="toast-content">
              <strong>Added to cart!</strong>
              <div>{product.title} × {quantity}</div>
              <small>Total: ${((product.price || 0) * newQuantity).toFixed(2)}</small>
            </div>
          </div>,
          {
            icon: false,
            style: {
              background: 'rgba(72, 187, 120, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)'
            }
          }
        )

        return updatedCart
      } else {
        // Add new item
        const newItem = {
          ...product,
          quantity,
          selectedOptions: options,
          addedAt: new Date().toISOString()
        }

        toast.success(
          <div className="cart-toast">
            <div className="toast-icon">✨</div>
            <div className="toast-content">
              <strong>New in cart!</strong>
              <div>{product.title}</div>
              <small>${(product.price || 0).toFixed(2)} each</small>
            </div>
          </div>,
          {
            icon: false,
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)'
            }
          }
        )

        return [...prevCart, newItem]
      }
    })
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((productId, productTitle = '') => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId)
      
      toast.info(
        <div className="cart-toast">
          <div className="toast-icon">🗑️</div>
          <div className="toast-content">
            <strong>Removed from cart</strong>
            <div>{productTitle || 'Item'}</div>
          </div>
        </div>,
        {
          icon: false,
          style: {
            background: 'rgba(245, 101, 101, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }
      )

      return newCart
    })
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      const item = cart.find(i => i.id === productId)
      removeFromCart(productId, item?.title)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }, [cart, removeFromCart])

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([])
    setDiscount(0)
    setCouponCode('')
    toast.info(
      <div className="cart-toast">
        <div className="toast-icon">🧹</div>
        <div className="toast-content">
          <strong>Cart cleared</strong>
          <div>All items have been removed</div>
        </div>
      </div>,
      {
        icon: false,
        style: {
          background: 'rgba(102, 126, 234, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)'
        }
      }
    )
  }, [])

  // Apply coupon code
  const applyCoupon = useCallback((code) => {
    const validCoupons = {
      'SAVE10': 10,
      'SAVE20': 20,
      'WELCOME15': 15,
      'FLASH25': 25,
      'FREESHIP': 0
    }

    const upperCode = code.toUpperCase()
    
    if (validCoupons[upperCode] !== undefined) {
      setCouponCode(upperCode)
      setDiscount(validCoupons[upperCode])
      toast.success(
        <div className="cart-toast">
          <div className="toast-icon">🎫</div>
          <div className="toast-content">
            <strong>Coupon applied!</strong>
            <div>{upperCode} - {validCoupons[upperCode]}% off</div>
          </div>
        </div>,
        {
          icon: false,
          style: {
            background: 'rgba(72, 187, 120, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }
      )
      return true
    } else {
      toast.error(
        <div className="cart-toast">
          <div className="toast-icon">❌</div>
          <div className="toast-content">
            <strong>Invalid coupon</strong>
            <div>Please check the code and try again</div>
          </div>
        </div>,
        {
          icon: false,
          style: {
            background: 'rgba(245, 101, 101, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }
      )
      return false
    }
  }, [])

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCouponCode('')
    setDiscount(0)
    toast.info('Coupon removed', {
      style: {
        background: 'rgba(102, 126, 234, 0.95)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        borderRadius: '12px'
      }
    })
  }, [])

  // Calculate cart totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
  }, [cart])

  const cartDiscount = useMemo(() => {
    return discount > 0 ? (cartSubtotal * discount) / 100 : 0
  }, [cartSubtotal, discount])

  const cartTotal = useMemo(() => {
    return cartSubtotal - cartDiscount
  }, [cartSubtotal, cartDiscount])

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const shippingCost = useMemo(() => {
    return cartSubtotal > 50 ? 0 : 5.99
  }, [cartSubtotal])

  const finalTotal = useMemo(() => {
    return cartTotal + shippingCost
  }, [cartTotal, shippingCost])

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return cart.some(item => item.id === productId)
  }, [cart])

  // Get item quantity
  const getItemQuantity = useCallback((productId) => {
    const item = cart.find(item => item.id === productId)
    return item?.quantity || 0
  }, [cart])

  // Merge duplicate items
  const mergeDuplicateItems = useCallback(() => {
    const mergedCart = cart.reduce((acc, item) => {
      const existingItem = acc.find(i => 
        i.id === item.id && 
        JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
      )
      
      if (existingItem) {
        existingItem.quantity += item.quantity
        return acc
      }
      
      return [...acc, { ...item }]
    }, [])

    if (mergedCart.length !== cart.length) {
      setCart(mergedCart)
      toast.success('Duplicate items merged', {
        style: {
          background: 'rgba(72, 187, 120, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          borderRadius: '12px'
        }
      })
    }
  }, [cart])

  // Save cart for later
  const saveCartForLater = useCallback(() => {
    localStorage.setItem('savedCart', JSON.stringify(cart))
    toast.success('Cart saved for later', {
      style: {
        background: 'rgba(72, 187, 120, 0.95)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        borderRadius: '12px'
      }
    })
  }, [cart])

  // Restore saved cart
  const restoreSavedCart = useCallback(() => {
    const savedCart = localStorage.getItem('savedCart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
        toast.success('Saved cart restored', {
          style: {
            background: 'rgba(72, 187, 120, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '12px'
          }
        })
      } catch (error) {
        console.error('Error restoring cart:', error)
        toast.error('Failed to restore cart')
      }
    } else {
      toast.info('No saved cart found')
    }
  }, [])

  // Cart value object
  const value = {
    // State
    cart,
    cartOpen,
    cartCount,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    shippingCost,
    finalTotal,
    couponCode,
    discount,
    isLoading,
    
    // Setters
    setCartOpen,
    setIsLoading,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    isInCart,
    getItemQuantity,
    mergeDuplicateItems,
    saveCartForLater,
    restoreSavedCart,
    
    // Utilities
    isEmpty: cart.length === 0,
    itemCount: cartCount,
    formattedSubtotal: `$${cartSubtotal.toFixed(2)}`,
    formattedDiscount: `$${cartDiscount.toFixed(2)}`,
    formattedTotal: `$${cartTotal.toFixed(2)}`,
    formattedShipping: `$${shippingCost.toFixed(2)}`,
    formattedFinalTotal: `$${finalTotal.toFixed(2)}`
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}