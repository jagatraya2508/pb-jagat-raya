import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Plus, Search, Edit, Trash2, X, Eye,
    Users, Trophy, Home, LogOut, BarChart3, Save, Calendar, Tag, ClipboardList, GitBranch, UserCog
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css'

function TournamentManagement() {
    const { signOut } = useAuth()
    const [tournaments, setTournaments] = useState([])
    const [registrations, setRegistrations] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
    const [selectedTournament, setSelectedTournament] = useState(null)
    const [editingTournament, setEditingTournament] = useState(null)
    const [availableCategories, setAvailableCategories] = useState([])

    // Format number to currency with thousand separators
    const formatCurrency = (value) => {
        if (!value && value !== 0) return ''
        return Number(value).toLocaleString('id-ID')
    }

    // Parse currency string back to number
    const parseCurrency = (value) => {
        if (!value) return ''
        return value.replace(/\./g, '').replace(/,/g, '')
    }

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        categories: '',
        max_participants: 100,
        status: 'open'
    })

    useEffect(() => {
        fetchTournaments()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const data = await api.categories.list()
            setAvailableCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

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

    const fetchRegistrations = async (tournamentId) => {
        try {
            const data = await api.registrations.listByTournament(tournamentId)
            setRegistrations(data || [])
        } catch (error) {
            console.error('Error fetching registrations:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingTournament) {
                await api.tournaments.update(editingTournament.id, formData)
            } else {
                await api.tournaments.create(formData)
            }

            fetchTournaments()
            closeModal()
        } catch (error) {
            console.error('Error saving tournament:', error)
            alert('Gagal menyimpan data.')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus kejuaraan ini?')) return

        try {
            await api.tournaments.delete(id)
            fetchTournaments()
        } catch (error) {
            console.error('Error deleting tournament:', error)
        }
    }

    const filteredTournaments = tournaments.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatForInput = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toISOString().split('T')[0]
    }

    const openEditModal = (tournament) => {
        setEditingTournament(tournament)
        setFormData({
            name: tournament.name,
            description: tournament.description || '',
            location: tournament.location || '',
            start_date: formatForInput(tournament.start_date),
            end_date: formatForInput(tournament.end_date),
            registration_deadline: formatForInput(tournament.registration_deadline),
            categories: tournament.categories || '',
            max_participants: tournament.max_participants || 100,
            status: tournament.status
        })
        setShowModal(true)
    }

    const openAddModal = () => {
        setEditingTournament(null)
        setFormData({
            name: '',
            description: '',
            location: '',
            start_date: '',
            end_date: '',
            registration_deadline: '',
            categories: '',
            max_participants: 100,
            status: 'open'
        })
        setShowModal(true)
    }

    const openRegistrationsModal = async (tournament) => {
        setSelectedTournament(tournament)
        await fetchRegistrations(tournament.id)
        setShowRegistrationsModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingTournament(null)
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
                    <Link to="/admin/tournaments" className="sidebar-link active">
                        <Trophy size={20} />
                        Kejuaraan
                    </Link>
                    <Link to="/admin/registrations" className="sidebar-link">
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
                                <h1>Kelola Kejuaraan</h1>
                                <p>Atur kejuaraan dan lihat pendaftaran</p>
                            </div>
                        </div>
                        <button className="btn btn-accent" onClick={openAddModal}>
                            <Plus size={20} />
                            Tambah Kejuaraan
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Search */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari kejuaraan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tournaments Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama Kejuaraan</th>
                                    <th>Lokasi</th>
                                    <th>Tanggal</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
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
                                ) : filteredTournaments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="table-empty">
                                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada kejuaraan'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTournaments.map((tournament) => (
                                        <tr key={tournament.id}>
                                            <td className="member-name">{tournament.name}</td>
                                            <td>{tournament.location || '-'}</td>
                                            <td>{formatDate(tournament.start_date)}</td>
                                            <td>{formatDate(tournament.registration_deadline)}</td>
                                            <td>
                                                <span className={`badge badge-${tournament.status === 'open' ? 'success' : tournament.status === 'closed' ? 'danger' : 'warning'}`}>
                                                    {tournament.status === 'open' ? 'Buka' : tournament.status === 'closed' ? 'Tutup' : 'Selesai'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => openRegistrationsModal(tournament)}
                                                        title="Lihat Pendaftar"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(tournament)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(tournament.id)}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingTournament ? 'Edit Kejuaraan' : 'Tambah Kejuaraan'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nama Kejuaraan *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Deskripsi</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Lokasi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tanggal Selesai</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Deadline Pendaftaran</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.registration_deadline}
                                            onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Maks. Peserta</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.max_participants}
                                            onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Kategori Pertandingan</label>
                                    <div className="category-selection-container" style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr',
                                        gap: '0.75rem',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        padding: '0.75rem',
                                        border: '1px solid var(--text-muted)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        {availableCategories.map((cat) => {
                                            let currentCategories = []
                                            try {
                                                // Try to parse as JSON
                                                currentCategories = JSON.parse(formData.categories)
                                            } catch (e) {
                                                // Fallback to legacy comma-separated string
                                                currentCategories = formData.categories
                                                    ? formData.categories.split(',').map(c => ({ name: c.trim(), fee: '' }))
                                                    : []
                                            }

                                            // Ensure currentCategories is an array of objects
                                            if (!Array.isArray(currentCategories)) currentCategories = []

                                            // Find if this category is selected
                                            const selectedCat = currentCategories.find(c => c.name === cat.name)
                                            const isChecked = !!selectedCat

                                            return (
                                                <div key={cat.id} className="category-item" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '0.5rem',
                                                    backgroundColor: isChecked ? 'var(--bg-secondary)' : 'transparent',
                                                    borderRadius: 'var(--radius-sm)'
                                                }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked
                                                                let newCategories = [...currentCategories]

                                                                if (checked) {
                                                                    newCategories.push({ name: cat.name, fee: '' })
                                                                } else {
                                                                    newCategories = newCategories.filter(c => c.name !== cat.name)
                                                                }

                                                                setFormData({
                                                                    ...formData,
                                                                    categories: JSON.stringify(newCategories)
                                                                })
                                                            }}
                                                        />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{cat.name}</span>
                                                    </label>

                                                    {isChecked && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rp</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Biaya Pendaftaran"
                                                                value={formatCurrency(selectedCat.fee)}
                                                                onChange={(e) => {
                                                                    const rawValue = parseCurrency(e.target.value)
                                                                    // Only allow numbers
                                                                    if (rawValue !== '' && !/^\d+$/.test(rawValue)) return
                                                                    const newCategories = currentCategories.map(c =>
                                                                        c.name === cat.name ? { ...c, fee: rawValue } : c
                                                                    )
                                                                    setFormData({
                                                                        ...formData,
                                                                        categories: JSON.stringify(newCategories)
                                                                    })
                                                                }}
                                                                style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    border: '1px solid var(--border-color)',
                                                                    width: '120px',
                                                                    fontSize: '0.875rem',
                                                                    textAlign: 'right'
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <p className="form-hint" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Pilih kategori dan masukkan biaya pendaftaran untuk setiap kategori.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-input"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="open">Buka</option>
                                        <option value="closed">Tutup</option>
                                        <option value="completed">Selesai</option>
                                    </select>
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

            {/* Registrations Modal */}
            {showRegistrationsModal && selectedTournament && (
                <div className="modal-overlay" onClick={() => setShowRegistrationsModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Pendaftar - {selectedTournament.name}</h2>
                            <button className="modal-close" onClick={() => setShowRegistrationsModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {registrations.length === 0 ? (
                                <p className="empty-text">Belum ada pendaftar</p>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Nama</th>
                                                <th>Email</th>
                                                <th>Telepon</th>
                                                <th>Kategori</th>
                                                <th>Tanggal Daftar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registrations.map((reg) => (
                                                <tr key={reg.id}>
                                                    <td className="member-name">{reg.participant_name}</td>
                                                    <td>{reg.email}</td>
                                                    <td>{reg.phone}</td>
                                                    <td>
                                                        <span className="badge badge-info">{reg.category}</span>
                                                    </td>
                                                    <td>{formatDate(reg.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowRegistrationsModal(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TournamentManagement
