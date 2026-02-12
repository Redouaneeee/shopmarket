import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  User,
  LogOut,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Home,
  Settings,
  Package,
  LogIn
} from 'lucide-react'
import './Navbar.css'

const Navbar = ({
  userRole,
  isAuthenticated,
  onLogout,
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  onWishlistClick,
  onHomeClick,
  showBackButton,
  onBack,
  isPublicStore
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Menu items for authenticated users
  const authMenuItems = userRole === 'admin' ? [
    { icon: Home, label: 'Dashboard', onClick: () => navigate('/admin') },
    { icon: Package, label: 'Products', onClick: () => navigate('/admin') },
    { icon: ShoppingCart, label: 'Orders', onClick: () => navigate('/admin') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/admin') }
  ] : [
    { icon: Home, label: 'Home', onClick: onHomeClick || (() => navigate('/client')), badge: null },
    { icon: Heart, label: 'Wishlist', onClick: onWishlistClick, badge: wishlistCount },
    { icon: ShoppingCart, label: 'Cart', onClick: onCartClick, badge: cartCount }
  ]

  // Menu items for guests
  const guestMenuItems = [
    { icon: Home, label: 'Home', onClick: onHomeClick || (() => navigate('/store')), badge: null },
    { icon: LogIn, label: 'Sign In', onClick: () => navigate('/login'), badge: null },
    { icon: ShoppingCart, label: 'Cart', onClick: onCartClick, badge: cartCount }
  ]

  const menuItems = isAuthenticated ? authMenuItems : guestMenuItems

  const handleLogout = () => {
    onLogout()
    setIsMenuOpen(false)
  }

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <div className="navbar-left">
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="back-btn"
            >
              ← Back
            </motion.button>
          )}

          <Link 
            to={isAuthenticated && userRole === 'admin' ? '/admin' : isAuthenticated ? '/client' : '/store'} 
            className="logo"
          >
            <ShoppingBag className="logo-icon" />
            <span className="logo-text">ShopMarket</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-desktop">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              className="nav-item"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={item.onClick}
                className="nav-link"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="badge">{item.badge}</span>
                )}
              </button>
            </motion.div>
          ))}

          <div className="nav-divider" />

          <div className="user-menu">
            {isAuthenticated ? (
              <>
                <div className="user-info">
                  <User size={18} />
                  <span className="user-role">
                    {userRole === 'admin' ? 'Admin' : 'Client'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="login-btn-nav"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick()
                  setIsMenuOpen(false)
                }}
                className="mobile-nav-link"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="badge">{item.badge}</span>
                )}
              </button>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mobile-nav-link logout"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login')
                  setIsMenuOpen(false)
                }}
                className="mobile-nav-link"
              >
                <LogIn size={20} />
                <span>Sign In</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar