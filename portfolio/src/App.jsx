import { useState } from 'react'
import Hero from './components/Hero'
import Projects from './components/Projects'
import EducationProcess from './components/EducationProcess'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'

export default function App() {
  // Lifted up so both the hero button and the footer button open the
  // exact same modal instance.
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ink">
      <Hero onOpenContact={() => setContactOpen(true)} />
      <Projects />
      <EducationProcess />
      <Footer onOpenContact={() => setContactOpen(true)} />

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
