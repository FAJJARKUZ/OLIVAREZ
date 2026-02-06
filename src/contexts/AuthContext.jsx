import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ROLES } from '../config/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  const role = profile?.role ?? user?.user_metadata?.role ?? null
  const isAdmin = role === ROLES.ADMIN
  const isAccounting = role === ROLES.ACCOUNTING
  const isSupplier = role === ROLES.SUPPLIER

  const value = {
    user,
    profile,
    role,
    isAdmin,
    isAccounting,
    isSupplier,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, metadata = {}) =>
      supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
