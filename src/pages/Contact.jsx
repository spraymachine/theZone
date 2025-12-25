import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // For now, just show success - you can add a contact_inquiries table later
      // const { error } = await supabase.from('contact_inquiries').insert([form])
      // if (error) throw error
      
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contactPage">
      <Navbar />

      {/* Hero */}
      <section className="contactHero">
        <div className="container">
          <span className="badge">Contact</span>
          <h1 className="contactTitle">
            Get in
            <span className="accent"> Touch</span>
          </h1>
          <p className="contactSubtitle">
            Have questions or want to schedule a visit? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section contactContent">
        <div className="container">
          <div className="contactGrid">
            {/* Contact Info */}
            <div className="contactInfo">
              <h2>Contact Information</h2>
              <p className="contactIntro">
                Reach out to us through any of these channels. We typically respond within 24 hours.
              </p>

              <div className="contactMethods">
                <div className="contactMethod">
                  <div className="contactMethodIcon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Address</h3>
                    <p>123 Event Street<br />City, State 12345</p>
                  </div>
                </div>

                <div className="contactMethod">
                  <div className="contactMethodIcon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                    <p className="contactNote">Also available on WhatsApp</p>
                  </div>
                </div>

                <div className="contactMethod">
                  <div className="contactMethodIcon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Email</h3>
                    <p>hello@thezone.com</p>
                  </div>
                </div>

                <div className="contactMethod">
                  <div className="contactMethodIcon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Business Hours</h3>
                    <p>Mon - Sun: 8 AM - 10 PM</p>
                    <p className="contactNote">Available for bookings 7 days a week</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mapPlaceholder">
                <span>📍</span>
                <p>Map Location</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contactForm">
              <h2>Send Us a Message</h2>
              
              {submitted ? (
                <div className="formSuccess">
                  <span className="successIcon">✓</span>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="formRow">
                    <div className="formGroup">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="formGroup">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="formRow">
                    <div className="formGroup">
                      <label htmlFor="phone">Phone (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="formGroup">
                      <label htmlFor="subject">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="booking">Booking Inquiry</option>
                        <option value="tour">Schedule a Tour</option>
                        <option value="pricing">Pricing Question</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="formGroup">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your event or inquiry..."
                      rows={5}
                      required
                    />
                  </div>

                  {error && (
                    <div className="formError">{error}</div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

