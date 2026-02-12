import React, { createContext, useState, useContext, useEffect } from 'react'
import { toast } from 'react-toastify'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])
  const [wishlistOpen, setWishlistOpen] = useState(false) // ✅ NEW: wishlist sidebar state

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Error loading wishlist:', error)
        localStorage.removeItem('wishlist')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) {
        toast.info(`💔 Removed ${product.title} from wishlist`)
        return prev.filter(item => item.id !== product.id)
      }
      toast.success(`❤️ Added ${product.title} to wishlist`)
      return [...prev, product]
    })
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setWishlist([])
    toast.info('💔 Wishlist cleared')
  }

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      wishlistOpen,
      setWishlistOpen,
      toggleWishlist, 
      isInWishlist,
      clearWishlist,
      wishlistCount: wishlist.length 
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}