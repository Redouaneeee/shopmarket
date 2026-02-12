import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import './ProductForm.css'

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    price: product?.price || '',
    description: product?.description || '',
    categoryId: product?.category?.id || 1,
    images: product?.images?.[0] || ['https://via.placeholder.com/300']
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="close-modal">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              value={formData.images[0]}
              onChange={(e) => setFormData({...formData, images: [e.target.value]})}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default ProductForm