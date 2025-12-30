import { Target, Award, Users, Heart } from 'lucide-react'
import './AboutSection.css'

function AboutSection() {
    const values = [
        {
            icon: Target,
            title: 'Visi',
            description: 'Menjadi perkumpulan bulutangkis terdepan yang menghasilkan atlet berprestasi di tingkat nasional dan internasional.'
        },
        {
            icon: Award,
            title: 'Misi',
            description: 'Memberikan pelatihan berkualitas, mengembangkan karakter atlet, dan menciptakan lingkungan yang mendukung prestasi.'
        },
        {
            icon: Users,
            title: 'Komunitas',
            description: 'Membangun komunitas bulutangkis yang solid, saling mendukung, dan berorientasi pada pengembangan bersama.'
        },
        {
            icon: Heart,
            title: 'Nilai',
            description: 'Menjunjung tinggi sportivitas, disiplin, kerja keras, dan semangat pantang menyerah dalam setiap latihan dan pertandingan.'
        }
    ]

    return (
        <section id="tentang" className="about section">
            <div className="container">
                <h2 className="section-title">Tentang Kami</h2>
                <p className="section-subtitle">
                    PB. JAGAT RAYA adalah perkumpulan bulutangkis yang berdedikasi untuk
                    mengembangkan bakat dan prestasi atlet bulutangkis Indonesia.
                </p>

                <div className="about-content">
                    <div className="about-story">
                        <div className="about-story-card card">
                            <h3>Sejarah Kami</h3>
                            <p>
                                Didirikan pada tahun 2014, PB. JAGAT RAYA bermula dari sekelompok
                                pecinta bulutangkis yang memiliki visi untuk mengembangkan olahraga
                                bulutangkis di Indonesia. Berbekal semangat dan dedikasi tinggi,
                                kami terus berkembang hingga menjadi salah satu perkumpulan bulutangkis
                                yang diakui di tingkat lokal.
                            </p>
                            <p>
                                Dengan fasilitas modern dan pelatih berpengalaman, kami telah berhasil
                                mencetak puluhan atlet berprestasi yang mengharumkan nama daerah di
                                berbagai kejuaraan bulutangkis.
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
