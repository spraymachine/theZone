import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useGSAPScroll } from '../hooks/useGSAPScroll'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Home.css'
import heroBg from '../assets/hero-bg.png'
import heroImg from '../assets/hero-img.png'
import home2Img from '../assets/home-2.png'

const EVENT_TYPES = [
  {
    icon: '🎯',
    title: 'Conferences',
    desc: 'Professional meetings with premium tech setup',
    href: '#/events#conferences'
  },
  {
    icon: '🎉',
    title: 'Parties',
    desc: 'Birthdays, anniversaries & celebrations',
    href: '#/events#parties'
  },
  {
    icon: '☕',
    title: 'Get-togethers',
    desc: 'Casual meetups in a cozy atmosphere',
    href: '#/events#gatherings'
  },
  {
    icon: '💼',
    title: 'Corporate',
    desc: 'Workshops, team meetings & launches',
    href: '#/events#corporate'
  }
]

const KEY_AMENITIES = [
  { icon: '📽️', label: 'HD Projector' },
  { icon: '🔊', label: 'Sound System' },
  { icon: '📶', label: 'High-Speed WiFi' },
  { icon: '❄️', label: 'Air Conditioning' },
  { icon: '💺', label: 'Flexible Seating' },
  { icon: '⚡', label: 'Power Backup' },
]

const TESTIMONIALS = [
  {
    quote: "The Zone exceeded all our expectations. The space was perfect for our annual conference and the team made everything seamless.",
    author: "Sarah Mitchell",
    role: "Marketing Director, TechCorp",
    rating: 5
  },
  {
    quote: "We hosted my daughter's 18th birthday here and it was magical. The ambiance, the service, everything was top-notch!",
    author: "Michael Chen",
    role: "Parent",
    rating: 5
  },
  {
    quote: "Best venue for corporate workshops. Clean, professional, and fully equipped. We've booked it three times already.",
    author: "Priya Sharma",
    role: "HR Manager, StartupHub",
    rating: 5
  }
]

export default function Home() {
  // Landing page hero animations (animate immediately on load)
  const heroBadgeRef = useGSAPScroll({ animation: 'topToOriginal', delay: 0, duration: 0.8, start: 'top 100%' })
  const heroTitleRef = useGSAPScroll({ animation: 'slideInFwdCenter', delay: 0.2, duration: 1, start: 'top 100%' })
  const heroSubtitleRef = useGSAPScroll({ animation: 'slideInFwdCenter', delay: 0.3, duration: 1, start: 'top 100%' })
  const heroActionsRef = useGSAPScroll({ animation: 'bottomToOriginal', delay: 0.4, duration: 0.8, start: 'top 100%' })
  const heroStatsRef = useGSAPScroll({ animation: 'bottomToOriginal', delay: 0.5, duration: 0.8, start: 'top 100%' })
  const heroImageRef = useGSAPScroll({ animation: 'rightToOriginal', delay: 0.3, duration: 1, start: 'top 100%' })

  const overviewBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const overviewTitleRef = useGSAPScroll({ animation: 'fadeInLeft', delay: 0.1, duration: 0.8 })
  const overviewTextRef = useGSAPScroll({ animation: 'fadeInLeft', delay: 0.2, duration: 0.8 })
  const overviewFeaturesRef = useGSAPScroll({ animation: 'fadeInLeft', delay: 0.3, duration: 0.8 })
  const overviewImageRef = useGSAPScroll({ animation: 'scaleIn', delay: 0.2, duration: 1 })

  const eventBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const eventTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const eventSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  
  // Event cards container ref for stagger animation
  const eventGridRef = useRef(null)
  
  // Event cards animations - using GSAP stagger directly for better control
  useEffect(() => {
    const cards = eventGridRef.current?.querySelectorAll('.eventCard')
    if (!cards || cards.length === 0) return

    // Set initial state
    gsap.set(cards, {
      opacity: 0,
      y: 120,
      filter: 'blur(10px)',
      immediateRender: true
    })

    // Create stagger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: eventGridRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    })

    tl.to(cards, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.3, // 0.3s between each card (leftmost first, rightmost last)
      force3D: true
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === eventGridRef.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  const eventCardRefs = EVENT_TYPES.map(() => useRef(null)) // Placeholder refs (not used)

  const amenitiesBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const amenitiesTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const amenitiesTextRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  
  // Amenities grid container ref for row-wise stagger animation
  const amenitiesGridRef = useRef(null)
  
  // Amenities cards animations - left column from left, right column from right, row-wise stagger
  // Left column: indices 0, 2, 4 (HD Projector, High-Speed WiFi, Flexible Seating)
  // Right column: indices 1, 3, 5 (Sound System, Air Conditioning, Power Backup)
  useEffect(() => {
    const items = amenitiesGridRef.current?.querySelectorAll('.amenityItem')
    if (!items || items.length === 0) return

    // Grid is 3 columns, items arranged:
    // Row 1: indices 0, 1, 2 (HD Projector, Sound System, High-Speed WiFi)
    // Row 2: indices 3, 4, 5 (Air Conditioning, Flexible Seating, Power Backup)
    // Left column items (even indices 0, 2, 4): HD Projector, High-Speed WiFi, Flexible Seating
    // Right column items (odd indices 1, 3, 5): Sound System, Air Conditioning, Power Backup
    
    const leftColumnIndices = [0, 2, 4] // Even indices - animate from left
    const rightColumnIndices = [1, 3, 5] // Odd indices - animate from right
    
    // Set initial states for ALL items
    items.forEach((item, index) => {
      if (leftColumnIndices.includes(index)) {
        // Left column items - from left
        gsap.set(item, {
          opacity: 0,
          x: -150,
          y: 0,
          filter: 'blur(10px)',
          immediateRender: true,
          force3D: true
        })
      } else if (rightColumnIndices.includes(index)) {
        // Right column items - from right
        gsap.set(item, {
          opacity: 0,
          x: 150,
          y: 0,
          filter: 'blur(10px)',
          immediateRender: true,
          force3D: true
        })
      } else {
        // Middle items (shouldn't happen with 6 items, but just in case)
        gsap.set(item, {
          opacity: 0,
          x: 0,
          y: 0,
          filter: 'blur(10px)',
          immediateRender: true,
          force3D: true
        })
      }
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

    // Animate row by row (3 items per row in 3-column grid)
    const itemsPerRow = 3
    const totalRows = Math.ceil(items.length / itemsPerRow)
    
    for (let row = 0; row < totalRows; row++) {
      const rowStart = row * itemsPerRow
      
      // Animate all items in this row
      for (let col = 0; col < itemsPerRow; col++) {
        const itemIndex = rowStart + col
        if (itemIndex >= items.length) break
        
        const item = items[itemIndex]
        const isLeftColumn = leftColumnIndices.includes(itemIndex)
        const isRightColumn = rightColumnIndices.includes(itemIndex)
        
        // Determine animation position based on column
        const position = col * 0.1 // Stagger within row: 0s, 0.1s, 0.2s
        
        tl.to(item, {
          opacity: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power4.out',
          force3D: true
        }, row * 0.2 + position) // Row-wise stagger + column stagger
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

  const amenityCardRefs = KEY_AMENITIES.map(() => useRef(null)) // Placeholder refs (not used)

  const testimonialBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const testimonialTitleRef = useGSAPScroll({ animation: 'topToOriginal', delay: 0.1, duration: 0.8 })
  
  // Testimonial cards container ref for stagger animation
  const testimonialGridRef = useRef(null)
  
  // Testimonial cards animations - using GSAP stagger directly for better control
  useEffect(() => {
    const cards = testimonialGridRef.current?.querySelectorAll('.testimonialCard')
    if (!cards || cards.length === 0) return

    // Set initial state
    gsap.set(cards, {
      opacity: 0,
      y: 120,
      filter: 'blur(10px)',
      immediateRender: true
    })

    // Create stagger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: testimonialGridRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    })

    tl.to(cards, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.4, // 0.4s between each card (leftmost first, rightmost last)
      force3D: true
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === testimonialGridRef.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  const testimonialCardRefs = TESTIMONIALS.map(() => useRef(null)) // Placeholder refs (not used)

  const ctaTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0, duration: 0.8 })
  const ctaTextRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const ctaActionsRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  return (
    <div className="homePage">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <div className="heroGrid">
            <div className="heroContent">
              <span ref={heroBadgeRef} className="heroBadge">Premium Private Space</span>
              <h1 ref={heroTitleRef} className="heroTitle">
                Perfect Space for
                <span className="heroAccent"> Every Occasion</span>
              </h1>
              <p ref={heroSubtitleRef} className="heroSubtitle">
                A versatile private venue for conferences, parties, get-togethers, 
                and corporate events. Equipped with premium amenities and flexible configurations.
              </p>
              <div ref={heroActionsRef} className="heroActions">
                <a href="#/book" className="btn btn-primary btn-lg">
                  Book Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href="#/space" className="btn btn-outline btn-lg">
                  Explore Space
                </a>
              </div>
              <div ref={heroStatsRef} className="heroStats">
                <div className="heroStat">
                  <span className="heroStatValue">2,000</span>
                  <span className="heroStatLabel">Square Feet</span>
                </div>
                <div className="heroStat">
                  <span className="heroStatValue">40</span>
                  <span className="heroStatLabel">Capacity</span>
                </div>
                <div className="heroStat">
                  <span className="heroStatValue">4.9</span>
                  <span className="heroStatLabel">Star Rating</span>
                </div>
              </div>
            </div>
            <div ref={heroImageRef} className="heroImageWrapper">
              <img src={heroImg} alt="The Zone Event Space" className="heroImage" />
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="section overview">
        <div className="container">
          <div className="overviewGrid">
            <div className="overviewContent">
              <span ref={overviewBadgeRef} className="badge">About The Zone</span>
              <h2 ref={overviewTitleRef} className="sectionTitle">A Space That Adapts to Your Vision</h2>
              <p ref={overviewTextRef} className="overviewText">
                Located in the heart of the city, The Zone is a thoughtfully designed private 
                space that transforms to suit your needs. Whether you're planning a high-stakes 
                business presentation or an intimate celebration, our venue provides the perfect 
                backdrop.
              </p>
              <ul ref={overviewFeaturesRef} className="overviewFeatures">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Flexible layout configurations
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  State-of-the-art audio/visual equipment
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Climate-controlled environment
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Dedicated event support team
                </li>
              </ul>
              <a href="#/about" className="btn btn-dark">
                Learn More About Us
              </a>
            </div>
            <div ref={overviewImageRef} className="overviewImage">
              <img src={home2Img} alt="Premium Event Space" className="overviewImageImg" />
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="section eventTypes">
        <div className="container">
          <div className="sectionHeader">
            <span ref={eventBadgeRef} className="badge">What We Host</span>
            <h2 ref={eventTitleRef} className="sectionTitle">Perfect for Every Event Type</h2>
            <p ref={eventSubtitleRef} className="sectionSubtitle">
              From corporate conferences to personal celebrations, our space adapts to your needs
            </p>
          </div>
          <div ref={eventGridRef} className="eventGrid">
            {EVENT_TYPES.map((event, index) => (
              <a key={event.title} href={event.href} className="eventCard">
                <span className="eventIcon">{event.icon}</span>
                <h3 className="eventTitle">{event.title}</h3>
                <p className="eventDesc">{event.desc}</p>
                <span className="eventLink">
                  Learn More
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </a>
            ))}
          </div>
          <div className="sectionCta">
            <a href="#/events" className="btn btn-outline">
              View All Event Types
            </a>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="section amenities">
        <div className="container">
          <div className="amenitiesInner">
            <div className="amenitiesContent">
              <span ref={amenitiesBadgeRef} className="badge badge-teal">Fully Equipped</span>
              <h2 ref={amenitiesTitleRef} className="sectionTitle">Everything You Need, Ready to Go</h2>
              <p ref={amenitiesTextRef} className="amenitiesText">
                Our space comes equipped with premium amenities to ensure your event runs smoothly.
                No need to bring anything extra – we've got you covered.
              </p>
              <div ref={amenitiesGridRef} className="amenitiesGrid">
                {KEY_AMENITIES.map((amenity, index) => (
                  <div key={amenity.label} className="amenityItem">
                    <span className="amenityIcon">{amenity.icon}</span>
                    <span className="amenityLabel">{amenity.label}</span>
                  </div>
                ))}
              </div>
              <a href="#/amenities" className="btn btn-dark">
                View All Amenities
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials">
        <div className="container">
          <div className="sectionHeader">
            <span ref={testimonialBadgeRef} className="badge">What People Say</span>
            <h2 ref={testimonialTitleRef} className="sectionTitle">Trusted by Hundreds of Happy Clients</h2>
          </div>
          <div ref={testimonialGridRef} className="testimonialGrid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonialCard">
                  <div className="testimonialRating">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} className="star">★</span>
                    ))}
                  </div>
                  <p className="testimonialQuote">"{t.quote}"</p>
                  <div className="testimonialAuthor">
                    <div className="testimonialAvatar">
                      {t.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="testimonialName">{t.author}</p>
                      <p className="testimonialRole">{t.role}</p>
                    </div>
                  </div>
              </div>
            ))}
          </div>
          <div className="sectionCta">
            <a href="#/testimonials" className="btn btn-outline">
              Read More Reviews
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaSection">
        <div className="container">
          <div className="ctaInner">
            <h2 ref={ctaTitleRef} className="ctaTitle">Ready to Host Your Event?</h2>
            <p ref={ctaTextRef} className="ctaText">
              Book The Zone today and create unforgettable memories in a premium private space.
            </p>
            <div ref={ctaActionsRef} className="ctaActions">
              <a href="#/book" className="btn btn-primary btn-lg">
                Book Your Event
              </a>
              <a href="#/contact" className="btn btn-outline btn-lg">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

