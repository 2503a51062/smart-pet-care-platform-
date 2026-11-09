
import { useEffect, useState } from 'react'
import './MedicalRecords.css'

function MedicalRecords({ user, onBack }) {
  const [pets, setPets] = useState([])
  const [records, setRecords] = useState([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [notes, setNotes] = useState('')
  const [recordDate, setRecordDate] = useState('')
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

  const loadRecords = async (petId) => {
    if (!petId) {
      setRecords([])
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/medical-records/${petId}`
      )
      const data = await response.json()

      if (response.ok) {
        setRecords(data.medical_records || [])
      } else {
        setMessage(data.error || 'Unable to load medical records.')
      }
    } catch {
      setMessage('Cannot connect to backend.')
    }
  }

  useEffect(() => {
    loadPets()
  }, [])

  useEffect(() => {
    loadRecords(selectedPetId)
  }, [selectedPetId])

  const resetForm = () => {
    setDiagnosis('')
    setTreatment('')
    setNotes('')
    setRecordDate('')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!selectedPetId || !diagnosis.trim() || !recordDate) {
      setMessage('Please fill in the required fields.')
      return
    }

    const recordData = {
      pet_id: Number(selectedPetId),
      vet_id: null,
      diagnosis,
      treatment,
      notes,
      record_date: recordDate
    }

    const url = editingId
      ? `http://127.0.0.1:5000/api/medical-records/${editingId}`
      : 'http://127.0.0.1:5000/api/medical-records'

    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          editingId
            ? 'Medical record updated successfully!'
            : 'Medical record added successfully!'
        )
        resetForm()
        loadRecords(selectedPetId)
      } else {
        setMessage(data.error || 'Medical record operation failed.')
      }
    } catch {
      setMessage('Cannot connect to backend.')
    }
  }

  const handleEdit = (record) => {
    setEditingId(record.id || record.record_id)
    setDiagnosis(record.diagnosis || '')
    setTreatment(record.treatment || '')
    setNotes(record.notes || '')
    setRecordDate(
      record.record_date ? String(record.record_date).slice(0, 10) : ''
    )
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/medical-records/${recordId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('Medical record deleted successfully!')
        loadRecords(selectedPetId)
      } else {
        setMessage(data.error || 'Unable to delete medical record.')
      }
    } catch {
      setMessage('Cannot connect to backend.')
    }
  }

  return (
    <div className="medical-page">
      <button className="medical-back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h1>📋 Medical Records</h1>
      <p>Maintain your pets' medical history.</p>

      {message && <p className="medical-message">{message}</p>}

      <section className="medical-form">
        <h2>{editingId ? 'Update Medical Record' : 'Add Medical Record'}</h2>

        <form onSubmit={handleSubmit}>
          <label>Select Pet</label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            disabled={!!editingId}
            required
          >
            <option value="">Choose your pet</option>
            {pets.map((pet) => (
              <option key={pet.pet_id} value={pet.pet_id}>
                {pet.pet_name}
              </option>
            ))}
          </select>

          <label>Diagnosis / Visit Details</label>
          <input
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Example: Routine health examination"
            required
          />

          <label>Treatment</label>
          <textarea
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            placeholder="Enter treatment details"
          />

          <label>Record Date</label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            required
          />

          <label>Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional medical information"
          />

          <button type="submit">
            {editingId ? 'Update Record' : 'Save Medical Record'}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section className="medical-list">
        <h2>Medical History</h2>

        {records.length === 0 ? (
          <p>No medical records found for this pet.</p>
        ) : (
          records.map((record) => (
            <div
              className="medical-card"
              key={record.id || record.record_id}
            >
              <h3>{record.diagnosis}</h3>
              <p>
                Treatment: {record.treatment || 'Not specified'}
              </p>
              <p>
                Record Date: {record.record_date
                  ? String(record.record_date).slice(0, 10)
                  : 'Not available'}
              </p>
              <p>Notes: {record.notes || 'None'}</p>

              <button onClick={() => handleEdit(record)}>
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(record.id || record.record_id)
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

export default MedicalRecords
