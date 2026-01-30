import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

/**
 * GSAP Provider Component
 * 
 * Note: ScrollSmoother is a premium GSAP plugin that requires a Club GreenSock membership.
 * If you don't have a license, you can:
 * 1. Use ScrollTrigger only (free) for scroll animations
 * 2. Purchase a Club GreenSock membership from https://greensock.com/club/
 * 3. Or use a free alternative smooth scroll library
 * 
 * For now, this will attempt to use ScrollSmoother if available, otherwise fall back to ScrollTrigger.
 */
export default function GSAPProvider({ children }) {
  const smootherRef = useRef(null)
  const contentRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    // Check if ScrollSmoother is available (requires premium license)
    let smoother = null
    const wrapper = wrapperRef.current
    const content = contentRef.current

    // Check if ScrollSmoother plugin is registered and available
    if (ScrollSmoother && typeof ScrollSmoother.create === 'function') {
      try {
        // Initialize ScrollSmoother
        // Note: This will only work if you have a Club GreenSock membership
        // To use ScrollSmoother, you need to:
        // 1. Purchase a Club GreenSock membership from https://greensock.com/club/
        // 2. Register your license: gsap.registerPlugin(ScrollSmoother)
        // 3. Or add your license key to the project
        
        smoother = ScrollSmoother.create({
          wrapper: wrapper,
          content: content,
          smooth: 1.5, // Smoothness factor (1 = no smoothing, higher = smoother)
          effects: true, // Enable data-speed and data-lag effects
          smoothTouch: 0.1, // Smooth scrolling on touch devices (0 = disabled)
          normalizeScroll: true, // Normalize scroll behavior across browsers
        })

        smootherRef.current = smoother
        console.log('✅ GSAP ScrollSmoother initialized successfully')
      } catch (error) {
        console.warn('⚠️ ScrollSmoother initialization failed. This requires a Club GreenSock membership.', error.message)
        // Fallback: Use ScrollTrigger only for scroll animations
        // The wrapper structure will still work, just without smooth scrolling
        if (wrapper && content) {
          // Remove wrapper constraints for fallback
          wrapper.style.height = 'auto'
          wrapper.style.overflow = 'visible'
        }
      }
    } else {
      console.warn('⚠️ ScrollSmoother plugin not available. Using ScrollTrigger only for animations.')
      console.info('💡 To enable smooth scrolling, purchase a Club GreenSock membership: https://greensock.com/club/')
      // Fallback: Remove wrapper constraints
      if (wrapper && content) {
        wrapper.style.height = 'auto'
        wrapper.style.overflow = 'visible'
      }
    }

    // Initialize ScrollTrigger (always available, free)
    ScrollTrigger.refresh()

    // Refresh ScrollTrigger on route changes
    const handleHashChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh()
        if (smoother) {
          smoother.refresh()
        }
      }, 100)
    }

    // Refresh on window resize
    const handleResize = () => {
      ScrollTrigger.refresh()
      if (smoother) {
        smoother.refresh()
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('resize', handleResize)
      if (smoother) {
        smoother.kill()
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}

