import axios from 'axios'

const API_BASE_URL = 'https://api.escuelajs.co/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('Resource not found')
    }
    if (error.response?.status === 500) {
      console.error('Server error')
    }
    return Promise.reject(error)
  }
)

export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`)
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`)
}

// ✅ ENHANCED: Order API with full CRUD operations
export const orderAPI = {
  submitOrder: (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder = {
          id: `ORD-${Date.now()}`,
          ...orderData,
          date: new Date().toISOString(),
          status: 'pending'
        }
        
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        orders.push(newOrder)
        localStorage.setItem('orders', JSON.stringify(orders))
        
        // Dispatch event for real-time updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('orderPlaced', { 
            detail: newOrder 
          }))
        }
        
        resolve({ 
          success: true, 
          order: newOrder,
          message: 'Order placed successfully!'
        })
      }, 1000)
    })
  },
  
  getOrders: () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    return Promise.resolve(orders.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ))
  },
  
  getOrderById: (orderId) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const order = orders.find(o => o.id === orderId)
    return Promise.resolve(order)
  },
  
  updateOrderStatus: (orderId, status) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { 
        ...order, 
        status, 
        updatedAt: new Date().toISOString() 
      } : order
    )
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    
    // Dispatch event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { orderId, status } 
      }))
    }
    
    return Promise.resolve({ success: true })
  },
  
  // ✅ NEW: Delete order function
  deleteOrder: (orderId) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updatedOrders = orders.filter(order => order.id !== orderId)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    
    // Dispatch event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('orderDeleted', { 
        detail: { orderId } 
      }))
    }
    
    return Promise.resolve({ success: true })
  },
  
  // ✅ NEW: Delete all orders
  deleteAllOrders: () => {
    localStorage.setItem('orders', '[]')
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ordersCleared'))
    }
    
    return Promise.resolve({ success: true })
  }
}

export default api