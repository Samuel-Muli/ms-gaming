/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // These map to the CSS custom properties defined in index.css,
        // so EVERY utility class (bg-g-surface, text-g-muted, border-g-border, etc.)
        // automatically updates when data-theme switches between dark/light.
        g: {
          bg:       'var(--bg)',
          surface:  'var(--surface)',
          surface2: 'var(--s2)',
          border:   'var(--border)',
          orange:   'var(--orange)',
          gold:     'var(--gold)',
          red:      'var(--red)',
          green:    'var(--green)',
          blue:     'var(--blue)',
          text:     'var(--text)',
          muted:    'var(--muted)',
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
      boxShadow: {
        'orange':     '0 0 12px rgba(240,132,44,0.5), 0 0 24px rgba(240,132,44,0.3)',
        'gold':       '0 0 12px rgba(200,160,68,0.5), 0 0 24px rgba(200,160,68,0.3)',
        'card':       '0 4px 20px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 32px rgba(240,132,44,0.2)',
      },
    },
  },
  plugins: [],
}
