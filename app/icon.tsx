import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#6B1A2C',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'Georgia, serif',
          color: '#F7F3EC',
          letterSpacing: '-1px',
          paddingBottom: 1,
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
