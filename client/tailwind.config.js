/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        g: {
          bg:       '#0a0a0f',
          surface:  '#12121a',
          surface2: '#1c1c28',
          border:   '#2a2a3a',
          orange:   '#F0842C',
          gold:     '#C8A044',
          red:      '#E83A3A',
          green:    '#3AE858',
          blue:     '#3A8AE8',
          text:     '#E8E8F0',
          muted:    '#8888AA',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        barlow:   ['"Barlow Condensed"', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono:     ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'ticker':      'ticker 40s linear infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'float':       'float 4s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s ease-out both',
        'fade-in':     'fadeIn 0.4s ease-out both',
        'scan':        'scan 3s linear infinite',
      },
      keyframes: {
        ticker:    { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-100%)' } },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 5px rgba(240,132,44,0.4)' },
          '50%':     { boxShadow: '0 0 20px rgba(240,132,44,0.8), 0 0 40px rgba(240,132,44,0.4)' },
        },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp:   { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        scan:      { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
      },
      backgroundImage: {
        'gaming-gradient': 'linear-gradient(135deg, #F0842C 0%, #C8A044 100%)',
        'dark-gradient':   'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
        'hero-bg':         'radial-gradient(ellipse at 50% 0%, rgba(240,132,44,0.12) 0%, transparent 60%), linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)',
      },
      boxShadow: {
        'orange':  '0 0 12px rgba(240,132,44,0.5), 0 0 24px rgba(240,132,44,0.3)',
        'gold':    '0 0 12px rgba(200,160,68,0.5), 0 0 24px rgba(200,160,68,0.3)',
        'card':    '0 4px 20px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 32px rgba(240,132,44,0.2)',
      },
    },
  },
  plugins: [],
}
