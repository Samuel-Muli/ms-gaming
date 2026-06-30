import { Crosshair, Target, Zap, Shield } from 'lucide-react'

const STATS = [
  { label: 'MATCHES',  value: '2.4K+' },
  { label: 'K/D',      value: '3.8'   },
  { label: 'WIN RATE', value: '18%'   },
]

export default function PlayerCard() {
  return (
    <div className="player-card" aria-label="M S Gaming founder player card">
      {/* The rotating gradient is done purely via CSS ::before / ::after */}
      <div className="player-card-inner">

        {/* Top — crosshair decorations */}
        <div className="pc-corner pc-corner--tl" />
        <div className="pc-corner pc-corner--tr" />
        <div className="pc-corner pc-corner--bl" />
        <div className="pc-corner pc-corner--br" />

        {/* Rank badge */}
        <div className="pc-rank-badge">
          <Shield size={11} />
          <span>PUBG · SQUAD</span>
        </div>

        {/* Avatar */}
        <div className="pc-avatar">
          <Crosshair size={36} className="pc-avatar-icon" />
          <div className="pc-avatar-ring" />
        </div>

        {/* Name */}
        <div className="pc-name">【M。S】</div>
        <div className="pc-title">FOUNDER &amp; SQUAD LEADER</div>

        {/* Divider */}
        <div className="pc-divider" />

        {/* Stats */}
        <div className="pc-stats">
          {STATS.map(s => (
            <div key={s.label} className="pc-stat">
              <div className="pc-stat-value">{s.value}</div>
              <div className="pc-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Platform */}
        <div className="pc-platform">
          <Target size={10} />
          <span>PUBG BATTLEGROUNDS</span>
          <Zap size={10} />
        </div>
      </div>
    </div>
  )
}
