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
      <Navbar />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="core-features">
        <CoreFeatures />
      </section>
      <section id="testimonials">
        <Testimonials />
      </section>
      <section id="cta">
        <CallToAction />
      </section>
    </div>
  )
}

export default App