import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import AdminDashboard from './AdminDashboard.jsx'
import AdminLogin from './AdminLogin.jsx'
import './AdminDashboard.css'

export default function AdminGate() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data, error: e } = await supabase.auth.getSession()
      if (cancelled) return
      if (e) {
        setError(e.message || 'Failed to load session.')
        setSession(null)
        setChecking(false)
        return
      }
      setSession(data.session)
      setChecking(false)
    }

    init()

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  const userId = useMemo(() => session?.user?.id || null, [session])

  useEffect(() => {
    let cancelled = false

    async function checkAdmin() {
      if (!userId) {
        setIsAdmin(false)
        setError('')
        return
      }

      setChecking(true)
      setError('')

      const { data, error: e } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()

      if (cancelled) return

      if (e) {
        setIsAdmin(false)
        setError(e.message || 'Failed to verify admin access.')
        setChecking(false)
        return
      }

      if (!data) {
        setIsAdmin(false)
        setError('Not authorized. This user is not marked as an admin.')
        setChecking(false)
        return
      }

      setIsAdmin(true)
      setChecking(false)
    }

    checkAdmin()
    return () => {
      cancelled = true
    }
  }, [userId])

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (!session) return <AdminLogin />

  if (checking) {
    return (
      <div className="admin">
        <header className="adminHeader">
          <div className="adminHeaderLeft">
            <div className="adminBadge">Admin</div>
            <h1 className="adminTitle">Checking access…</h1>
            <p className="adminSubtle">Verifying this user is an admin.</p>
          </div>
          <div className="adminHeaderRight">
            <button className="adminBtn" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin">
        <header className="adminHeader">
          <div className="adminHeaderLeft">
            <div className="adminBadge">Admin</div>
            <h1 className="adminTitle">Access denied</h1>
            <p className="adminSubtle">{error || 'Not authorized.'}</p>
          </div>
          <div className="adminHeaderRight">
            <button className="adminBtnDanger" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>
        <main className="adminMain" style={{ gridTemplateColumns: '1fr' }}>
          <section className="adminCard" style={{ maxWidth: 820, margin: '0 auto' }}>
            <h2>How to fix</h2>
            <div className="adminSmall" style={{ marginTop: 6 }}>
              Add this user’s id to the `admins` table in Supabase (see `supabase/admins_and_bookings_rls.sql`).
            </div>
          </section>
        </main>
      </div>
    )
  }

  return <AdminDashboard onSignOut={signOut} />
}



