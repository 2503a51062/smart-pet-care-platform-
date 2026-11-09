
import { useEffect, useState } from 'react'
import './Appointments.css'

function Appointments({ user, onBack }) {
  const [pets, setPets] = useState([])
  const [appointments, setAppointments] = useState([])
  const [petId, setPetId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [reason, setReason] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  const loadPets = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/pets/${user.user_id}`
      )
      const data = await response.json()

      if (response.ok) {
        setPets(data.pets || [])
      } else {
        setMessage(data.error || 'Unable to load pets.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    }
  }

  const loadAppointments = async (selectedPetId) => {
    if (!selectedPetId) {
      setAppointments([])
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/appointments/${selectedPetId}`
      )
      const data = await response.json()

      if (response.ok) {
        setAppointments(data.appointments || [])
      } else {
        setMessage(data.error || 'Unable to load appointments.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    }
  }

  useEffect(() => {
    loadPets()
  }, [])

  useEffect(() => {
    if (petId) loadAppointments(petId)
  }, [petId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const appointmentData = {
      appointment_datetime: appointmentDate,
      reason
    }

    try {
      const url = editingId
        ? `http://127.0.0.1:5000/api/appointments/${editingId}`
        : 'http://127.0.0.1:5000/api/appointments'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId
            ? appointmentData
            : { ...appointmentData, pet_id: Number(petId), vet_id: null }
        )
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          editingId
            ? 'Appointment updated successfully!'
            : 'Appointment booked successfully!'
        )
        setEditingId(null)
        setAppointmentDate('')
        setReason('')
        await loadAppointments(petId)
      } else {
        setMessage(data.error || 'Unable to save appointment.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    }
  }

  const handleEdit = (appointment) => {
    setEditingId(appointment.appointment_id)
    setPetId(String(appointment.pet_id))
    setAppointmentDate(
      appointment.appointment_datetime?.slice(0, 16) || ''
    )
    setReason(appointment.reason || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/appointments/${appointmentId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()

      if (response.ok) {
        setMessage('Appointment cancelled successfully!')
        await loadAppointments(petId)
      } else {
        setMessage(data.error || 'Unable to cancel appointment.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    }
  }

  return (
    <div className="appointments-page">
      <header className="appointments-header">
        <h2>🩺 Veterinary Appointments</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </header>

      <main className="appointments-content">
        <section className="appointment-form-card">
          <h2>{editingId ? 'Edit Appointment' : 'Book an Appointment'}</h2>

          <form onSubmit={handleSubmit}>
            <label>Select Your Pet</label>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              required
            >
              <option value="">Choose a pet</option>
              {pets.map((pet) => (
                <option key={pet.pet_id} value={pet.pet_id}>
                  {pet.pet_name}
                </option>
              ))}
            </select>

            <label>Appointment Date and Time</label>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />

            <label>Reason for Appointment</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for your visit"
              required
            />

            <button type="submit">
              {editingId ? 'Update Appointment' : 'Book Appointment'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setAppointmentDate('')
                  setReason('')
                }}
              >
                Cancel Editing
              </button>
            )}
          </form>

          {message && <p className="appointment-message">{message}</p>}
        </section>

        <section className="appointment-list-section">
          <h2>Your Appointments</h2>

          {!petId ? (
            <p>Select a pet to view its appointments.</p>
          ) : appointments.length === 0 ? (
            <p>No appointments found for this pet.</p>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <div
                  className="appointment-card"
                  key={appointment.appointment_id}
                >
                  <h3>🩺 Veterinary Visit</h3>
                  <p>
                    Date: {appointment.appointment_datetime
                      ? new Date(appointment.appointment_datetime).toLocaleString()
                      : 'Not available'}
                  </p>
                  <p>Reason: {appointment.reason}</p>

                  <button onClick={() => handleEdit(appointment)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(appointment.appointment_id)}>
                    Cancel Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Appointments
