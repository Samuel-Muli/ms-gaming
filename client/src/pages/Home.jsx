import { Link } from 'react-router-dom'
import { ChevronRight, Flame, Globe, Users } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import ArticleCard from '../components/ArticleCard'
import { getFeaturedArticles, getRecentArticles } from '../data/articles'
import { phoneArticles } from '../data/phones'
import { laptopArticles } from '../data/laptops'
import { events, STATUS_COLORS } from '../data/events'

const allRecent = getRecentArticles(3)
const featuredPubg = getFeaturedArticles()
const featuredPhone = phoneArticles.find(a => a.featured)
const featuredLaptop = laptopArticles.find(a => a.featured)
const featuredEvents = events.slice(0, 3)

function SectionHeader({ icon: Icon, label, link, linkLabel = 'View All' }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'rgba(240,132,44,0.1)', border: '1px solid rgba(240,132,44,0.2)' }}>
          <Icon size={16} className="text-g-orange" />
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 0 }}>{label}</div>
          <div className="h-px w-12 mt-1" style={{ background: 'linear-gradient(90deg, #F0842C, transparent)' }} />
        </div>
      </div>
      {link && (
        <Link to={link} className="flex items-center gap-1 text-g-muted hover:text-g-orange transition-colors" style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.06em' }}>
          {linkLabel} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* ── Main content ── */}
      <div className="max-w-screen-xl mx-auto px-4 py-16 space-y-16">

        {/* Featured PUBG Articles */}
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

        {/* Hardware Spotlight */}
        <section>
          <SectionHeader icon={Globe} label="Hardware Spotlight" link="/gaming-phones" linkLabel="More Hardware" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredPhone && <ArticleCard article={featuredPhone} />}
            {featuredLaptop && <ArticleCard article={featuredLaptop} />}
          </div>
        </section>

        {/* Events strip */}
        <section>
          <SectionHeader icon={Globe} label="Events & Tournaments" link="/upcoming-games" linkLabel="All Events" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredEvents.map(ev => {
              const status = STATUS_COLORS[ev.status] || STATUS_COLORS.upcoming
              return (
                <Link
                  key={ev.slug}
                  to={`/upcoming-games/${ev.slug}`}
                  className="gaming-card gold-card p-5 block group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-3xl">{ev.thumbIcon}</span>
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                  </div>
                  <h3
                    className="font-barlow font-700 text-g-text group-hover:text-g-gold transition-colors leading-snug mb-1"
                    style={{ fontSize: '17px' }}
                  >
                    {ev.title}
                  </h3>
                  <div className="text-g-muted text-sm mt-2" style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', letterSpacing: '0.06em' }}>
                    📅 {ev.date}
                    {ev.prizePool && <span className="ml-3 text-g-gold">💰 {ev.prizePool}</span>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Community CTA */}
        <section
          className="gaming-card p-8 md:p-12 text-center scanlines"
          style={{ background: 'linear-gradient(135deg, rgba(240,132,44,0.06) 0%, rgba(200,160,68,0.04) 100%)' }}
        >
          <div className="flex justify-center mb-4">
            <Users size={40} className="text-g-orange animate-float" />
          </div>
          <h2 className="font-orbitron font-900 text-2xl md:text-3xl text-g-text mb-3">
            Join the <span className="text-gradient">Community</span>
          </h2>
          <p className="text-g-muted max-w-md mx-auto mb-6" style={{ fontFamily: 'Rajdhani', fontSize: '16px' }}>
            Share PUBG strategies, hardware questions, gaming clips, or just introduce yourself.
            The M S Gaming community is open to all skill levels.
          </p>
          <Link to="/community" className="btn btn-primary text-base px-8 py-3">
            Browse Discussions <ChevronRight size={16} />
          </Link>
        </section>

      </div>
    </div>
  )
}
