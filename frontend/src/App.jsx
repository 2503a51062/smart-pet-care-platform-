
import { useState } from 'react'
import './App.css'
import Login from './login'
import Dashboard from './dashboard'
import AdminDashboard from './AdminDashboard'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setShowLogin(false)
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

  if (showLogin) {
    return <Login onLogin={handleLogin} />
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
      </header>
    </div>
  )
}

export default App
