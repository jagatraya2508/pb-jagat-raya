import { ArrowRight, Trophy, Users, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

function HeroSection() {
    return (
        <section id="beranda" className="hero">
            <div className="hero-bg">
                <div className="hero-bg-gradient"></div>
                <div className="hero-bg-pattern"></div>
            </div>

            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Trophy size={16} />
                        <span>Perkumpulan Bulutangkis Terbaik</span>
                    </div>

                    <h1 className="hero-title">
                        Selamat Datang di
                        <span className="hero-title-highlight">PB. JAGAT RAYA</span>
                    </h1>

                    <p className="hero-description">
                        Bergabunglah dengan komunitas bulutangkis kami. Kami menyediakan
                        pelatihan profesional, fasilitas modern, dan kesempatan berkompetisi
                        di berbagai kejuaraan tingkat lokal hingga nasional.
                    </p>

                    <div className="hero-actions">
                        <Link to="/kejuaraan" className="btn btn-accent btn-lg">
                            Daftar Kejuaraan
                            <ArrowRight size={20} />
                        </Link>
                        <a href="#tentang" className="btn btn-outline btn-lg">
                            Pelajari Lebih Lanjut
                        </a>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-icon">
                                <Users size={24} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-number">100+</span>
                                <span className="hero-stat-label">Anggota Aktif</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-icon">
                                <Trophy size={24} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-number">50+</span>
                                <span className="hero-stat-label">Prestasi</span>
                            </div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-icon">
                                <Calendar size={24} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-number">10+</span>
                                <span className="hero-stat-label">Tahun Berdiri</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-image-container">
                        <div className="hero-shuttlecock">🏸</div>
                        <div className="hero-circle hero-circle-1"></div>
                        <div className="hero-circle hero-circle-2"></div>
                        <div className="hero-circle hero-circle-3"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
