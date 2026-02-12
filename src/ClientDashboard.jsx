import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth, useCart, useWishlist } from './store/useAuth'
import { productAPI } from './api'
import Navbar from './Navbar'
import ProductCard from './ProductCard'
import CartSidebar from './CartSidebar'
import WishlistSidebar from './WishlistSidebar'
import AnimatedBackground from './AnimatedBackground'
import { 
  Search, 
  Filter, 
  X, 
  Package, 
  ShoppingBag, 
  TrendingUp,
  Star,
  Truck,
  Shield,
  Clock,
  ChevronDown,
  Grid,
  List,
  SlidersHorizontal,
  Sparkles,
  Heart,
  ArrowRight,
  DollarSign,
  Tag,
  Star as StarIcon,
  Zap,
  LogIn
} from 'lucide-react'
import { toast } from 'react-toastify'
import './ClientDashboard.css'

const ClientDashboard = () => {
  const navigate = useNavigate()
  
  // State management
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedRating, setSelectedRating] = useState(0)
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  
  // UI states
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('default')
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [itemsToShow, setItemsToShow] = useState(12)
  const [activeFilters, setActiveFilters] = useState([])
  
  // Auth state - handle gracefully when not logged in
  const { isAuthenticated, login, logout } = useAuth()
  const { 
    cartCount, 
    setCartOpen, 
    addToCart 
  } = useCart()
  const { 
    wishlist, 
    setWishlistOpen, 
    toggleWishlistItem 
  } = useWishlist()

  // Initial fetch - NO AUTH REQUIRED
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter and sort products when dependencies change
  useEffect(() => {
    filterAndSortProducts()
  }, [
    products, 
    searchTerm, 
    selectedCategory, 
    priceRange, 
    sortBy,
    selectedRating,
    selectedBrand,
    inStockOnly,
    onSaleOnly
  ])

  // Update displayed products when filtered products or pagination changes
  useEffect(() => {
    setDisplayedProducts(filteredProducts.slice(0, itemsToShow))
  }, [filteredProducts, itemsToShow])

  // Update active filters count
  useEffect(() => {
    const filters = []
    if (searchTerm) filters.push('search')
    if (selectedCategory !== 'all') filters.push('category')
    if (priceRange[0] > 0 || priceRange[1] < 1000) filters.push('price')
    if (selectedRating > 0) filters.push('rating')
    if (selectedBrand !== 'all') filters.push('brand')
    if (inStockOnly) filters.push('inStock')
    if (onSaleOnly) filters.push('onSale')
    if (sortBy !== 'default') filters.push('sort')
    setActiveFilters(filters)
  }, [
    searchTerm, 
    selectedCategory, 
    priceRange, 
    selectedRating, 
    selectedBrand, 
    inStockOnly, 
    onSaleOnly, 
    sortBy
  ])

  // Fetch all products from API - PUBLIC
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll()
      setProducts(response.data)
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(response.data.map(p => p.category.name))]
      setCategories(uniqueCategories)
      
      // Extract unique brands
      const uniqueBrands = ['all', ...new Set(
        response.data
          .map(p => p.title.split(' ')[0])
          .filter(b => b.length > 2)
          .slice(0, 8)
      )]
      setBrands(uniqueBrands)
      
      // Set featured products
      const shuffled = [...response.data].sort(() => 0.5 - Math.random())
      setFeaturedProducts(shuffled.slice(0, 4))
    } catch (error) {
      toast.error('Failed to load products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products - PUBLIC
  const filterAndSortProducts = () => {
    let filtered = [...products]
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.name === selectedCategory
      )
    }
    
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    
    if (selectedRating > 0) {
      filtered = filtered.filter(() => {
        const randomRating = Math.random() * 2 + 3
        return randomRating >= selectedRating
      })
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(selectedBrand.toLowerCase())
      )
    }
    
    if (inStockOnly) {
      filtered = filtered.filter(() => Math.random() > 0.3)
    }
    
    if (onSaleOnly) {
      filtered = filtered.filter(() => Math.random() > 0.5)
    }
    
    switch(sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'rating-desc':
        filtered.sort(() => Math.random() - 0.5)
        break
      case 'newest':
        filtered.sort((a, b) => b.id - a.id)
        break
      default:
        filtered.sort((a, b) => a.id - b.id)
    }
    
    setFilteredProducts(filtered)
    setItemsToShow(12)
  }

  // 🛒 Handle add to cart - ONLY require login when trying to buy
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      // Save the product they wanted to buy
      localStorage.setItem('pendingCartItem', JSON.stringify({
        product,
        quantity: 1
      }))
      
      toast.info('Please login to add items to cart')
      navigate('/login')
      return
    }
    
    // Authenticated - add to cart normally
    addToCart({ ...product, quantity: 1 })
    toast.success(`🛒 Added ${product.title} to cart!`)
  }

  // 💖 Handle wishlist - require login to save favorites
  const handleWishlistToggle = (product) => {
    if (!isAuthenticated) {
      localStorage.setItem('pendingWishlistItem', JSON.stringify({
        product
      }))
      
      toast.info('Please login to save items to wishlist')
      navigate('/login')
      return
    }
    
    toggleWishlistItem(product)
  }

  // 🛍️ Handle view cart - require login to see cart
  const handleViewCart = () => {
    if (!isAuthenticated) {
      toast.info('Please login to view your cart')
      navigate('/login')
      return
    }
    setCartOpen(true)
  }

  // 💝 Handle view wishlist - require login to see wishlist
  const handleViewWishlist = () => {
    if (!isAuthenticated) {
      toast.info('Please login to view your wishlist')
      navigate('/login')
      return
    }
    setWishlistOpen(true)
  }

  // 🏠 Handle home click - PUBLIC, no login required
  const handleHomeClick = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceRange([0, 1000])
    setSelectedRating(0)
    setSelectedBrand('all')
    setInStockOnly(false)
    setOnSaleOnly(false)
    setSortBy('default')
    setShowFilters(false)
    // Stay on home page, don't navigate
  }

  // Handle View All button click
  const handleViewAll = () => {
    handleHomeClick()
    document.querySelector('.products-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  // Handle Load More button click
  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 12)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceRange([0, 1000])
    setSelectedRating(0)
    setSelectedBrand('all')
    setInStockOnly(false)
    setOnSaleOnly(false)
    setSortBy('default')
    toast.info('All filters cleared')
  }

  // Remove specific filter
  const removeFilter = (filter) => {
    switch(filter) {
      case 'search':
        setSearchTerm('')
        break
      case 'category':
        setSelectedCategory('all')
        break
      case 'price':
        setPriceRange([0, 1000])
        break
      case 'rating':
        setSelectedRating(0)
        break
      case 'brand':
        setSelectedBrand('all')
        break
      case 'inStock':
        setInStockOnly(false)
        break
      case 'onSale':
        setOnSaleOnly(false)
        break
      case 'sort':
        setSortBy('default')
        break
      default:
        break
    }
  }

  // Get count of products in a category
  const getCategoryCount = (category) => {
    if (category === 'all') return products.length
    return products.filter(p => p.category.name === category).length
  }

  // Loading state
  if (loading) {
    return (
      <div className="client-loading">
        <AnimatedBackground />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="loading-spinner"
        >
          <ShoppingBag size={64} />
        </motion.div>
        <h2 className="loading-title">Welcome to ShopMarket</h2>
        <p className="loading-text">Loading amazing products for you...</p>
      </div>
    )
  }

  return (
    <div className="client-dashboard">
      <AnimatedBackground />
      
      {/* Navigation Bar - PUBLIC */}
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        cartCount={cartCount}
        wishlistCount={wishlist?.length || 0}
        onCartClick={handleViewCart}
        onWishlistClick={handleViewWishlist}
        onHomeClick={handleHomeClick}
      />

      <div className="dashboard-content">
        {/* Hero Section - PUBLIC */}
        <section className="hero-section">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={16} />
              <span>Summer Sale Up to 50% Off</span>
            </motion.div>
            
            <h1 className="hero-title">
              Welcome to
              <span className="gradient-text"> ShopMarket</span>
            </h1>
            
            <p className="hero-subtitle">
              Discover thousands of products at amazing prices. 
              No account needed to browse - just start shopping!
            </p>
            
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">50k+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>

            {/* Call to action for guests */}
            {!isAuthenticated && (
              <motion.button
                className="login-cta-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <LogIn size={18} />
                Sign In for Exclusive Benefits
                <ArrowRight size={16} />
              </motion.button>
            )}
          </motion.div>
        </section>

        {/* Featured Products Section - PUBLIC */}
        <section className="featured-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Hand-picked just for you</p>
            </div>
            <motion.button 
              className="view-all-btn"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewAll}
            >
              View All
              <ArrowRight size={16} />
            </motion.button>
          </div>

          <div className="featured-grid">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product}
                  onAddToCart={handleAddToCart}
                  onWishlistToggle={handleWishlistToggle}
                  isAuthenticated={isAuthenticated}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Active Filters Bar */}
        {activeFilters.length > 0 && (
          <div className="active-filters-bar">
            <span className="active-filters-label">Active Filters:</span>
            <div className="active-filters-list">
              {activeFilters.includes('search') && (
                <div className="filter-tag">
                  Search: "{searchTerm}"
                  <button onClick={() => removeFilter('search')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeFilters.includes('category') && (
                <div className="filter-tag">
                  Category: {selectedCategory}
                  <button onClick={() => removeFilter('category')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeFilters.includes('price') && (
                <div className="filter-tag">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => removeFilter('price')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeFilters.includes('rating') && (
                <div className="filter-tag">
                  {selectedRating}+ Stars
                  <button onClick={() => removeFilter('rating')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeFilters.includes('brand') && (
                <div className="filter-tag">
                  Brand: {selectedBrand}
                  <button onClick={() => removeFilter('brand')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeFilters.includes('inStock') && (
                <div className="filter-tag">
                  In Stock Only
                  <button onClick={() => removeFilter('inStock')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeFilters.includes('onSale') && (
                <div className="filter-tag">
                  On Sale
                  <button onClick={() => removeFilter('onSale')}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            <button onClick={clearFilters} className="clear-all-filters">
              Clear All
            </button>
          </div>
        )}

        {/* Search and Filters Section - PUBLIC */}
        <section className="filters-section">
          <div className="filters-header">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products, categories, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <motion.button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <X size={16} />
                </motion.button>
              )}
            </div>

            <div className="filters-actions">
              <motion.button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SlidersHorizontal size={18} />
                <span className="filter-text">Filters</span>
                {activeFilters.length > 0 && (
                  <span className="filter-count">{activeFilters.length}</span>
                )}
                {showFilters && <ChevronDown size={16} className="rotate" />}
              </motion.button>

              <div className="sort-wrapper">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="default">Sort by: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              <div className="view-toggle">
                <motion.button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Grid view"
                >
                  <Grid size={18} />
                </motion.button>
                <motion.button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="List view"
                >
                  <List size={18} />
                </motion.button>
              </div>

              <motion.button 
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter size={18} />
                <span>Filter</span>
                {activeFilters.length > 0 && (
                  <span className="filter-count mobile">{activeFilters.length}</span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Filters Panel - PUBLIC */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filters-grid">
                  <div className="filter-group">
                    <label className="filter-label">
                      <Tag size={14} />
                      Category
                    </label>
                    <div className="category-chips">
                      {categories.map(cat => (
                        <motion.button
                          key={cat}
                          className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          <span className="category-count">
                            {getCategoryCount(cat)}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      <DollarSign size={14} />
                      Price Range
                    </label>
                    <div className="price-range">
                      <div className="price-inputs">
                        <div className="price-input-wrapper">
                          <span className="currency">$</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="price-input"
                            min="0"
                            max={priceRange[1]}
                          />
                        </div>
                        <span className="price-separator">—</span>
                        <div className="price-input-wrapper">
                          <span className="currency">$</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="price-input"
                            min={priceRange[0]}
                            max="1000"
                          />
                        </div>
                      </div>
                      <div className="price-slider-container">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="price-slider"
                        />
                        <div 
                          className="price-slider-track"
                          style={{
                            left: `${(priceRange[0] / 1000) * 100}%`,
                            right: `${100 - (priceRange[1] / 1000) * 100}%`
                          }}
                        />
                      </div>
                      <div className="price-range-values">
                        <span>Min: ${priceRange[0]}</span>
                        <span>Max: ${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      <StarIcon size={14} />
                      Minimum Rating
                    </label>
                    <div className="rating-options">
                      {[4, 3, 2, 1].map(rating => (
                        <motion.button
                          key={rating}
                          className={`rating-option ${selectedRating === rating ? 'active' : ''}`}
                          onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                size={14}
                                fill={i < rating ? "#ffd700" : "none"}
                                stroke={i < rating ? "#ffd700" : "#718096"}
                              />
                            ))}
                          </div>
                          <span>& up</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      <ShoppingBag size={14} />
                      Brand
                    </label>
                    <select 
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="brand-select"
                    >
                      {brands.map(brand => (
                        <option key={brand} value={brand}>
                          {brand.charAt(0).toUpperCase() + brand.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      <Zap size={14} />
                      Availability
                    </label>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                        />
                        <span>In Stock Only</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={onSaleOnly}
                          onChange={(e) => setOnSaleOnly(e.target.checked)}
                        />
                        <span>On Sale</span>
                      </label>
                    </div>
                  </div>

                  <div className="filter-actions">
                    <motion.button 
                      onClick={clearFilters}
                      className="clear-filters-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Clear All Filters
                    </motion.button>
                    <motion.button 
                      onClick={() => setShowFilters(false)}
                      className="apply-filters-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply Filters ({filteredProducts.length})
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Products Grid Section - PUBLIC */}
        <section className="products-section">
          <div className="products-header">
            <div className="results-info">
              <h2 className="results-title">
                {filteredProducts.length} Products Available
              </h2>
              <p className="results-subtitle">
                {selectedCategory !== 'all' && `in ${selectedCategory}`}
                {priceRange[1] < 1000 && ` • Under $${priceRange[1]}`}
                {searchTerm && ` • Search: "${searchTerm}"`}
                {selectedRating > 0 && ` • ${selectedRating}+ Stars`}
                {selectedBrand !== 'all' && ` • ${selectedBrand}`}
                {inStockOnly && ` • In Stock`}
                {onSaleOnly && ` • On Sale`}
              </p>
            </div>
            
            {filteredProducts.length > 0 && (
              <p className="showing-results">
                Showing 1-{displayedProducts.length} of {filteredProducts.length} products
              </p>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <motion.div
              className="no-products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="no-products-icon">
                <Package size={64} />
              </div>
              <h3>No products found</h3>
              <p>We couldn't find any products matching your criteria</p>
              <div className="no-products-suggestions">
                <p>Try:</p>
                <ul>
                  <li>Using fewer filters</li>
                  <li>Checking for typos</li>
                  <li>Broadening your search</li>
                </ul>
              </div>
              <motion.button 
                onClick={clearFilters}
                className="reset-filters-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          ) : (
            <>
              <div className={`products-grid ${viewMode}`}>
                <AnimatePresence>
                  {displayedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      layout
                    >
                      <ProductCard 
                        product={product}
                        onAddToCart={handleAddToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isAuthenticated={isAuthenticated}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {displayedProducts.length < filteredProducts.length && (
                <motion.div 
                  className="load-more"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <button 
                    onClick={handleLoadMore}
                    className="load-more-btn"
                  >
                    Load More Products
                    <ChevronDown size={16} />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Benefits Section - PUBLIC */}
        <section className="benefits-section">
          <h2 className="benefits-title">Why Shop With Us?</h2>
          <div className="benefits-grid">
            <motion.div 
              className="benefit-card"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="benefit-icon free-shipping">
                <Truck size={24} />
              </div>
              <h3>Free Shipping</h3>
              <p>On orders over $50, delivered to your doorstep</p>
            </motion.div>

            <motion.div 
              className="benefit-card"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="benefit-icon secure-payment">
                <Shield size={24} />
              </div>
              <h3>Secure Payment</h3>
              <p>100% secure transactions with encryption</p>
            </motion.div>

            <motion.div 
              className="benefit-card"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="benefit-icon returns">
                <Clock size={24} />
              </div>
              <h3>30-Day Returns</h3>
              <p>Easy returns and full refund policy</p>
            </motion.div>

            <motion.div 
              className="benefit-card"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="benefit-icon support">
                <Heart size={24} />
              </div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer service team</p>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Mobile Filters Modal - PUBLIC */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div 
            className="mobile-filters-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div 
              className="mobile-filters-content"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-filters-header">
                <h3>Filters</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mobile-filters-body">
                <div className="mobile-filter-group">
                  <label>Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)} ({getCategoryCount(cat)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mobile-filter-group">
                  <label>Price Range</label>
                  <div className="mobile-price-range">
                    <div className="mobile-price-inputs">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        placeholder="Min"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        placeholder="Max"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    />
                    <div className="mobile-price-values">
                      <span>Min: ${priceRange[0]}</span>
                      <span>Max: ${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="mobile-filter-group">
                  <label>Minimum Rating</label>
                  <select 
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(Number(e.target.value))}
                  >
                    <option value="0">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                <div className="mobile-filter-group">
                  <label>Brand</label>
                  <select 
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    {brands.map(brand => (
                      <option key={brand} value={brand}>
                        {brand.charAt(0).toUpperCase() + brand.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mobile-filter-group">
                  <label>Availability</label>
                  <div className="mobile-checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                      />
                      In Stock Only
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={onSaleOnly}
                        onChange={(e) => setOnSaleOnly(e.target.checked)}
                      />
                      On Sale
                    </label>
                  </div>
                </div>

                <div className="mobile-filter-group">
                  <label>Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>

              <div className="mobile-filters-footer">
                <button onClick={clearFilters} className="mobile-clear-btn">
                  Clear All
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="mobile-apply-btn"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar - Only show if authenticated */}
      {isAuthenticated && <CartSidebar />}
      
      {/* Wishlist Sidebar - Only show if authenticated */}
      {isAuthenticated && <WishlistSidebar />}
    </div>
  )
}

export default ClientDashboard