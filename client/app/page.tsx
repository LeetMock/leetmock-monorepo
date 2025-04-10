import './globals.css'
import Navbar from './_components/Navbar'
import Hero from './_components/Hero'
import Features from './_components/Features'
import CoreFeatures from './_components/CoreFeatures'
import Testimonials from './_components/Testimonials'
import CallToAction from './_components/CallToAction'

function App() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative z-50">
        <Navbar />
      </div>
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black/50 pointer-events-none" />

        <Hero />
        <section id="motivation" className="relative">
          <Features />
        </section>
        <section id="core-advantages" className="relative">
          <CoreFeatures />
        </section>
        <section id="testimonials" className="relative">
          <Testimonials />
        </section>
        <section id="cta" className="relative">
          <CallToAction />
        </section>
      </main>
    </div>
  )
}

export default App