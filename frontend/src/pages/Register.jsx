import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function Register() {
  const [form, setForm] = useState({
    organization_name: '',
    organization_slug: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  })
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleHotelNameChange(value) {
    updateField('organization_name', value)
    if (!slugEdited) {
      updateField('organization_slug', slugify(value))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="brand">Domora</h1>
          <p>Set up your hotel.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <p className="section-label">Your hotel</p>

          <div className="field">
            <label htmlFor="organization_name">Hotel name</label>
            <input
              id="organization_name"
              value={form.organization_name}
              onChange={(e) => handleHotelNameChange(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="organization_slug">Short handle</label>
            <input
              id="organization_slug"
              value={form.organization_slug}
              onChange={(e) => {
                setSlugEdited(true)
                updateField('organization_slug', e.target.value)
              }}
              required
            />
          </div>

          <hr className="divider" />

          <p className="section-label">Your account</p>

          <div className="field-row">
            <div className="field">
              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name</label>
              <input
                id="last_name"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create hotel'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register