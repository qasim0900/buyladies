import { Component } from 'react'

/**
 * React Error Boundary — Graceful Luxury Recovery
 * Catches unhandled JS exceptions anywhere in the component tree and
 * renders a brand-consistent dark luxury fallback instead of a blank page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div
        className="min-h-screen bg-[#0D0D0D] text-[#F5F0E8] flex flex-col selection:bg-[#C9A84C] selection:text-[#0D0D0D]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.03,
            backgroundImage:
              'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),' +
              'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
          }}
        />

        {/* Nav */}
        <nav
          className="relative z-10 flex items-center justify-between px-10 py-7"
          style={{ borderBottom: '1px solid #1E1E1E' }}
        >
          <a
            href="/"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '1.5rem',
              letterSpacing: '0.15em',
              color: '#F5F0E8',
              textDecoration: 'none',
            }}
          >
            BUY<span style={{ color: '#C9A84C' }}>LADIES</span>
          </a>
        </nav>

        {/* Main */}
        <div className="flex-1 flex items-center justify-center px-6 relative z-10">
          <div className="w-full max-w-md text-center">
            {/* Ornament */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div style={{ height: 1, width: 48, background: '#2A2A2A' }} />
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '1px solid rgba(201,168,76,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  style={{ width: 20, height: 20, color: '#C9A84C' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                  />
                </svg>
              </div>
              <div style={{ height: 1, width: 48, background: '#2A2A2A' }} />
            </div>

            {/* Eyebrow */}
            <p
              style={{
                color: '#C9A84C',
                fontSize: '0.6875rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              An Unplanned Intermission
            </p>

            {/* Heading */}
            <h1
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 500,
                marginBottom: '1rem',
                lineHeight: 1.25,
                color: '#F5F0E8',
              }}
            >
              We've lost our
              <br />
              <span style={{ fontStyle: 'italic', color: '#C9A84C' }}>footing.</span>
            </h1>

            {/* Body */}
            <p
              style={{
                color: '#5A5A5A',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                marginBottom: '3rem',
                maxWidth: '20rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Something unexpected unravelled behind the scenes.
              Our artisans are already at work mending it.
            </p>

            {/* Recovery actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.875rem 2rem',
                  border: '1px solid #C9A84C',
                  color: '#C9A84C',
                  fontSize: '0.75rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C9A84C'
                  e.currentTarget.style.color = '#0D0D0D'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#C9A84C'
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: '0.875rem 2rem',
                  border: '1px solid #2A2A2A',
                  color: '#7A7A7A',
                  fontSize: '0.75rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  display: 'inline-block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C9A84C'
                  e.currentTarget.style.color = '#C9A84C'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A2A'
                  e.currentTarget.style.color = '#7A7A7A'
                }}
              >
                Return Home
              </a>
            </div>

            {/* Dev error details */}
            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginTop: '2.5rem', textAlign: 'left' }}>
                <summary
                  style={{
                    fontSize: '0.7rem',
                    color: '#3A3A3A',
                    cursor: 'pointer',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  Error details (dev only)
                </summary>
                <pre
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: '#111111',
                    border: '1px solid #2A2A2A',
                    color: '#C9A84C',
                    fontSize: '0.7rem',
                    overflowX: 'auto',
                    maxHeight: '12rem',
                    lineHeight: 1.6,
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Footer strip */}
        <div
          className="relative z-10 text-center py-5"
          style={{ borderTop: '1px solid #1E1E1E' }}
        >
          <p
            style={{
              color: '#2A2A2A',
              fontSize: '0.625rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            Heritage · Craft · Elegance
          </p>
        </div>
      </div>
    )
  }
}
