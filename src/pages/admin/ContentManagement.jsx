
import React, { useState, useEffect } from 'react'
import { Save, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import './ContentManagement.css'

function ContentManagement() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [contactData, setContactData] = useState({
        address: '',
        phone: '',
        email: '',
        hours: ''
    })

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        setLoading(true)
        try {
            const data = await api.content.get('contact')
            if (data && data.content) {
                // Ensure content is parsed if it's a string, or used directly if it's already an object
                const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                setContactData(content)
            }
        } catch (err) {
            console.error('Error fetching content:', err)
            setError('Gagal memuat data konten')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setContactData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            // API expects { title, content }
            // We keep title as "Informasi Kontak"
            await api.content.update('contact', {
                title: 'Informasi Kontak',
                content: contactData // API client/server should handle JSON stringify if needed, or we send object
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

    if (loading) return <div className="loading-state"><Loader className="spin" size={32} /></div>

    return (
        <div className="content-management">
            <header className="page-header">
                <h1>Kelola Konten Website</h1>
                <p>Edit informasi kontak dan konten lainnya</p>
            </header>

            <div className="content-card">
                <div className="card-header">
                    <h2>Informasi Kontak</h2>
                </div>

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

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Alamat</label>
                        <textarea
                            name="address"
                            value={contactData.address}
                            onChange={handleChange}
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
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                            onChange={handleChange}
                            rows="3"
                            className="form-input"
                            placeholder="Senin - Jumat: ..."
                        />
                        <small className="form-hint">Gunakan baris baru untuk memisahkan jadwal</small>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ContentManagement
