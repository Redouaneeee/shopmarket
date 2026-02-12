import React from 'react'
import { motion } from 'framer-motion'
import { Package, ShoppingCart, Clock, DollarSign } from 'lucide-react'

const StatsCards = ({ stats }) => {
  return (
    <div className="stats-grid">
      <motion.div 
        className="stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-icon products">
          <Package />
        </div>
        <div className="stat-info">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="stat-icon orders">
          <ShoppingCart />
        </div>
        <div className="stat-info">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-icon pending">
          <Clock />
        </div>
        <div className="stat-info">
          <h3>Pending Orders</h3>
          <p className="stat-number">{stats.pendingOrders}</p>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="stat-icon revenue">
          <DollarSign />
        </div>
        <div className="stat-info">
          <h3>Total Revenue</h3>
          <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsCards