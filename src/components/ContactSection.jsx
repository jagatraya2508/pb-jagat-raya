import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import './ContactSection.css'

function ContactSection() {
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
                                        <p>GOR Bulutangkis JAGAT RAYA<br />Jl. Olahraga No. 123<br />Jakarta, Indonesia</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <Phone size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Telepon</h4>
                                        <p>+62 812 3456 7890</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <Mail size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Email</h4>
                                        <p>info@pbjagat-raya.com</p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-item-icon">
                                        <Clock size={24} />
                                    </div>
                                    <div className="contact-item-details">
                                        <h4>Jam Operasional</h4>
                                        <p>Senin - Jumat: 16:00 - 21:00<br />Sabtu - Minggu: 08:00 - 12:00</p>
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
