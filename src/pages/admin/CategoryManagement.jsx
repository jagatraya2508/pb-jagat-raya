import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Plus, Search, Edit, Trash2, X,
    Users, Trophy, Home, LogOut, BarChart3, Save, Tag, ClipboardList, GitBranch, UserCog
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css' // Reuse similar styles

function CategoryManagement() {
    const { signOut } = useAuth()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        match_type: 'single'
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const data = await api.categories.list()
            setCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingCategory) {
                await api.categories.update(editingCategory.id, formData)
            } else {
                await api.categories.create(formData)
            }

            fetchCategories()
            closeModal()
        } catch (error) {
            console.error('Error saving category:', error)
            alert('Gagal menyimpan data.')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return

        try {
            await api.categories.delete(id)
            fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    const openEditModal = (category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || '',
            match_type: category.match_type || 'single'
        })
        setShowModal(true)
    }

    const openAddModal = () => {
        setEditingCategory(null)
        setFormData({
            name: '',
            description: '',
            match_type: 'single'
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingCategory(null)
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Tag size={24} />
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
                    <Link to="/admin/categories" className="sidebar-link active">
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
                                <h1>Kelola Kategori</h1>
                                <p>Atur master data kategori pertandingan</p>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <Plus size={20} />
                            Tambah Kategori
                        </button>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Search */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Categories Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Kode/Nama</th>
                                    <th>Deskripsi</th>
                                    <th>Tipe</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="table-empty">
                                            <div className="spinner"></div>
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="table-empty">
                                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada kategori'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((cat) => (
                                        <tr key={cat.id}>
                                            <td className="member-name">{cat.name}</td>
                                            <td>{cat.description || '-'}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {cat.match_type === 'single' ? 'Tunggal' : 'Ganda'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(cat)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(cat.id)}
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
                            <h2>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Kode/Nama Kategori *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Contoh: Tunggal Putra"
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
                                        placeholder="Keterangan kategori..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tipe Pertandingan</label>
                                    <select
                                        className="form-input"
                                        value={formData.match_type}
                                        onChange={(e) => setFormData({ ...formData, match_type: e.target.value })}
                                    >
                                        <option value="single">Tunggal (Single)</option>
                                        <option value="double">Ganda (Double)</option>
                                    </select>
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

export default CategoryManagement
