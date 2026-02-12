// App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { WishlistProvider } from './WishlistContext'
import LoginPage from './LoginPage'
import ClientDashboard from './ClientDashboard'
import AdminDashboard from './AdminDashboard'
import ProductDetails from './ProductDetails'
import ProtectedRoute from './ProtectedRoute'
import './App.css'

// Create a wrapper component that uses router hooks
const AppContent = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/client" element={
                <ProtectedRoute role="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/product/:id" element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

// Main App component - Router at the very top
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App