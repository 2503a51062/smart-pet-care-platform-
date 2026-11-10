
import { useState } from 'react'
import './dashboard.css'
import MyPets from './Mypets'
import Appointments from './Appointments'
import Vaccinations from './Vaccinations'
import MedicalRecords from './MedicalRecords'
import Chatbot from './Chatbot'

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')

  const goBack = () => setActivePage('dashboard')

  if (activePage === 'pets') {
    return <MyPets user={user} onBack={goBack} />
  }

  if (activePage === 'appointments') {
    return <Appointments user={user} onBack={goBack} />
  }

  if (activePage === 'vaccinations') {
    return <Vaccinations user={user} onBack={goBack} />
  }

  if (activePage === 'medical') {
    return <MedicalRecords user={user} onBack={goBack} />
  }

  if (activePage === 'chatbot') {
    return <Chatbot onBack={goBack} />
  }

  const features = [
    {
      icon: '🐾',
      title: 'My Pets',
      description: 'Add, view and manage your pets.',
      color: 'mint',
      page: 'pets'
    },
    {
      icon: '🩺',
      title: 'Appointments',
      description: 'Book and manage veterinary appointments.',
      color: 'peach',
      page: 'appointments'
    },
    {
      icon: '💉',
      title: 'Vaccinations',
      description: 'Track vaccination dates and reminders.',
      color: 'lavender',
      page: 'vaccinations'
    },
    {
      icon: '📋',
      title: 'Medical Records',
      description: 'View your pets’ medical history.',
      color: 'yellow',
      page: 'medical'
    },
    {
      icon: '🤖',
      title: 'AI Pet Assistant',
      description: 'Ask general pet-care questions.',
      color: 'blue',
      page: 'chatbot'
    }
  ]

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          🐾 Smart Pet Care
        </div>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h1>Welcome, {user.full_name}!</h1>
          <p>
            Welcome to your Smart Pet Care platform.
            Manage your pets' health and veterinary activities
            in one place.
          </p>
        </section>

        <section className="dashboard-summary">
          <h2>Your Pet Care Dashboard</h2>
          <p>Choose a feature to manage your pet's care.</p>
        </section>

        <section className="dashboard-grid">
          {features.map((feature) => (
            <div
              className={`dashboard-card ${feature.color}`}
              key={feature.page}
            >
              <div className="dashboard-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <button
                className="dashboard-card-button"
                onClick={() => setActivePage(feature.page)}
              >
                Explore →
              </button>
            </div>
          ))}
        </section>

        <footer className="dashboard-footer">
          <p>🐾 Smart Pet Care © 2026</p>
          <p>Taking better care of your beloved pets.</p>
        </footer>
      </main>
    </div>
  )
}

export default Dashboard
