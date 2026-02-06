import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getAuthErrorMessage } from '../../lib/authErrors'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { error: err } = await resetPassword(email)
      if (err) throw err
      setMessage('Check your email for the reset link.')
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to send reset email'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl bg-white shadow-sm border border-neutral-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-olive-800">Forgot password</h1>
            <p className="text-neutral-500 mt-1">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-olive-600 bg-olive-50 rounded-xl p-3" role="status">
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-500">
            <Link to="/login" className="text-olive-600 hover:text-olive-700 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
