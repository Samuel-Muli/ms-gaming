import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame, Smartphone, Monitor, Calendar, Users, Gamepad2, ChevronDown } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import ArticleCard from '../components/ArticleCard'
import PlayerCard from '../components/PlayerCard'
import { articles } from '../data/articles'
import { phoneArticles } from '../data/phones'
import { laptopArticles } from '../data/laptops'
import { events, STATUS_COLORS } from '../data/events'

/* ── Utility: pick 4 most-interacted + 4 least (by featured flag as proxy) ── */
function pick8(arts) {
  const featured    = arts.filter(a => a.featured)
  const notFeatured = arts.filter(a => !a.featured)
  const top4    = featured.slice(0, 4)
  const bottom4 = notFeatured.slice(0, 4)
  // Interleave so card layout feels varied
  const result = []
  const maxLen = Math.max(top4.length, bottom4.length)
  for (let i = 0; i < maxLen; i++) {
    if (top4[i])    result.push(top4[i])
    if (bottom4[i]) result.push(bottom4[i])
  }
  return result.slice(0, 8)
}

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
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color }}>
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

/* ── Article group — 8 max, mobile "See more" ── */
function ArticleGroup({ icon: Icon, label, color, allArticles, categoryLink, viewAllLink }) {
  const [expanded, setExpanded] = useState(true)
  const [mobileShowAll, setMobileShowAll] = useState(false)

  const displayed = useMemo(() => pick8(allArticles), [allArticles])
  // Mobile: show 2 cards initially
  const mobileCols = 2
  const mobileVisible = mobileShowAll ? displayed : displayed.slice(0, mobileCols)

  return (
    <div className="gaming-card overflow-hidden">
      {/* Group header / toggle */}
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
            {allArticles.length}
          </span>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--muted)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {expanded && (
        <div className="p-4 md:p-5">
          {/* Desktop grid (sm+): up to 4 cols, show all 8 */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map((a, i) => (
              <div key={a.slug} className="card-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                <ArticleCard article={a} highlight={!!a.featured} />
              </div>
            ))}
          </div>

          {/* Mobile: 1 column, initially 2, "See more" expands */}
          <div className="sm:hidden grid grid-cols-1 gap-4">
            {mobileVisible.map((a, i) => (
              <div key={a.slug} className="card-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                <ArticleCard article={a} highlight={!!a.featured} />
              </div>
            ))}
          </div>

          {/* Mobile: See more / See less */}
          {!mobileShowAll && displayed.length > mobileCols && (
            <button
              className="sm:hidden w-full btn btn-ghost text-sm mt-4"
              style={{ color, borderColor: `${color}40` }}
              onClick={() => setMobileShowAll(true)}
            >
              See {displayed.length - mobileCols} more articles <ChevronDown size={13} />
            </button>
          )}
          {mobileShowAll && (
            <button
              className="sm:hidden w-full btn btn-ghost text-sm mt-4"
              style={{ color, borderColor: `${color}40` }}
              onClick={() => setMobileShowAll(false)}
            >
              Show less
            </button>
          )}

          {/* Navigate to full category page */}
          {viewAllLink && (
            <div className="text-center mt-5">
              <Link to={viewAllLink} className="btn btn-ghost text-sm" style={{ color }}>
                Browse all {label} articles <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Home ── */
export default function Home() {
  return (
    <div>
      <HeroSection />

      <div className="max-w-screen-xl mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-16">

        {/* Founder card */}
        <section>
          <SectionHeader icon={Gamepad2} label="Meet the Founder" />
          <div
            className="gaming-card home-featured-group p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8"
            style={{
              background: 'linear-gradient(135deg, rgba(240,132,44,0.06), rgba(200,160,68,0.03))',
              borderColor: 'rgba(240,132,44,0.35)',
              boxShadow: '0 0 32px rgba(240,132,44,0.12), 0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div className="shrink-0 flex justify-center">
              <PlayerCard />
            </div>
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 8 }}>
                ▸ PUBG Battlegrounds
              </div>
              <h2 className="font-orbitron font-900 text-gradient" style={{ fontSize: 'clamp(20px, 4vw, 38px)', marginBottom: 12 }}>
                【M。S】
              </h2>
              <p style={{ fontFamily: 'Rajdhani', fontSize: '15px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 14 }}>
                Active PUBG Battlegrounds player, squad leader, and founder of M S Gaming.
                This platform is my space to share strategies, hardware insights, tournament coverage,
                and build a community of serious and casual gamers alike.
              </p>
              <p className="hidden md:block" style={{ fontFamily: 'Rajdhani', fontSize: '15px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20 }}>
                Whether you're pushing ranked, grinding squad wipes, or just getting into the
                game — you're welcome here. Drop into the community and let's get that Chicken Dinner.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
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

        {/* Events */}
        <section>
          <SectionHeader icon={Calendar} label="Events & Tournaments" link="/upcoming-games" color="var(--green)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.slice(0, 4).map(ev => {
              const status = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming
              return (
                <Link key={ev.slug} to={`/upcoming-games/${ev.slug}`} className="block group">
                  <div className="gaming-card gold-card event-card p-4 h-full" style={{ minHeight: 130 }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span style={{ fontSize: 26 }}>{ev.thumbIcon}</span>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <h3 className="font-barlow font-700 leading-snug mb-2 group-hover:text-g-gold transition-colors"
                      style={{ fontSize: '14px', color: 'var(--text)' }}>
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

        {/* Articles — 3 grouped sections, 8 max each, mobile pagination */}
        <section>
          <SectionHeader icon={Flame} label="Articles" />
          <div className="space-y-4">
            <ArticleGroup
              icon={Flame}
              label="PUBG Battlegrounds"
              color="var(--orange)"
              allArticles={articles}
              viewAllLink="/pubg-articles"
            />
            <ArticleGroup
              icon={Smartphone}
              label="Gaming Phones"
              color="var(--blue)"
              allArticles={phoneArticles}
              viewAllLink="/gaming-phones"
            />
            <ArticleGroup
              icon={Monitor}
              label="Laptops & Consoles"
              color="var(--gold)"
              allArticles={laptopArticles}
              viewAllLink="/laptops-consoles"
            />
          </div>
        </section>

        {/* Community CTA */}
        <section
          className="gaming-card p-8 md:p-12 text-center scanlines"
          style={{ background: 'linear-gradient(135deg, rgba(240,132,44,0.06), rgba(200,160,68,0.04))' }}
        >
          <div className="flex justify-center mb-4">
            <Users size={36} style={{ color: 'var(--orange)' }} className="animate-float" />
          </div>
          <h2 className="font-orbitron font-900 mb-3" style={{ fontSize: 'clamp(18px, 4vw, 30px)', color: 'var(--text)' }}>
            Join the <span className="text-gradient">Community</span>
          </h2>
          <p style={{ fontFamily: 'Rajdhani', fontSize: '15px', color: 'var(--muted)', maxWidth: 400, margin: '0 auto 20px' }}>
            Share PUBG strategies, hardware questions, gaming clips, or just introduce yourself.
          </p>
          <Link to="/community" className="btn btn-primary px-7 py-3">
            Browse Discussions <ChevronRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  )
}
