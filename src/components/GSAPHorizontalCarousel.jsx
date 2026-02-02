import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './GSAPHorizontalCarousel.css'

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
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop',
    name: 'Get-togethers',
    description: 'Gather with friends and family in a warm, inviting atmosphere.'
  }
]

export default function GSAPHorizontalCarousel({ slides = DEFAULT_SLIDES }) {
  const pinRef = useRef(null)
  const carouselRef = useRef(null)
  const containerRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    const pin = pinRef.current
    const carousel = carouselRef.current
    const container = containerRef.current

    if (!pin || !carousel || !container) return

    const initCarousel = () => {
      // Kill any existing timeline and ScrollTrigger
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }

      const slideElements = carousel.querySelectorAll('.carouselSlide')
      if (slideElements.length === 0) {
        // Retry if slides aren't ready
        setTimeout(initCarousel, 100)
        return
      }

      // Calculate dimensions
      const slideWidth = slideElements[0].offsetWidth
      const gap = 24
      const totalWidth = (slideWidth + gap) * slideElements.length - gap
      const containerWidth = container.offsetWidth
      const scrollDistance = totalWidth - containerWidth

      if (scrollDistance <= 0) {
        // No scrolling needed if content fits
        return
      }

      // Set carousel width and reset position
      gsap.set(carousel, {
        width: totalWidth,
        x: 0
      })

      // Calculate scroll duration - proportional to horizontal distance
      // Use a multiplier that gives smooth scrolling without excessive space
      const scrollDuration = scrollDistance * 1.5

      // Create timeline for horizontal scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${scrollDuration}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          pinSpacing: true,
          invalidateOnRefresh: true
        }
      })

      tl.to(carousel, {
        x: -scrollDistance,
        ease: 'none'
      })

      timelineRef.current = tl

      // Refresh ScrollTrigger after setup
      ScrollTrigger.refresh()
    }

    // Initialize with proper timing
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        initCarousel()
      })
    }, 150)

    // Handle resize
    const handleResize = () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      setTimeout(() => {
        initCarousel()
        ScrollTrigger.refresh()
      }, 200)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      // Clean up any ScrollTriggers attached to this element
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.trigger === pin) {
          trigger.kill()
        }
      })
    }
  }, [slides])

  return (
    <div ref={pinRef} className="gsapCarouselPin">
      <div ref={containerRef} className="gsapCarouselContainer">
        <div ref={carouselRef} className="gsapCarousel">
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


