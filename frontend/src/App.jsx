
import { useState } from 'react'
import './App.css'
import Login from './login'
import Register from './Register'
import Dashboard from './dashboard'
import AdminDashboard from './AdminDashboard'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setShowLogin(false)
    setShowRegister(false)
  }

  if (user) {
    if (user.role === 'admin') {
      return (
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
        />
      )
    }

    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    )
  }

  if (showRegister) {
    return (
      <Register
        onRegister={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
        onShowLogin={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
      />
    )
  }

  if (showLogin) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <p style={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <button onClick={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}>
            Register
          </button>
        </p>
      </>
    )
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>🐾 Smart Pet Care</h1>
        <p>
          AI-Assisted Smart Pet Care & Veterinary Management Platform
        </p>

        <button
          onClick={() => setShowLogin(true)}
          className="login-button"
        >
          Get Started
        </button>

        <button
          onClick={() => setShowRegister(true)}
          className="login-button"
        >
          Create Account
        </button>
      </header>
    </div>
  )
}

export default App
