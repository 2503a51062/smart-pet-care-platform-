import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const inputStyle = {
    color: '#222222',
    WebkitTextFillColor: '#222222',
    backgroundColor: '#ffffff',
    opacity: 1,
    fontSize: '16px'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('Signing in...')

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Login successful!')
        onLogin(data)
      } else {
        setMessage(data.message || data.error || 'Login failed.')
      }
    } catch (error) {
      setMessage('Cannot connect to the server. Please try again.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🐾</div>

        <h1>Welcome Back!</h1>

        <p className="login-subtitle">
          Sign in to continue caring for your pets.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            style={inputStyle}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            style={inputStyle}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-submit">
            Login
          </button>
        </form>

        {message && (
          <p className="login-message">{message}</p>
        )}

        <p className="login-footer">
          Your pet's health matters to us. ❤️
        </p>
      </div>
    </div>
  )
}

export default Login