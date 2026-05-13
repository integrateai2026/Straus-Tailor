import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Straus Tailor Shop — Tailoring & Alterations in Fargo, ND'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  ).then(r => r.text())
  const fontUrl = css.match(/src: url\((.+?)\) format/)?.[1]
  const font = fontUrl ? await fetch(fontUrl).then(r => r.arrayBuffer()) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#17171b',
          position: 'relative',
        }}
      >
        {/* Subtle texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(107,26,44,0.12) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Top rule */}
        <div style={{ width: 80, height: 1, background: '#6B1A2C', marginBottom: 40, display: 'flex' }} />

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <span style={{
            fontFamily: font ? 'Dancing Script' : 'Georgia, serif',
            fontSize: 148,
            color: '#6B1A2C',
            lineHeight: 1,
            letterSpacing: '-2px',
          }}>
            Straus
          </span>
          <span style={{
            fontFamily: font ? 'Dancing Script' : 'Georgia, serif',
            fontSize: 72,
            color: '#E8E0D0',
            lineHeight: 1,
            letterSpacing: '1px',
            marginTop: -8,
          }}>
            Tailor Shop
          </span>
        </div>

        {/* Bottom rule */}
        <div style={{ width: 80, height: 1, background: '#6B1A2C', marginTop: 40, marginBottom: 28, display: 'flex' }} />

        {/* Tagline */}
        <span style={{
          fontSize: 22,
          color: '#8A847C',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}>
          Master Tailoring &amp; Alterations
        </span>

        <span style={{
          fontSize: 18,
          color: '#5A5450',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          marginTop: 10,
        }}>
          Fargo, North Dakota  ·  (701) 929-8262
        </span>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'Dancing Script', data: font, style: 'normal', weight: 700 }] : [],
    }
  )
}
