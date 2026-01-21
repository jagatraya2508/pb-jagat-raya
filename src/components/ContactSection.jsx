import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { api } from '../lib/api'
import './ContactSection.css'

function ContactSection() {
    const [contactInfo, setContactInfo] = useState({
        address: "GOR Bulutangkis JAGAT RAYA\nJl. Olahraga No. 123\nJakarta, Indonesia",
        phone: "+62 812 3456 7890",
        email: "info@pbjagat-raya.com",
        hours: "Senin - Jumat: 16:00 - 21:00\nSabtu - Minggu: 08:00 - 12:00"
    })

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const data = await api.content.get('contact')
                if (data && data.content) {
                    const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content
                    setContactInfo(prev => ({ ...prev, ...content }))
                }
            } catch (err) {
                console.error('Failed to load contact info', err)
            }
        }
        fetchContact()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission
        alert('Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.')
    }

    return (
        <section id="kontak" className="contact section">
            <div className="container">
                <h2 className="section-title">Hubungi Kami</h2>
                <p className="section-subtitle">
                    Tertarik bergabung atau memiliki pertanyaan? Jangan ragu untuk menghubungi kami.
                </p>

                <div className="contact-content">
                    <div className="contact-info">
                        <div className="contact-card card">
                            <h3>Informasi Kontak</h3>

                            <div className="contact-items">
                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Alamat</h4>
                                        <p style={{ whiteSpace: 'pre-line' }}>{contactInfo.address}</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <Phone size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Telepon</h4>
                                        <p>{contactInfo.phone}</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <Mail size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Email</h4>
                                        <p>{contactInfo.email}</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <Clock size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Jam Operasional</h4>
                                        <p style={{ whiteSpace: 'pre-line' }}>{contactInfo.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form card" onSubmit={handleSubmit}>
                            <h3>Kirim Pesan</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Masukkan nama Anda"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Masukkan email Anda"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Subjek</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Subjek pesan"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pesan</label>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Tulis pesan Anda..."
                                    rows="5"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg">
                                <Send size={20} />
                                Kirim Pesan
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
