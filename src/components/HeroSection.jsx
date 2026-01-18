import { useState, useEffect } from 'react'
import { ArrowRight, Trophy, Users, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

const API_URL = 'http://localhost:5001/api'

// Default slides as fallback
const defaultSlides = [
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622394749320-7216a6902264?q=80&w=1000&auto=format&fit=crop"
]

function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [slides, setSlides] = useState(defaultSlides)

    useEffect(() => {
        // Fetch slides from API
        const fetchSlides = async () => {
            try {
                const response = await fetch(`${API_URL}/hero-slides?active_only=true`)
                const data = await response.json()
                if (data && data.length > 0) {
                    setSlides(data.map(slide => slide.image_url))
                }
            } catch (error) {
                console.error('Error fetching slides:', error)
                // Keep default slides on error
            }
        }
        fetchSlides()
    }, [])

    useEffect(() => {
        if (slides.length === 0) return
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [slides])

    return (
        <section id="beranda" className="hero">
            <div className="hero-bg">
                <div className="hero-bg-gradient"></div>
                <div className="hero-bg-pattern"></div>
            </div>

            <div className="hero-container">
                <div className="hero-content">


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
                        <Link to="/kejuaraan" className="btn btn-lg" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #fecaca 100%)', color: '#ffffff', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)' }}>
                            Daftar Kejuaraan
                            <ArrowRight size={20} />
                        </Link>

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
