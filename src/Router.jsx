import { useEffect, useMemo, useState } from 'react'
import AdminGate from './pages/AdminGate.jsx'

// Main pages (5)
import Home from './pages/Home.jsx'
import Space from './pages/Space.jsx'
import Events from './pages/Events.jsx'
import PricingFAQ from './pages/PricingFAQ.jsx'
import BookNow from './pages/BookNow.jsx'

// Footer utility pages
import Contact from './pages/Contact.jsx'
import Testimonials from './pages/Testimonials.jsx'

function getRouteFromHash(hash) {
  const h = (hash || '').replace(/^#/, '').split('?')[0]
  
  if (h === '/admin' || h.startsWith('/admin')) return 'admin'
  if (h === '/space') return 'space'
  if (h === '/events' || h.startsWith('/events')) return 'events'
  if (h === '/pricing') return 'pricing'
  if (h === '/book') return 'book'
  if (h === '/testimonials') return 'testimonials'
  if (h === '/contact') return 'contact'
  
  return 'home'
}

export default function Router() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || '#/')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const route = useMemo(() => getRouteFromHash(hash), [hash])

  // Set body attribute for admin dark theme
  useEffect(() => {
    if (route === 'admin') {
      document.body.setAttribute('data-route', 'admin')
    } else {
      document.body.removeAttribute('data-route')
    }
  }, [route])

  // Route mapping
  switch (route) {
    case 'admin':
      return <AdminGate />
    case 'space':
      return <Space />
    case 'events':
      return <Events />
    case 'pricing':
      return <PricingFAQ />
    case 'book':
      return <BookNow />
    case 'testimonials':
      return <Testimonials />
    case 'contact':
      return <Contact />
    default:
      return <Home />
  }
}
