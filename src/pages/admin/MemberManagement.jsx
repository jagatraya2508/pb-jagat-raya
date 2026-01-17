import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Plus, Search, Edit, Trash2, X,
    Users, Trophy, Home, LogOut, BarChart3, Save
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css'

function MemberManagement() {
    const { signOut } = useAuth()
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingMember, setEditingMember] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        birthdate: '',
        category: 'dewasa',
        status: 'aktif'
    })

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            const data = await api.members.list()
            setMembers(data || [])
        } catch (error) {
            console.error('Error fetching members:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingMember) {
                await api.members.update(editingMember.id, formData)
            } else {
                await api.members.create(formData)
            }

            fetchMembers()
            closeModal()
        } catch (error) {
            console.error('Error saving member:', error)
            alert('Gagal menyimpan data.')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus anggota ini?')) return

        try {
            await api.members.delete(id)
            fetchMembers()
        } catch (error) {
            console.error('Error deleting member:', error)
        }
    }

    const openEditModal = (member) => {
        setEditingMember(member)
        setFormData({
            name: member.name,
            email: member.email || '',
            phone: member.phone || '',
            address: member.address || '',
            birthdate: member.birthdate || '',
            category: member.category,
            status: member.status
        })
        setShowModal(true)
    }

    const openAddModal = () => {
        setEditingMember(null)
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            birthdate: '',
            category: 'dewasa',
            status: 'aktif'
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingMember(null)
    }

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                    <Link to="/admin/members" className="sidebar-link active">
                        <Users size={20} />
                        Anggota
                    </Link>
                    <Link to="/admin/tournaments" className="sidebar-link">
                        <Trophy size={20} />
                        Kejuaraan
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
                                <h1>Kelola Anggota</h1>
                                <p>Tambah, edit, dan hapus data anggota</p>
                            </div>
                        </div>
                        <button className="btn btn-accent" onClick={openAddModal}>
                            <Plus size={20} />
                            Tambah Anggota
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Search */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari anggota..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Members Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Telepon</th>
                                    <th>Kategori</th>
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
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="table-empty">
                                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada anggota'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td className="member-name">{member.name}</td>
                                            <td>{member.email || '-'}</td>
                                            <td>{member.phone || '-'}</td>
                                            <td>
                                                <span className={`badge badge-${member.category === 'anak' ? 'info' : 'warning'}`}>
                                                    {member.category}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${member.status === 'aktif' ? 'success' : 'danger'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(member)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(member.id)}
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
                            <h2>{editingMember ? 'Edit Anggota' : 'Tambah Anggota'}</h2>
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
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                        <label className="form-label">Telepon</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Alamat</label>
                                    <textarea
                                        className="form-input"
                                        rows="2"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Tanggal Lahir</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.birthdate}
                                            onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Kategori</label>
                                        <select
                                            className="form-input"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="anak">Anak-anak</option>
                                            <option value="dewasa">Dewasa</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-input"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Non-Aktif</option>
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
        </div>
    )
}

export default MemberManagement
