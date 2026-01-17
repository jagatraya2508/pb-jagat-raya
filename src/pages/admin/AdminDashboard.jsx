import { Link, useNavigate } from 'react-router-dom'
import {
    Users, Trophy, LogOut, Home, Settings,
    UserPlus, Calendar, BarChart3, Tag
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './AdminDashboard.css'

function AdminDashboard() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const stats = [
        { label: 'Total Anggota', value: '0', icon: Users, color: 'blue' },
        { label: 'Kejuaraan Aktif', value: '0', icon: Trophy, color: 'yellow' },
        { label: 'Pendaftar Baru', value: '0', icon: UserPlus, color: 'green' },
        { label: 'Event Bulan Ini', value: '0', icon: Calendar, color: 'purple' },
    ]

    const menuItems = [
        {
            title: 'Kelola Anggota',
            description: 'Tambah, edit, dan hapus data anggota',
            icon: Users,
            link: '/admin/members',
            color: 'blue'
        },
        {
            title: 'Kelola Kejuaraan',
            description: 'Atur kejuaraan dan pendaftaran',
            icon: Trophy,
            link: '/admin/tournaments',
            color: 'yellow'
        },
        {
            title: 'Kelola Kategori',
            description: 'Atur master data kategori pertandingan',
            icon: Tag,
            link: '/admin/categories',
            color: 'purple'
        },
    ]

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Trophy size={24} />
                    </div>
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-name">PB. JAGAT RAYA</span>
                        <span className="sidebar-brand-label">Admin Panel</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin" className="sidebar-link active">
                        <BarChart3 size={20} />
                        Dashboard
                    </Link>
                    <Link to="/admin/members" className="sidebar-link">
                        <Users size={20} />
                        Anggota
                    </Link>
                    <Link to="/admin/categories" className="sidebar-link">
                        <Tag size={20} />
                        Kategori
                    </Link>
                    <Link to="/admin/tournaments" className="sidebar-link">
                        <Trophy size={20} />
                        Kejuaraan
                    </Link>
                </nav>

                <div className="sidebar-footer">

                    <button onClick={handleLogout} className="sidebar-link sidebar-logout">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-content">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Selamat datang kembali, Admin!</p>
                        </div>
                        <div className="admin-user">
                            <Link to="/" className="btn btn-ghost btn-sm" style={{ marginRight: '1rem' }}>
                                <Home size={18} style={{ marginRight: '0.5rem' }} />
                                Ke Website
                            </Link>
                            <div className="admin-user-avatar">
                                <Settings size={20} />
                            </div>
                            <span>{user?.email}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className={`stat-card stat-card-${stat.color}`}>
                                <div className="stat-icon">
                                    <stat.icon size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <h2 className="section-header">Menu Cepat</h2>
                    <div className="menu-grid">
                        {menuItems.map((item, index) => (
                            <Link key={index} to={item.link} className={`menu-card menu-card-${item.color}`}>
                                <div className="menu-icon">
                                    <item.icon size={32} />
                                </div>
                                <div className="menu-info">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard
