import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user, organization, role, logout } = useAuth()

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

      <p style={{ color: 'var(--color-text-muted)' }}>
        Rooms, guests, and bookings will appear here as we build them.
      </p>
    </div>
  )
}

export default Dashboard