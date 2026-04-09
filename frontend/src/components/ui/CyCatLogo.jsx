export default function CyCatLogo({ size = 'md', showText = true }) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? 8 * scale : 0 }}>
      <svg
        width={32 * scale}
        height={32 * scale}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse cx="16" cy="19" rx="11" ry="10" fill="#2e2016" stroke="#e8956d" strokeWidth="1.5"/>
        <polygon points="6,12 2,2 11,9" fill="#2e2016" stroke="#e8956d" strokeWidth="1.5"/>
        <polygon points="6.5,11.5 4,5 10,9" fill="#e8956d" opacity="0.5"/>
        <polygon points="26,12 30,2 21,9" fill="#2e2016" stroke="#e8956d" strokeWidth="1.5"/>
        <polygon points="25.5,11.5 28,5 22,9" fill="#e8956d" opacity="0.5"/>
        <rect x="9" y="10" width="14" height="6" rx="1.5" fill="#e8c97a"/>
        <rect x="9" y="10" width="14" height="3" rx="1.5" fill="#e8956d"/>
        <line x1="12" y1="10" x2="11" y2="13" stroke="#2e2016" strokeWidth="1.2"/>
        <line x1="16" y1="10" x2="15" y2="13" stroke="#2e2016" strokeWidth="1.2"/>
        <line x1="20" y1="10" x2="19" y2="13" stroke="#2e2016" strokeWidth="1.2"/>
        <ellipse cx="11.5" cy="20" rx="3.5" ry="3.5" fill="#e8c97a"/>
        <ellipse cx="20.5" cy="20" rx="3.5" ry="3.5" fill="#e8c97a"/>
        <circle cx="11.5" cy="20" r="1.8" fill="#2e2016"/>
        <circle cx="20.5" cy="20" r="1.8" fill="#2e2016"/>
        <circle cx="12.2" cy="19.2" r="0.8" fill="#e8c97a" opacity="0.8"/>
        <circle cx="21.2" cy="19.2" r="0.8" fill="#e8c97a" opacity="0.8"/>
        <ellipse cx="16" cy="24" rx="2" ry="1.5" fill="#e8956d"/>
        <line x1="5"  y1="22" x2="13" y2="24" stroke="#e8956d" strokeWidth="0.8" opacity="0.6"/>
        <line x1="5"  y1="25" x2="13" y2="25" stroke="#e8956d" strokeWidth="0.8" opacity="0.6"/>
        <line x1="19" y1="24" x2="27" y2="22" stroke="#e8956d" strokeWidth="0.8" opacity="0.6"/>
        <line x1="19" y1="25" x2="27" y2="25" stroke="#e8956d" strokeWidth="0.8" opacity="0.6"/>
      </svg>
      {showText && (
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 900,
          fontSize: 20 * scale,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          <span style={{ color: '#f5ede0' }}>CY</span>
          <span style={{ color: '#e8956d' }}>CAT</span>
        </span>
      )}
    </span>
  )
}
