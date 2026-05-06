import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  // Fetch Dancing Script Bold from Google Fonts
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  ).then(r => r.text())

  const fontUrl = css.match(/src: url\((.+?)\) format/)?.[1]
  const fontData = fontUrl
    ? await fetch(fontUrl).then(r => r.arrayBuffer())
    : null

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
          fontSize: 26,
          fontFamily: fontData ? 'Dancing Script' : 'Georgia, serif',
          fontWeight: 700,
          color: '#F7F3EC',
          paddingBottom: 2,
        }}
      >
        S
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Dancing Script', data: fontData, style: 'normal', weight: 700 }]
        : [],
    }
  )
}
