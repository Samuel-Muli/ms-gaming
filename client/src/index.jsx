import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function MissingKeyScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f', color: '#E8E8F0', fontFamily: 'monospace', padding: 24, textAlign: 'center',
    }}>
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ color: '#E83A3A', fontSize: 22, marginBottom: 16 }}>⚠ Clerk Publishable Key Missing</h1>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          <code>VITE_CLERK_PUBLISHABLE_KEY</code> was not found, so Sign In cannot work.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: 12, color: '#8888AA' }}>
          Check that <code>client/.env</code> exists and contains a line starting with
          <code> VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code>, then fully stop and
          restart <code>npm run dev</code> (Vite only reads .env on startup).
        </p>
        <p style={{ lineHeight: 1.7, color: '#8888AA' }}>
          If you're running this from a Git clone, note that <code>.env</code> is in
          <code> .gitignore</code> by design (so secrets aren't committed) — it must be
          copied over manually, it won't come through on <code>git pull</code> / clone.
        </p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      {PUBLISHABLE_KEY ? (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      ) : (
        <MissingKeyScreen />
      )}
    </HelmetProvider>
  </React.StrictMode>
)