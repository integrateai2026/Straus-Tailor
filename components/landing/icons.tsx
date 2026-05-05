const BURGUNDY = '#6B1A2C'
const NEAR_BLACK = '#17171c'

interface IconProps { name: string; size?: number; stroke?: string }

export function Icon({ name, size = 36, stroke = NEAR_BLACK }: IconProps) {
  const s = { width: size, height: size, fill: 'none' as const, stroke, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, display: 'block' as const }
  switch (name) {
    case 'gown': return <svg viewBox="0 0 48 48" {...s}><path d="M18 10 L24 14 L30 10"/><path d="M18 10 L12 18 L14 42 L34 42 L36 18 L30 10"/><path d="M14 42 Q24 46 34 42"/><path d="M24 14 L24 38" strokeDasharray="1 3"/></svg>
    case 'dress': return <svg viewBox="0 0 48 48" {...s}><path d="M19 9 L24 12 L29 9"/><path d="M19 9 L17 22 L10 42 L38 42 L31 22 L29 9"/><path d="M17 22 L31 22"/></svg>
    case 'suit': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 16 L34 10 L40 14 L40 42 L8 42 L8 14 Z"/><path d="M24 16 L20 24 L24 30 L28 24 Z"/><path d="M24 30 L24 42"/></svg>
    case 'coat': return <svg viewBox="0 0 48 48" {...s}><path d="M16 8 L24 12 L32 8 L40 14 L37 24 L37 42 L11 42 L11 24 L8 14 Z"/><path d="M24 12 L24 42"/><circle cx="20" cy="20" r="0.8" fill={stroke}/><circle cx="20" cy="28" r="0.8" fill={stroke}/><circle cx="20" cy="36" r="0.8" fill={stroke}/></svg>
    case 'pants': return <svg viewBox="0 0 48 48" {...s}><path d="M14 8 L34 8 L33 24 L36 42 L28 42 L24 26 L20 42 L12 42 L15 24 Z"/></svg>
    case 'jeans': return <svg viewBox="0 0 48 48" {...s}><path d="M14 8 L34 8 L33 24 L36 42 L28 42 L24 26 L20 42 L12 42 L15 24 Z"/><path d="M19 14 L21 14"/><path d="M27 14 L29 14"/></svg>
    case 'uniform': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 14 L34 10 L40 14 L40 42 L8 42 L8 14 Z"/><path d="M14 10 L20 18 L24 14"/><path d="M34 10 L28 18 L24 14"/><path d="M14 24 L20 24"/><path d="M14 30 L20 30"/></svg>
    case 'zipper': return <svg viewBox="0 0 48 48" {...s}><path d="M24 6 L24 38"/><path d="M21 10 L24 12 L27 10"/><path d="M21 16 L24 18 L27 16"/><path d="M21 22 L24 24 L27 22"/><path d="M21 28 L24 30 L27 28"/><rect x="20" y="36" width="8" height="6" rx="1"/></svg>
    case 'sweater': return <svg viewBox="0 0 48 48" {...s}><path d="M14 12 L24 14 L34 12 L40 18 L36 24 L36 42 L12 42 L12 24 L8 18 Z"/><path d="M14 12 Q24 18 34 12"/></svg>
    case 'shirt': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L40 16 L37 22 L34 20 L34 42 L14 42 L14 20 L11 22 L8 16 Z"/><path d="M24 14 L24 42" strokeDasharray="2 3"/></svg>
    case 'scissors': return <svg viewBox="0 0 48 48" {...s}><circle cx="16" cy="14" r="5"/><circle cx="16" cy="34" r="5"/><path d="M20 17 L38 36"/><path d="M20 31 L38 12"/></svg>
    case 'needle': return <svg viewBox="0 0 48 48" {...s}><path d="M10 38 L36 12"/><path d="M36 12 L36 12 Q40 8 40 12 Q40 16 36 14"/><path d="M10 38 Q8 42 12 42 Q16 42 14 38"/><path d="M22 26 Q26 22 28 24 Q28 28 26 30 Q22 32 18 28"/></svg>
    case 'button': return <svg viewBox="0 0 48 48" {...s}><circle cx="24" cy="24" r="14"/><circle cx="20" cy="20" r="1.5" fill={stroke}/><circle cx="28" cy="20" r="1.5" fill={stroke}/><circle cx="20" cy="28" r="1.5" fill={stroke}/><circle cx="28" cy="28" r="1.5" fill={stroke}/><circle cx="24" cy="24" r="5"/></svg>
    case 'patch': return <svg viewBox="0 0 48 48" {...s}><rect x="10" y="10" width="28" height="28" rx="4"/><path d="M16 16 L32 32 M32 16 L16 32" strokeDasharray="3 2"/></svg>
    case 'strap': return <svg viewBox="0 0 48 48" {...s}><path d="M18 8 L18 40 M30 8 L30 40"/><path d="M16 12 L20 12 M28 12 L32 12"/><path d="M16 24 L32 24"/></svg>
    case 'takein': return <svg viewBox="0 0 48 48" {...s}><path d="M14 8 L34 8 L32 42 L16 42 Z"/><path d="M10 24 L14 24 M34 24 L38 24"/><path d="M10 24 L13 21 M10 24 L13 27"/></svg>
    case 'length': return <svg viewBox="0 0 48 48" {...s}><path d="M16 8 L32 8 L34 42 L14 42 Z"/><path d="M10 24 L14 24 M34 24 L38 24"/><path d="M38 24 L35 21 M38 24 L35 27"/></svg>
    case 'hem': return <svg viewBox="0 0 48 48" {...s}><path d="M8 32 L40 32" strokeWidth="2"/><path d="M10 28 L14 32 M14 28 L18 32 M18 28 L22 32 M22 28 L26 32 M26 28 L30 32 M30 28 L34 32 M34 28 L38 32"/><path d="M14 14 L34 14 L34 26 L14 26 Z"/></svg>
    case 'bustle': return <svg viewBox="0 0 48 48" {...s}><path d="M18 10 L24 14 L30 10"/><path d="M18 10 L14 42 L34 42 L30 10"/><path d="M26 30 Q34 28 36 34 Q38 40 30 42"/><path d="M26 30 Q28 36 30 42"/></svg>
    case 'plus': return <svg viewBox="0 0 48 48" {...s}><circle cx="24" cy="24" r="18"/><path d="M24 16 L24 32 M16 24 L32 24"/></svg>
    case 'wedding': return <svg viewBox="0 0 48 48" {...s}><path d="M24 6 L26 11 L32 11 L27 15 L29 21 L24 17 L19 21 L21 15 L16 11 L22 11 Z"/><path d="M18 22 L24 26 L30 22"/><path d="M18 22 L14 32 L34 32 L30 22"/><path d="M14 32 Q24 38 34 32"/></svg>
    case 'prom': return <svg viewBox="0 0 48 48" {...s}><path d="M19 8 L24 11 L29 8"/><path d="M19 8 L16 20 L8 42 L40 42 L32 20 L29 8"/><path d="M16 20 L32 20"/><path d="M22 6 L24 8 L26 6"/></svg>
    case 'evening': return <svg viewBox="0 0 48 48" {...s}><path d="M18 8 L24 12 L30 8"/><path d="M18 8 L10 16 L14 42 L34 42 L38 16 L30 8"/><path d="M10 16 L18 20 M30 20 L38 16"/><path d="M14 42 Q24 46 34 42"/></svg>
    case 'bridesmaid': return <svg viewBox="0 0 48 48" {...s}><path d="M20 8 L24 11 L28 8"/><path d="M20 8 L17 20 L12 42 L36 42 L31 20 L28 8"/><path d="M17 20 L31 20"/><circle cx="24" cy="6" r="2"/></svg>
    case 'skirt': return <svg viewBox="0 0 48 48" {...s}><path d="M14 14 L34 14 L38 42 L10 42 Z"/><path d="M12 22 L36 22" strokeDasharray="2 2"/></svg>
    case 'tux': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 16 L34 10 L40 14 L40 42 L8 42 L8 14 Z"/><path d="M24 16 L20 22 L24 26 L28 22 Z"/><path d="M24 26 L24 42"/><circle cx="24" cy="30" r="1" fill={stroke}/><circle cx="24" cy="36" r="1" fill={stroke}/></svg>
    case 'blazer': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 15 L34 10 L40 14 L40 36 L8 36 L8 14 Z"/><path d="M24 15 L20 23 L24 27 L28 23 Z"/><path d="M16 10 Q18 16 20 16 M32 10 Q30 16 28 16"/></svg>
    case 'vest': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L36 14 L34 42 L14 42 L12 14 Z"/><path d="M24 14 L22 22 L24 26 L26 22 Z"/><circle cx="24" cy="30" r="1" fill={stroke}/><circle cx="24" cy="36" r="1" fill={stroke}/></svg>
    case 'dressshirt': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L40 16 L37 22 L34 20 L34 42 L14 42 L14 20 L11 22 L8 16 Z"/><path d="M22 14 L22 20 L24 22 L26 20 L26 14"/><circle cx="24" cy="28" r="1" fill={stroke}/><circle cx="24" cy="34" r="1" fill={stroke}/></svg>
    case 'blouse': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 15 L32 10 L40 16 L37 22 L34 20 L34 40 L14 40 L14 20 L11 22 L8 16 Z"/><path d="M18 14 Q24 20 30 14"/></svg>
    case 'tee': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 12 L34 10 L42 16 L37 22 L34 18 L34 40 L14 40 L14 18 L11 22 L6 16 Z"/></svg>
    case 'polo': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 14 L34 10 L42 16 L37 22 L34 18 L34 42 L14 42 L14 18 L11 22 L6 16 Z"/><path d="M22 14 L22 22 L24 24 L26 22 L26 14"/></svg>
    case 'dresspants': return <svg viewBox="0 0 48 48" {...s}><path d="M14 8 L34 8 L33 24 L36 42 L28 42 L24 26 L20 42 L12 42 L15 24 Z"/><path d="M14 8 L34 8"/><path d="M16 16 L32 16" strokeDasharray="2 2"/></svg>
    case 'shorts': return <svg viewBox="0 0 48 48" {...s}><path d="M12 8 L36 8 L35 30 L28 30 L24 24 L20 30 L13 30 Z"/></svg>
    case 'jacket': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L40 14 L37 24 L37 42 L11 42 L11 24 L8 14 Z"/><path d="M24 14 L24 42"/><circle cx="20" cy="24" r="0.8" fill={stroke}/><circle cx="20" cy="32" r="0.8" fill={stroke}/></svg>
    case 'hoodie': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L40 16 L37 22 L34 20 L34 42 L14 42 L14 20 L11 22 L8 16 Z"/><path d="M18 10 Q24 18 30 10"/><path d="M20 28 L28 28 L28 38 L20 38 Z"/></svg>
    case 'scrubs': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 13 L34 10 L40 14 L40 42 L8 42 L8 14 Z"/><path d="M22 10 L22 16 L24 18 L26 16 L26 10"/><rect x="14" y="26" width="8" height="6" rx="1"/></svg>
    case 'choir': return <svg viewBox="0 0 48 48" {...s}><path d="M18 8 L24 12 L30 8"/><path d="M18 8 L14 42 L34 42 L30 8"/><path d="M14 20 L34 20"/><path d="M14 30 L34 30"/></svg>
    case 'cultural': return <svg viewBox="0 0 48 48" {...s}><path d="M24 6 L28 12 L34 8 L32 14 L38 14 L34 18 L36 24 L30 22 L28 28 L24 24 L20 28 L18 22 L12 24 L14 18 L10 14 L16 14 L14 8 L20 12 Z"/></svg>
    case 'leather': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 14 L34 10 L38 14 L38 42 L10 42 L10 14 Z"/><path d="M18 18 L30 18"/><path d="M16 24 L32 24"/><path d="M18 30 L30 30"/></svg>
    case 'curtain': return <svg viewBox="0 0 48 48" {...s}><path d="M8 8 L40 8"/><path d="M10 8 L14 14 Q18 20 18 28 L18 42"/><path d="M38 8 L34 14 Q30 20 30 28 L30 42"/><circle cx="10" cy="8" r="2" fill={stroke}/><circle cx="38" cy="8" r="2" fill={stroke}/></svg>
    case 'household': return <svg viewBox="0 0 48 48" {...s}><path d="M10 42 L10 20 L24 8 L38 20 L38 42 Z"/><path d="M18 42 L18 30 L30 30 L30 42"/><path d="M14 20 L34 20" strokeDasharray="2 2"/></svg>
    case 'shorten-pants': return <svg viewBox="0 0 48 48" {...s}><path d="M14 8 L34 8 L33 28 L36 36 L28 36 L24 24 L20 36 L12 36 L15 28 Z"/><path d="M8 40 L40 40" strokeDasharray="3 2"/></svg>
    case 'lengthen-pants': return <svg viewBox="0 0 48 48" {...s}><path d="M16 14 L32 14 L31 24 L34 32 L28 32 L24 26 L20 32 L14 32 L17 24 Z"/><path d="M10 34 L38 34" strokeDasharray="3 2"/><path d="M22 6 L26 6 M24 6 L24 12"/></svg>
    case 'shorten-dress': return <svg viewBox="0 0 48 48" {...s}><path d="M19 10 L24 13 L29 10"/><path d="M19 10 L14 28 L34 28 L29 10"/><path d="M10 32 L38 32" strokeDasharray="3 2"/></svg>
    case 'shorten-skirt': return <svg viewBox="0 0 48 48" {...s}><path d="M16 12 L32 12 L36 30 L12 30 Z"/><path d="M8 34 L40 34" strokeDasharray="3 2"/></svg>
    case 'lengthen-sleeves': return <svg viewBox="0 0 48 48" {...s}><path d="M14 14 L20 12 L20 22 L14 24 Z"/><path d="M34 14 L28 12 L28 22 L34 24 Z"/><path d="M20 12 L28 12 L28 36 L20 36 Z"/><path d="M14 24 L14 32 M34 24 L34 32"/></svg>
    case 'shorten-sleeves': return <svg viewBox="0 0 48 48" {...s}><path d="M16 14 L20 12 L20 18 L16 20 Z"/><path d="M32 14 L28 12 L28 18 L32 20 Z"/><path d="M20 12 L28 12 L28 36 L20 36 Z"/><path d="M14 22 L18 22 M30 22 L34 22"/></svg>
    case 'shoulder': return <svg viewBox="0 0 48 48" {...s}><path d="M8 18 Q14 12 24 12 Q34 12 40 18"/><path d="M14 18 L14 28 M34 18 L34 28"/><path d="M14 18 L34 18"/><path d="M18 22 L22 22 M26 22 L30 22"/></svg>
    case 'jacket-length': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L38 14 L38 30 L10 30 L10 14 Z"/><path d="M24 14 L24 30"/><path d="M10 34 L38 34" strokeDasharray="3 2"/></svg>
    case 'shirt-length': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L24 14 L32 10 L40 16 L37 22 L34 20 L34 32 L14 32 L14 20 L11 22 L8 16 Z"/><path d="M10 36 L38 36" strokeDasharray="3 2"/></svg>
    case 'cuff': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L34 10 L34 38 L14 38 Z"/><path d="M14 30 L34 30"/><circle cx="24" cy="34" r="1" fill={stroke}/></svg>
    case 'bodice': return <svg viewBox="0 0 48 48" {...s}><path d="M18 10 L24 14 L30 10"/><path d="M18 10 L16 28 L32 28 L30 10"/><path d="M16 28 Q24 32 32 28"/><path d="M22 16 L22 26 M26 16 L26 26" strokeDasharray="2 2"/></svg>
    case 'cups': return <svg viewBox="0 0 48 48" {...s}><path d="M8 16 L24 22 L40 16"/><path d="M8 16 Q14 30 24 30 Q34 30 40 16"/></svg>
    case 'elastic': return <svg viewBox="0 0 48 48" {...s}><path d="M8 20 L40 20 L40 28 L8 28 Z"/><path d="M10 24 L14 22 L14 26 L18 22 L18 26 L22 22 L22 26 L26 22 L26 26 L30 22 L30 26 L34 22 L34 26 L38 24"/></svg>
    case 'drawstring': return <svg viewBox="0 0 48 48" {...s}><path d="M8 22 L40 22 L40 30 L8 30 Z"/><path d="M16 26 Q20 36 16 38 M32 26 Q28 36 32 38"/><circle cx="16" cy="40" r="1.2" fill={stroke}/><circle cx="32" cy="40" r="1.2" fill={stroke}/></svg>
    case 'snap': return <svg viewBox="0 0 48 48" {...s}><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="4"/><circle cx="24" cy="24" r="1" fill={stroke}/></svg>
    case 'hook': return <svg viewBox="0 0 48 48" {...s}><path d="M16 10 L16 24 Q16 32 22 32 L26 32"/><path d="M30 26 L26 32 L30 38"/><circle cx="16" cy="10" r="2"/></svg>
    case 'velcro': return <svg viewBox="0 0 48 48" {...s}><path d="M8 16 L24 16 L24 24 L8 24 Z"/><path d="M24 24 L40 24 L40 32 L24 32 Z"/><path d="M11 19 L13 21 M16 18 L18 22 M21 19 L19 22"/><path d="M27 27 L29 29 M32 26 L34 30 M37 27 L35 30"/></svg>
    case 'tear': return <svg viewBox="0 0 48 48" {...s}><path d="M8 10 L40 10 L40 38 L8 38 Z"/><path d="M16 14 L20 22 L18 26 L24 32 L22 36"/><path d="M16 14 Q22 20 18 26 Q26 30 22 36" strokeDasharray="2 2"/></svg>
    case 'seam': return <svg viewBox="0 0 48 48" {...s}><path d="M8 24 L40 24"/><path d="M10 22 L14 26 M14 22 L18 26 M18 22 L22 26 M22 22 L26 26 M26 22 L30 26 M30 22 L34 26 M34 22 L38 26"/></svg>
    case 'pocket': return <svg viewBox="0 0 48 48" {...s}><path d="M10 10 L38 10 L38 42 L10 42 Z"/><path d="M16 18 L32 18 L32 32 L16 32 Z"/><path d="M16 22 L32 22"/></svg>
    case 'beltloop': return <svg viewBox="0 0 48 48" {...s}><path d="M8 18 L40 18 L40 26 L8 26 Z"/><path d="M14 14 L14 30 M24 14 L24 30 M34 14 L34 30"/></svg>
    case 'lining': return <svg viewBox="0 0 48 48" {...s}><path d="M14 10 L24 14 L34 10 L38 14 L38 42 L10 42 L10 14 Z"/><path d="M18 14 L22 18 L22 38" strokeDasharray="2 2"/><path d="M30 14 L26 18 L26 38" strokeDasharray="2 2"/></svg>
    case 'coatzip': return <svg viewBox="0 0 48 48" {...s}><path d="M16 8 L24 12 L32 8 L40 14 L37 24 L37 42 L11 42 L11 24 L8 14 Z"/><path d="M24 12 L24 42"/><path d="M22 18 L24 20 L26 18 M22 26 L24 28 L26 26 M22 34 L24 36 L26 34"/></svg>
    case 'pantzip': return <svg viewBox="0 0 48 48" {...s}><path d="M14 8 L34 8 L33 24 L36 42 L28 42 L24 26 L20 42 L12 42 L15 24 Z"/><path d="M24 10 L24 24"/><path d="M22 14 L26 14 M22 18 L26 18 M22 22 L26 22"/></svg>
    case 'taper': return <svg viewBox="0 0 48 48" {...s}><path d="M16 8 L32 8 L28 42 L20 42 Z"/><path d="M20 14 L18 14 M20 22 L18 22 M20 30 L18 30"/><path d="M28 14 L30 14 M28 22 L30 22 M28 30 L30 30"/></svg>
    case 'reinforce': return <svg viewBox="0 0 48 48" {...s}><path d="M8 24 L40 24" strokeWidth={2.2}/><path d="M8 20 L40 20" strokeDasharray="2 2"/><path d="M8 28 L40 28" strokeDasharray="2 2"/></svg>
    case 'formal-c': return <svg viewBox="0 0 48 48" {...s}><path d="M20 8 L24 11 L28 8"/><path d="M20 8 L18 20 Q24 17 30 20 L28 8"/><path d="M18 20 L8 42 L40 42 L30 20"/><path d="M14 34 Q24 38 34 34"/></svg>
    case 'home-b': return <svg viewBox="0 0 48 48" {...s}><ellipse cx="24" cy="11" rx="11" ry="4"/><ellipse cx="24" cy="37" rx="11" ry="4"/><line x1="13" y1="11" x2="13" y2="37"/><line x1="35" y1="11" x2="35" y2="37"/><path d="M24 11 L24 37"/><path d="M19 13 L29 35 M29 13 L19 35"/></svg>
    case 'hem-b': return <svg viewBox="0 0 48 48" {...s}><rect x="8" y="10" width="32" height="6" rx="2"/><path d="M10 16 L10 38 M38 16 L38 38"/><path d="M8 38 L40 38" strokeWidth="2.5"/><path d="M10 30 L14 34 M14 30 L18 34 M18 30 L22 34 M22 30 L26 34 M26 30 L30 34 M30 30 L34 34 M34 30 L38 34"/></svg>
    case 'fit-c': return <svg viewBox="0 0 48 48" {...s}><circle cx="24" cy="9" r="3.5"/><path d="M18 14 Q24 12 30 14 L28 34 L24 30 L20 34 Z"/><path d="M15 22 L10 22 M15 22 L13 19 M15 22 L13 25"/><path d="M33 22 L38 22 M33 22 L35 19 M33 22 L35 25"/></svg>
    default: return <svg viewBox="0 0 48 48" {...s}><circle cx="24" cy="24" r="16"/><path d="M24 16 L24 32 M16 24 L32 24"/></svg>
  }
}
