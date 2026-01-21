import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    BarChart3, Users, Trophy, Tag, ClipboardList, GitBranch, UserCog,
    Home, LogOut, Save, FileText, Target, Award, Heart, Trash2, Plus, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './MemberManagement.css' // Reusing existing styles for now

function ContentManagement() {
    const { signOut } = useAuth()
    const [loading, setLoading] = useState(true)
    const [content, setContent] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            const data = await api.content.list()
            setContent(data || {})
        } catch (error) {
            console.error('Error fetching content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (key, field, value) => {
        setContent(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }))
    }

    const handleSave = async (key) => {
        setSaving(true)
        try {
            await api.content.update(key, {
                title: content[key].title,
                content: content[key].content
            })
            alert('Perubahan berhasil disimpan')
        } catch (error) {
            console.error('Error updating content:', error)
            alert('Gagal menyimpan perubahan')
        } finally {
            setSaving(false)
        }
    }

    // Helper to safely get content
    const getValue = (key, field) => content[key]?.[field] || ''

    // Gallery Helpers
    const getGalleryGroups = () => {
        try {
            return JSON.parse(getValue('gallery_groups', 'content') || '[]')
        } catch (e) {
            return []
        }
    }

    const updateGalleryGroups = (newGroups) => {
        handleChange('gallery_groups', 'content', JSON.stringify(newGroups))
    }

    const handleUploadGalleryImage = async (file, groupIndex, itemIndex) => {
        if (!file) return

        try {
            setSaving(true)
            const res = await api.content.uploadImage(file)

            const groups = getGalleryGroups()
            if (groups[groupIndex] && groups[groupIndex].items[itemIndex]) {
                groups[groupIndex].items[itemIndex].icon = res.url
                updateGalleryGroups(groups)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Gagal upload gambar')
        } finally {
            setSaving(false)
        }
    }

    // Schedule Helpers
    const getSchedule = () => {
        try {
            return JSON.parse(getValue('activity_schedule', 'content') || '[]')
        } catch (e) {
            return []
        }
    }

    const updateSchedule = (newSchedule) => {
        handleChange('activity_schedule', 'content', JSON.stringify(newSchedule))
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
                        <GitBranch size={20} />
                        Bagan
                    </Link>
                    <Link to="/admin/users" className="sidebar-link">
                        <UserCog size={20} />
                        Pengguna
                    </Link>
                    <Link to="/admin/content" className="sidebar-link active">
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
                        <div>
                            <h1>Manajemen Konten</h1>
                            <p>Kelola konten website seperti Tentang Kami, Sejarah, Visi & Misi</p>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Memuat konten...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Main About Section */}
                            <div className="card">
                                <div className="card-header">
                                    <h3>Header Tentang Kami</h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">Judul</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={getValue('about_main', 'title')}
                                            onChange={(e) => handleChange('about_main', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Deskripsi</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={getValue('about_main', 'content')}
                                            onChange={(e) => handleChange('about_main', 'content', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => handleSave('about_main')}
                                        disabled={saving}
                                    >
                                        <Save size={16} /> Simpan
                                    </button>
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="card">
                                <div className="card-header">
                                    <h3>Sejarah Kami</h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">Judul</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={getValue('about_history', 'title')}
                                            onChange={(e) => handleChange('about_history', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Konten</label>
                                        <textarea
                                            className="form-input"
                                            rows="6"
                                            value={getValue('about_history', 'content')}
                                            onChange={(e) => handleChange('about_history', 'content', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => handleSave('about_history')}
                                        disabled={saving}
                                    >
                                        <Save size={16} /> Simpan
                                    </button>
                                </div>
                            </div>

                            {/* Vision & Mission Grid */}
                            <div className="card">
                                <div className="card-header">
                                    <h3>Visi, Misi & Nilai</h3>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {['about_vision', 'about_mission', 'about_community', 'about_values'].map((key) => (
                                            <div key={key} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                                <h4 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>
                                                    {key.replace('about_', '')}
                                                </h4>
                                                <div className="form-group">
                                                    <label className="form-label">Judul</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={getValue(key, 'title')}
                                                        onChange={(e) => handleChange(key, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Deskripsi</label>
                                                    <textarea
                                                        className="form-input"
                                                        rows="3"
                                                        value={getValue(key, 'content')}
                                                        onChange={(e) => handleChange(key, 'content', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    style={{ marginTop: '0.5rem', width: '100%' }}
                                                    onClick={() => handleSave(key)}
                                                    disabled={saving}
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Activities Section */}
                            <div className="card">
                                <div className="card-header">
                                    <h3>Header Kegiatan</h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">Judul</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={getValue('activity_main', 'title')}
                                            onChange={(e) => handleChange('activity_main', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Deskripsi</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={getValue('activity_main', 'content')}
                                            onChange={(e) => handleChange('activity_main', 'content', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => handleSave('activity_main')}
                                        disabled={saving}
                                    >
                                        <Save size={16} /> Simpan
                                    </button>
                                </div>
                            </div>

                            {/* Activity Cards */}
                            <div className="card">
                                <div className="card-header">
                                    <h3>Kartu Kegiatan</h3>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {['activity_card_1', 'activity_card_2', 'activity_card_3'].map((key) => (
                                            <div key={key} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Judul</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={getValue(key, 'title')}
                                                        onChange={(e) => handleChange(key, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Deskripsi</label>
                                                    <textarea
                                                        className="form-input"
                                                        rows="3"
                                                        value={getValue(key, 'content')}
                                                        onChange={(e) => handleChange(key, 'content', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Icon (Nama Komponen)</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={getValue(key, 'icon')}
                                                        onChange={(e) => handleChange(key, 'icon', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    style={{ marginTop: '0.5rem', width: '100%' }}
                                                    onClick={() => handleSave(key)}
                                                    disabled={saving}
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Config (GUI) */}
                            <div className="card">
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>Jadwal Latihan</h3>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => {
                                            const schedule = getSchedule()
                                            schedule.push({ day: 'Senin', time: '', type: '', location: '' })
                                            updateSchedule(schedule)
                                        }}
                                        disabled={saving}
                                    >
                                        <Plus size={16} /> Tambah Jadwal
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {getSchedule().map((item, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                                    <div>
                                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Hari</label>
                                                        <select
                                                            className="form-input"
                                                            value={item.day}
                                                            onChange={(e) => {
                                                                const schedule = getSchedule()
                                                                schedule[index].day = e.target.value
                                                                updateSchedule(schedule)
                                                            }}
                                                        >
                                                            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
                                                                <option key={day} value={day}>{day}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Waktu</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="contoh: 16:00 - 18:00"
                                                            value={item.time}
                                                            onChange={(e) => {
                                                                const schedule = getSchedule()
                                                                schedule[index].time = e.target.value
                                                                updateSchedule(schedule)
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flexGrow: 2 }}>
                                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Jenis Latihan</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="contoh: Latihan Anak-anak"
                                                            value={item.type}
                                                            onChange={(e) => {
                                                                const schedule = getSchedule()
                                                                schedule[index].type = e.target.value
                                                                updateSchedule(schedule)
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Lokasi</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="contoh: GOR Utama"
                                                            value={item.location}
                                                            onChange={(e) => {
                                                                const schedule = getSchedule()
                                                                schedule[index].location = e.target.value
                                                                updateSchedule(schedule)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    style={{ height: 'fit-content', background: '#fee2e2', color: '#dc2626', border: 'none', marginTop: '1.5rem' }}
                                                    onClick={() => {
                                                        const schedule = getSchedule()
                                                        schedule.splice(index, 1)
                                                        updateSchedule(schedule)
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem', width: '100%' }}
                                        onClick={() => handleSave('activity_schedule')}
                                        disabled={saving}
                                    >
                                        <Save size={16} /> Simpan Perubahan Jadwal
                                    </button>
                                </div>
                            </div>

                            {/* Gallery Main */}
                            <div className="card">
                                <div className="card-header">
                                    <h3>Header Galeri</h3>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">Judul</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={getValue('gallery_main', 'title')}
                                            onChange={(e) => handleChange('gallery_main', 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Deskripsi</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={getValue('gallery_main', 'content')}
                                            onChange={(e) => handleChange('gallery_main', 'content', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => handleSave('gallery_main')}
                                        disabled={saving}
                                    >
                                        <Save size={16} /> Simpan
                                    </button>
                                </div>
                            </div>

                            {/* Gallery Editor (GUI) */}
                            <div className="card">
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3>Isi Galeri</h3>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => {
                                            const groups = getGalleryGroups()
                                            groups.push({ title: 'New Group', items: [] })
                                            updateGalleryGroups(groups)
                                        }}
                                        disabled={saving}
                                    >
                                        <Plus size={16} /> Tambah Group
                                    </button>
                                </div>
                                <div className="card-body">
                                    {getGalleryGroups().map((group, groupIndex) => (
                                        <div key={groupIndex} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label className="form-label">Nama Group</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={group.title}
                                                        onChange={(e) => {
                                                            const groups = getGalleryGroups()
                                                            groups[groupIndex].title = e.target.value
                                                            updateGalleryGroups(groups)
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    style={{ height: 'fit-content', alignSelf: 'flex-end', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                                                    onClick={() => {
                                                        if (confirm('Hapus group ini?')) {
                                                            const groups = getGalleryGroups()
                                                            groups.splice(groupIndex, 1)
                                                            updateGalleryGroups(groups)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Items in Group */}
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {group.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                        {/* Image Preview & Upload */}
                                                        <div style={{ width: '100px', flexShrink: 0 }}>
                                                            <div style={{
                                                                width: '100px', height: '100px',
                                                                background: '#f1f5f9', borderRadius: '4px',
                                                                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                marginBottom: '0.5rem', border: '1px solid #cbd5e1'
                                                            }}>
                                                                {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? (
                                                                    <img src={item.icon} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontSize: '2rem' }}>{item.icon || '📷'}</span>
                                                                )}
                                                            </div>
                                                            <label className="btn btn-sm btn-outline" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', padding: '0.25rem' }}>
                                                                <ImageIcon size={14} /> Upload
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => handleUploadGalleryImage(e.target.files[0], groupIndex, itemIndex)}
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Item Details */}
                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                placeholder="Judul Foto"
                                                                value={item.title}
                                                                onChange={(e) => {
                                                                    const groups = getGalleryGroups()
                                                                    groups[groupIndex].items[itemIndex].title = e.target.value
                                                                    updateGalleryGroups(groups)
                                                                }}
                                                            />
                                                            <textarea
                                                                className="form-input"
                                                                placeholder="Deskripsi"
                                                                rows="2"
                                                                value={item.description}
                                                                onChange={(e) => {
                                                                    const groups = getGalleryGroups()
                                                                    groups[groupIndex].items[itemIndex].description = e.target.value
                                                                    updateGalleryGroups(groups)
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Delete Item */}
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ height: 'fit-content', color: '#94a3b8', background: 'transparent', padding: '0.5rem' }}
                                                            onClick={() => {
                                                                const groups = getGalleryGroups()
                                                                groups[groupIndex].items.splice(itemIndex, 1)
                                                                updateGalleryGroups(groups)
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    style={{ width: 'fit-content' }}
                                                    onClick={() => {
                                                        const groups = getGalleryGroups()
                                                        groups[groupIndex].items.push({ title: 'Baru', description: '', icon: '' })
                                                        updateGalleryGroups(groups)
                                                    }}
                                                >
                                                    <Plus size={14} /> Tambah Foto
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem', width: '100%' }}
                                        onClick={() => handleSave('gallery_groups')}
                                        disabled={saving}
                                    >
                                        <Save size={16} /> Simpan Semua Perubahan Galeri
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ContentManagement
