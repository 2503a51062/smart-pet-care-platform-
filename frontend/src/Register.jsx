
import { useState } from 'react'
import './login.css'

function Register({ onRegister, onShowLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('pet_owner')
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('Creating your account...')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
            role
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('Registration successful! Please log in.')
        setTimeout(() => onRegister(), 1500)
      } else {
        setMessage(data.error || 'Registration failed.')
      }
    } catch (error) {
      setMessage('Cannot connect to the server. Please try again.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🐾</div>

        <h1>Create Account</h1>
        <p className="login-subtitle">
          Join Smart Pet Care today!
        </p>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <label>Account Type</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="pet_owner">Pet Owner</option>
            <option value="veterinarian">Veterinarian</option>
          </select>

          <button type="submit" className="login-submit">
            Register
          </button>
        </form>

        {message && (
          <p className="login-message">{message}</p>
        )}

        <p className="login-footer">
          Already have an account?
          {' '}
          <button type="button" onClick={onShowLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
