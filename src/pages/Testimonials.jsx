import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useGSAPScroll } from '../hooks/useGSAPScroll'
import './Testimonials.css'

const TESTIMONIALS = [
  {
    quote: "The Zone exceeded all our expectations. The space was perfect for our annual conference and the team made everything seamless. We've already booked for next year!",
    author: "Sarah Mitchell",
    role: "Marketing Director, TechCorp",
    rating: 5,
    type: 'Corporate'
  },
  {
    quote: "We hosted my daughter's 18th birthday here and it was magical. The lighting, the sound system, everything came together perfectly. Highly recommend for any celebration!",
    author: "Michael Chen",
    role: "Parent",
    rating: 5,
    type: 'Party'
  },
  {
    quote: "Best venue for corporate workshops. Clean, professional, and fully equipped. We've booked it three times already and will keep coming back.",
    author: "Priya Sharma",
    role: "HR Manager, StartupHub",
    rating: 5,
    type: 'Corporate'
  },
  {
    quote: "The flexibility of the space is amazing. We transformed it from a formal presentation setup in the morning to a casual networking event in the afternoon.",
    author: "James Wilson",
    role: "Event Coordinator",
    rating: 5,
    type: 'Corporate'
  },
  {
    quote: "Our family reunion was perfect thanks to The Zone. The team was incredibly helpful with setup and the space accommodated all 45 of us comfortably.",
    author: "Linda Martinez",
    role: "Family Organizer",
    rating: 5,
    type: 'Get-together'
  },
  {
    quote: "I was worried about the AV setup for our product launch, but everything worked flawlessly. The projector quality was outstanding!",
    author: "David Kim",
    role: "Startup Founder",
    rating: 5,
    type: 'Corporate'
  },
  {
    quote: "Hosted my engagement party here and received so many compliments about the venue. The ambient lighting options really set the mood perfectly.",
    author: "Amanda Foster",
    role: "Bride-to-be",
    rating: 5,
    type: 'Party'
  },
  {
    quote: "As someone who hosts monthly meetups, finding The Zone was a game-changer. Reliable, professional, and the pricing is very reasonable.",
    author: "Robert Taylor",
    role: "Community Organizer",
    rating: 5,
    type: 'Get-together'
  },
  {
    quote: "Our quarterly board meetings are now held exclusively at The Zone. The boardroom setup and video conferencing quality are top-notch.",
    author: "Elizabeth Brown",
    role: "CEO, FinanceFirst",
    rating: 5,
    type: 'Corporate'
  }
]

const STATS = [
  { value: '500+', label: 'Events Hosted' },
  { value: '4.9', label: 'Average Rating' },
  { value: '98%', label: 'Would Recommend' },
  { value: '85%', label: 'Return Clients' }
]

export default function Testimonials() {
  // Hero animations
  const heroBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const heroTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const heroSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  // Stats animations
  const statCardRefs = STATS.map((_, i) => 
    useGSAPScroll({ animation: 'scaleIn', delay: 0.2 + (i * 0.1), duration: 0.7, start: 'top 85%' })
  )

  // Testimonial cards animations
  const testimonialCardRefs = TESTIMONIALS.map((_, i) => 
    useGSAPScroll({ animation: 'fadeInUp', delay: 0.3 + (i * 0.08), duration: 0.6, start: 'top 85%' })
  )

  const ctaTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0, duration: 0.8 })
  const ctaTextRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const ctaActionsRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  return (
    <div className="testimonialsPage">
      <Navbar />

      {/* Hero */}
      <section className="testimonialsHero">
        <div className="container">
          <span ref={heroBadgeRef} className="badge">Testimonials</span>
          <h1 ref={heroTitleRef} className="testimonialsTitle">
            What Our
            <span className="accent"> Clients Say</span>
          </h1>
          <p ref={heroSubtitleRef} className="testimonialsSubtitle">
            Don't just take our word for it. Here's what people who've 
            hosted events at The Zone have to say.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="statsSection">
        <div className="container">
          <div className="statsGrid">
            {STATS.map((stat, i) => (
              <div key={i} ref={statCardRefs[i]} className="statCard">
                <span className="statValue">{stat.value}</span>
                <span className="statLabel">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="section testimonialsList">
        <div className="container">
          <div className="testimonialsGrid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} ref={testimonialCardRefs[i]} className="testimonialCard">
                <span className="testimonialType">{t.type}</span>
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
        </div>
      </section>

      {/* CTA */}
      <section className="ctaSection">
        <div className="container">
          <div className="ctaInner">
            <h2 ref={ctaTitleRef} className="ctaTitle">Join Our Happy Clients</h2>
            <p ref={ctaTextRef} className="ctaText">
              Book your event and create your own success story.
            </p>
            <div ref={ctaActionsRef} className="ctaActions">
              <a href="#/book" className="btn btn-primary btn-lg">Book Now</a>
              <a href="#/contact" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(245,245,240,0.3)', color: '#f5f5f0' }}>
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

