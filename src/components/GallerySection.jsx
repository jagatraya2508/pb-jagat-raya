import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import './GallerySection.css'

function GallerySection() {
    const [selectedImage, setSelectedImage] = useState(null)
    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await api.content.list()
                setContent(data)
            } catch (error) {
                console.error('Error fetching gallery content:', error)
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

    const getGroups = () => {
        const raw = getValue('gallery_groups', 'content', '[]')
        try {
            return JSON.parse(raw)
        } catch (e) {
            console.error('Error parsing gallery JSON:', e)
            return []
        }
    }

    const groups = getGroups()

    if (loading) return null

    return (
        <section id="galeri" className="gallery section">
            <div className="container">
                <h2 className="section-title">{getValue('gallery_main', 'title', 'Galeri Kegiatan')}</h2>
                <p className="section-subtitle">
                    {getValue('gallery_main', 'content', 'Dokumentasi berbagai kegiatan dan momen berharga PB. JAGAT RAYA')}
                </p>

                <div className="gallery-groups-container">
                    {groups.map((group, groupIndex) => (
                        <div key={groupIndex} className="gallery-group">
                            <h3 className="gallery-group-title" style={{
                                marginTop: groupIndex === 0 ? '0' : '3rem',
                                marginBottom: '1.5rem',
                                color: 'var(--primary-color)',
                                borderLeft: '4px solid var(--accent-yellow)',
                                paddingLeft: '1rem'
                            }}>
                                {group.title}
                            </h3>
                            <div className="gallery-grid">
                                {group.items.map((image, index) => (
                                    <div
                                        key={index}
                                        className="gallery-item"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <div className="gallery-item-placeholder">
                                            {(image.icon && (image.icon.startsWith('http') || image.icon.startsWith('/'))) ? (
                                                <img
                                                    src={image.icon}
                                                    alt={image.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <span>{image.icon || image.placeholder || '📷'}</span>
                                            )}
                                        </div>
                                        <div className="gallery-item-overlay">
                                            <h4>{image.title}</h4>
                                            <p>{image.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <p className="text-center">Belum ada data galeri.</p>
                    )}
                </div>

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div className="gallery-modal" onClick={() => setSelectedImage(null)}>
                        <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="gallery-modal-close"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X size={24} />
                            </button>
                            <div className="gallery-modal-image">
                                {(selectedImage.icon && (selectedImage.icon.startsWith('http') || selectedImage.icon.startsWith('/'))) ? (
                                    <img
                                        src={selectedImage.icon}
                                        alt={selectedImage.title}
                                        style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <span className="gallery-modal-placeholder">{selectedImage.icon || selectedImage.placeholder || '📷'}</span>
                                )}
                            </div>
                            <div className="gallery-modal-info">
                                <h3>{selectedImage.title}</h3>
                                <p>{selectedImage.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default GallerySection
