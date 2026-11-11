
import { useEffect, useState } from 'react'
import './AdminDashboard.css'

function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users`
      )

      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setMessage(data.error || 'Unable to load users.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>🐾 Smart Pet Care Admin</h1>
          <p>Welcome, {user.full_name}</p>
        </div>

        <button onClick={onLogout}>Logout</button>
      </header>

      <main className="admin-content">
        <h2>Admin Dashboard</h2>
        <p>Manage and monitor your platform.</p>

        {message && <p className="admin-message">{message}</p>}

        <section className="admin-stats">
          <div className="admin-card">
            <h3>Registered Users</h3>
            <h2>{users.length}</h2>
          </div>

          <div className="admin-card">
            <h3>Platform</h3>
            <h2>Active</h2>
          </div>
        </section>

        <section className="admin-users">
          <h2>Registered Users</h2>

          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.full_name}</td>
                      <td>{item.email}</td>
                      <td>{item.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
