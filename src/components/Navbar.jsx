import { useState, useEffect } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { href: '#/', label: 'Home' },
  { href: '#/space', label: 'The Space' },
  { href: '#/events', label: 'Events' },
  { href: '#/pricing', label: 'Pricing & FAQs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/')
      setMobileOpen(false)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const isActive = (href) => {
    if (href === '#/') return currentPath === '#/' || currentPath === '#' || currentPath === ''
    return currentPath.startsWith(href)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navContainer">
        <a href="#/" className="navLogo">
          <span className="logoIcon">◆</span>
          <span className="logoText">The Zone</span>
        </a>

        <div className={`navLinks ${mobileOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`navLink ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </a>
          ))}
          <a href="#/book" className="navCta">
            Book Now
          </a>
        </div>

        <button
          className={`navToggle ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}

