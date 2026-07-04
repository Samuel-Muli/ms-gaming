import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame, Smartphone, Monitor, Calendar, Users, Gamepad2, ChevronDown } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import ArticleCard from '../components/ArticleCard'
import PlayerCard from '../components/PlayerCard'
import { articles } from '../data/articles'
import { phoneArticles } from '../data/phones'
import { laptopArticles } from '../data/laptops'
import { events, STATUS_COLORS } from '../data/events'

/* ── Section header ── */
function SectionHeader({ icon: Icon, label, link, linkLabel = 'View All', color = 'var(--orange)' }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30`, flexShrink: 0 }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <div style={{
            fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color,
          }}>
            ▸ {label}
          </div>
          <div className="h-px w-10 mt-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        </div>
      </div>
      {link && (
        <Link to={link}
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = color)}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          {linkLabel} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  )
}

/* ── Collapsible article group ── */
function ArticleGroup({ icon: Icon, label, color, articles: arts, link, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="gaming-card overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 transition-all"
        style={{
          background: expanded ? `${color}0a` : 'var(--s2)',
          border: 'none', cursor: 'pointer',
          borderBottom: expanded ? `1px solid ${color}30` : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: '15px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
            {label}
          </span>
          <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: '10px' }}>
            {arts.length}
          </span>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Articles grid */}
      {expanded && (
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {arts.map((a, i) => (
              <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
          {link && (
            <div className="text-center mt-5">
              <Link to={link} className="btn btn-ghost text-sm" style={{ color }}>
                View all {label} articles <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Home Page ── */
export default function Home() {
  return (
    <div>
      <HeroSection />

      <div className="max-w-screen-xl mx-auto px-4 py-16 space-y-16">

        {/* ── Founder Card ── */}
        <section>
          <SectionHeader icon={Gamepad2} label="Meet the Founder" />
          <div
            className="gaming-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8"
            style={{ background: 'linear-gradient(135deg, rgba(240,132,44,0.04), rgba(200,160,68,0.02))' }}
          >
            <div className="shrink-0 flex justify-center">
              <PlayerCard />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 8 }}>
                ▸ PUBG Battlegrounds
              </div>
              <h2 className="font-orbitron font-900 text-gradient" style={{ fontSize: 'clamp(22px, 4vw, 38px)', marginBottom: 12 }}>
                【M。S】
              </h2>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 14 }}>
                Active PUBG Battlegrounds player, squad leader, and founder of M S Gaming.
                This platform is my space to share strategies, hardware insights, tournament
                coverage, and build a community of serious and casual gamers alike.
              </p>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20 }}>
                Whether you're pushing ranked, grinding squad wipes, or just getting into the
                game — you're welcome here. Drop into the community and let's get that Chicken Dinner.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/community" className="btn btn-primary">
                  Join Community <ChevronRight size={14} />
                </Link>
                <Link to="/articles/pubg-mobile-sensitivity-gyroscope-2026" className="btn btn-ghost">
                  My PUBG Tips
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Events first ── */}
        <section>
          <SectionHeader icon={Calendar} label="Events & Tournaments" link="/upcoming-games" color="var(--green)" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map(ev => {
              const status = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming
              return (
                <Link key={ev.slug} to={`/upcoming-games/${ev.slug}`} className="block group">
                  <div className="gaming-card gold-card p-4 h-full" style={{ minHeight: 140 }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span style={{ fontSize: 28 }}>{ev.thumbIcon}</span>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <h3 className="font-barlow font-700 leading-snug mb-2 group-hover:text-g-gold transition-colors" style={{ fontSize: '15px', color: 'var(--text)' }}>
                      {ev.title}
                    </h3>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                      📅 {ev.date}
                      {ev.prizePool && <span style={{ color: 'var(--gold)', marginLeft: 8 }}>💰 {ev.prizePool}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── ALL Articles — grouped and collapsible ── */}
        <section>
          <SectionHeader icon={Flame} label="All Articles" />
          <div className="space-y-4">

            {/* PUBG group */}
            <ArticleGroup
              icon={Flame}
              label="PUBG Battlegrounds"
              color="var(--orange)"
              articles={articles}
              link="/articles/pubg-mobile-4-4-heros-crown"
              defaultExpanded={true}
            />

            {/* Phones group */}
            <ArticleGroup
              icon={Smartphone}
              label="Gaming Phones"
              color="var(--blue)"
              articles={phoneArticles}
              link="/gaming-phones"
              defaultExpanded={true}
            />

            {/* Laptops & Consoles group */}
            <ArticleGroup
              icon={Monitor}
              label="Laptops & Consoles"
              color="var(--gold)"
              articles={laptopArticles}
              link="/laptops-consoles"
              defaultExpanded={true}
            />
          </div>
        </section>

        {/* ── Community CTA ── */}
        <section
          className="gaming-card p-8 md:p-12 text-center scanlines"
          style={{ background: 'linear-gradient(135deg, rgba(240,132,44,0.06), rgba(200,160,68,0.04))' }}
        >
          <div className="flex justify-center mb-4">
            <Users size={40} style={{ color: 'var(--orange)' }} className="animate-float" />
          </div>
          <h2 className="font-orbitron font-900 mb-3" style={{ fontSize: 'clamp(20px, 4vw, 32px)', color: 'var(--text)' }}>
            Join the <span className="text-gradient">Community</span>
          </h2>
          <p style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)', maxWidth: 420, margin: '0 auto 24px' }}>
            Share PUBG strategies, hardware questions, gaming clips, or just introduce yourself.
          </p>
          <Link to="/community" className="btn btn-primary text-base px-8 py-3">
            Browse Discussions <ChevronRight size={16} />
          </Link>
        </section>

      </div>
    </div>
  )
}
