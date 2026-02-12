import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './store/useAuth'
import { orderAPI } from './api'
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'react-toastify'
import './CartSidebar.css'

const CartSidebar = () => {
  const { 
    items, 
    isOpen, 
    closeCart,
    removeFromCart, 
    updateQuantity, 
    clearCart,
    total 
  } = useCart()

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.warning('Your cart is empty!')
      return
    }

    try {
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          images: item.images
        })),
        total: total,
        date: new Date().toISOString()
      }

      const response = await orderAPI.submitOrder(orderData)
      
      if (response.success) {
        toast.success('🎉 Order placed successfully!')
        clearCart()
        closeCart()
      }
    } catch (error) {
      toast.error('Failed to place order')
      console.error(error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          
          <motion.div
            className="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
          >
            <div className="cart-header">
              <div className="cart-title">
                <ShoppingCart size={24} />
                <h2>Your Cart</h2>
                <span className="cart-count">{items.length}</span>
              </div>
              <button 
                className="close-btn"
                onClick={closeCart}
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCart size={64} className="empty-cart-icon" />
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet</p>
                <button 
                  className="continue-shopping"
                  onClick={closeCart}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <img 
                        src={item.images?.[0] || item.images} 
                        alt={item.title}
                        className="cart-item-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/667eea/ffffff?text=Product'
                        }}
                      />
                      
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">{item.title}</h4>
                        <p className="cart-item-price">${item.price?.toFixed(2)}</p>
                        
                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="quantity-btn"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="quantity-btn"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="remove-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="free">Free</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="cart-actions">
                    <button 
                      onClick={clearCart}
                      className="clear-cart-btn"
                    >
                      Clear Cart
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      className="checkout-btn"
                    >
                      Place Order
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

export default CartSidebar