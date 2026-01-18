import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Calendar, MapPin, Users, Clock, Send, CheckCircle, Camera, Upload } from 'lucide-react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './TournamentPage.css'

function TournamentPage() {
    const [tournaments, setTournaments] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTournament, setSelectedTournament] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        participant_name: '',
        email: '',
        phone: '',
        category: '',
        club_name: '',
        partner_name: '',
        partner_phone: ''
    })
    const [birthCertPhoto, setBirthCertPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [partnerPhoto, setPartnerPhoto] = useState(null)
    const [partnerPhotoPreview, setPartnerPhotoPreview] = useState(null)
    const [masterCategories, setMasterCategories] = useState([])

    useEffect(() => {
        fetchTournaments()
        fetchMasterCategories()
    }, [])

    const fetchMasterCategories = async () => {
        try {
            const data = await api.categories.list()
            setMasterCategories(data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchTournaments = async () => {
        try {
            const data = await api.tournaments.list('open')
            setTournaments(data || [])
        } catch (error) {
            console.error('Error fetching tournaments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = (tournament) => {
        setSelectedTournament(tournament)

        let firstCategory = ''
        try {
            const parsed = JSON.parse(tournament.categories)
            if (Array.isArray(parsed) && parsed.length > 0) {
                firstCategory = parsed[0].name
            }
        } catch {
            firstCategory = tournament.categories?.split(',')[0]?.trim() || ''
        }

        setFormData({
            participant_name: '',
            email: '',
            phone: '',
            category: firstCategory,
            club_name: '',
            partner_name: '',
            partner_phone: ''
        })
        setBirthCertPhoto(null)
        setPhotoPreview(null)
        setPartnerPhoto(null)
        setPartnerPhotoPreview(null)
        setShowForm(true)
        setSubmitted(false)
    }

    const handlePhotoChange = (e, isPartner = false) => {
        const file = e.target.files[0]
        if (file) {
            if (isPartner) {
                setPartnerPhoto(file)
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPartnerPhotoPreview(reader.result)
                }
                reader.readAsDataURL(file)
            } else {
                setBirthCertPhoto(file)
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPhotoPreview(reader.result)
                }
                reader.readAsDataURL(file)
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.registrations.create({
                tournament_id: selectedTournament.id,
                ...formData
            })
            setSubmitted(true)
        } catch (error) {
            console.error('Error registering:', error)
            alert('Gagal mendaftar. Pastikan semua data terisi dengan benar.')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const parseCategories = (categoriesData) => {
        if (!categoriesData) return []
        try {
            const parsed = JSON.parse(categoriesData)
            if (Array.isArray(parsed)) return parsed
            return []
        } catch {
            return categoriesData.split(',').map(c => ({ name: c.trim(), fee: null }))
        }
    }

    const categories = selectedTournament ? parseCategories(selectedTournament.categories) : []

    // Check if current category is doubles - check both name and master category match_type
    const checkIsDoubles = () => {
        const catName = formData.category?.toLowerCase() || ''
        // Check by name keywords
        if (catName.includes('ganda') || catName.includes('double')) return true
        // Check by master category match_type
        const masterCat = masterCategories.find(c => c.name === formData.category)
        if (masterCat && masterCat.match_type === 'double') return true
        return false
    }
    const isDoubles = checkIsDoubles()

    return (
        <div className="tournament-page">
            <Navbar />

            <main className="tournament-main">
                <div className="container">
                    <div className="tournament-header">
                        <Link to="/" className="back-btn">
                            <ArrowLeft size={20} />
                            Kembali
                        </Link>
                        <div className="tournament-title">
                            <Trophy size={32} className="title-icon" />
                            <div>
                                <h1>Pendaftaran Kejuaraan</h1>
                                <p>Daftarkan diri Anda untuk mengikuti kejuaraan bulutangkis</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Memuat data kejuaraan...</p>
                        </div>
                    ) : tournaments.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={64} />
                            <h2>Tidak Ada Kejuaraan Terbuka</h2>
                            <p>Saat ini belum ada kejuaraan yang membuka pendaftaran. Silakan cek kembali nanti.</p>
                        </div>
                    ) : (
                        <div className="tournaments-grid">
                            {tournaments.map((tournament) => (
                                <div key={tournament.id} className="tournament-card card">
                                    <div className="tournament-card-header">
                                        <Trophy size={24} />
                                        <span className="badge badge-success">Buka</span>
                                    </div>
                                    <h3>{tournament.name}</h3>
                                    {tournament.description && (
                                        <p className="tournament-desc">{tournament.description}</p>
                                    )}

                                    <div className="tournament-info">
                                        {tournament.location && (
                                            <div className="info-item">
                                                <MapPin size={16} />
                                                <span>{tournament.location}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <Calendar size={16} />
                                            <span>{formatDate(tournament.start_date)}</span>
                                        </div>
                                        <div className="info-item">
                                            <Clock size={16} />
                                            <span>Deadline: {formatDate(tournament.registration_deadline)}</span>
                                        </div>
                                        <div className="info-item">
                                            <Users size={16} />
                                            <span>Maks. {tournament.max_participants} peserta</span>
                                        </div>
                                    </div>

                                    {tournament.categories && (
                                        <div className="tournament-categories">
                                            <span className="categories-label">Kategori & Biaya:</span>
                                            <div className="categories-list">
                                                {(() => {
                                                    try {
                                                        const cats = JSON.parse(tournament.categories)
                                                        if (Array.isArray(cats)) {
                                                            return cats.map((cat, idx) => (
                                                                <span key={idx} className="category-badge">
                                                                    {cat.name}
                                                                    {cat.fee && <span className="category-fee"> - Rp {parseInt(cat.fee).toLocaleString('id-ID')}</span>}
                                                                </span>
                                                            ))
                                                        }
                                                    } catch {
                                                        // Legacy fallback
                                                        return tournament.categories.split(',').map((cat, idx) => (
                                                            <span key={idx} className="category-badge">{cat.trim()}</span>
                                                        ))
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary btn-lg register-btn"
                                        onClick={() => handleRegister(tournament)}
                                    >
                                        Daftar Sekarang
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Registration Modal */}
            {showForm && selectedTournament && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        {submitted ? (
                            <div className="success-state">
                                <CheckCircle size={64} />
                                <h2>Pendaftaran Berhasil!</h2>
                                <p>Terima kasih telah mendaftar untuk {selectedTournament.name}</p>
                                <p className="success-note">Kami akan menghubungi Anda melalui email atau telepon untuk konfirmasi.</p>
                                <button className="btn btn-accent" onClick={() => setShowForm(false)}>
                                    Tutup
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="modal-header">
                                    <h2>Daftar: {selectedTournament.name}</h2>
                                    <button className="modal-close" onClick={() => setShowForm(false)}>
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label className="form-label">Nama Lengkap *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Masukkan nama lengkap Anda"
                                                value={formData.participant_name}
                                                onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Email (opsional)</label>
                                                <input
                                                    type="email"
                                                    className="form-input"
                                                    placeholder="email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">No. Telepon *</label>
                                                <input
                                                    type="tel"
                                                    className="form-input"
                                                    placeholder="08xxxxxxxxxx"
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
                                                {categories.map((cat, idx) => (
                                                    <option key={idx} value={cat.name}>
                                                        {cat.name} {cat.fee ? `(Rp ${parseInt(cat.fee).toLocaleString('id-ID')})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Nama PB / Klub</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Contoh: PB. Jagat Raya"
                                                value={formData.club_name}
                                                onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                                            />
                                        </div>

                                        {isDoubles && (
                                            <div className="partner-section" style={{
                                                background: 'rgba(37, 99, 235, 0.1)',
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-md)',
                                                marginTop: '0.5rem'
                                            }}>
                                                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>
                                                    Informasi Partner (untuk Ganda)
                                                </h4>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label className="form-label">Nama Partner *</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Masukkan nama partner"
                                                            value={formData.partner_name}
                                                            onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">No. Telepon Partner *</label>
                                                        <input
                                                            type="tel"
                                                            className="form-input"
                                                            placeholder="08xxxxxxxxxx"
                                                            value={formData.partner_phone}
                                                            onChange={(e) => setFormData({ ...formData, partner_phone: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Foto Akta Partner *</label>
                                                    <div className="photo-upload-container" style={{
                                                        display: 'flex',
                                                        gap: '1rem',
                                                        flexWrap: 'wrap',
                                                        alignItems: 'flex-start'
                                                    }}>
                                                        <div className="photo-upload-buttons" style={{
                                                            display: 'flex',
                                                            gap: '0.5rem',
                                                            flexDirection: 'column'
                                                        }}>
                                                            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                                                                <Upload size={18} />
                                                                Pilih File
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handlePhotoChange(e, true)}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                                                <Camera size={18} />
                                                                Ambil Foto
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    capture="environment"
                                                                    onChange={(e) => handlePhotoChange(e, true)}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                        {partnerPhotoPreview && (
                                                            <div className="photo-preview" style={{
                                                                flex: 1,
                                                                minWidth: '150px',
                                                                maxWidth: '200px'
                                                            }}>
                                                                <img
                                                                    src={partnerPhotoPreview}
                                                                    alt="Preview Akta Partner"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: 'auto',
                                                                        borderRadius: 'var(--radius-md)',
                                                                        border: '2px solid var(--primary-blue)'
                                                                    }}
                                                                />
                                                                <p style={{
                                                                    fontSize: 'var(--font-size-xs)',
                                                                    color: 'var(--text-secondary)',
                                                                    marginTop: '0.25rem',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    {partnerPhoto?.name}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label className="form-label">Foto Akta Kelahiran *</label>
                                            <div className="photo-upload-container" style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                flexWrap: 'wrap',
                                                alignItems: 'flex-start'
                                            }}>
                                                <div className="photo-upload-buttons" style={{
                                                    display: 'flex',
                                                    gap: '0.5rem',
                                                    flexDirection: 'column'
                                                }}>
                                                    <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                                                        <Upload size={18} />
                                                        Pilih File
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoChange}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                    <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                                        <Camera size={18} />
                                                        Ambil Foto
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            capture="environment"
                                                            onChange={handlePhotoChange}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                                {photoPreview && (
                                                    <div className="photo-preview" style={{
                                                        flex: 1,
                                                        minWidth: '150px',
                                                        maxWidth: '200px'
                                                    }}>
                                                        <img
                                                            src={photoPreview}
                                                            alt="Preview Akta"
                                                            style={{
                                                                width: '100%',
                                                                height: 'auto',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: '2px solid var(--primary-blue)'
                                                            }}
                                                        />
                                                        <p style={{
                                                            fontSize: 'var(--font-size-xs)',
                                                            color: 'var(--text-secondary)',
                                                            marginTop: '0.25rem',
                                                            textAlign: 'center'
                                                        }}>
                                                            {birthCertPhoto?.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--text-muted)',
                                                marginTop: '0.5rem'
                                            }}>
                                                Upload foto Akta Kelahiran atau ambil langsung dari kamera
                                            </p>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                                            Batal
                                        </button>
                                        <button type="submit" className="btn btn-accent">
                                            <Send size={18} />
                                            Kirim Pendaftaran
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default TournamentPage
