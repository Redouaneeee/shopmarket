import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoginPage from './LoginPage'
import ClientDashboard from './ClientDashboard'
import AdminDashboard from './AdminDashboard'
import ProductDetails from './ProductDetails'
import ProtectedRoute from './ProtectedRoute'
import './App.css'

const AppContent = () => {
  return (
    <div className="app">
      <Routes>
      
        <Route path="/" element={<ClientDashboard />} />
        <Route path="/store" element={<Navigate to="/" replace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        
       
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
        
      
        <Route path="*" element={<Navigate to="/" replace />} />
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
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App