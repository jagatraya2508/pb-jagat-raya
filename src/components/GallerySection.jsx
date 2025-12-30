import { useState } from 'react'
import { X } from 'lucide-react'
import './GallerySection.css'

function GallerySection() {
    const [selectedImage, setSelectedImage] = useState(null)

    // Placeholder images - these would come from Supabase in production
    const images = [
        {
            id: 1,
            title: 'Latihan Rutin',
            description: 'Kegiatan latihan rutin setiap minggu',
            placeholder: '🏸'
        },
        {
            id: 2,
            title: 'Kejuaraan Daerah',
            description: 'Partisipasi dalam kejuaraan tingkat daerah',
            placeholder: '🏆'
        },
        {
            id: 3,
            title: 'Sparring Match',
            description: 'Pertandingan persahabatan antar anggota',
            placeholder: '🤝'
        },
        {
            id: 4,
            title: 'Pelatihan Khusus',
            description: 'Sesi pelatihan teknik bersama pelatih',
            placeholder: '📋'
        },
        {
            id: 5,
            title: 'Gathering Anggota',
            description: 'Acara kebersamaan para anggota',
            placeholder: '🎉'
        },
        {
            id: 6,
            title: 'Pembagian Hadiah',
            description: 'Penghargaan untuk atlet berprestasi',
            placeholder: '🥇'
        }
    ]

    return (
        <section id="galeri" className="gallery section">
            <div className="container">
                <h2 className="section-title">Galeri Kegiatan</h2>
                <p className="section-subtitle">
                    Dokumentasi berbagai kegiatan dan momen berharga PB. JAGAT RAYA
                </p>

                <div className="gallery-grid">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="gallery-item"
                            onClick={() => setSelectedImage(image)}
                        >
                            <div className="gallery-item-placeholder">
                                <span>{image.placeholder}</span>
                            </div>
                            <div className="gallery-item-overlay">
                                <h4>{image.title}</h4>
                                <p>{image.description}</p>
                            </div>
                        </div>
                    ))}
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
                                <span className="gallery-modal-placeholder">{selectedImage.placeholder}</span>
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
