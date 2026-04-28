export default function BackgroundAnimation() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Large crimson orb — drifts top-left */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #9f1239 0%, transparent 70%)',
        filter: 'blur(90px)',
        opacity: 0.18,
        top: '-20%', left: '-15%',
        animation: 'orbA 26s ease-in-out infinite',
      }} />
      {/* Medium orb — drifts bottom-right */}
      <div style={{
        position: 'absolute',
        width: 550, height: 550,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #be123c 0%, transparent 70%)',
        filter: 'blur(100px)',
        opacity: 0.14,
        bottom: '-18%', right: '-10%',
        animation: 'orbB 20s ease-in-out infinite',
      }} />
      {/* Small accent orb — pulses mid-screen */}
      <div style={{
        position: 'absolute',
        width: 350, height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #e11d48 0%, transparent 70%)',
        filter: 'blur(70px)',
        opacity: 0.1,
        top: '35%', left: '45%',
        animation: 'orbC 32s ease-in-out infinite',
      }} />
    </div>
  )
}
