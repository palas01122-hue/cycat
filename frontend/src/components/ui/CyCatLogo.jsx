export default function CyCatLogo({ size = 'md', showText = true }) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: showText ? 8 * scale : 0 }}>
      <img 
        src="/logo.png" 
        alt="CyCat" 
        style={{ 
          width: 32 * scale, 
          height: 32 * scale, 
          objectFit: 'cover', 
          borderRadius: 8 * scale 
        }} 
      />
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
