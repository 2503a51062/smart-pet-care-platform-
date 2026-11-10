
import { useEffect, useState } from 'react'
import './MyPets.css'

function MyPets({ user, onBack }) {
  const [pets, setPets] = useState([])
  const [petName, setPetName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [editingPetId, setEditingPetId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const ownerId = user.user_id

  const loadPets = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/pets/${ownerId}`
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

  useEffect(() => {
    loadPets()
  }, [])

  const resetForm = () => {
    setPetName('')
    setSpecies('')
    setBreed('')
    setDateOfBirth('')
    setGender('')
    setEditingPetId(null)
  }

  const handleAddOrUpdatePet = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const petData = {
      pet_name: petName,
      species,
      breed,
      date_of_birth: dateOfBirth || null,
      gender: gender || null
    }

    try {
      const url = editingPetId
        ? `http://127.0.0.1:5000/api/pets/${editingPetId}`
        : 'http://127.0.0.1:5000/api/pets'

      const response = await fetch(url, {
        method: editingPetId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          editingPetId
            ? petData
            : { ...petData, owner_id: ownerId }
        )
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          editingPetId
            ? 'Pet updated successfully! 🐾'
            : 'Pet added successfully! 🐾'
        )

        resetForm()
        await loadPets()
      } else {
        setMessage(data.error || 'Unable to save pet.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPet = (pet) => {
    setEditingPetId(pet.pet_id)
    setPetName(pet.pet_name)
    setSpecies(pet.species)
    setBreed(pet.breed || '')
    setDateOfBirth(pet.date_of_birth || '')
    setGender(pet.gender || '')
    setMessage('You are editing ' + pet.pet_name + '.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/pets/${petId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('Pet deleted successfully!')
        await loadPets()
      } else {
        setMessage(data.error || 'Unable to delete pet.')
      }
    } catch {
      setMessage('Cannot connect to the backend.')
    }
  }

  return (
    <div className="mypets-page">

      <header className="mypets-header">
        <h2>🐾 My Pets</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </header>

      <main className="mypets-content">

        <section className="pet-form-card">
          <h2>
            {editingPetId ? 'Edit Pet Details' : 'Add a New Pet'}
          </h2>

          <form onSubmit={handleAddOrUpdatePet}>
            <label>Pet Name</label>
            <input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter pet name"
              required
            />

            <label>Species</label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
            >
              <option value="">Select species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>

            <label>Breed</label>
            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Enter breed"
            />

            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />

            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading
                ? 'Please wait...'
                : editingPetId
                  ? 'Update Pet'
                  : 'Add Pet'}
            </button>

            {editingPetId && (
              <button
                type="button"
                onClick={resetForm}
                className="cancel-edit-button"
              >
                Cancel Edit
              </button>
            )}
          </form>

          {message && (
            <p className="pet-message">{message}</p>
          )}
        </section>

        <section className="pet-list-section">
          <h2>Your Registered Pets</h2>

          {pets.length === 0 ? (
            <p>No pets registered yet. Add your first pet!</p>
          ) : (
            <div className="pet-list">
              {pets.map((pet) => (
                <div className="pet-card" key={pet.pet_id}>
                  <div className="pet-emoji">🐶</div>

                  <h3>{pet.pet_name}</h3>

                  <p>Species: {pet.species}</p>
                  <p>Breed: {pet.breed || 'Not specified'}</p>
                  <p>
                    Date of Birth: {pet.date_of_birth || 'Not specified'}
                  </p>
                  <p>Gender: {pet.gender || 'Not specified'}</p>

                  <button
                    onClick={() => handleEditPet(pet)}
                    className="edit-pet-button"
                  >
                    Edit Pet
                  </button>

                  <button
                    onClick={() => handleDeletePet(pet.pet_id)}
                  >
                    Delete Pet
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

export default MyPets
