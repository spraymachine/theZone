import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
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
              <span className="heroBadge">Premium Private Space</span>
              <h1 className="heroTitle">
                Your Perfect Space for
                <span className="heroAccent"> Every Occasion</span>
              </h1>
              <p className="heroSubtitle">
                A versatile private venue for conferences, parties, get-togethers, 
                and corporate events. Equipped with premium amenities and flexible configurations.
              </p>
              <div className="heroActions">
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
              <div className="heroStats">
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
            <div className="heroImageWrapper">
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
              <span className="badge">About The Zone</span>
              <h2 className="sectionTitle">A Space That Adapts to Your Vision</h2>
              <p className="overviewText">
                Located in the heart of the city, The Zone is a thoughtfully designed private 
                space that transforms to suit your needs. Whether you're planning a high-stakes 
                business presentation or an intimate celebration, our venue provides the perfect 
                backdrop.
              </p>
              <ul className="overviewFeatures">
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
            <div className="overviewImage">
              <img src={home2Img} alt="Premium Event Space" className="overviewImageImg" />
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="section eventTypes">
        <div className="container">
          <div className="sectionHeader">
            <span className="badge">What We Host</span>
            <h2 className="sectionTitle">Perfect for Every Event Type</h2>
            <p className="sectionSubtitle">
              From corporate conferences to personal celebrations, our space adapts to your needs
            </p>
          </div>
          <div className="eventGrid">
            {EVENT_TYPES.map((event) => (
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
              <span className="badge badge-teal">Fully Equipped</span>
              <h2 className="sectionTitle">Everything You Need, Ready to Go</h2>
              <p className="amenitiesText">
                Our space comes equipped with premium amenities to ensure your event runs smoothly.
                No need to bring anything extra – we've got you covered.
              </p>
              <div className="amenitiesGrid">
                {KEY_AMENITIES.map((amenity) => (
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
            <span className="badge">What People Say</span>
            <h2 className="sectionTitle">Trusted by Hundreds of Happy Clients</h2>
          </div>
          <div className="testimonialGrid">
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
            <h2 className="ctaTitle">Ready to Host Your Event?</h2>
            <p className="ctaText">
              Book The Zone today and create unforgettable memories in a premium private space.
            </p>
            <div className="ctaActions">
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

