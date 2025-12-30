import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import ActivitiesSection from '../components/ActivitiesSection'
import GallerySection from '../components/GallerySection'
import ContactSection from '../components/ContactSection'

function HomePage() {
    return (
        <div className="home-page">
            <Navbar />
            <main>
                <HeroSection />
                <AboutSection />
                <ActivitiesSection />
                <GallerySection />
                <ContactSection />
            </main>
            <Footer />
        </div>
    )
}

export default HomePage
