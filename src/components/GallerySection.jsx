import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { api } from '../lib/api'
import './GallerySection.css'

function GallerySection() {
    const [galleryItems, setGalleryItems] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const items = await api.gallery.list()
                setGalleryItems(Array.isArray(items) ? items : [])
            } catch (error) {
                console.error('Error fetching gallery:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchGallery()
    }, [])

    const getGroupedItems = () => {
        const groups = {};
        galleryItems.forEach(item => {
            const category = item.category || 'Umum';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        return Object.entries(groups).map(([title, items]) => ({ title, items }));
    }

    const groupedGallery = getGroupedItems();

    if (loading) return null

    return (
        <section id="galeri" className="gallery section">
            <div className="container">
                <h2 className="section-title">Galeri Kegiatan</h2>
                <p className="section-subtitle">
                    Dokumentasi berbagai kegiatan dan momen berharga PB. JAGAT RAYA
                </p>

                <div className="gallery-groups-container">
                    {galleryItems.length === 0 ? (
                        <p className="text-center" style={{ width: '100%' }}>Belum ada foto di galeri.</p>
                    ) : (
                        groupedGallery.map((group, groupIndex) => (
                            <div key={groupIndex} className="gallery-group" style={{ marginBottom: '4rem' }}>
                                <h3 className="gallery-group-title" style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: 'var(--primary-color)',
                                    marginBottom: '1.5rem',
                                    paddingLeft: '1rem',
                                    borderLeft: '4px solid var(--accent-yellow)',
                                    textTransform: 'capitalize'
                                }}>
                                    {group.title}
                                </h3>
                                <div className="gallery-grid">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="gallery-item"
                                            onClick={() => setSelectedImage(item)}
                                        >
                                            <div className="gallery-item-placeholder">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.caption || 'Galeri'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="gallery-item-overlay">
                                                <h4>{item.category}</h4>
                                                <p>{item.caption}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
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
                                <img
                                    src={selectedImage.image_url}
                                    alt={selectedImage.caption}
                                    style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
                                />
                            </div>
                            <div className="gallery-modal-info">
                                <h3>{selectedImage.category}</h3>
                                <p>{selectedImage.caption}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default GallerySection
