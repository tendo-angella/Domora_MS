import { useEffect, useState } from 'react'
import { api } from '../api/Client'
import { useAuth } from '../context/AuthContext'

function initials(name, email) {
  if (name) return name.charAt(0).toUpperCase()
  return email ? email.charAt(0).toUpperCase() : '?'
}

function AddStaffForm({ onAdded }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    role: 'receptionist',
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
      await api.addStaff(form)
      setForm({ email: '', password: '', first_name: '', role: 'receptionist' })
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
          <label htmlFor="staff-name">First name</label>
          <input
            id="staff-name"
            value={form.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="staff-email">Email</label>
          <input
            id="staff-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="staff-password">Temporary password</label>
          <input
            id="staff-password"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="staff-role">Role</label>
          <select
            id="staff-role"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
          >
            <option value="manager">Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="housekeeping">Housekeeping</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-small" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add employee'}
      </button>
    </form>
  )
}

function Dashboard() {
  const { user, organization, role, logout } = useAuth()
  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const canManageStaff = role === 'owner' || role === 'manager'

  function loadStaff() {
    setStaffLoading(true)
    api
      .listStaff()
      .then(setStaff)
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false))
  }

  useEffect(() => {
    loadStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>{organization?.name}</h1>
          <p>
            Signed in as {user?.first_name || user?.email}{' '}
            <span className="role-badge">{role}</span>
          </p>
        </div>
        <button className="btn-ghost" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{staffLoading ? '—' : staff.length}</div>
          <div className="stat-label">Staff members</div>
        </div>
        <div className="stat-card is-placeholder">
          <div className="stat-value">—</div>
          <div className="stat-label">Rooms (coming soon)</div>
        </div>
        <div className="stat-card is-placeholder">
          <div className="stat-value">—</div>
          <div className="stat-label">Active bookings (coming soon)</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Staff</h2>
          {canManageStaff && (
            <button className="btn-small" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? 'Cancel' : '+ Add employee'}
            </button>
          )}
        </div>

        {staffLoading ? (
          <p className="empty-state">Loading staff…</p>
        ) : staff.length === 0 ? (
          <p className="empty-state">No staff members yet.</p>
        ) : (
          <div className="staff-list">
            {staff.map((member) => (
              <div className="staff-row" key={member.id}>
                <div className="avatar">
                  {initials(member.user.first_name, member.user.email)}
                </div>
                <div className="staff-info">
                  <div className="staff-name">
                    {member.user.first_name || member.user.email}
                  </div>
                  <div className="staff-email">{member.user.email}</div>
                </div>
                <span className="role-badge">{member.role}</span>
              </div>
            ))}
          </div>
        )}

        {canManageStaff && showAddForm && (
          <AddStaffForm
            onAdded={() => {
              setShowAddForm(false)
              loadStaff()
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard