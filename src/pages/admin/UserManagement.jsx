import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Plus, Search, Edit, Trash2, X,
    Users, Trophy, Home, LogOut, BarChart3, Save, Tag, ClipboardList, GitBranch, UserCog, Eye, EyeOff
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css'

function UserManagement() {
    const { signOut } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        status: 'active'
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const data = await api.users.list()
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingUser) {
                // Only send password if it was changed
                const updateData = { ...formData }
                if (!updateData.password) {
                    delete updateData.password
                }
                await api.users.update(editingUser.id, updateData)
            } else {
                if (!formData.password) {
                    alert('Password wajib diisi')
                    return
                }
                await api.users.create(formData)
            }

            fetchUsers()
            closeModal()
        } catch (error) {
            console.error('Error saving user:', error)
            alert(error.message || 'Gagal menyimpan data.')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus pengguna ini?')) return

        try {
            await api.users.delete(id)
            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't show password when editing
            role: user.role,
            status: user.status
        })
        setShowPassword(false)
        setShowModal(true)
    }

    const openAddModal = () => {
        setEditingUser(null)
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'admin',
            status: 'active'
        })
        setShowPassword(false)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingUser(null)
        setShowPassword(false)
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'badge-success'
            case 'operator': return 'badge-info'
            case 'viewer': return 'badge-warning'
            default: return 'badge-secondary'
        }
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
                    <Link to="/admin/registrations" className="sidebar-link">
                        <ClipboardList size={20} />
                        Pendaftar
                    </Link>
                    <Link to="/admin/brackets" className="sidebar-link">
                        <GitBranch size={20} />
                        Bagan
                    </Link>
                    <Link to="/admin/users" className="sidebar-link active">
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
                                <h1>Kelola Pengguna</h1>
                                <p>Tambah, edit, dan hapus data pengguna sistem</p>
                            </div>
                        </div>
                        <button className="btn btn-accent" onClick={openAddModal}>
                            <Plus size={20} />
                            Tambah Pengguna
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Search */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari pengguna..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Users Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Login Terakhir</th>
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
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="table-empty">
                                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada pengguna'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="member-name">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                                    {user.role === 'admin' ? 'Admin' :
                                                        user.role === 'operator' ? 'Operator' : 'Viewer'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${user.status === 'active' ? 'success' : 'danger'}`}>
                                                    {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td>{formatDate(user.last_login)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(user)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(user.id)}
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
                            <h2>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
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

                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Password {editingUser ? '(kosongkan jika tidak diubah)' : '*'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-input"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                            style={{ paddingRight: '40px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Role</label>
                                        <select
                                            className="form-input"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="operator">Operator</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-input"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Aktif</option>
                                            <option value="inactive">Nonaktif</option>
                                        </select>
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

export default UserManagement
