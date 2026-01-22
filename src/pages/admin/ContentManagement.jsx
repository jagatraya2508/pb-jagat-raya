import React, { useState, useEffect } from 'react'
import { Save, Loader, AlertCircle, CheckCircle, Image, Trash2, Plus, Upload } from 'lucide-react'
import { api } from '../../lib/api'
import './ContentManagement.css'
import AdminSidebar from '../../components/AdminSidebar'

function ContentManagement() {
    const [activeTab, setActiveTab] = useState('about')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // Contact Data State
    const [contactData, setContactData] = useState({
        address: '',
        phone: '',
        email: '',
        hours: ''
    })

    // Activities Data State
    const [activityMain, setActivityMain] = useState({ title: '', content: '' })
    const [activityCards, setActivityCards] = useState([
        { id: 'activity_card_1', title: '', content: '', icon: 'Calendar' },
        { id: 'activity_card_2', title: '', content: '', icon: 'Users' },
        { id: 'activity_card_3', title: '', content: '', icon: 'Clock' }
    ])
    const [activitySchedule, setActivitySchedule] = useState([])
    const [newSchedule, setNewSchedule] = useState({ day: 'Senin', time: '', type: '', location: '' })
    const [editingScheduleIndex, setEditingScheduleIndex] = useState(null)

    // Gallery Data State
    const [galleryItems, setGalleryItems] = useState([])
    const [newImage, setNewImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [caption, setCaption] = useState('')
    const [category, setCategory] = useState('')
    const [editingId, setEditingId] = useState(null)

    // About Us Data State
    const [aboutMain, setAboutMain] = useState({ title: '', content: '' })
    const [aboutHistory, setAboutHistory] = useState({ title: '', content: '' })
    const [aboutVision, setAboutVision] = useState({ title: '', content: '', icon: 'Target' })
    const [aboutMission, setAboutMission] = useState({ title: '', content: '', icon: 'Award' })
    const [aboutCommunity, setAboutCommunity] = useState({ title: '', content: '', icon: 'Users' })
    const [aboutValues, setAboutValues] = useState({ title: '', content: '', icon: 'Heart' })

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            if (activeTab === 'contact') {
                const data = await api.content.get('contact')
                if (data && data.content) {
                    const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                    setContactData(content)
                }
            } else if (activeTab === 'gallery') {
                const items = await api.gallery.list()
                setGalleryItems(Array.isArray(items) ? items : [])
            } else if (activeTab === 'activities') {
                const data = await api.content.list()
                // Main Section
                if (data.activity_main) {
                    setActivityMain({
                        title: data.activity_main.title || '',
                        content: data.activity_main.content || ''
                    })
                }
                // Cards
                const cards = []
                for (let i = 1; i <= 3; i++) {
                    const key = `activity_card_${i}`
                    if (data[key]) {
                        cards.push({ id: key, title: data[key].title, content: data[key].content, icon: data[key].icon })
                    } else {
                        cards.push({ id: key, title: '', content: '', icon: 'Calendar' })
                    }
                }
                if (cards.length > 0) setActivityCards(cards)

                // Schedule
                if (data.activity_schedule) {
                    try {
                        const parsed = JSON.parse(data.activity_schedule.content || '[]')
                        setActivitySchedule(parsed)
                    } catch (e) {
                        console.error('Error parsing schedule', e)
                        setActivitySchedule([])
                    }
                }
            } else if (activeTab === 'about') {
                const data = await api.content.list()
                if (data.about_main) setAboutMain({ title: data.about_main.title || '', content: data.about_main.content || '' })
                if (data.about_history) setAboutHistory({ title: data.about_history.title || '', content: data.about_history.content || '' })
                if (data.about_vision) setAboutVision({ title: data.about_vision.title || '', content: data.about_vision.content || '', icon: data.about_vision.icon || 'Target' })
                if (data.about_mission) setAboutMission({ title: data.about_mission.title || '', content: data.about_mission.content || '', icon: data.about_mission.icon || 'Award' })
                if (data.about_community) setAboutCommunity({ title: data.about_community.title || '', content: data.about_community.content || '', icon: data.about_community.icon || 'Users' })
                if (data.about_values) setAboutValues({ title: data.about_values.title || '', content: data.about_values.content || '', icon: data.about_values.icon || 'Heart' })
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            // Don't show error for 404 contact
            if (activeTab === 'gallery' || (err.message && !err.message.includes('not found'))) {
                setError('Gagal memuat data')
            }
        } finally {
            setLoading(false)
        }
    }

    // Contact Handlers
    const handleContactChange = (e) => {
        const { name, value } = e.target
        setContactData(prev => ({ ...prev, [name]: value }))
    }

    const handleSaveContact = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await api.content.update('contact', {
                title: 'Informasi Kontak',
                content: contactData
            })
            setSuccess('Konten berhasil disimpan')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error saving content:', err)
            setError('Gagal menyimpan konten: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    // Activity Handlers
    const handleActivityMainChange = (e) => {
        const { name, value } = e.target
        setActivityMain(prev => ({ ...prev, [name]: value }))
    }

    const handleCardChange = (index, field, value) => {
        const newCards = [...activityCards]
        newCards[index][field] = value
        setActivityCards(newCards)
    }

    const handleAddSchedule = () => {
        if (!newSchedule.day || !newSchedule.time || !newSchedule.type) return

        if (editingScheduleIndex !== null) {
            // Update existing
            const updatedSchedule = [...activitySchedule]
            updatedSchedule[editingScheduleIndex] = newSchedule
            setActivitySchedule(updatedSchedule)
            setEditingScheduleIndex(null)
        } else {
            // Add new
            setActivitySchedule([...activitySchedule, newSchedule])
        }
        setNewSchedule({ day: 'Senin', time: '', type: '', location: '' })
    }

    const handleEditSchedule = (index) => {
        setEditingScheduleIndex(index)
        setNewSchedule(activitySchedule[index])
    }

    const handleCancelScheduleEdit = () => {
        setEditingScheduleIndex(null)
        setNewSchedule({ day: 'Senin', time: '', type: '', location: '' })
    }

    const handleDeleteSchedule = (index) => {
        setActivitySchedule(activitySchedule.filter((_, i) => i !== index))
    }

    const handleSaveActivities = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            // Update Main
            await api.content.update('activity_main', activityMain)

            // Update Cards
            for (const card of activityCards) {
                await api.content.update(card.id, card)
            }

            // Update Schedule
            await api.content.update('activity_schedule', {
                title: 'Jadwal Latihan',
                content: JSON.stringify(activitySchedule)
            })

            setSuccess('Kegiatan berhasil diperbarui')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error saving activities:', err)
            setError('Gagal menyimpan kegiatan: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    // Gallery Handlers
    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleEdit = (item) => {
        setEditingId(item.id)
        setCaption(item.caption || '')
        setCategory(item.category || '')
        setPreviewUrl(item.image_url)
        setNewImage(null) // No new image file selected yet
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setCaption('')
        setCategory('')
        setPreviewUrl(null)
        setNewImage(null)
    }

    const handleSubmitGallery = async (e) => {
        e.preventDefault()

        setSaving(true)
        setError(null)
        try {
            let uploadedImageUrl = null;

            // Upload image if a new one is selected
            if (newImage) {
                const uploadRes = await api.gallery.upload(newImage)
                uploadedImageUrl = uploadRes.image_url
            }

            if (editingId) {
                // UPDATE EXISTING
                const updateData = {
                    caption,
                    category: category || 'Umum'
                }
                // Only include image_url if a new one was uploaded
                if (uploadedImageUrl) {
                    updateData.image_url = uploadedImageUrl
                }

                await api.gallery.update(editingId, updateData)
                setSuccess('Item galeri berhasil diperbarui')
            } else {
                // CREATE NEW (UPLOAD)
                if (!uploadedImageUrl) return

                // Create Gallery Item
                await api.gallery.create({
                    image_url: uploadedImageUrl,
                    caption,
                    category: category || 'Umum'
                })
                setSuccess('Gambar berhasil ditambahkan')
            }

            // Reset Form
            setEditingId(null)
            setNewImage(null)
            setPreviewUrl(null)
            setCaption('')
            setCategory('')

            // Refresh list
            const items = await api.gallery.list()
            setGalleryItems(Array.isArray(items) ? items : [])

            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error saving gallery:', err)
            setError('Gagal menyimpan galeri: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteGallery = async (id) => {
        if (!confirm('Yakin ingin menghapus gambar ini?')) return

        try {
            await api.gallery.delete(id)
            setGalleryItems(prev => (Array.isArray(prev) ? prev.filter(item => item.id !== id) : []))
        } catch (err) {
            console.error('Failed to delete:', err)
            alert('Gagal menghapus gambar')
        }
    }

    // About Handlers
    const handleSaveAbout = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            await api.content.update('about_main', aboutMain)
            await api.content.update('about_history', aboutHistory)
            await api.content.update('about_vision', aboutVision)
            await api.content.update('about_mission', aboutMission)
            await api.content.update('about_community', aboutCommunity)
            await api.content.update('about_values', aboutValues)

            setSuccess('Konten Tentang Kami berhasil diperbarui')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error saving about content:', err)
            setError('Gagal menyimpan konten: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading && !galleryItems.length && !contactData.address) return <div className="loading-state"><Loader className="spin" size={32} /></div>

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div className="content-management">
                    <header className="page-header">
                        <h1>Kelola Konten Website</h1>
                        <p>Edit informasi kontak dan galeri foto</p>
                    </header>

                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            Tentang Kami
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            Informasi Kontak
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                            onClick={() => setActiveTab('gallery')}
                        >
                            Galeri Foto
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activities')}
                        >
                            Kegiatan
                        </button>
                    </div>

                    <div className="content-card">
                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <CheckCircle size={18} />
                                {success}
                            </div>
                        )}

                        {activeTab === 'about' ? (
                            <form onSubmit={handleSaveAbout}>
                                {/* Main Section */}
                                <div className="card-header">
                                    <h2>Bagian Utama</h2>
                                </div>
                                <div className="form-group">
                                    <label>Judul Utama</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={aboutMain.title}
                                        onChange={e => setAboutMain({ ...aboutMain, title: e.target.value })}
                                        placeholder="Tentang Kami"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Deskripsi Singkat</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        value={aboutMain.content}
                                        onChange={e => setAboutMain({ ...aboutMain, content: e.target.value })}
                                        placeholder="Deskripsi singkat perkumpulan..."
                                    />
                                </div>

                                <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

                                {/* History Section */}
                                <div className="card-header">
                                    <h2>Sejarah</h2>
                                </div>
                                <div className="form-group">
                                    <label>Judul Bagian Sejarah</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={aboutHistory.title}
                                        onChange={e => setAboutHistory({ ...aboutHistory, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Konten Sejarah</label>
                                    <textarea
                                        className="form-input"
                                        rows="6"
                                        value={aboutHistory.content}
                                        onChange={e => setAboutHistory({ ...aboutHistory, content: e.target.value })}
                                        placeholder="Ceritakan sejarah berdirinya..."
                                    />
                                </div>

                                <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

                                {/* Cards Grid for Vision, Mission, Community, Values */}
                                <div className="card-header">
                                    <h2>Poin-Poin Utama (Visi, Misi, dll)</h2>
                                </div>
                                <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {[
                                        { state: aboutVision, setState: setAboutVision, label: 'Visi' },
                                        { state: aboutMission, setState: setAboutMission, label: 'Misi' },
                                        { state: aboutCommunity, setState: setAboutCommunity, label: 'Komunitas' },
                                        { state: aboutValues, setState: setAboutValues, label: 'Nilai' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                                            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>{item.label}</h4>

                                            <div className="form-group">
                                                <label>Ikon</label>
                                                <select
                                                    className="form-input"
                                                    value={item.state.icon}
                                                    onChange={e => item.setState({ ...item.state, icon: e.target.value })}
                                                >
                                                    <option value="Target">🎯 Target (Visi)</option>
                                                    <option value="Award">🎖️ Award (Misi/Prestasi)</option>
                                                    <option value="Users">👥 Users (Komunitas)</option>
                                                    <option value="Heart">❤️ Heart (Nilai/Passion)</option>
                                                    <option value="Star">⭐ Star</option>
                                                    <option value="Trophy">🏆 Trophy</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label>Judul</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={item.state.title}
                                                    onChange={e => item.setState({ ...item.state, title: e.target.value })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Konten</label>
                                                <textarea
                                                    className="form-input"
                                                    rows="4"
                                                    value={item.state.content}
                                                    onChange={e => item.setState({ ...item.state, content: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-actions" style={{ marginTop: '2rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        ) : activeTab === 'contact' ? (
                            <form onSubmit={handleSaveContact}>
                                <div className="card-header">
                                    <h2>Edit Kontak</h2>
                                </div>
                                <div className="form-group">
                                    <label>Alamat</label>
                                    <textarea
                                        name="address"
                                        value={contactData.address}
                                        onChange={handleContactChange}
                                        rows="3"
                                        className="form-input"
                                        placeholder="Alamat lengkap..."
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nomor Telepon</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={contactData.phone}
                                            onChange={handleContactChange}
                                            className="form-input"
                                            placeholder="+62..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactData.email}
                                            onChange={handleContactChange}
                                            className="form-input"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Jam Operasional</label>
                                    <textarea
                                        name="hours"
                                        value={contactData.hours}
                                        onChange={handleContactChange}
                                        rows="3"
                                        className="form-input"
                                        placeholder="Senin - Jumat: ..."
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        ) : activeTab === 'activities' ? (
                            <form onSubmit={handleSaveActivities}>
                                {/* Main Section */}
                                <div className="card-header">
                                    <h2>Bagian Utama</h2>
                                </div>
                                <div className="form-group">
                                    <label>Judul Utama</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={activityMain.title}
                                        onChange={handleActivityMainChange}
                                        className="form-input"
                                        placeholder="Judul bagian kegiatan..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sub-judul / Deskripsi Singkat</label>
                                    <textarea
                                        name="content"
                                        value={activityMain.content}
                                        onChange={handleActivityMainChange}
                                        rows="2"
                                        className="form-input"
                                        placeholder="Deskripsi singkat di bawah judul..."
                                    />
                                </div>

                                <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

                                {/* Cards Section */}
                                <div className="card-header">
                                    <h2>Kartu Kegiatan (3 Highlight)</h2>
                                </div>
                                <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {activityCards.map((card, index) => (
                                        <div key={card.id} className="activity-card-editor" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                                            <h4 style={{ marginBottom: '1rem' }}>Kartu {index + 1}</h4>
                                            <div className="form-group">
                                                <label>Ikon</label>
                                                <select
                                                    className="form-input"
                                                    value={card.icon}
                                                    onChange={(e) => handleCardChange(index, 'icon', e.target.value)}
                                                >
                                                    <option value="Calendar">📅 Calendar (Jadwal/Rutin)</option>
                                                    <option value="Users">👥 Users (Sparring/Tim)</option>
                                                    <option value="Clock">⏰ Clock (Waktu/Durasi)</option>
                                                    <option value="MapPin">📍 MapPin (Lokasi)</option>
                                                    <option value="Trophy">🏆 Trophy (Turnamen)</option>
                                                    <option value="Medal">🥇 Medal (Prestasi)</option>
                                                    <option value="Star">⭐ Star (Unggulan)</option>
                                                    <option value="Target">🎯 Target (Fokus)</option>
                                                    <option value="Dumbbell">💪 Dumbbell (Latihan Fisik)</option>
                                                    <option value="Activity">📈 Activity (Kesehatan)</option>
                                                    <option value="Zap">⚡ Zap (Intensif)</option>
                                                    <option value="Award">🎖️ Award (Penghargaan)</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Judul Kartu</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={card.title}
                                                    onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                                                    placeholder="Contoh: Latihan Rutin"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Deskripsi</label>
                                                <textarea
                                                    className="form-input"
                                                    rows="3"
                                                    value={card.content}
                                                    onChange={(e) => handleCardChange(index, 'content', e.target.value)}
                                                    placeholder="Penjelasan singkat..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

                                {/* Schedule Section */}
                                <div className="card-header">
                                    <h2>Jadwal Latihan Mingguan</h2>
                                </div>

                                <div className="schedule-manage">
                                    <div className="add-schedule-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8rem' }}>Hari</label>
                                            <select
                                                className="form-input"
                                                value={newSchedule.day}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                                            >
                                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8rem' }}>Waktu</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={newSchedule.time}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                                placeholder="18:00 - 21:00"
                                            />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ fontSize: '0.8rem' }}>Jenis Latihan</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={newSchedule.type}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                                                placeholder="Reguler / Privat / Sparring"
                                            />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ fontSize: '0.8rem' }}>Lokasi</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={newSchedule.location}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                                                placeholder="GOR..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className={`btn ${editingScheduleIndex !== null ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={handleAddSchedule}
                                            disabled={!newSchedule.time || !newSchedule.type}
                                        >
                                            {editingScheduleIndex !== null ? <Save size={18} /> : <Plus size={18} />}
                                            {editingScheduleIndex !== null ? 'Update' : 'Tambah'}
                                        </button>
                                        {editingScheduleIndex !== null && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCancelScheduleEdit}
                                                style={{ marginLeft: '0.5rem' }}
                                            >
                                                Batal
                                            </button>
                                        )}
                                    </div>

                                    {activitySchedule.length > 0 ? (
                                        <div className="schedule-list" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ background: '#f8f9fa', fontSize: '0.9rem', textAlign: 'left' }}>
                                                    <tr>
                                                        <th style={{ padding: '0.75rem' }}>Hari</th>
                                                        <th style={{ padding: '0.75rem' }}>Waktu</th>
                                                        <th style={{ padding: '0.75rem' }}>Kegiatan</th>
                                                        <th style={{ padding: '0.75rem' }}>Lokasi</th>
                                                        <th style={{ padding: '0.75rem', width: '50px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activitySchedule.map((item, idx) => (
                                                        <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                                                            <td style={{ padding: '0.75rem' }}>{item.day}</td>
                                                            <td style={{ padding: '0.75rem' }}>{item.time}</td>
                                                            <td style={{ padding: '0.75rem' }}>{item.type}</td>
                                                            <td style={{ padding: '0.75rem' }}>{item.location}</td>
                                                            <td style={{ padding: '0.75rem' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditSchedule(idx)}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                                                                    title="Edit"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteSchedule(idx)}
                                                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', margin: '1rem 0' }}>Belum ada jadwal. Tambahkan di atas.</p>
                                    )}
                                </div>

                                <div className="form-actions" style={{ marginTop: '2rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="gallery-section">
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2>{editingId ? 'Edit Foto' : 'Upload Foto Baru'}</h2>
                                    {editingId && (
                                        <button onClick={handleCancelEdit} className="btn" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                                            Batal Edit
                                        </button>
                                    )}
                                </div>
                                <form onSubmit={handleSubmitGallery} className="upload-form">
                                    <div className="form-row">
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Pilih Foto</label>
                                            <input
                                                type="file"
                                                className="form-input"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                required={!editingId}
                                            />
                                            {previewUrl && (
                                                <div style={{ marginTop: '1rem', border: '1px dashed #ccc', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                                                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Pratinjau Gambar</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Kategori</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                placeholder="Contoh: Latihan, Turnamen 2024"
                                                list="category-suggestions"
                                            />
                                            <datalist id="category-suggestions">
                                                <option value="Umum" />
                                                <option value="Turnamen" />
                                                <option value="Latihan" />
                                                <option value="Event" />
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Keterangan (Opsional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="Deskripsi foto..."
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={(!newImage && !editingId) || saving}>
                                        {saving ? <Loader size={18} className="spin" /> : (editingId ? <Save size={18} /> : <Upload size={18} />)}
                                        {editingId ? 'Simpan Perubahan' : 'Upload Foto'}
                                    </button>
                                </form>

                                <div className="gallery-grid" style={{ marginTop: '2rem' }}>
                                    <h3>Daftar Galeri</h3>
                                    {galleryItems.length === 0 ? (
                                        <p className="empty-text">Belum ada foto di galeri</p>
                                    ) : (
                                        <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                            {galleryItems.map(item => (
                                                <div key={item.id} className="gallery-item-card" style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.caption}
                                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                                    />
                                                    <div className="item-details" style={{ padding: '0.5rem' }}>
                                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.caption || 'Tanpa Judul'}</p>
                                                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                                                    </div>
                                                    <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }}>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer' }}
                                                            title="Edit"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGallery(item.id)}
                                                            style={{ background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer' }}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ContentManagement
