import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import './ActivitiesSection.css'

function ActivitiesSection() {
    const schedules = [
        {
            day: 'Senin',
            time: '16:00 - 18:00',
            type: 'Latihan Anak-anak',
            location: 'GOR Utama'
        },
        {
            day: 'Selasa',
            time: '18:00 - 21:00',
            type: 'Latihan Dewasa',
            location: 'GOR Utama'
        },
        {
            day: 'Rabu',
            time: '16:00 - 18:00',
            type: 'Latihan Anak-anak',
            location: 'GOR Utama'
        },
        {
            day: 'Kamis',
            time: '18:00 - 21:00',
            type: 'Latihan Dewasa',
            location: 'GOR Utama'
        },
        {
            day: 'Jumat',
            time: '16:00 - 18:00',
            type: 'Latihan Anak-anak',
            location: 'GOR Utama'
        },
        {
            day: 'Sabtu',
            time: '08:00 - 12:00',
            type: 'Sparring & Pertandingan',
            location: 'GOR Utama'
        },
        {
            day: 'Minggu',
            time: '08:00 - 12:00',
            type: 'Latihan Bebas',
            location: 'GOR Utama'
        }
    ]

    const activities = [
        {
            icon: Calendar,
            title: 'Latihan Rutin',
            description: 'Latihan terstruktur setiap minggu dengan pelatih berpengalaman'
        },
        {
            icon: Users,
            title: 'Sparring Match',
            description: 'Pertandingan persahabatan untuk mengasah kemampuan bermain'
        },
        {
            icon: Clock,
            title: 'Kejuaraan',
            description: 'Mengikuti berbagai turnamen tingkat lokal dan nasional'
        }
    ]

    return (
        <section id="kegiatan" className="activities section">
            <div className="container">
                <h2 className="section-title">Kegiatan Kami</h2>
                <p className="section-subtitle">
                    Berbagai kegiatan rutin yang kami selenggarakan untuk mengembangkan
                    kemampuan dan prestasi para anggota.
                </p>

                <div className="activities-features">
                    {activities.map((activity, index) => (
                        <div key={index} className="activity-feature card">
                            <div className="activity-feature-icon">
                                <activity.icon size={32} />
                            </div>
                            <h3>{activity.title}</h3>
                            <p>{activity.description}</p>
                        </div>
                    ))}
                </div>

                <div className="schedule-section">
                    <h3 className="schedule-title">
                        <Calendar size={24} />
                        Jadwal Latihan Mingguan
                    </h3>

                    <div className="schedule-grid">
                        {schedules.map((schedule, index) => (
                            <div key={index} className="schedule-card">
                                <div className="schedule-day">{schedule.day}</div>
                                <div className="schedule-info">
                                    <div className="schedule-time">
                                        <Clock size={14} />
                                        <span>{schedule.time}</span>
                                    </div>
                                    <div className="schedule-type">{schedule.type}</div>
                                    <div className="schedule-location">
                                        <MapPin size={14} />
                                        <span>{schedule.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ActivitiesSection
