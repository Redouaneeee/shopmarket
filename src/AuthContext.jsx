// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AuthContext = createContext()

const predefinedUsers = {
  'client@exemple.com': { password: 'client123', role: 'client' },
  'admin@exemple.com': { password: 'admin123', role: 'admin' }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = (email, password) => {
    if (predefinedUsers[email] && predefinedUsers[email].password === password) {
      const userData = {
        email,
        role: predefinedUsers[email].role,
        name: email.split('@')[0]
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      toast.success(`✨ Welcome back, ${userData.name}!`)
      return userData.role
    }
    toast.error('❌ Invalid email or password')
    return null
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    toast.info('👋 Logged out successfully')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}