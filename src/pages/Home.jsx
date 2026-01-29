import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AnimatedElement from '../components/AnimatedElement'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
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
  const heroBadgeRef = useScrollAnimation('animate-fade-in-down', 0)
  const heroTitleRef = useScrollAnimation('animate-fade-in-up', 100)
  const heroSubtitleRef = useScrollAnimation('animate-fade-in-up', 200)
  const heroActionsRef = useScrollAnimation('animate-fade-in-up', 300)
  const heroStatsRef = useScrollAnimation('animate-fade-in-scale', 400)
  const heroImageRef = useScrollAnimation('animate-fade-in-right', 200)
  
  const overviewBadgeRef = useScrollAnimation('animate-fade-in-down', 0)
  const overviewTitleRef = useScrollAnimation('animate-fade-in-left', 100)
  const overviewTextRef = useScrollAnimation('animate-fade-in-left', 200)
  const overviewFeaturesRef = useScrollAnimation('animate-fade-in-left', 300)
  const overviewImageRef = useScrollAnimation('animate-zoom-in', 200)
  
  const eventBadgeRef = useScrollAnimation('animate-fade-in-down', 0)
  const eventTitleRef = useScrollAnimation('animate-fade-in-up', 100)
  const eventSubtitleRef = useScrollAnimation('animate-fade-in-up', 200)
  
  const amenitiesBadgeRef = useScrollAnimation('animate-fade-in-down', 0)
  const amenitiesTitleRef = useScrollAnimation('animate-fade-in-up', 100)
  const amenitiesTextRef = useScrollAnimation('animate-fade-in-up', 200)
  
  const testimonialBadgeRef = useScrollAnimation('animate-fade-in-down', 0)
  const testimonialTitleRef = useScrollAnimation('animate-fade-in-up', 100)
  
  const ctaTitleRef = useScrollAnimation('animate-fade-in-up', 0)
  const ctaTextRef = useScrollAnimation('animate-fade-in-up', 100)
  const ctaActionsRef = useScrollAnimation('animate-fade-in-up', 200)

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
                Your Perfect Space for
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
          <div className="eventGrid">
            {EVENT_TYPES.map((event, index) => (
              <AnimatedElement
                key={event.title}
                as="a"
                href={event.href}
                className="eventCard"
                animationClass={index % 2 === 0 ? 'animate-scale-in' : 'animate-slide-in-bottom'}
                delay={index * 100}
              >
                <span className="eventIcon">{event.icon}</span>
                <h3 className="eventTitle">{event.title}</h3>
                <p className="eventDesc">{event.desc}</p>
                <span className="eventLink">
                  Learn More
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </AnimatedElement>
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
              <div className="amenitiesGrid">
                {KEY_AMENITIES.map((amenity, index) => {
                  const animations = ['animate-fade-in-up', 'animate-scale-in', 'animate-slide-in-bottom']
                  return (
                    <AnimatedElement
                      key={amenity.label}
                      className="amenityItem"
                      animationClass={animations[index % 3]}
                      delay={index * 80}
                    >
                      <span className="amenityIcon">{amenity.icon}</span>
                      <span className="amenityLabel">{amenity.label}</span>
                    </AnimatedElement>
                  )
                })}
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
          <div className="testimonialGrid">
            {TESTIMONIALS.map((t, i) => {
              const animations = ['animate-fade-in-left', 'animate-fade-in-up', 'animate-fade-in-right']
              return (
                <AnimatedElement
                  key={i}
                  className="testimonialCard"
                  animationClass={animations[i] || 'animate-fade-in-up'}
                  delay={i * 150}
                >
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
                </AnimatedElement>
              )
            })}
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

