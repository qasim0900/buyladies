import { Component } from 'react'

/**
 * FE-002 FIX: React Error Boundary
 * Catches unhandled JS exceptions anywhere in the component tree and
 * renders a graceful fallback instead of a blank page.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
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
    // In production this would forward to Sentry / Datadog
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5C2.3 17.333 3.262 19 4.802 19z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              An unexpected error occurred. Our team has been notified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Go home
            </button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 text-red-400 text-xs rounded overflow-auto max-h-48">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
