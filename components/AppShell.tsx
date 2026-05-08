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
    <div className="relative min-h-screen">
      {view === 'customer' ? (
        <>
          <CustomerForm />
          <button
            onClick={() => setView('staff')}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-900/20 border border-rose-800/30 text-rose-400/80 hover:text-rose-300 hover:border-rose-700/50 hover:bg-rose-900/30 transition-all text-xs font-medium tracking-wide"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </button>
        </>
      ) : (
        <StaffDashboard onCustomerForm={() => setView('customer')} />
      )}
    </div>
  )
}
