import Hero from '@/components/home/Hero'
import GallerySlider from '@/components/home/GallerySlider'
import AboutSection from '@/components/home/AboutSection'
import ProcessAccordion from '@/components/home/ProcessAccordion'
import ContactForm from '@/components/home/ContactForm'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <GallerySlider />
      <AboutSection />
      <ProcessAccordion />
      <ContactForm />
    </main>
  )
}
