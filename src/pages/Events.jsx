import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Events.css'
import heroBg from '../assets/hero-bg.png'
import conferenceImg from '../assets/event pic/conference.png'
import corporateImg from '../assets/event pic/corporate.png'
import eventsImg from '../assets/event pic/events.png'
import getTogetherImg from '../assets/event pic/get-together.png'

const EVENT_IMAGES = {
  conferences: conferenceImg,
  parties: eventsImg,
  gatherings: getTogetherImg,
  corporate: corporateImg
}

const EVENT_CATEGORIES = [
  {
    id: 'conferences',
    icon: '🎯',
    title: 'Conferences & Meetings',
    description: 'Professional gatherings with premium tech setup and executive ambiance.',
    useCases: ['Board meetings', 'Investor presentations', 'Annual general meetings', 'Training seminars', 'Product demos'],
    seating: ['Theatre (40)', 'Boardroom (20)', 'Classroom (30)'],
    amenities: ['4K Projector', 'Video conferencing', 'Whiteboard', 'High-speed WiFi', 'Microphones']
  },
  {
    id: 'parties',
    title: 'Parties & Celebrations',
    icon: '🎉',
    description: 'Make your special moments unforgettable in a space designed for celebration.',
    useCases: ['Birthday parties', 'Anniversary celebrations', 'Graduation parties', 'Baby showers', 'Engagement parties'],
    seating: ['Banquet (40)', 'Cocktail (40)', 'Lounge (35)'],
    amenities: ['Party lighting', 'Sound system', 'Dance floor space', 'Decorations allowed', 'Catering setup']
  },
  {
    id: 'gatherings',
    title: 'Get-togethers',
    icon: '☕',
    description: 'Casual, comfortable settings for friends, family, and small groups.',
    useCases: ['Family reunions', 'Friend meetups', 'Book clubs', 'Game nights', 'Casual networking'],
    seating: ['Lounge (35)', 'Cocktail (40)', 'Casual mix'],
    amenities: ['Comfortable seating', 'Background music', 'Coffee/tea setup', 'Ambient lighting', 'Games available']
  },
  {
    id: 'corporate',
    title: 'Corporate Events',
    icon: '💼',
    description: 'Professional environment for your business needs with modern amenities.',
    useCases: ['Team workshops', 'Strategy sessions', 'Product launches', 'Client presentations', 'Company offsites'],
    seating: ['Theatre (40)', 'Classroom (30)', 'Boardroom (20)'],
    amenities: ['Presentation tools', 'Breakout spaces', 'Catering options', 'Recording capability', 'Professional lighting']
  }
]

export default function Events() {
  return (
    <div className="eventsPage">
      <Navbar />

      {/* Hero */}
      <section className="eventsHero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <span className="badge">Event Types</span>
          <h1 className="eventsTitle">
            A Space for
            <span className="accent"> Every Occasion</span>
          </h1>
          <p className="eventsSubtitle">
            From corporate conferences to intimate celebrations, our versatile venue 
            adapts to make your event perfect.
          </p>
        </div>
      </section>

      {/* Event Categories */}
      <div className="stickyCategoriesWrapper">
        {EVENT_CATEGORIES.map((category, index) => {
          // Background colors: conferences=white, parties=brown, gatherings=white, corporate=brown
          const categoryClass = category.id === 'conferences' || category.id === 'gatherings' ? 'category-white' : 'category-brown'
          return (
            <section 
              key={category.id} 
              id={category.id}
              className={`section eventCategory ${categoryClass}`}
            >
              <div className="container">
                <div className="categoryGrid">
                  <div className="categoryContent">
                    <span className="categoryIcon">{category.icon}</span>
                    <h2 className="categoryTitle">{category.title}</h2>
                    <p className="categoryDesc">{category.description}</p>

                    <div className="categoryDetails">
                      <div className="categoryDetail">
                        <h4>Perfect For</h4>
                        <ul>
                          {category.useCases.map((use, i) => (
                            <li key={i}>{use}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="categoryDetail">
                        <h4>Seating Options</h4>
                        <ul>
                          {category.seating.map((seat, i) => (
                            <li key={i}>{seat}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="categoryDetail">
                        <h4>Included Amenities</h4>
                        <ul>
                          {category.amenities.map((amenity, i) => (
                            <li key={i}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <a href="#/book" className="btn btn-primary">
                      Book for {category.title.split(' ')[0]}
                    </a>
                  </div>
                  <div className="categoryImage">
                    <img 
                      src={EVENT_IMAGES[category.id]} 
                      alt={category.title}
                      className="categoryImageImg"
                    />
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* CTA */}
      <section className="ctaSection">
        <div className="container">
          <div className="ctaInner">
            <h2 className="ctaTitle">Not Sure Which Event Type?</h2>
            <p className="ctaText">
              Contact us and we'll help you plan the perfect event.
            </p>
            <div className="ctaActions">
              <a href="#/book" className="btn btn-primary btn-lg">Book Now</a>
              <a href="#/contact" className="btn btn-outline btn-lg">
                Get Help Planning
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

