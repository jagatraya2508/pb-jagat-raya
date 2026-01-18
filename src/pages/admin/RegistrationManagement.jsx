import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Search, Edit, Trash2, X, Eye,
    Users, Trophy, Home, LogOut, BarChart3, Save, Tag, ClipboardList, GitBranch, UserCog
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css'

function RegistrationManagement() {
    const { signOut } = useAuth()
    const [registrations, setRegistrations] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingRegistration, setEditingRegistration] = useState(null)
    const [formData, setFormData] = useState({
        participant_name: '',
        email: '',
        phone: '',
        category: '',
        club_name: '',
        partner_name: '',
        partner_phone: '',
        partner_ranking: 0,
        partner_points: 0,
        ranking: 0,
        points: 0
    })

    useEffect(() => {
        fetchRegistrations()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const data = await api.categories.list()
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchRegistrations = async () => {
        try {
            const data = await api.registrations.list()
            setRegistrations(data || [])
        } catch (error) {
            console.error('Error fetching registrations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.registrations.update(editingRegistration.id, formData)
            fetchRegistrations()
            closeModal()
        } catch (error) {
            console.error('Error updating registration:', error)
            alert('Gagal menyimpan data.')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus pendaftaran ini?')) return

        try {
            await api.registrations.delete(id)
            fetchRegistrations()
        } catch (error) {
            console.error('Error deleting registration:', error)
        }
    }

    const filteredRegistrations = registrations.filter(r =>
        r.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    )

    const openEditModal = (registration) => {
        setEditingRegistration(registration)
        setFormData({
            participant_name: registration.participant_name,
            email: registration.email || '',
            phone: registration.phone,
            category: registration.category,
            club_name: registration.club_name || '',
            partner_name: registration.partner_name || '',
            partner_phone: registration.partner_phone || '',
            partner_ranking: registration.partner_ranking || 0,
            partner_points: registration.partner_points || 0,
            ranking: registration.ranking || 0,
            points: registration.points || 0
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingRegistration(null)
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

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
                    <Link to="/admin" className="sidebar-link">
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
                    <Link to="/admin/registrations" className="sidebar-link active">
                        <ClipboardList size={20} />
                        Pendaftar
                    </Link>
                    <Link to="/admin/brackets" className="sidebar-link">
                        <GitBranch size={20} />
                        Bagan
                    </Link>
                    <Link to="/admin/users" className="sidebar-link">
                        <UserCog size={20} />
                        Pengguna
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-link">
                        <Home size={20} />
                        Ke Website
                    </Link>
                    <button onClick={signOut} className="sidebar-link sidebar-logout">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-content">
                        <div className="header-title-group">
                            <Link to="/admin" className="back-link">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1>Data Pendaftar</h1>
                                <p>Lihat dan kelola data pendaftar kejuaraan</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Search */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama pendaftar, kejuaraan, atau telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Registrations Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama Peserta</th>
                                    <th>Kejuaraan</th>
                                    <th>Kategori</th>
                                    <th>Telepon</th>
                                    <th>Ranking</th>
                                    <th>Poin</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="table-empty">
                                            <div className="spinner"></div>
                                        </td>
                                    </tr>
                                ) : filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="table-empty">
                                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada pendaftar'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id}>
                                            <td className="member-name">{reg.participant_name}</td>
                                            <td>
                                                <span className="badge badge-info">{reg.tournament_name || '-'}</span>
                                            </td>
                                            <td>{reg.category}</td>
                                            <td>{reg.phone}</td>
                                            <td><span className="badge badge-warning">{reg.ranking || 0}</span></td>
                                            <td><span className="badge badge-success">{reg.points || 0}</span></td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(reg)}
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(reg.id)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Pendaftar</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.participant_name}
                                        onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">No. Telepon *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Kategori *</label>
                                    <select
                                        className="form-input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Nama PB / Klub</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.club_name}
                                        onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Nama Partner</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.partner_name}
                                            onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">No. Telp Partner</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={formData.partner_phone}
                                            onChange={(e) => setFormData({ ...formData, partner_phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Ranking Partner</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.partner_ranking}
                                            onChange={(e) => setFormData({ ...formData, partner_ranking: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Poin Partner</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.partner_points}
                                            onChange={(e) => setFormData({ ...formData, partner_points: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Ranking</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.ranking}
                                            onChange={(e) => setFormData({ ...formData, ranking: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Poin</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-accent">
                                    <Save size={18} />
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RegistrationManagement
