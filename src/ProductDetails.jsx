import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productAPI } from './api'
import { useCart } from './CartContext'
import { useWishlist } from './WishlistContext'
import { useAuth } from './AuthContext'
import Navbar from './Navbar'
import AnimatedBackground from './AnimatedBackground'
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  ArrowLeft,
  Check,
  Share2,
  Package
} from 'lucide-react'
import { toast } from 'react-toastify'
import './ProductDetails.css' 

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchProductDetails()
  }, [id])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getById(id)
      setProduct(response.data)
      
      // Fetch related products
      const allProducts = await productAPI.getAll()
      const related = allProducts.data
        .filter(p => p.category.id === response.data.category.id && p.id !== response.data.id)
        .slice(0, 4)
      setRelatedProducts(related)
    } catch (error) {
      toast.error('Failed to load product details')
      navigate(user?.role === 'admin' ? '/admin' : '/client')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    toast.success(
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Check size={20} />
        <span>Added {quantity} × {product.title} to cart!</span>
      </div>
    )
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/client')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on ShopMarket!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="product-details-loading">
        <AnimatedBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="loading-spinner"
        >
          <Package size={48} />
        </motion.div>
        <p className="loading-text">Loading product details...</p>
      </div>
    )
  }

  if (!product) return null

  const discount = Math.floor(Math.random() * 30) + 10
  const discountedPrice = product.price * (1 - discount / 100)
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1)
  const reviewCount = Math.floor(Math.random() * 500) + 100

  return (
    <div className="product-details-page">
      <AnimatedBackground />
      
      <Navbar
        userRole={user?.role}
        onLogout={logout}
        showBackButton
        onBack={() => navigate(user?.role === 'admin' ? '/admin' : '/client')}
      />

      <div className="product-details-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/client')}>
            <ArrowLeft size={16} />
            Back to {user?.role === 'admin' ? 'Dashboard' : 'Shopping'}
          </button>
          <span>/</span>
          <span className="breadcrumb-category">{product.category.name}</span>
          <span>/</span>
          <span className="breadcrumb-current">{product.title}</span>
        </div>

        {/* Main Content */}
        <div className="product-main-content">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="main-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600/667eea/ffffff?text=Product+Image'
                }}
              />
              
              {discount > 0 && (
                <div className="discount-badge">
                  -{discount}%
                </div>
              )}

              <button 
                className="share-button"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 size={20} />
              </button>
            </div>

            {product.images.length > 1 && (
              <div className="thumbnail-gallery">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.title} - View ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=Preview'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-wrapper">
            <div className="product-header">
              <span className="product-category-badge">
                {product.category.name}
              </span>
              <h1 className="product-main-title">{product.title}</h1>
              
              <div className="product-rating-container">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(rating) ? "#ffd700" : "none"}
                      stroke="#ffd700"
                    />
                  ))}
                </div>
                <span className="rating-value">{rating}</span>
                <span className="rating-count">({reviewCount} reviews)</span>
              </div>
            </div>

            <div className="product-description-section">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-pricing">
              <div className="price-wrapper">
                <div className="current-price-wrapper">
                  <span className="current-price-label">Price</span>
                  <span className="current-price-value">
                    ${discountedPrice.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="discount-wrapper">
                    <span className="original-price">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="discount-percentage">
                      Save {discount}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="product-actions-section">
              <div className="quantity-selector-wrapper">
                <label htmlFor="quantity">Quantity</label>
                <div className="quantity-controls-large">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="quantity-btn-large"
                  >
                    −
                  </button>
                  <span className="quantity-display-large">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="quantity-btn-large"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons-wrapper">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="add-to-cart-large"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="buy-now-large"
                >
                  Buy Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWishlist(product)}
                  className={`wishlist-button-large ${isInWishlist(product.id) ? 'active' : ''}`}
                >
                  <Heart 
                    size={22} 
                    fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                  />
                </motion.button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="shipping-info">
              <div className="info-item">
                <Truck size={20} />
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over $50</p>
                </div>
              </div>
              <div className="info-item">
                <Shield size={20} />
                <div>
                  <h4>Secure Payment</h4>
                  <p>100% secure transactions</p>
                </div>
              </div>
              <div className="info-item">
                <RefreshCw size={20} />
                <div>
                  <h4>30-Day Returns</h4>
                  <p>Easy returns policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-title">You might also like</h2>
            <div className="related-products-grid">
              {relatedProducts.map((related) => (
                <motion.div
                  key={related.id}
                  className="related-product-card"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/product/${related.id}`)}
                >
                  <div className="related-product-image">
                    <img 
                      src={related.images[0]} 
                      alt={related.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200/667eea/ffffff?text=Product'
                      }}
                    />
                  </div>
                  <div className="related-product-info">
                    <h4>{related.title}</h4>
                    <p className="related-product-price">
                      ${related.price.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails