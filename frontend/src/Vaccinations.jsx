
import { useEffect, useState } from 'react'
import './Vaccinations.css'

function Vaccinations({ user, onBack }) {
  const [pets, setPets] = useState([])
  const [vaccinations, setVaccinations] = useState([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [vaccineName, setVaccineName] = useState('')
  const [dateGiven, setDateGiven] = useState('')
  const [nextDueDate, setNextDueDate] = useState('')
  const [notes, setNotes] = useState('')
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
      setMessage('Cannot connect to backend.')
    }
  }

  const loadVaccinations = async (petId) => {
    if (!petId) {
      setVaccinations([])
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/vaccinations/${petId}`
      )
      const data = await response.json()

      if (response.ok) {
        setVaccinations(data.vaccinations || [])
      } else {
        setMessage(data.error || 'Unable to load vaccinations.')
      }
    } catch {
      setMessage('Cannot connect to backend.')
    }
  }

  useEffect(() => {
    loadPets()
  }, [])

  useEffect(() => {
    loadVaccinations(selectedPetId)
  }, [selectedPetId])

  const resetForm = () => {
    setVaccineName('')
    setDateGiven('')
    setNextDueDate('')
    setNotes('')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!selectedPetId || !vaccineName.trim() || !dateGiven) {
      setMessage('Please fill in the required fields.')
      return
    }

    const vaccinationData = {
      pet_id: Number(selectedPetId),
      vaccine_name: vaccineName,
      date_given: dateGiven,
      next_due_date: nextDueDate || null,
      notes: notes
    }

    const url = editingId
      ? `http://127.0.0.1:5000/api/vaccinations/${editingId}`
      : 'http://127.0.0.1:5000/api/vaccinations'

    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaccinationData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          editingId
            ? 'Vaccination updated successfully!'
            : 'Vaccination added successfully!'
        )
        resetForm()
        loadVaccinations(selectedPetId)
      } else {
        setMessage(data.error || 'Vaccination operation failed.')
      }
    } catch {
      setMessage('Cannot connect to backend.')
    }
  }

  const handleEdit = (vaccination) => {
    setEditingId(vaccination.id || vaccination.vaccination_id)
    setVaccineName(vaccination.vaccine_name || '')
    setDateGiven(
      vaccination.date_given
        ? String(vaccination.date_given).slice(0, 10)
        : ''
    )
    setNextDueDate(
      vaccination.next_due_date
        ? String(vaccination.next_due_date).slice(0, 10)
        : ''
    )
    setNotes(vaccination.notes || '')
  }

  const handleDelete = async (vaccinationId) => {
    if (!window.confirm('Delete this vaccination record?')) return

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/vaccinations/${vaccinationId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('Vaccination deleted successfully!')
        loadVaccinations(selectedPetId)
      } else {
        setMessage(data.error || 'Unable to delete vaccination.')
      }
    } catch {
      setMessage('Cannot connect to backend.')
    }
  }

  return (
    <div className="vaccinations-page">
      <button className="vaccination-back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h1>💉 Vaccination Management</h1>
      <p>Keep track of your pets' vaccination records.</p>

      {message && <p className="vaccination-message">{message}</p>}

      <section className="vaccination-form">
        <h2>{editingId ? 'Update Vaccination' : 'Add Vaccination'}</h2>

        <form onSubmit={handleSubmit}>
          <label>Select Pet</label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            required
            disabled={!!editingId}
          >
            <option value="">Choose your pet</option>
            {pets.map((pet) => (
              <option key={pet.pet_id} value={pet.pet_id}>
                {pet.pet_name}
              </option>
            ))}
          </select>

          <label>Vaccine Name</label>
          <input
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            placeholder="Example: Rabies vaccine"
            required
          />

          <label>Date Given</label>
          <input
            type="date"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
            required
          />

          <label>Next Due Date</label>
          <input
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
          />

          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional vaccination details"
          />

          <button type="submit">
            {editingId ? 'Update Vaccination' : 'Save Vaccination'}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section className="vaccination-list">
        <h2>Vaccination History</h2>

        {vaccinations.length === 0 ? (
          <p>No vaccination records found for this pet.</p>
        ) : (
          vaccinations.map((vaccination) => (
            <div
              className="vaccination-card"
              key={vaccination.id || vaccination.vaccination_id}
            >
              <h3>{vaccination.vaccine_name}</h3>
              <p>Date Given: {String(vaccination.date_given || '').slice(0, 10)}</p>
              <p>
                Next Due: {vaccination.next_due_date
                  ? String(vaccination.next_due_date).slice(0, 10)
                  : 'Not specified'}
              </p>
              <p>Notes: {vaccination.notes || 'None'}</p>

              <button onClick={() => handleEdit(vaccination)}>
                Edit
              </button>
              <button
                onClick={() =>
                  handleDelete(vaccination.id || vaccination.vaccination_id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default Vaccinations
