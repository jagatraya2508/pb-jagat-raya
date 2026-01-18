import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/logo.png" alt="PB. Jagat Raya" style={{ height: '56px', width: 'auto' }} />
                        </div>
                        <h3 style={{ color: '#2563eb' }}>PB. JAGAT RAYA</h3>
                        <p>Perkumpulan Bulutangkis yang berkomitmen untuk mengembangkan bakat dan prestasi atlet bulutangkis Indonesia.</p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="Youtube">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>Menu</h4>
                        <ul>
                            <li><a href="#beranda">Beranda</a></li>
                            <li><a href="#tentang">Tentang Kami</a></li>
                            <li><a href="#kegiatan">Kegiatan</a></li>
                            <li><a href="#galeri">Galeri</a></li>
                            <li><a href="#kontak">Kontak</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="footer-section">
                        <h4>Layanan</h4>
                        <ul>
                            <li><Link to="/kejuaraan">Pendaftaran Kejuaraan</Link></li>
                            <li><a href="#kegiatan">Jadwal Latihan</a></li>
                            <li><a href="#tentang">Keanggotaan</a></li>
                            <li><Link to="/login">Portal Admin</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4>Kontak</h4>
                        <ul className="footer-contact">
                            <li>
                                <MapPin size={16} />
                                <span>GOR Bulutangkis, Jl. Olahraga No. 123, Jakarta</span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <span>+62 812 3456 7890</span>
                            </li>
                            <li>
                                <Mail size={16} />
                                <span>info@pbjagat-raya.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} PB. JAGAT RAYA. All rights reserved.</p>
                    <p>Designed with ❤️ for Badminton</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
