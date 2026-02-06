import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getAuthErrorMessage } from '../../lib/authErrors'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await signIn(email, password)
      if (err) throw err
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to sign in'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl bg-white shadow-sm border border-neutral-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-olive-800">Olivarez College</h1>
            <p className="text-neutral-500 mt-1">Inventory Management</p>
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
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2 text-sm">
            <Link to="/forgot-password" className="text-olive-600 hover:text-olive-700">
              Forgot password?
            </Link>
            <Link to="/register" className="text-olive-600 hover:text-olive-700">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
