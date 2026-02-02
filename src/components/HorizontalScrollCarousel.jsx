import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HorizontalScrollCarousel.css'

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    name: 'Conferences',
    description: 'Host impactful presentations in our professional conference setup.'
  },
  {
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop',
    name: 'Celebrations',
    description: 'Create unforgettable memories in our versatile party-ready space.'
  },
  {
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
    name: 'Corporate',
    description: 'Elevate your business events with premium amenities and ambiance.'
  },
  {
    image: 'https://images.unsplash.com/photo-1529543544277-ea0f5b87d97a?w=800&auto=format&fit=crop',
    name: 'Get-togethers',
    description: 'Gather with friends and family in a warm, inviting atmosphere.'
  }
]

export default function HorizontalScrollCarousel({ slides = DEFAULT_SLIDES }) {
  const containerRef = useRef(null)
  const carouselRef = useRef(null)
  const pinRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const carousel = carouselRef.current
    const pin = pinRef.current

    if (!container || !carousel || !pin) return

    // Wait for layout to be ready
    let cleanup = null

    const initCarousel = () => {
      const slideElements = carousel.querySelectorAll('.carouselSlide')
      if (slideElements.length === 0) return

      const slideWidth = slideElements[0].offsetWidth
      const gap = 24 // gap between slides (match CSS gap)
      const totalWidth = (slideWidth + gap) * slideElements.length - gap
      const scrollDistance = totalWidth - container.offsetWidth

      // Set the carousel width to accommodate all slides
      gsap.set(carousel, {
        width: totalWidth
      })

      // Calculate scroll duration - proportional to horizontal scroll distance
      // Use a multiplier that gives smooth scrolling without excessive blank space
      // Each slide should get enough scroll to be visible, but not excessive
      const scrollDuration = scrollDistance * 2 // 2x multiplier for smooth scrolling

      // Create horizontal scroll animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${scrollDuration}`, // Proportional to horizontal scroll distance
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          pinSpacing: true
        }
      })

      tl.to(carousel, {
        x: -scrollDistance,
        ease: 'none'
      })

      cleanup = () => {
        tl.kill()
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars.trigger === pin) {
            trigger.kill()
          }
        })
      }
    }

    // Wait for next frame to ensure layout is calculated
    requestAnimationFrame(() => {
      setTimeout(initCarousel, 100)
    })

    return () => {
      if (cleanup) cleanup()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === pinRef.current) {
          trigger.kill()
        }
      })
    }
  }, [slides])

  return (
    <div ref={pinRef} className="horizontalCarouselPin">
      <div ref={containerRef} className="horizontalCarouselContainer">
        <div ref={carouselRef} className="horizontalCarousel">
          {slides.map((slide, index) => (
            <div
              key={`${slide.name}-${index}`}
              className="carouselSlide"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="carouselContent">
                <div className="carouselName">{slide.name}</div>
                <div className="carouselDescription">{slide.description}</div>
                <a href="#/book" className="carouselButton">
                  <button>Book Now</button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

