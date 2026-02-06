/**
 * Returns a user-friendly message for auth errors.
 * Replaces "email rate limit exceeded" and similar with a gentler message.
 */
export function getAuthErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const msg = err?.message || ''
  const lower = msg.toLowerCase()
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('email rate')) {
    return 'Too many attempts. Please try again in a few minutes.'
  }
  return msg || fallback
}
