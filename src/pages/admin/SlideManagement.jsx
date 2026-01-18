import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Users, Trophy, LogOut, Home, Settings, Image, Plus, Edit2, Trash2, X, Save,
    BarChart3, Tag, ClipboardList, Calendar, UserCog, ChevronUp, ChevronDown, Upload
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import '../admin/AdminDashboard.css'

const API_URL = 'http://localhost:5001/api'

function SlideManagement() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSlide, setEditingSlide] = useState(null)
    const [formData, setFormData] = useState({
        image_url: '',
        title: '',
        is_active: true
    })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const response = await fetch(`${API_URL}/hero-slides`)
            const data = await response.json()
            setSlides(data)
        } catch (error) {
            console.error('Error fetching slides:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const openAddModal = () => {
        setEditingSlide(null)
        setFormData({ image_url: '', title: '', is_active: true })
        setShowModal(true)
    }

    const openEditModal = (slide) => {
        setEditingSlide(slide)
        setFormData({
            image_url: slide.image_url,
            title: slide.title || '',
            is_active: slide.is_active
        })
        setShowModal(true)
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        const uploadData = new FormData()
        uploadData.append('image', file)

        try {
            const response = await fetch(`${API_URL}/hero-slides/upload`, {
                method: 'POST',
                body: uploadData
            })
            const data = await response.json()
            if (data.image_url) {
                setFormData(prev => ({ ...prev, image_url: data.image_url }))
            } else if (data.error) {
                alert('Error: ' + data.error)
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Gagal upload file')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.image_url) {
            alert('Silakan pilih gambar terlebih dahulu')
            return
        }
        try {
            if (editingSlide) {
                await fetch(`${API_URL}/hero-slides/${editingSlide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            } else {
                await fetch(`${API_URL}/hero-slides`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            }
            setShowModal(false)
            fetchSlides()
        } catch (error) {
            console.error('Error saving slide:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus slide ini?')) return
        try {
            await fetch(`${API_URL}/hero-slides/${id}`, { method: 'DELETE' })
            fetchSlides()
        } catch (error) {
            console.error('Error deleting slide:', error)
        }
    }

    const handleMoveUp = async (index) => {
        if (index === 0) return
        const newSlides = [...slides]
        const temp = newSlides[index]
        newSlides[index] = newSlides[index - 1]
        newSlides[index - 1] = temp

        const reorderData = newSlides.map((s, i) => ({ id: s.id, sort_order: i + 1 }))
        try {
            await fetch(`${API_URL}/hero-slides/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides: reorderData })
            })
            fetchSlides()
        } catch (error) {
            console.error('Error reordering:', error)
        }
    }

    const handleMoveDown = async (index) => {
        if (index === slides.length - 1) return
        const newSlides = [...slides]
        const temp = newSlides[index]
        newSlides[index] = newSlides[index + 1]
        newSlides[index + 1] = temp

        const reorderData = newSlides.map((s, i) => ({ id: s.id, sort_order: i + 1 }))
        try {
            await fetch(`${API_URL}/hero-slides/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides: reorderData })
            })
            fetchSlides()
        } catch (error) {
            console.error('Error reordering:', error)
        }
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
                    <Link to="/admin/registrations" className="sidebar-link">
                        <ClipboardList size={20} />
                        Pendaftar
                    </Link>
                    <Link to="/admin/brackets" className="sidebar-link">
                        <Calendar size={20} />
                        Bagan
                    </Link>
                    <Link to="/admin/users" className="sidebar-link">
                        <UserCog size={20} />
                        Pengguna
                    </Link>
                    <Link to="/admin/slides" className="sidebar-link active">
                        <Image size={20} />
                        Kelola Slide
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
                            <h1>Kelola Slide Hero</h1>
                            <p>Tambah, edit, dan atur urutan slide pada hero section</p>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="section-header" style={{ margin: 0 }}>Daftar Slide</h2>
                        <button onClick={openAddModal} className="btn btn-primary">
                            <Plus size={18} />
                            Tambah Slide
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner"></div>
                            <p>Memuat data...</p>
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <Image size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h3>Belum ada slide</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Klik tombol "Tambah Slide" untuk menambahkan gambar</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {slides.map((slide, index) => (
                                <div key={slide.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: '0.25rem' }}
                                        >
                                            <ChevronUp size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === slides.length - 1}
                                            className="btn btn-ghost btn-sm"
                                            style={{ padding: '0.25rem' }}
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>

                                    <img
                                        src={slide.image_url}
                                        alt={slide.title || 'Slide'}
                                        style={{
                                            width: '120px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--text-muted)'
                                        }}
                                    />

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0' }}>{slide.title || '(Tanpa judul)'}</h4>
                                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                                            {slide.image_url.length > 60 ? slide.image_url.substring(0, 60) + '...' : slide.image_url}
                                        </p>
                                    </div>

                                    <span className={`badge ${slide.is_active ? 'badge-success' : 'badge-warning'}`}>
                                        {slide.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openEditModal(slide)} className="btn btn-ghost btn-sm">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(slide.id)} className="btn btn-danger btn-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Tambah/Edit Slide */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#1f2937' }}>{editingSlide ? 'Edit Slide' : 'Tambah Slide Baru'}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Upload Section */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                    Upload Gambar
                                </label>
                                <div style={{
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    backgroundColor: '#f9fafb'
                                }}>
                                    <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                                    <p style={{ margin: '0 0 12px 0', color: '#6b7280' }}>Pilih file gambar dari komputer</p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                    {uploading && (
                                        <p style={{ color: '#3b82f6', marginTop: '8px', fontWeight: '500' }}>
                                            ⏳ Mengupload gambar...
                                        </p>
                                    )}
                                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                                        Format: JPG, PNG, GIF, WEBP (Maks 10MB)
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            {formData.image_url && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                        ✅ Preview Gambar
                                    </label>
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        style={{
                                            width: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            backgroundColor: '#f3f4f6'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Title Input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                    Judul Slide (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Foto Latihan 2024"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Active Checkbox */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#374151' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>Aktifkan slide ini</span>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.image_url || uploading}
                                    style={{
                                        padding: '12px 24px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        backgroundColor: formData.image_url ? '#2563eb' : '#9ca3af',
                                        color: '#fff',
                                        cursor: formData.image_url ? 'pointer' : 'not-allowed',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Save size={18} />
                                    {editingSlide ? 'Simpan Perubahan' : 'Tambah Slide'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SlideManagement
