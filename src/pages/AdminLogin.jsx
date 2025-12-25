import { useState } from 'react'
import { supabase } from '../supabaseClient'
import './AdminDashboard.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: e1 } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (e1) {
      setError(e1.message || 'Login failed.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  return (
    <div className="admin">
      <header className="adminHeader">
        <div className="adminHeaderLeft">
          <div className="adminBadge">Admin</div>
          <h1 className="adminTitle">Sign in</h1>
          <p className="adminSubtle">This page is restricted to administrators.</p>
        </div>
        <div className="adminHeaderRight">
          <a className="adminLink" href="#/">← Back to booking page</a>
        </div>
      </header>

      <main className="adminMain" style={{ gridTemplateColumns: '1fr' }}>
        <section className="adminCard" style={{ maxWidth: 520, margin: '0 auto' }}>
          {error ? <div className="adminError">{error}</div> : null}
          <form className="adminForm" onSubmit={onSubmit}>
            <div className="adminGrid2" style={{ gridTemplateColumns: '1fr' }}>
              <div className="adminField">
                <label>Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="adminField">
                <label>Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="adminActions">
              <button className="adminBtnPrimary" type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="adminSmall" style={{ marginTop: 10 }}>
            You must be an admin user in Supabase Auth, and your user id must exist in the `admins` table.
          </div>
        </section>
      </main>
    </div>
  )
}



