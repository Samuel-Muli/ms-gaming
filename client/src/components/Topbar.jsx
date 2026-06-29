import { useState, useEffect } from 'react'
import { Youtube, Twitch, Twitter, MessageCircle, Wifi } from 'lucide-react'

const NEWS_ITEMS = [
  '🔥 PUBG Season 2025 — New Rondo map updates & ranked season changes now LIVE',
  '⚡ Community Alert — 【M。S】 gaming tips series: Drop Zone Mastery is up now',
  '🎮 Gaming Phone Showdown — ROG Phone 9 vs RedMagic 10 Pro: full comparison inside',
  '🏆 PUBG Global Championship 2025 — Group stage results & bracket breakdown',
  '📱 Best gaming phones for PUBG Mobile in 2025 — ranked & reviewed',
  '🖥️ MSI Titan GT77 review — Can it handle PUBG at ultra settings?',
  '🗺️ Mastering Erangel — Advanced hot-drop strategies by 【M。S】',
]

export default function Topbar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = (n) => String(n).padStart(2, '0')
  const clock = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`

  return (
    <div
      className="w-full bg-g-surface border-b border-g-border"
      style={{ height: '34px' }}
    >
      <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between px-4">
        {/* Left — live indicator + ticker */}
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          {/* LIVE dot */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-2 h-2 rounded-full bg-g-red"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
            <span
              className="font-barlow text-xs font-700 tracking-widest uppercase text-g-red"
              style={{ fontSize: '10px', letterSpacing: '0.15em' }}
            >
              LIVE
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-g-border shrink-0" />

          {/* Scrolling ticker */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className="whitespace-nowrap animate-ticker"
              style={{ fontFamily: 'Barlow Condensed', fontSize: '12px', color: '#c8c8d8', letterSpacing: '0.02em' }}
            >
              {NEWS_ITEMS.join('   •••   ')}
              &nbsp;&nbsp;&nbsp;•••&nbsp;&nbsp;&nbsp;
              {NEWS_ITEMS.join('   •••   ')}
            </div>
          </div>
        </div>

        {/* Right — clock + socials */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5">
            <Wifi size={11} className="text-g-green" />
            <span
              className="font-jetmono text-g-green"
              style={{ fontSize: '11px' }}
            >
              {clock}
            </span>
          </div>

          <div className="w-px h-4 bg-g-border" />

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {[
              { Icon: Twitter,       href: '#', label: 'X / Twitter',  col: '#8888AA' },
              { Icon: Youtube,       href: '#', label: 'YouTube',      col: '#E83A3A' },
              { Icon: Twitch,        href: '#', label: 'Twitch',       col: '#9B59B6' },
              { Icon: MessageCircle, href: '#', label: 'Discord',      col: '#5865F2' },
            ].map(({ Icon, href, label, col }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="transition-all hover:scale-110"
                style={{ color: '#8888AA' }}
                onMouseEnter={e => (e.currentTarget.style.color = col)}
                onMouseLeave={e => (e.currentTarget.style.color = '#8888AA')}
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
