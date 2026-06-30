import { Link } from 'react-router-dom'
import { Crosshair, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(240,132,44,0.08) 0%, transparent 60%), var(--bg)' }}
    >
      {/* Grid */}
      <div className="absolute inset-0 grid-overlay opacity-40" />

      {/* Corner brackets */}
      {[
        { top: 32, left: 32, bd: '2px 0 0 2px' },
        { top: 32, right: 32, bd: '2px 2px 0 0' },
        { bottom: 32, left: 32, bd: '0 0 2px 2px' },
        { bottom: 32, right: 32, bd: '0 2px 2px 0' },
      ].map((s, i) => (
        <div key={i} className="absolute hidden md:block" style={{ ...s, width: 24, height: 24, border: `1px solid rgba(240,132,44,0.3)`, borderWidth: s.bd }} />
      ))}

      <div className="relative z-10 max-w-md">
        {/* Crosshair icon */}
        <div className="flex justify-center mb-6">
          <Crosshair
            size={64}
            className="text-g-orange animate-float"
            style={{ filter: 'drop-shadow(0 0 20px rgba(240,132,44,0.5))' }}
          />
        </div>

        {/* 404 */}
        <div
          className="font-orbitron font-900 text-gradient mb-4"
          style={{ fontSize: 'clamp(80px, 20vw, 140px)', lineHeight: 1 }}
        >
          404
        </div>

        {/* Labels */}
        <div className="section-label mb-3" style={{ color: 'var(--red)' }}>ZONE NOT FOUND</div>

        <h1 className="font-barlow font-700 text-2xl text-g-text uppercase tracking-wide mb-3">
          You Dropped Outside the Map
        </h1>

        <p className="text-g-muted mb-8" style={{ fontFamily: 'Rajdhani', fontSize: '16px', lineHeight: 1.6 }}>
          This area doesn't exist — or it's been looted and abandoned.
          Head back to the landing zone.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn btn-primary px-6 py-3 text-base">
            <Home size={16} /> Back to Home
          </Link>
          <Link to="/community" className="btn btn-ghost px-6 py-3 text-base">
            Community
          </Link>
        </div>
      </div>
    </div>
  )
}
