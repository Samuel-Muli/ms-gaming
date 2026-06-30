import { Link } from 'react-router-dom'
import { ChevronRight, Flame, Globe, Users, Gamepad2 } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import ArticleCard from '../components/ArticleCard'
import PlayerCard from '../components/PlayerCard'
import { getFeaturedArticles, getRecentArticles } from '../data/articles'
import { phoneArticles } from '../data/phones'
import { laptopArticles } from '../data/laptops'
import { events, STATUS_COLORS } from '../data/events'

const featuredPubg   = getFeaturedArticles()
const featuredPhone  = phoneArticles.find(a => a.featured)
const featuredLaptop = laptopArticles.find(a => a.featured)
const featuredEvents = events.slice(0, 3)

function SectionHeader({ icon: Icon, label, link, linkLabel = 'View All', iconColor = 'var(--orange)' }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center"
          style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <div>
          <div className="section-label" style={{ color: iconColor }}>{label}</div>
          <div className="h-px w-12 mt-1"
            style={{ background: `linear-gradient(90deg, ${iconColor}, transparent)` }} />
        </div>
      </div>
      {link && (
        <Link to={link}
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--orange)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          {linkLabel} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <HeroSection />

      <div className="max-w-screen-xl mx-auto px-4 py-16 space-y-16">

        {/* ── Founder Player Card + Bio ──────────────────────────── */}
        <section>
          <SectionHeader icon={Gamepad2} label="Meet the Founder" />
          <div
            className="gaming-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8"
            style={{ background: 'linear-gradient(135deg, rgba(240,132,44,0.04) 0%, rgba(200,160,68,0.03) 100%)' }}
          >
            {/* Card */}
            <div className="shrink-0 flex justify-center">
              <PlayerCard />
            </div>

            {/* Bio */}
            <div className="flex-1 min-w-0">
              <div className="section-label mb-2">PUBG Battlegrounds</div>
              <h2 className="font-orbitron font-900 text-gradient mb-3"
                style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>
                【M。S】
              </h2>
              <p className="leading-relaxed mb-4"
                style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)' }}>
                Active PUBG Battlegrounds player, squad leader, and the founder of M S Gaming.
                This platform is my space to share strategies, hardware insights, tournament coverage,
                and build a community of serious and casual gamers alike.
              </p>
              <p className="leading-relaxed mb-6"
                style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)' }}>
                Whether you're pushing ranked, grinding squad wipes, or just getting into the game —
                you're welcome here. Drop into the community, share your clips, and let's get that Chicken Dinner.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { label: 'Game',      value: 'PUBG Battlegrounds', color: 'var(--orange)' },
                  { label: 'Role',      value: 'Squad Leader',       color: 'var(--gold)' },
                  { label: 'Platform',  value: 'PC + Mobile',        color: 'var(--green)' },
                ].map(s => (
                  <div key={s.label}
                    className="px-3 py-2"
                    style={{ background: 'var(--s2)', border: `1px solid ${s.color}30` }}>
                    <div className="font-orbitron font-700 text-sm" style={{ color: s.color }}>{s.value}</div>
                    <div className="font-barlow uppercase tracking-widest" style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/community" className="btn btn-primary">
                  Join Community <ChevronRight size={14} />
                </Link>
                <Link to="/articles/survival-tips-from-ms" className="btn btn-ghost">
                  My PUBG Tips
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured PUBG Articles ─────────────────────────────── */}
        <section>
          <SectionHeader icon={Flame} label="Featured PUBG Articles" link="/articles/pubg-season-2025" linkLabel="All PUBG" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPubg.map((a, i) => (
              <div key={a.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Hardware Spotlight ─────────────────────────────────── */}
        <section>
          <SectionHeader icon={Globe} label="Hardware Spotlight" link="/gaming-phones" linkLabel="More Hardware" iconColor="var(--gold)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredPhone  && <ArticleCard article={featuredPhone} />}
            {featuredLaptop && <ArticleCard article={featuredLaptop} />}
          </div>
        </section>

        {/* ── Events strip ──────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Globe} label="Events & Tournaments" link="/upcoming-games" linkLabel="All Events" iconColor="var(--green)" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredEvents.map(ev => {
              const status = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming
              return (
                <Link key={ev.slug} to={`/upcoming-games/${ev.slug}`} className="block group">
                  <div className="gaming-card gold-card p-5 h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-3xl">{ev.thumbIcon}</span>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <h3 className="font-barlow font-700 leading-snug mb-2 group-hover:transition-colors"
                      style={{ fontSize: '17px', color: 'var(--text)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}>
                      {ev.title}
                    </h3>
                    <div className="text-sm mt-2" style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                      📅 {ev.date}
                      {ev.prizePool && <span className="ml-3" style={{ color: 'var(--gold)' }}>💰 {ev.prizePool}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Community CTA ─────────────────────────────────────── */}
        <section
          className="gaming-card p-8 md:p-12 text-center scanlines"
          style={{ background: 'linear-gradient(135deg, rgba(240,132,44,0.06) 0%, rgba(200,160,68,0.04) 100%)' }}
        >
          <div className="flex justify-center mb-4">
            <Users size={40} style={{ color: 'var(--orange)' }} className="animate-float" />
          </div>
          <h2 className="font-orbitron font-900 mb-3" style={{ fontSize: 'clamp(20px, 4vw, 32px)', color: 'var(--text)' }}>
            Join the <span className="text-gradient">Community</span>
          </h2>
          <p className="max-w-md mx-auto mb-6" style={{ fontFamily: 'Rajdhani', fontSize: '16px', color: 'var(--muted)' }}>
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
