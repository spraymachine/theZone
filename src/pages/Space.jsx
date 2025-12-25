import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ImageSlider from '../components/ImageSlider'
import './Space.css'
import heroBg from '../assets/hero-bg.png'

const CONFIGURATIONS = [
  {
    icon: '🎭',
    name: 'Theatre Style',
    capacity: '40 guests',
    desc: 'Rows of chairs facing a stage or screen, ideal for presentations.'
  },
  {
    icon: '📋',
    name: 'Boardroom',
    capacity: '20 guests',
    desc: 'Formal setup around a central table for executive meetings.'
  },
  {
    icon: '🍽️',
    name: 'Banquet',
    capacity: '40 guests',
    desc: 'Round tables for dining events and celebrations.'
  },
  {
    icon: '☕',
    name: 'Cocktail',
    capacity: '40 guests',
    desc: 'Standing arrangement with high tables for social events.'
  },
  {
    icon: '🎓',
    name: 'Classroom',
    capacity: '30 guests',
    desc: 'Tables and chairs in rows for workshops and training.'
  },
  {
    icon: '🛋️',
    name: 'Lounge',
    capacity: '35 guests',
    desc: 'Casual seating with sofas for relaxed gatherings.'
  }
]

const AMBIENCE_MODES = [
  { icon: '☀️', name: 'Bright & Professional', desc: 'Full lighting for corporate meetings' },
  { icon: '🌅', name: 'Warm & Inviting', desc: 'Soft ambient lighting for celebrations' },
  { icon: '🌙', name: 'Party Mode', desc: 'Dynamic lighting for energetic events' },
  { icon: '🕯️', name: 'Intimate', desc: 'Dimmed, cozy atmosphere for small gatherings' }
]

const AMENITIES = [
  { icon: '📽️', title: 'HD Projector & Screen', desc: '4K resolution with 120" motorized screen' },
  { icon: '🔊', title: 'Sound System', desc: 'Professional speakers with Bluetooth & mics' },
  { icon: '📶', title: 'High-Speed WiFi', desc: '500 Mbps fiber with guest network' },
  { icon: '❄️', title: 'Climate Control', desc: 'Central AC with zone control' },
  { icon: '💺', title: 'Flexible Seating', desc: '40 chairs, tables, and lounge furniture' },
  { icon: '⚡', title: 'Power Backup', desc: 'UPS for uninterrupted power' },
  { icon: '🎥', title: 'Video Conferencing', desc: 'Pro webcam and conferencing equipment' },
  { icon: '📝', title: 'Whiteboard', desc: 'Large whiteboard and flipchart stands' },
  { icon: '🚻', title: 'Private Restrooms', desc: 'Clean, exclusive facilities' },
  { icon: '🅿️', title: 'Parking', desc: '15 dedicated spaces + street parking' },
  { icon: '♿', title: 'Accessibility', desc: 'Wheelchair accessible throughout' },
  { icon: '🚪', title: 'Private Entrance', desc: 'Dedicated entrance with reception' }
]

export default function Space() {
  return (
    <div className="spacePage">
      <Navbar />

      {/* Hero */}
      <section className="spaceHero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <span className="badge">The Space</span>
          <h1 className="spaceTitle">
            A Versatile Canvas for
            <span className="accent"> Your Vision</span>
          </h1>
          <p className="spaceSubtitle">
            2,000 sq ft of premium, adaptable space designed to transform 
            seamlessly for any type of event.
          </p>
        </div>
      </section>

      {/* Endless Possibilities */}
      <section className="section aboutSection">
        <div className="container">
          <div className="aboutContent">
            <span className="badge">Endless Possibilities</span>
          </div>
          <div className="aboutSlider">
            <ImageSlider />
          </div>
        </div>
      </section>

      {/* Space Overview */}
      <section className="section overviewSection">
        <div className="container">
          <div className="sectionHeader">
            <span className="badge">Space Overview</span>
            <h2 className="sectionTitle">2,000 Sq Ft of Possibilities</h2>
          </div>
          <div className="overviewGrid">
            <div className="overviewCard">
              <span className="overviewIcon">📐</span>
              <h3>Total Area</h3>
              <p>2,000 sq ft</p>
            </div>
            <div className="overviewCard">
              <span className="overviewIcon">📏</span>
              <h3>Ceiling Height</h3>
              <p>12 ft</p>
            </div>
            <div className="overviewCard">
              <span className="overviewIcon">🪟</span>
              <h3>Natural Light</h3>
              <p>Large windows</p>
            </div>
            <div className="overviewCard">
              <span className="overviewIcon">🚪</span>
              <h3>Private Entrance</h3>
              <p>Dedicated access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Sections Container */}
      <div className="stickySectionsWrapper">
        {/* Configurations */}
        <section className="section configSection">
          <div className="container">
            <div className="sectionHeader">
              <span className="badge">Flexible Layouts</span>
              <h2 className="sectionTitle">Configuration Options</h2>
              <p className="sectionSubtitle">
                Our space adapts to your needs with multiple seating arrangements
              </p>
            </div>
            <div className="configGrid">
              {CONFIGURATIONS.map((config) => (
                <div key={config.name} className="configCard">
                  <span className="configIcon">{config.icon}</span>
                  <h3 className="configName">{config.name}</h3>
                  <span className="configCapacity">{config.capacity}</span>
                  <p className="configDesc">{config.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ambience Modes */}
        <section className="section ambienceSection">
          <div className="container">
            <div className="ambienceInner">
              <span className="badge badge-teal">Set the Mood</span>
              <h2 className="sectionTitle">Ambience Modes</h2>
              <p className="ambienceText">
                Our adjustable lighting system lets you create the perfect atmosphere.
              </p>
              <div className="ambienceGrid">
                {AMBIENCE_MODES.map((mode) => (
                  <div key={mode.name} className="ambienceCard">
                    <span className="ambienceIcon">{mode.icon}</span>
                    <h3 className="ambienceName">{mode.name}</h3>
                    <p className="ambienceDesc">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="section amenitiesSection">
          <div className="container">
            <div className="sectionHeader">
              <span className="badge badge-teal">Fully Equipped</span>
              <h2 className="sectionTitle">Amenities & Features</h2>
              <p className="sectionSubtitle">
                Everything included with your booking — no hidden fees
              </p>
            </div>
            <div className="amenitiesGrid">
              {AMENITIES.map((amenity) => (
                <div key={amenity.title} className="amenityCard">
                  <span className="amenityIcon">{amenity.icon}</span>
                  <div className="amenityContent">
                    <h3 className="amenityTitle">{amenity.title}</h3>
                    <p className="amenityDesc">{amenity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="ctaSection">
        <div className="container">
          <div className="ctaInner">
            <h2 className="ctaTitle">Ready to Experience The Zone?</h2>
            <p className="ctaText">
              Book your event or schedule a tour today.
            </p>
            <div className="ctaActions">
              <a href="#/book" className="btn btn-primary btn-lg">Book Now</a>
              <a href="#/contact" className="btn btn-outline btn-lg">
                Schedule a Tour
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
