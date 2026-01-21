import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Search, Edit, Trash2, X, Eye, FileText,
    Users, Trophy, Home, LogOut, BarChart3, Save, Tag, ClipboardList, GitBranch, UserCog
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css'

function RegistrationManagement() {
    const { signOut } = useAuth()
    const [registrations, setRegistrations] = useState([])
    const [tournaments, setTournaments] = useState([])
    const [selectedTournament, setSelectedTournament] = useState(null)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingRegistration, setEditingRegistration] = useState(null)
    const [formData, setFormData] = useState({
        si_pbsi: '',
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
        fetchTournaments()
        fetchCategories()
    }, [])

    useEffect(() => {
        if (selectedTournament) {
            fetchRegistrations(selectedTournament.id)
            setActiveTab('all') // Reset tab when tournament changes
        }
    }, [selectedTournament])

    const fetchTournaments = async () => {
        try {
            const data = await api.tournaments.list()
            setTournaments(data || [])
        } catch (error) {
            console.error('Error fetching tournaments:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const data = await api.categories.list()
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchRegistrations = async (tournamentId) => {
        setLoading(true)
        try {
            const data = await api.registrations.listByTournament(tournamentId)
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
            if (selectedTournament) {
                fetchRegistrations(selectedTournament.id)
            }
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
            if (selectedTournament) {
                fetchRegistrations(selectedTournament.id)
            }
        } catch (error) {
            console.error('Error deleting registration:', error)
        }
    }

    // Parse categories from tournament data
    const getTournamentCategories = () => {
        if (!selectedTournament || !selectedTournament.categories) return []
        try {
            // Check if it's JSON
            const parsed = JSON.parse(selectedTournament.categories)
            if (Array.isArray(parsed)) return parsed.map(c => c.name || c)
            return []
        } catch {
            // Fallback to comma separated
            return selectedTournament.categories.split(',').map(c => c.trim())
        }
    }

    const tournamentCategories = getTournamentCategories()

    const filteredRegistrations = registrations.filter(r => {
        const matchesSearch =
            r.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.phone?.includes(searchTerm)

        const matchesTab = activeTab === 'all' || r.category === activeTab

        return matchesSearch && matchesTab
    })

    const openEditModal = (registration) => {
        setEditingRegistration(registration)
        setFormData({
            si_pbsi: registration.si_pbsi || '',
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
                        <img src="/logo.png" alt="Logo" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} />
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
                    <button className={`sidebar-link ${!selectedTournament ? 'active' : ''}`} onClick={() => setSelectedTournament(null)} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <ClipboardList size={20} />
                        Pendaftar
                    </button>
                    <Link to="/admin/brackets" className="sidebar-link">
                        <GitBranch size={20} />
                        Bagan
                    </Link>
                    <Link to="/admin/users" className="sidebar-link">
                        <UserCog size={20} />
                        Pengguna
                    </Link>
                    <Link to="/admin/content" className="sidebar-link">
                        <FileText size={20} />
                        Konten
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
                            {selectedTournament ? (
                                <button onClick={() => setSelectedTournament(null)} className="back-link-btn" style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <ArrowLeft size={20} />
                                </button>
                            ) : (
                                <Link to="/admin" className="back-link">
                                    <ArrowLeft size={20} />
                                </Link>
                            )}
                            <div>
                                <h1>{selectedTournament ? `Pendaftar: ${selectedTournament.name}` : 'Pilih Kejuaraan'}</h1>
                                <p>{selectedTournament ? 'Kelola data pendaftar untuk kejuaraan ini' : 'Pilih kejuaraan untuk melihat pendaftar'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {!selectedTournament ? (
                        /* Tournament Selection View */
                        <div className="tournaments-grid-admin" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Memuat kejuaraan...</p>
                                </div>
                            ) : tournaments.length === 0 ? (
                                <div className="empty-state">
                                    <Trophy size={48} />
                                    <h3>Belum ada kejuaraan</h3>
                                    <p>Buat kejuaraan baru terlebih dahulu.</p>
                                    <Link to="/admin/tournaments" className="btn btn-primary">
                                        Buat Kejuaraan
                                    </Link>
                                </div>
                            ) : (
                                tournaments.map(tournament => (
                                    <div key={tournament.id} className="card tournament-card-admin" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div className="card-header" style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0 }}>{tournament.name}</h3>
                                                <span className={`badge badge-${tournament.status === 'open' ? 'success' : tournament.status === 'completed' ? 'secondary' : 'warning'}`}>
                                                    {tournament.status === 'open' ? 'Buka' : tournament.status === 'completed' ? 'Selesai' : 'Tutup'}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                                            </p>
                                        </div>
                                        <div className="card-body" style={{ flex: 1 }}>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                {tournament.location || 'Lokasi belum ditentukan'}
                                            </p>
                                            <div className="stats" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                    {tournamentCategories.length || 0} Kategori
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-footer" style={{ marginTop: 'auto' }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{ width: '100%' }}
                                                onClick={() => setSelectedTournament(tournament)}
                                            >
                                                Lihat Pendaftar
                                                <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Registration List View */
                        <>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                {/* Category Tabs */}
                                <div className="category-tabs" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', maxWidth: '100%' }}>
                                    <button
                                        className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setActiveTab('all')}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        Semua
                                    </button>
                                    {tournamentCategories.map((cat, idx) => (
                                        <button
                                            key={idx}
                                            className={`btn ${activeTab === cat ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setActiveTab(cat)}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Search */}
                                <div className="search-bar" style={{ margin: 0 }}>
                                    <Search size={20} />
                                    <input
                                        type="text"
                                        placeholder="Cari..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '200px' }}
                                    />
                                </div>
                            </div>

                            {/* Registrations Table */}
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nama Peserta</th>
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
                                                <td colSpan="6" className="table-empty">
                                                    <div className="spinner"></div>
                                                </td>
                                            </tr>
                                        ) : filteredRegistrations.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty">
                                                    {searchTerm ? 'Tidak ada hasil pencarian' : activeTab !== 'all' ? `Belum ada pendaftar di kategori ${activeTab}` : 'Belum ada pendaftar'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRegistrations.map((reg) => (
                                                <tr key={reg.id}>
                                                    <td className="member-name">{reg.participant_name}</td>
                                                    <td>
                                                        <span className="badge badge-info">{reg.category || '-'}</span>
                                                    </td>
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
                        </>
                    )}
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
                                    <label className="form-label">NO. SI.PBSI</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.si_pbsi}
                                        onChange={(e) => setFormData({ ...formData, si_pbsi: e.target.value })}
                                        placeholder="Masukkan nomor SI.PBSI"
                                    />
                                </div>

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
                                <button type="submit" className="btn btn-primary">
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
