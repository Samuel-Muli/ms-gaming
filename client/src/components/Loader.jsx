// Loader component — adapted from Uiverse.io by mobinkakei
export default function Loader({ size = 44, className = '' }) {
  return (
    <span className={`loader-wrap ${className}`} style={{ display: 'inline-block', width: size, height: size }}>
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <rect x="8" y="8" width="64" height="64" rx="0" />
        <polygon points="40 4 76 68 4 68" />
        <circle cx="40" cy="40" r="28" />
      </svg>
      <span className="loader-dot" />
    </span>
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-5">
      <Loader size={48} />
      <p
        className="font-barlow uppercase tracking-widest text-sm"
        style={{ color: 'var(--muted)', letterSpacing: '0.2em' }}
      >
        {label}
      </p>
    </div>
  )
}
