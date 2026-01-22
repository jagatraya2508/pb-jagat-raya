import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Trophy, Medal, Star, Target, Dumbbell, Activity, Zap, Award } from 'lucide-react'
import { api } from '../lib/api'
import './ActivitiesSection.css'

function ActivitiesSection() {
    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await api.content.list()
                setContent(data)
            } catch (error) {
                console.error('Error fetching activities content:', error)
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

    // Helper to get Icon component from string name
    const getIcon = (iconName) => {
        const icons = { Calendar, Clock, MapPin, Users, Trophy, Medal, Star, Target, Dumbbell, Activity, Zap, Award }
        return icons[iconName] || Calendar
    }

    // Parse schedule JSON safely
    const getSchedule = () => {
        const raw = getValue('activity_schedule', 'content', '[]')
        try {
            return JSON.parse(raw)
        } catch (e) {
            console.error('Error parsing schedule JSON:', e)
            return []
        }
    }

    const schedules = getSchedule()

    // Dynamic activities from individual keys
    const activityKeys = ['activity_card_1', 'activity_card_2', 'activity_card_3']
    const activities = activityKeys.map(key => ({
        icon: getIcon(getValue(key, 'icon', 'Calendar')),
        title: getValue(key, 'title', ''),
        description: getValue(key, 'content', '')
    })).filter(a => a.title) // Only show if title exists

    if (loading) return null

    return (
        <section id="kegiatan" className="activities section">
            <div className="container">
                <h2 className="section-title">{getValue('activity_main', 'title', 'Kegiatan Kami')}</h2>
                <p className="section-subtitle">
                    {getValue('activity_main', 'content', 'Berbagai kegiatan rutin yang kami selenggarakan untuk mengembangkan kemampuan dan prestasi para anggota.')}
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
