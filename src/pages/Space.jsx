import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ImageSlider from '../components/ImageSlider'
import { useGSAPScroll } from '../hooks/useGSAPScroll'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  // Hero animations
  const heroBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const heroTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const heroSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  // Section animations
  const aboutBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const overviewBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const overviewTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const overviewCardRefs = Array.from({ length: 4 }, (_, i) => 
    useGSAPScroll({ animation: 'fadeInUp', delay: 0.2 + (i * 0.1), duration: 0.7, start: 'top 85%' })
  )

  const configBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const configTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const configSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  const configCardRefs = CONFIGURATIONS.map((_, i) => 
    useGSAPScroll({ animation: 'scaleIn', delay: 0.3 + (i * 0.1), duration: 0.7, start: 'top 85%' })
  )

  const ambienceBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const ambienceTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const ambienceTextRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  const ambienceCardRefs = AMBIENCE_MODES.map((_, i) => 
    useGSAPScroll({ animation: 'fadeInUp', delay: 0.3 + (i * 0.1), duration: 0.7, start: 'top 85%' })
  )

  const amenitiesBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const amenitiesTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const amenitiesSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  
  // Amenities grid container ref for row-wise stagger animation
  const amenitiesGridRef = useRef(null)
  
  // Amenities cards animations - left column from left, right column from right, row-wise stagger
  // Grid is 2 columns, so even indices (0, 2, 4, 6, 8, 10) are left column
  // Odd indices (1, 3, 5, 7, 9, 11) are right column
  useEffect(() => {
    const items = amenitiesGridRef.current?.querySelectorAll('.amenityCard')
    if (!items || items.length === 0) return

    // Separate left and right column items
    const leftColumnItems = []
    const rightColumnItems = []
    
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        // Even indices = left column
        leftColumnItems.push(item)
      } else {
        // Odd indices = right column
        rightColumnItems.push(item)
      }
    })

    // Set initial states immediately - left column from left, right column from right
    gsap.set(leftColumnItems, {
      opacity: 0,
      x: -150,
      y: 0, // Explicitly set y to 0 to prevent bottom animation
      filter: 'blur(10px)',
      immediateRender: true,
      force3D: true
    })
    
    gsap.set(rightColumnItems, {
      opacity: 0,
      x: 150,
      y: 0, // Explicitly set y to 0 to prevent bottom animation
      filter: 'blur(10px)',
      immediateRender: true,
      force3D: true
    })

    // Create timeline with row-wise stagger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: amenitiesGridRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    })

    // Animate row by row (2 items per row in 2-column grid)
    const itemsPerRow = 2
    const totalRows = Math.ceil(items.length / itemsPerRow)
    
    for (let row = 0; row < totalRows; row++) {
      // Animate left column item (from left to original)
      if (leftColumnItems[row]) {
        tl.to(leftColumnItems[row], {
          opacity: 1,
          x: 0,
          y: 0, // Ensure y stays at 0
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power4.out',
          force3D: true
        }, row * 0.2) // Row-wise stagger: 0s, 0.2s, 0.4s, etc.
      }
      
      // Animate right column item (from right to original)
      if (rightColumnItems[row]) {
        tl.to(rightColumnItems[row], {
          opacity: 1,
          x: 0,
          y: 0, // Ensure y stays at 0
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power4.out',
          force3D: true
        }, row * 0.2 + 0.1) // Slightly after left item in same row
      }
    }

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === amenitiesGridRef.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  const amenityCardRefs = AMENITIES.map(() => useRef(null)) // Placeholder refs (not used)

  const ctaTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0, duration: 0.8 })
  const ctaTextRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const ctaActionsRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  return (
    <div className="spacePage">
      <Navbar />

      {/* Hero */}
      <section className="spaceHero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <span ref={heroBadgeRef} className="badge">The Space</span>
          <h1 ref={heroTitleRef} className="spaceTitle">
            A Versatile Canvas for
            <span className="accent"> Your Vision</span>
          </h1>
          <p ref={heroSubtitleRef} className="spaceSubtitle">
            2,000 sq ft of premium, adaptable space designed to transform 
            seamlessly for any type of event.
          </p>
        </div>
      </section>

      {/* Endless Possibilities */}
      <section className="section aboutSection">
        <div className="container">
          <div className="aboutContent">
            <span ref={aboutBadgeRef} className="badge">Endless Possibilities</span>
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
            <span ref={overviewBadgeRef} className="badge">Space Overview</span>
            <h2 ref={overviewTitleRef} className="sectionTitle">2,000 Sq Ft of Possibilities</h2>
          </div>
          <div className="overviewGrid">
            <div ref={overviewCardRefs[0]} className="overviewCard">
              <span className="overviewIcon">📐</span>
              <h3>Total Area</h3>
              <p>2,000 sq ft</p>
            </div>
            <div ref={overviewCardRefs[1]} className="overviewCard">
              <span className="overviewIcon">📏</span>
              <h3>Ceiling Height</h3>
              <p>12 ft</p>
            </div>
            <div ref={overviewCardRefs[2]} className="overviewCard">
              <span className="overviewIcon">🪟</span>
              <h3>Natural Light</h3>
              <p>Large windows</p>
            </div>
            <div ref={overviewCardRefs[3]} className="overviewCard">
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
              <span ref={configBadgeRef} className="badge">Flexible Layouts</span>
              <h2 ref={configTitleRef} className="sectionTitle">Configuration Options</h2>
              <p ref={configSubtitleRef} className="sectionSubtitle">
                Our space adapts to your needs with multiple seating arrangements
              </p>
            </div>
            <div className="configGrid">
              {CONFIGURATIONS.map((config, i) => (
                <div key={config.name} ref={configCardRefs[i]} className="configCard">
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
              <span ref={ambienceBadgeRef} className="badge badge-teal">Set the Mood</span>
              <h2 ref={ambienceTitleRef} className="sectionTitle">Ambience Modes</h2>
              <p ref={ambienceTextRef} className="ambienceText">
                Our adjustable lighting system lets you create the perfect atmosphere.
              </p>
              <div className="ambienceGrid">
                {AMBIENCE_MODES.map((mode, i) => (
                  <div key={mode.name} ref={ambienceCardRefs[i]} className="ambienceCard">
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
              <span ref={amenitiesBadgeRef} className="badge badge-teal">Fully Equipped</span>
              <h2 ref={amenitiesTitleRef} className="sectionTitle">Amenities & Features</h2>
              <p ref={amenitiesSubtitleRef} className="sectionSubtitle">
                Everything included with your booking — no hidden fees
              </p>
            </div>
            <div ref={amenitiesGridRef} className="amenitiesGrid">
              {AMENITIES.map((amenity, i) => (
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
            <h2 ref={ctaTitleRef} className="ctaTitle">Ready to Experience The Zone?</h2>
            <p ref={ctaTextRef} className="ctaText">
              Book your event or schedule a tour today.
            </p>
            <div ref={ctaActionsRef} className="ctaActions">
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
