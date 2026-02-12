import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './store/useAuth'
import { productAPI, orderAPI } from './api'
import Navbar from './Navbar'
import AnimatedBackground from './AnimatedBackground'
import ProductForm from './ProductForm'
import StatsCards from './StatsCards'
import OrdersTable from './OrdersTable'
import { 
  Package, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Users,
  AlertCircle,
  Eye,
  Trash
} from 'lucide-react'
import { toast } from 'react-toastify'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('products')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchData()
    
    const handleOrderUpdate = () => {
      fetchOrders()
    }
    
    window.addEventListener('orderPlaced', handleOrderUpdate)
    window.addEventListener('orderUpdated', handleOrderUpdate)
    window.addEventListener('orderDeleted', handleOrderUpdate)
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderUpdate)
      window.removeEventListener('orderUpdated', handleOrderUpdate)
      window.removeEventListener('orderDeleted', handleOrderUpdate)
    }
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getOrders()
      ])
      setProducts(productsRes.data)
      setOrders(ordersRes)
      setFilteredOrders(ordersRes)
    } catch (error) {
      toast.error('Failed to load data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const ordersRes = await orderAPI.getOrders()
      setOrders(ordersRes)
      setFilteredOrders(ordersRes)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    setFilteredOrders(filtered)
  }

  const handleCreateProduct = async (productData) => {
    try {
      const response = await productAPI.create(productData)
      setProducts([response.data, ...products])
      toast.success('✨ Product created successfully!')
      setShowProductModal(false)
    } catch (error) {
      toast.error('Failed to create product')
      console.error(error)
    }
  }

  const handleUpdateProduct = async (id, productData) => {
    try {
      const response = await productAPI.update(id, productData)
      setProducts(products.map(p => p.id === id ? response.data : p))
      toast.success('📝 Product updated successfully!')
      setEditingProduct(null)
    } catch (error) {
      toast.error('Failed to update product')
      console.error(error)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productAPI.delete(id)
      setProducts(products.filter(p => p.id !== id))
      toast.success('🗑️ Product deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete product')
      console.error(error)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      )
      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders)
      toast.success(`✅ Order ${orderId} marked as ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update order status')
      console.error(error)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    
    try {
      await orderAPI.deleteOrder(orderId)
      const updatedOrders = orders.filter(order => order.id !== orderId)
      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders)
      toast.success(`🗑️ Order ${orderId} deleted successfully!`)
    } catch (error) {
      toast.error('Failed to delete order')
      console.error(error)
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#48bb78'
      case 'pending': return '#ed8936'
      case 'cancelled': return '#f56565'
      default: return '#718096'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />
      case 'pending': return <Clock size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return <AlertCircle size={16} />
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <AnimatedBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="loading-spinner"
        >
          <Package size={48} />
        </motion.div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <AnimatedBackground />
      
      {/* ✅ FIXED: Navbar with proper admin props */}
      <Navbar 
        userRole="admin"
        isAuthenticated={true}
        onLogout={logout}
        isAdmin={true}
      />

      <div className="admin-content">
        {/* Header with working Add Product button */}
        <div className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p className="header-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="header-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="header-btn refresh"
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProductModal(true)}
              className="header-btn add-product"
            >
              <Plus size={18} />
              Add Product
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            Products
            <span className="tab-count">{stats.totalProducts}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={18} />
            Orders
            <span className="tab-count">{stats.totalOrders}</span>
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div 
            className="admin-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2>Products Management</h2>
              <div className="section-actions">
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products.map(product => (
                      <motion.tr 
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                      >
                        <td className="product-id">#{product.id}</td>
                        <td>
                          <div className="product-thumb-wrapper">
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="product-thumb"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50x50/667eea/ffffff?text=P'
                              }}
                            />
                          </div>
                        </td>
                        <td className="product-title-cell">
                          <div className="product-info-mini">
                            <span className="product-title-text">{product.title}</span>
                            <span className="product-description-preview">
                              {product.description?.slice(0, 50)}...
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {product.category.name}
                          </span>
                        </td>
                        <td className="product-price-cell">
                          <span className="current-price">${product.price.toFixed(2)}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingProduct(product)}
                              className="action-btn edit"
                              title="Edit product"
                            >
                              <Edit size={16} />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteProduct(product.id)}
                              className="action-btn delete"
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="empty-state">
                  <Package size={48} />
                  <h3>No products found</h3>
                  <p>Get started by adding your first product</p>
                  <button 
                    onClick={() => setShowProductModal(true)}
                    className="empty-state-btn"
                  >
                    <Plus size={18} />
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div 
            className="admin-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2>Orders Management</h2>
              <div className="section-actions">
                <div className="search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <select 
                  className="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Stats Mini */}
            <div className="orders-stats-mini">
              <div className="mini-stat">
                <span className="mini-stat-label">Pending</span>
                <span className="mini-stat-value pending">{stats.pendingOrders}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">Completed</span>
                <span className="mini-stat-value completed">{stats.completedOrders}</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">Cancelled</span>
                <span className="mini-stat-value cancelled">{stats.cancelledOrders}</span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredOrders.map((order, index) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="order-id">
                          <span className="order-id-text">{order.id}</span>
                        </td>
                        <td>
                          <div className="order-date">
                            <span className="date-main">
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                            <span className="date-time">
                              {new Date(order.date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="customer-info">
                            <Users size={16} />
                            <span>Customer #{order.id.split('-')[1]}</span>
                          </div>
                        </td>
                        <td>
                          <div className="order-items-summary">
                            <span className="items-count">{order.items?.length || 0} items</span>
                            <button 
                              className="view-items-btn"
                              onClick={() => viewOrderDetails(order)}
                              title="View order details"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </div>
                          
                          <div className="order-items-preview">
                            {order.items?.slice(0, 3).map((item, idx) => (
                              <img 
                                key={idx}
                                src={item.images?.[0]} 
                                alt={item.title}
                                className="item-thumb-preview"
                                title={item.title}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/30x30/667eea/ffffff?text=P'
                                }}
                              />
                            ))}
                            {order.items?.length > 3 && (
                              <span className="more-items-badge">+{order.items.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="order-total">
                          ${order.total?.toFixed(2) || '0.00'}
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${order.status}`}
                            style={{ 
                              backgroundColor: `${getStatusColor(order.status)}20`,
                              color: getStatusColor(order.status),
                              borderColor: `${getStatusColor(order.status)}40`
                            }}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className="status-actions">
                            <select 
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              value={order.status}
                              className="status-select"
                              style={{ borderColor: `${getStatusColor(order.status)}40` }}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="completed">✅ Completed</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                            
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteOrder(order.id)}
                              className="action-btn delete small"
                              title="Delete order"
                            >
                              <Trash size={14} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="empty-state">
                  <ShoppingCart size={48} />
                  <h3>No orders found</h3>
                  <p>There are no orders matching your criteria</p>
                  {statusFilter !== 'all' && (
                    <button 
                      onClick={() => setStatusFilter('all')}
                      className="empty-state-btn"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {(showProductModal || editingProduct) && (
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct ? 
              (data) => handleUpdateProduct(editingProduct.id, data) :
              handleCreateProduct
            }
            onClose={() => {
              setShowProductModal(false)
              setEditingProduct(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div 
              className="modal-content order-details-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Order Details - {selectedOrder.id}</h2>
                <button 
                  className="close-modal"
                  onClick={() => setShowOrderDetails(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="order-details-content">
                <div className="order-info-section">
                  <h3>Order Information</h3>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Order Date:</span>
                      <span className="info-value">
                        {new Date(selectedOrder.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status:</span>
                      <span 
                        className={`status-badge ${selectedOrder.status}`}
                        style={{ 
                          backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                          color: getStatusColor(selectedOrder.status)
                        }}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Amount:</span>
                      <span className="info-value total">
                        ${selectedOrder.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-items-section">
                  <h3>Order Items</h3>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <img 
                          src={item.images?.[0]} 
                          alt={item.title}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x60/667eea/ffffff?text=P'
                          }}
                        />
                        <div className="item-info">
                          <h4>{item.title}</h4>
                          <p className="item-price">${item.price?.toFixed(2)}</p>
                        </div>
                        <div className="item-quantity">
                          ×{item.quantity || 1}
                        </div>
                        <div className="item-subtotal">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDashboard