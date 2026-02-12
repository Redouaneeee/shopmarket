import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from './store/useAuth'
import { ShoppingBag, User, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    clearError()
    
    
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/client')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    
    const role = await login(email, password)
    
    // Login function already handles navigation
    if (role === 'admin') {
      console.log('Admin login successful, redirecting...')
    } else if (role === 'client') {
      console.log('Client login successful, redirecting...')
    }
  }

  const demoLogin = (type) => {
    setEmail('')
    setPassword('')
    setTimeout(() => {
      if (type === 'client') {
        setEmail('client@exemple.com')
        setPassword('client123')
      } else {
        setEmail('admin@exemple.com')
        setPassword('admin123')
      }
    }, 100)
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="gradient-sphere sphere1"></div>
        <div className="gradient-sphere sphere2"></div>
        <div className="gradient-sphere sphere3"></div>
      </div>

      <div className="login-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="login-card"
        >
          <div className="login-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="logo-container"
            >
              <ShoppingBag className="logo-icon" />
              <Sparkles className="sparkle-icon" />
            </motion.div>
            <h1>ShopMarket</h1>
            <p className="subtitle">Your premium shopping destination</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
                <div className="input-glow"></div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loader"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className="demo-section">
            <p className="demo-title">Try demo accounts</p>
            <div className="demo-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => demoLogin('client')}
                className="demo-btn client"
              >
                <User size={16} />
                Client Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => demoLogin('admin')}
                className="demo-btn admin"
              >
                <Lock size={16} />
                Admin Demo
              </motion.button>
            </div>
          </div>

          <div className="login-footer">
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Secure checkout</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Free shipping</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage