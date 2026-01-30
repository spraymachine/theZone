import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useGSAPScroll } from '../hooks/useGSAPScroll'
import './PricingFAQ.css'
import heroBg from '../assets/hero-bg.png'

const PRICING_TIERS = [
  {
    name: 'Weekday',
    days: 'Mon - Thu',
    basePrice: 3499,
    additionalPerHour: 1000,
    minHours: '3 hour minimum',
    features: [
      'All standard amenities',
      'Flexible scheduling',
      'Perfect for meetings',
      'Setup assistance'
    ],
    popular: false
  },
  {
    name: 'Weekend',
    days: 'Fri - Sun',
    basePrice: 4499,
    additionalPerHour: 1299,
    minHours: '3 hour minimum',
    features: [
      'All standard amenities',
      'Premium hours',
      'Ideal for parties',
      'Setup + cleanup time'
    ],
    popular: true
  }
]

const ADD_ONS = [
  { name: 'Deep Cleaning', price: 400, desc: 'Post-event deep cleaning' },
  { name: 'Extra Projector', price: 250, desc: 'Second projector for dual-screen' },
  { name: 'Sound Upgrade', price: 300, desc: 'Additional wireless mics' },
  { name: 'Catering Setup', price: 500, desc: 'Tables, linens, serving equipment' },
  { name: 'Photo Booth', price: 750, desc: 'Instant photo booth with props' },
  { name: 'Decoration Package', price: 1000, desc: 'Balloons, streamers, table decor' }
]

const WHATS_INCLUDED = [
  'HD Projector & Screen',
  'Sound System with Mics',
  'High-Speed WiFi',
  'Climate Control',
  'Flexible Seating (40 chairs)',
  'Tables (various sizes)',
  'Private Restrooms',
  'Dedicated Parking',
  'Basic Cleaning',
  'Setup Assistance'
]

const FAQ_SECTIONS = [
  {
    title: 'Booking',
    faqs: [
      {
        q: 'How do I book The Zone?',
        a: 'You can book online through our website, or contact us directly via phone or email. A 50% deposit is required to confirm your booking.'
      },
      {
        q: 'What is the minimum booking duration?',
        a: 'The minimum booking is 3 hours. Additional hours can be added at a discounted rate.'
      },
      {
        q: 'How far in advance should I book?',
        a: 'We recommend booking at least 2 weeks in advance for weekends and 1 week for weekdays. Last-minute bookings may be available.'
      },
      {
        q: 'Can I visit before booking?',
        a: 'Absolutely! We encourage tours. Contact us to schedule a visit at your convenience.'
      }
    ]
  },
  {
    title: 'Capacity & Setup',
    faqs: [
      {
        q: 'What is the maximum capacity?',
        a: 'The maximum capacity is 40 guests. Capacity varies by setup: Theatre (40), Cocktail (40), Banquet (40), Boardroom (20), Classroom (30).'
      },
      {
        q: 'Can I bring my own decorations?',
        a: 'Yes! You can bring decorations. We ask that nothing be attached to walls with nails or tape that could cause damage.'
      },
      {
        q: 'Is there parking available?',
        a: 'Yes, we have 15 dedicated parking spaces plus ample street parking nearby.'
      }
    ]
  },
  {
    title: 'Policies',
    faqs: [
      {
        q: 'What is the cancellation policy?',
        a: 'Cancellations 7+ days before: full refund. 3-7 days: 50% refund. Less than 3 days: no refund. Rescheduling is always free.'
      },
      {
        q: 'Is there a security deposit?',
        a: 'A ₹2,000 refundable security deposit is required for all bookings. It\'s returned within 3 business days after the event.'
      },
      {
        q: 'Can I bring outside food and drinks?',
        a: 'Yes! You can bring your own catering or use our preferred vendors. No corkage fees.'
      },
      {
        q: 'What are the noise restrictions?',
        a: 'Indoor events can run until midnight. Music volume should be reasonable after 10 PM to respect neighbors.'
      }
    ]
  }
]

export default function PricingFAQ() {
  const [openFaq, setOpenFaq] = useState(null)

  // Hero animations
  const heroBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const heroTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const heroSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  // Pricing section animations
  const pricingBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const pricingTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const pricingSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  const pricingCardRefs = PRICING_TIERS.map((_, i) => 
    useGSAPScroll({ animation: i === 0 ? 'fadeInLeft' : 'fadeInRight', delay: 0.3 + (i * 0.1), duration: 0.7, start: 'top 85%' })
  )

  // Add-ons animations
  const addOnsBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const addOnsTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const addOnsSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  const addOnItemRefs = ADD_ONS.map((_, i) => 
    useGSAPScroll({ animation: 'fadeInUp', delay: 0.3 + (i * 0.08), duration: 0.6, start: 'top 85%' })
  )

  // Included section animations
  const includedBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const includedTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const includedTextRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })
  const includedItemRefs = WHATS_INCLUDED.map((_, i) => 
    useGSAPScroll({ animation: 'fadeInLeft', delay: 0.3 + (i * 0.06), duration: 0.5, start: 'top 85%' })
  )

  // FAQ animations
  const faqBadgeRef = useGSAPScroll({ animation: 'fadeInDown', delay: 0, duration: 0.6 })
  const faqTitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1, duration: 0.8 })
  const faqSubtitleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2, duration: 0.8 })

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="pricingFaqPage">
      <Navbar />

      {/* Hero */}
      <section className="pricingHero">
        <div className="heroBackground" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="heroOverlay" />
        </div>
        <div className="container">
          <span ref={heroBadgeRef} className="badge">Pricing & FAQs</span>
          <h1 ref={heroTitleRef} className="pricingTitle">
            Transparent Pricing,
            <span className="accent"> No Surprises</span>
          </h1>
          <p ref={heroSubtitleRef} className="pricingSubtitle">
            Simple, all-inclusive pricing with everything you need for a successful event.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section pricingSection">
        <div className="container">
          <div className="sectionHeader">
            <span ref={pricingBadgeRef} className="badge">Flexible Options</span>
            <h2 ref={pricingTitleRef} className="sectionTitle">Choose Your Package</h2>
            <p ref={pricingSubtitleRef} className="sectionSubtitle">
              All packages include our standard amenities — no hidden fees
            </p>
          </div>

          <div className="pricingGrid">
            {PRICING_TIERS.map((tier, index) => (
              <div key={tier.name} ref={pricingCardRefs[index]} className={`pricingCard ${tier.popular ? 'popular' : ''}`}>
                {tier.popular && <span className="popularBadge">Most Popular</span>}
                <h3 className="tierName">{tier.name}</h3>
                <p className="tierDays">{tier.days}</p>
                <div className="tierPrice">
                  <span className="priceAmount">₹{tier.basePrice.toLocaleString('en-IN')}</span>
                  <span className="priceUnit">for 3 hours</span>
                </div>
                <p className="tierMin">{tier.minHours}</p>
                <p className="tierAdditional">Additional: ₹{tier.additionalPerHour.toLocaleString('en-IN')}/hr</p>
                <ul className="tierFeatures">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="checkIcon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#/book" className="btn btn-primary btn-block">
                  Book Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="section addOnsSection">
        <div className="container">
          <div className="sectionHeader">
            <span ref={addOnsBadgeRef} className="badge badge-teal">Customize</span>
            <h2 ref={addOnsTitleRef} className="sectionTitle">Optional Add-ons</h2>
            <p ref={addOnsSubtitleRef} className="sectionSubtitle">
              Enhance your event with these optional services
            </p>
          </div>

          <div className="addOnsGrid">
            {ADD_ONS.map((addon, i) => (
              <div key={addon.name} ref={addOnItemRefs[i]} className="addOnItem">
                <div className="addOnInfo">
                  <h4>{addon.name}</h4>
                  <p>{addon.desc}</p>
                </div>
                <span className="addOnPrice">+₹{addon.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section includedSection">
        <div className="container">
          <div className="includedInner">
            <div className="includedContent">
              <span ref={includedBadgeRef} className="badge badge-teal">All-Inclusive</span>
              <h2 ref={includedTitleRef} className="sectionTitle" style={{ color: '#f5f5f0' }}>What's Included</h2>
              <p ref={includedTextRef} className="includedText">
                Every booking comes with full access to our amenities and equipment at no extra cost.
              </p>
            </div>
            <div className="includedGrid">
              {WHATS_INCLUDED.map((item, idx) => (
                <div key={idx} ref={includedItemRefs[idx]} className="includedItem">
                  <span className="includedCheck">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section faqSection">
        <div className="container">
          <div className="sectionHeader">
            <span ref={faqBadgeRef} className="badge">FAQ</span>
            <h2 ref={faqTitleRef} className="sectionTitle">Frequently Asked Questions</h2>
            <p ref={faqSubtitleRef} className="sectionSubtitle">
              Find answers to common questions about booking The Zone
            </p>
          </div>

          <div className="faqContainer">
            {FAQ_SECTIONS.map((section, sIdx) => (
              <div key={section.title} className="faqGroup">
                <h3 className="faqGroupTitle">{section.title}</h3>
                <div className="faqList">
                  {section.faqs.map((faq, fIdx) => {
                    const id = `${sIdx}-${fIdx}`
                    const isOpen = openFaq === id
                    return (
                      <div key={id} className={`faqItem ${isOpen ? 'open' : ''}`}>
                        <button className="faqQuestion" onClick={() => toggleFaq(id)}>
                          <span>{faq.q}</span>
                          <span className="faqIcon">{isOpen ? '−' : '+'}</span>
                        </button>
                        <div className="faqAnswer">
                          <p>{faq.a}</p>
                        </div>
                      </div>
                    )
                  })}
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
            <h2 className="ctaTitle">Ready to Book?</h2>
            <p className="ctaText">
              Reserve The Zone for your next event. Simple pricing, no surprises.
            </p>
            <div className="ctaActions">
              <a href="#/book" className="btn btn-primary btn-lg">Book Now</a>
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

