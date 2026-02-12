import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from './WishlistContext'
import { useCart } from './CartContext'
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import './WishlistSidebar.css'

const WishlistSidebar = () => {
  const { 
    wishlist, 
    wishlistOpen, 
    setWishlistOpen, 
    toggleWishlist,
    clearWishlist,
    wishlistCount 
  } = useWishlist()
  
  const { addToCart } = useCart()

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 })
    toast.success(`🛒 Added ${product.title} to cart!`)
  }

  const handleRemoveFromWishlist = (product) => {
    toggleWishlist(product)
  }

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <>
          <motion.div
            className="wishlist-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWishlistOpen(false)}
          />
          
          <motion.div
            className="wishlist-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
          >
            <div className="wishlist-header">
              <div className="wishlist-title">
                <Heart size={24} fill={wishlist.length > 0 ? "currentColor" : "none"} />
                <h2>My Wishlist</h2>
                <span className="wishlist-count">{wishlist.length}</span>
              </div>
              <button 
                className="close-btn"
                onClick={() => setWishlistOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="empty-wishlist">
                <Heart size={64} className="empty-wishlist-icon" />
                <h3>Your wishlist is empty</h3>
                <p>Save your favorite items here!</p>
                <button 
                  className="continue-shopping"
                  onClick={() => setWishlistOpen(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="wishlist-items">
                  {wishlist.map((item) => (
                    <motion.div
                      key={item.id}
                      className="wishlist-item"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <img 
                        src={item.images?.[0]} 
                        alt={item.title}
                        className="wishlist-item-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/667eea/ffffff?text=Product'
                        }}
                      />
                      
                      <div className="wishlist-item-details">
                        <h4 className="wishlist-item-title">{item.title}</h4>
                        <p className="wishlist-item-price">${item.price?.toFixed(2)}</p>
                        
                        <div className="wishlist-item-actions">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="add-to-cart-wishlist"
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                          
                          <button
                            onClick={() => handleRemoveFromWishlist(item)}
                            className="remove-from-wishlist"
                            title="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="wishlist-footer">
                  <div className="wishlist-summary">
                    <div className="summary-row">
                      <span>Total Items</span>
                      <span className="total-items">{wishlist.length}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Value</span>
                      <span className="total-value">
                        ${wishlist.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="wishlist-actions">
                    <button 
                      onClick={clearWishlist}
                      className="clear-wishlist-btn"
                    >
                      Clear Wishlist
                    </button>
                    <button 
                      onClick={() => setWishlistOpen(false)}
                      className="continue-shopping-btn"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default WishlistSidebar