import { Link } from 'react-router-dom'
import { Crosshair, ChevronRight, Users, BookOpen, Gamepad2 } from 'lucide-react'

const STATS = [
  { icon: Gamepad2,  label: 'PUBG Focus',  value: '#1',   color: 'var(--orange)' },
  { icon: BookOpen,  label: 'Articles',     value: '20+',  color: 'var(--gold)' },
  { icon: Users,     label: 'Community',    value: 'OPEN', color: 'var(--green)' },
]

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden scanlines"
      style={{
        minHeight: '88vh',
        background: 'radial-gradient(ellipse at 50% -10%, rgba(240,132,44,0.14) 0%, transparent 55%), var(--bg)',
      }}
    >
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Glow orbs */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width: 600, height: 600, top: '-200px', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(240,132,44,0.08) 0%, transparent 70%)',
          animation: 'heroGlow 4s ease-in-out infinite' }} />

      {/* Corner brackets */}
      {[
        { top: 24,  left: 24,  bd: '2px 0 0 2px' },
        { top: 24,  right: 24, bd: '2px 2px 0 0' },
        { bottom: 24, left: 24, bd: '0 0 2px 2px' },
        { bottom: 24, right: 24, bd: '0 2px 2px 0' },
      ].map((s, i) => (
        <div key={i} className="absolute hidden lg:block"
          style={{ ...s, width: 28, height: 28, border: `1.5px solid rgba(240,132,44,0.3)`, borderWidth: s.bd }} />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <div className="h-px w-8" style={{ background: 'var(--orange)', opacity: 0.6 }} />
          <span className="section-label" style={{ color: 'var(--gold)' }}>PUBG Community Hub</span>
          <div className="h-px w-8" style={{ background: 'var(--orange)', opacity: 0.6 }} />
        </div>

        {/* Main heading */}
        <h1 className="font-orbitron font-900 mb-4 animate-slide-up"
          style={{ fontSize: 'clamp(40px, 8vw, 96px)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
          <span className="text-gradient">M S GAMING</span>
        </h1>

        {/* Author */}
        <div className="flex items-center gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Crosshair size={14} style={{ color: 'var(--orange)' }} />
          <span className="font-barlow font-600 uppercase tracking-widest"
            style={{ fontSize: '13px', letterSpacing: '0.2em', color: 'var(--muted)' }}>
            Founded by
          </span>
          <span className="font-orbitron font-700" style={{ fontSize: '15px', color: 'var(--gold)' }}>
            【M。S】
          </span>
        </div>

        {/* Subheadline */}
        <p className="max-w-xl mx-auto leading-relaxed mb-10 animate-slide-up"
          style={{ fontFamily: 'Rajdhani', fontSize: '18px', color: 'var(--muted)', animationDelay: '0.15s' }}>
          Your drop zone for{' '}
          <span style={{ color: 'var(--orange)', fontWeight: 600 }}>PUBG news</span>,{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>gaming hardware</span> reviews,
          upcoming game <span style={{ color: 'var(--green)', fontWeight: 600 }}>events</span>, and a growing{' '}
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>gaming community</span>.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/articles/pubg-season-2025" className="btn btn-primary text-base px-7 py-3">
            Latest PUBG <ChevronRight size={16} />
          </Link>
          <Link to="/community" className="btn btn-ghost text-base px-7 py-3">
            Join Community
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {STATS.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-left">
                <div className="font-orbitron font-700" style={{ fontSize: '18px', color }}>{value}</div>
                <div className="uppercase" style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--muted)' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="font-barlow uppercase" style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--muted)' }}>Scroll</span>
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, var(--orange), transparent)', animation: 'float 2s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  )
}
