import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from './CartContext'
import { useWishlist } from './WishlistContext'
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({ ...product, quantity: 1 })
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      className="product-card"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          {imageError ? (
            <div className="product-image-placeholder">
              <ShoppingCart size={48} />
            </div>
          ) : (
            <img
              src={product.images[0]}
              alt={product.title}
              className="product-image"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          
          {isHovered && (
            <motion.div 
              className="product-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
                className={`overlay-btn wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </motion.button>
              
              <Link to={`/product/${product.id}`}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="overlay-btn view-btn"
                >
                  <Eye size={20} />
                </motion.button>
              </Link>
            </motion.div>
          )}

          <div className="product-category">
            {product.category.name}
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          
          <div className="product-meta">
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < 4 ? "#ffd700" : "none"}
                  stroke="#ffd700"
                />
              ))}
              <span className="rating-count">(124)</span>
            </div>
            
            <div className="product-price">
              <span className="current-price">${product.price.toFixed(2)}</span>
              {product.price > 100 && (
                <span className="original-price">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="add-to-cart-btn"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </motion.button>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard