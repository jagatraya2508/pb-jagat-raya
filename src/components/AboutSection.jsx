import { useState, useEffect } from 'react'
import { Target, Award, Users, Heart } from 'lucide-react'
import { api } from '../lib/api'
import './AboutSection.css'

function AboutSection() {
    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await api.content.list()
                setContent(data)
            } catch (error) {
                console.error('Error fetching about content:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchContent()
    }, [])

    const getValue = (key, field, fallback) => {
        if (!content || !content[key] || !content[key][field]) return fallback
        return content[key][field]
    }

    // Default values if API fails or empty
    const values = [
        {
            icon: Target,
            title: getValue('about_vision', 'title', 'Visi'),
            description: getValue('about_vision', 'content', 'Menjadi perkumpulan bulutangkis terdepan yang menghasilkan atlet berprestasi di tingkat nasional dan internasional.')
        },
        {
            icon: Award,
            title: getValue('about_mission', 'title', 'Misi'),
            description: getValue('about_mission', 'content', 'Memberikan pelatihan berkualitas, mengembangkan karakter atlet, dan menciptakan lingkungan yang mendukung prestasi.')
        },
        {
            icon: Users,
            title: getValue('about_community', 'title', 'Komunitas'),
            description: getValue('about_community', 'content', 'Membangun komunitas bulutangkis yang solid, saling mendukung, dan berorientasi pada pengembangan bersama.')
        },
        {
            icon: Heart,
            title: getValue('about_values', 'title', 'Nilai'),
            description: getValue('about_values', 'content', 'Menjunjung tinggi sportivitas, disiplin, kerja keras, dan semangat pantang menyerah dalam setiap latihan dan pertandingan.')
        }
    ]

    if (loading) return <div className="section"><div className="container text-center">Loading...</div></div>

    return (
        <section id="tentang" className="about section">
            <div className="container">
                <h2 className="section-title">{getValue('about_main', 'title', 'Tentang Kami')}</h2>
                <p className="section-subtitle">
                    {getValue('about_main', 'content', 'PB. JAGAT RAYA adalah perkumpulan bulutangkis yang berdedikasi untuk mengembangkan bakat dan prestasi atlet bulutangkis Indonesia.')}
                </p>

                <div className="about-content">
                    <div className="about-story">
                        <div className="about-story-card card">
                            <h3>{getValue('about_history', 'title', 'Sejarah Kami')}</h3>
                            <p style={{ whiteSpace: 'pre-line' }}>
                                {getValue('about_history', 'content', `Didirikan pada tahun 2014, PB. JAGAT RAYA bermula dari sekelompok pecinta bulutangkis yang memiliki visi untuk mengembangkan olahraga bulutangkis di Indonesia. Berbekal semangat dan dedikasi tinggi, kami terus berkembang hingga menjadi salah satu perkumpulan bulutangkis yang diakui di tingkat lokal.

Dengan fasilitas modern dan pelatih berpengalaman, kami telah berhasil mencetak puluhan atlet berprestasi yang mengharumkan nama daerah di berbagai kejuaraan bulutangkis.`)}
                            </p>
                        </div>
                    </div>

                    <div className="about-values">
                        {values.map((value, index) => (
                            <div key={index} className="about-value-card card">
                                <div className="about-value-icon">
                                    <value.icon size={28} />
                                </div>
                                <h4>{value.title}</h4>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
