import { useState, useEffect } from 'react'
import { ArrowRight, Trophy, Users, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop", // Badminton Player Portrait
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop", // Action Shot
        "https://images.unsplash.com/photo-1622394749320-7216a6902264?q=80&w=1000&auto=format&fit=crop"  // Racket Close up
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

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


                </div>

                <div className="hero-visual">
                    <div className="hero-slider-container">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                                style={{ backgroundImage: `url(${slide})` }}
                            ></div>
                        ))}
                        <div className="hero-slider-overlay"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
