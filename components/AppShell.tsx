'use client'

import { useEffect, useState } from 'react'
import LoginScreen from './LoginScreen'
import CustomerForm from './CustomerForm'
import StaffDashboard from './StaffDashboard'

type View = 'customer' | 'staff'

export default function AppShell() {
  const [authed, setAuthed] = useState(false)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState<View>('customer')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => { setAuthed(r.ok); setReady(true) })
      .catch(() => setReady(true))
  }, [])

  if (!ready) return null

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div className="relative">
      {view === 'customer' ? (
        <>
          <CustomerForm />
          <button
            onClick={() => setView('staff')}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-900/20 border border-rose-800/30 text-rose-400/80 hover:text-rose-300 hover:border-rose-700/50 hover:bg-rose-900/30 transition-all text-xs font-medium tracking-wide"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Staff
          </button>
        </>
      ) : (
        <StaffDashboard onCustomerForm={() => setView('customer')} />
      )}
    </div>
  )
}
