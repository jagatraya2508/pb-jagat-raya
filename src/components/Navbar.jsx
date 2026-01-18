import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, Home, Users, Trophy, Calendar, Image, Phone, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Beranda', href: '#beranda', icon: Home },
        { name: 'Tentang', href: '#tentang', icon: Users },
        { name: 'Kegiatan', href: '#kegiatan', icon: Calendar },
        { name: 'Galeri', href: '#galeri', icon: Image },
        { name: 'Kontak', href: '#kontak', icon: Phone },
    ]

    const handleNavClick = (e, href) => {
        if (location.pathname === '/' && href.startsWith('#')) {
            e.preventDefault()
            const element = document.querySelector(href)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
            setIsOpen(false)
        }
    }

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="navbar-logo">
                        <img src="/logo.png" alt="Jagat Raya Logo" style={{ height: '40px', width: 'auto' }} />
                    </div>
                    <div className="navbar-brand-text">
                        <span className="navbar-brand-name">PB. JAGAT RAYA</span>
                        <span className="navbar-brand-tagline">Perkumpulan Bulutangkis</span>
                    </div>
                </Link>

                <div className={`navbar-menu ${isOpen ? 'navbar-menu-open' : ''}`}>
                    <ul className="navbar-links">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <a
                                    href={link.href}
                                    className="navbar-link"
                                    onClick={(e) => handleNavClick(e, link.href)}
                                >
                                    <link.icon size={18} />
                                    <span>{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="navbar-actions">

                        {user ? (
                            <>
                                <Link to="/admin" className="btn btn-ghost btn-sm">
                                    <LayoutDashboard size={18} />
                                    Panel
                                </Link>
                                <button onClick={() => { signOut(); navigate('/'); }} className="btn btn-accent btn-sm">
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-accent btn-sm">
                                <LogIn size={18} />
                                Login Admin
                            </Link>
                        )}
                    </div>
                </div>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    )
}

export default Navbar
