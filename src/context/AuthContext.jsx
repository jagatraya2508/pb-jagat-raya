import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    return useContext(AuthContext)
}

// Demo admin credentials
const DEMO_ADMIN = {
    email: 'admin@pbjagat-raya.com',
    password: 'admin123'
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for demo session in localStorage
        const demoSession = localStorage.getItem('demo_admin_session')
        if (demoSession) {
            setUser(JSON.parse(demoSession))
            setLoading(false)
            return
        }

        // If Supabase is not configured, skip Supabase authentication
        if (!isSupabaseConfigured || !supabase) {
            console.warn('Supabase not configured - demo mode available')
            setLoading(false)
            return
        }

        // Check active Supabase sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        }).catch((error) => {
            console.error('Error getting session:', error)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        // Demo login - check against demo credentials
        if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
            const demoUser = {
                id: 'demo-admin-id',
                email: DEMO_ADMIN.email,
                name: 'Administrator',
                isDemo: true
            }
            localStorage.setItem('demo_admin_session', JSON.stringify(demoUser))
            setUser(demoUser)
            return { user: demoUser }
        }

        // If Supabase is configured, try Supabase login
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) throw error
            return data
        }

        throw new Error('Email atau password salah')
    }

    const signOut = async () => {
        // Clear demo session
        localStorage.removeItem('demo_admin_session')

        if (supabase) {
            await supabase.auth.signOut()
        }

        setUser(null)
    }

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
        isSupabaseConfigured,
        isDemoMode: user?.isDemo === true
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
