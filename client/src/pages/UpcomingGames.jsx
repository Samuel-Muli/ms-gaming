import { Link } from 'react-router-dom'
import { Calendar, MapPin, Trophy, Clock } from 'lucide-react'
import { events, STATUS_COLORS } from '../data/events'
import ArticleCard from '../components/ArticleCard'

function EventCard({ event }) {
  const status = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming
  return (
    <Link to={`/upcoming-games/${event.slug}`} className="block group">
      <div
        className="gaming-card gold-card p-5 h-full"
        style={event.status === 'ongoing' ? { borderColor: 'rgba(232,58,58,0.4)', boxShadow: '0 0 16px rgba(232,58,58,0.1)' } : {}}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-4xl">{event.thumbIcon}</span>
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>

        {/* Title */}
        <h3
          className="font-barlow font-700 text-g-text group-hover:text-g-gold transition-colors leading-snug mb-3"
          style={{ fontSize: '18px' }}
        >
          {event.title}
        </h3>

        {/* Excerpt */}
        <p className="text-g-muted text-sm leading-relaxed mb-4 line-clamp-2" style={{ fontFamily: 'Rajdhani' }}>
          {event.excerpt}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 border-t border-g-border pt-3 mt-auto">
          {event.date && (
            <div className="flex items-center gap-2 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', letterSpacing: '0.05em' }}>
              <Calendar size={11} className="text-g-gold" /> {event.date}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', letterSpacing: '0.05em' }}>
              <MapPin size={11} className="text-g-orange" /> {event.location}
            </div>
          )}
          {event.prizePool && (
            <div className="flex items-center gap-2 text-g-gold font-semibold" style={{ fontFamily: 'Barlow Condensed', fontSize: '13px', letterSpacing: '0.05em' }}>
              <Trophy size={11} /> {event.prizePool} Prize Pool
            </div>
          )}
          <div className="flex items-center gap-2 text-g-muted" style={{ fontFamily: 'Barlow Condensed', fontSize: '12px' }}>
            <Clock size={11} /> {event.readTime} min read
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function UpcomingGames() {
  const ongoing  = events.filter(e => e.status === 'ongoing')
  const upcoming = events.filter(e => e.status === 'upcoming')

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-10 pb-6 border-b border-g-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'rgba(58,232,88,0.1)', border: '1px solid rgba(58,232,88,0.2)' }}>
            <Calendar size={20} className="text-g-green" />
          </div>
          <span className="section-label" style={{ color: '#3AE858' }}>Events</span>
        </div>
        <h1 className="font-barlow font-800 text-3xl md:text-4xl text-g-text uppercase tracking-wide mb-2">Upcoming Games & Events</h1>
        <p className="text-g-muted max-w-xl" style={{ fontFamily: 'Rajdhani', fontSize: '16px' }}>
          PUBG tournaments, season drops, gaming expos, and hardware launches — all in one place.
        </p>
      </div>

      {/* LIVE NOW */}
      {ongoing.length > 0 && (
        <div id="tournaments" className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-2.5 h-2.5 rounded-full bg-g-red"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
            <div className="section-label" style={{ color: '#E83A3A' }}>Live Now</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ongoing.map(ev => <EventCard key={ev.slug} event={ev} />)}
          </div>
        </div>
      )}

      {/* UPCOMING */}
      <div id="pubg" className="mb-10">
        <div className="section-label mb-5">Upcoming</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcoming.map((ev, i) => (
            <div key={ev.slug} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
      </div>

      {/* PUBG Updates anchor */}
      <div id="expos" className="gaming-card p-6 text-center mt-8" style={{ background: 'rgba(58,232,88,0.03)' }}>
        <Calendar size={28} className="text-g-green mx-auto mb-3" />
        <p className="text-g-muted" style={{ fontFamily: 'Rajdhani' }}>
          Stay tuned for more PUBG season drops and tournament coverage.{' '}
          <Link to="/community?cat=events" className="text-g-green hover:underline">Discuss events in the community.</Link>
        </p>
      </div>
    </div>
  )
}
