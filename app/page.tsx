import type { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Straus Tailor Shop — Tailoring & Alterations in Fargo, ND',
  description: 'Expert tailoring, alterations & repairs in Fargo, ND. Suits, dresses, wedding gowns, hems, zippers, and more. Walk-ins welcome — no appointment needed. Call (701) 929-8262.',
  alternates: {
    canonical: 'https://straustailor.com',
  },
}

export default function Home() {
  return <LandingPage />
}
