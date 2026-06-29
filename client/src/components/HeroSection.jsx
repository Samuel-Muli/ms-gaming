import { Link } from 'react-router-dom'
import { Crosshair, ChevronRight, Users, BookOpen, Gamepad2 } from 'lucide-react'

const STATS = [
  { icon: Gamepad2,  label: 'PUBG Focus',      value: '#1',    color: '#F0842C' },
  { icon: BookOpen,  label: 'Articles',         value: '20+',   color: '#C8A044' },
  { icon: Users,     label: 'Community Posts',  value: 'OPEN',  color: '#3AE858' },
]

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden scanlines"
      style={{
        minHeight: '88vh',
        background: 'radial-gradient(ellipse at 50% -10%, rgba(240,132,44,0.14) 0%, transparent 55%), linear-gradient(180deg, #0a0a0f 0%, #0e0e1a 100%)',
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Glow orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(240,132,44,0.08) 0%, transparent 70%)',
          animation: 'heroGlow 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300, height: 300,
          bottom: '10%', right: '5%',
          background: 'radial-gradient(circle, rgba(200,160,68,0.06) 0%, transparent 70%)',
          animation: 'heroGlow 5s ease-in-out infinite 1s',
        }}
      />

      {/* Animated corner brackets (desktop only) */}
      {[
        { top: 24, left: 24, bd: '2px 0 0 2px' },
        { top: 24, right: 24, bd: '2px 2px 0 0' },
        { bottom: 24, left: 24, bd: '0 0 2px 2px' },
        { bottom: 24, right: 24, bd: '0 2px 2px 0' },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute hidden lg:block"
          style={{
            ...s,
            width: 32, height: 32,
            border: `2px solid rgba(240,132,44,0.35)`,
            borderWidth: s.bd,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen-minus-nav text-center px-4 py-20">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <div className="h-px w-8 bg-g-orange opacity-60" />
          <span className="section-label" style={{ color: '#C8A044' }}>PUBG Community Hub</span>
          <div className="h-px w-8 bg-g-orange opacity-60" />
        </div>

        {/* Main heading */}
        <h1
          className="font-orbitron font-900 mb-4 animate-slide-up"
          style={{
            fontSize: 'clamp(42px, 8vw, 96px)',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="text-gradient">M S GAMING</span>
        </h1>

        {/* Author tag */}
        <div
          className="flex items-center gap-2 mb-6 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <Crosshair size={14} className="text-g-orange" />
          <span
            className="font-barlow font-600 uppercase tracking-widest text-g-muted"
            style={{ fontSize: '13px', letterSpacing: '0.2em' }}
          >
            Founded by
          </span>
          <span
            className="font-orbitron font-700 text-g-gold"
            style={{ fontSize: '15px' }}
          >
            【M。S】
          </span>
        </div>

        {/* Subheadline */}
        <p
          className="max-w-xl mx-auto text-g-muted leading-relaxed mb-10 animate-slide-up"
          style={{ fontFamily: 'Rajdhani', fontSize: '18px', animationDelay: '0.15s' }}
        >
          Your drop zone for <span className="text-g-orange font-semibold">PUBG news</span>,{' '}
          <span className="text-g-gold font-semibold">gaming hardware</span> reviews,{' '}
          upcoming game <span className="text-g-green font-semibold">events</span>, and a growing{' '}
          <span className="text-white font-semibold">gaming community</span>.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap gap-3 justify-center mb-16 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <Link to="/articles/pubg-season-2025" className="btn btn-primary text-base px-6 py-3">
            Latest PUBG Article <ChevronRight size={16} />
          </Link>
          <Link to="/community" className="btn btn-ghost text-base px-6 py-3">
            Join Community
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-6 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          {STATS.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ background: `rgba(${color === '#F0842C' ? '240,132,44' : color === '#C8A044' ? '200,160,68' : '58,232,88'},.1)`, border: `1px solid ${color}30` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-left">
                <div
                  className="font-orbitron font-700"
                  style={{ fontSize: '18px', color }}
                >
                  {value}
                </div>
                <div
                  className="text-g-muted uppercase"
                  style={{ fontFamily: 'Barlow Condensed', fontSize: '10px', letterSpacing: '0.12em' }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span
            className="font-barlow uppercase tracking-widest text-g-muted"
            style={{ fontSize: '10px', letterSpacing: '0.2em' }}
          >
            Scroll
          </span>
          <div
            className="w-px h-10 bg-gradient-to-b from-g-orange to-transparent"
            style={{ animation: 'float 2s ease-in-out infinite' }}
          />
        </div>
      </div>
    </section>
  )
}
