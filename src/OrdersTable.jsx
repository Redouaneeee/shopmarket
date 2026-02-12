import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

const OrdersTable = ({ orders, onUpdateStatus }) => {
  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <motion.tr 
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <td>{order.id}</td>
              <td>{new Date(order.date).toLocaleDateString()}</td>
              <td>{order.items?.length || 0} items</td>
              <td>${order.total?.toFixed(2)}</td>
              <td>
                <span className={`status-badge ${order.status}`}>
                  {order.status === 'pending' && <Clock size={14} />}
                  {order.status === 'completed' && <CheckCircle size={14} />}
                  {order.status === 'cancelled' && <XCircle size={14} />}
                  {order.status}
                </span>
              </td>
              <td>
                <div className="status-actions">
                  <select 
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    value={order.status}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable