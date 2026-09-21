import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/Client'
import { useAuth } from '../context/AuthContext'

function AddRoomForm({ onAdded }) {
  const [form, setForm] = useState({
    room_number: '',
    category: 'single',
    price_per_night: '',
    capacity: 1,
    description: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.addRoom(form)
      setForm({ room_number: '', category: 'single', price_per_night: '', capacity: 1, description: '' })
      onAdded()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="add-staff-form" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}

      <div className="field-row">
        <div className="field">
          <label htmlFor="room-number">Room number</label>
          <input
            id="room-number"
            value={form.room_number}
            onChange={(e) => updateField('room_number', e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="room-category">Category</label>
          <select
            id="room-category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
          >
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
            <option value="deluxe">Deluxe</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="room-price">Price per night</label>
          <input
            id="room-price"
            type="number"
            step="0.01"
            value={form.price_per_night}
            onChange={(e) => updateField('price_per_night', e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="room-capacity">Capacity</label>
          <input
            id="room-capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => updateField('capacity', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="room-description">Description</label>
        <input
          id="room-description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>

      <button type="submit" className="btn-small" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add room'}
      </button>
    </form>
  )
}

function Rooms() {
  const { role } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const canManageRooms = role === 'owner' || role === 'manager'

  function loadRooms() {
    setLoading(true)
    api
      .listRooms()
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRooms()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this room?')) return
    await api.deleteRoom(id)
    loadRooms()
  }

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Rooms</h1>
          <p>
            <Link to="/dashboard">&larr; Back to dashboard</Link>
          </p>
        </div>
        {canManageRooms && (
          <button className="btn-small" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? 'Cancel' : '+ Add room'}
          </button>
        )}
      </div>

      <div className="panel">
        {canManageRooms && showAddForm && (
          <AddRoomForm
            onAdded={() => {
              setShowAddForm(false)
              loadRooms()
            }}
          />
        )}

        {loading ? (
          <p className="empty-state">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <p className="empty-state">No rooms yet.</p>
        ) : (
          <div className="staff-list">
            {rooms.map((room) => (
              <div className="staff-row" key={room.id}>
                <div className="avatar">{room.room_number}</div>
                <div className="staff-info">
                  <div className="staff-name">
                    Room {room.room_number} — {room.category}
                  </div>
                  <div className="staff-email">
                    {room.price_per_night} / night · sleeps {room.capacity}
                  </div>
                </div>
                <span className="role-badge">{room.is_occupied ? 'Occupied' : 'Vacant'}</span>
                {canManageRooms && (
                  <button className="btn-ghost" onClick={() => handleDelete(room.id)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Rooms