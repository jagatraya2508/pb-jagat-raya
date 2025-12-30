import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Trophy, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            navigate('/admin')
        } catch (err) {
            setError('Email atau password salah. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-bg-gradient"></div>
            </div>

            <div className="login-container">
                <Link to="/" className="login-back">
                    <ArrowLeft size={20} />
                    Kembali ke Beranda
                </Link>

                <div className="login-card card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Trophy size={32} />
                        </div>
                        <h1>Admin Login</h1>
                        <p>Masuk ke dashboard admin PB. JAGAT RAYA</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin@pbjagat-raya.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-accent btn-lg login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner" style={{ width: 20, height: 20 }}></span>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-help">
                        <p><strong>Demo Login:</strong></p>
                        <p className="login-help-note">Email: admin@pbjagat-raya.com</p>
                        <p className="login-help-note">Password: admin123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
