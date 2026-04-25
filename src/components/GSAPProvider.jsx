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
    let smoother = null
    const wrapper = wrapperRef.current
    const content = contentRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const touchDevice = navigator.maxTouchPoints > 0
    const narrowViewport = window.innerWidth <= 768
    const shouldUseNativeScroll = prefersReducedMotion || coarsePointer || touchDevice || narrowViewport

    if (!wrapper || !content) return

    if (shouldUseNativeScroll) {
      ScrollTrigger.config({ ignoreMobileResize: true })
      ScrollTrigger.normalizeScroll(false)
      ScrollTrigger.refresh()
    } else if (ScrollSmoother && typeof ScrollSmoother.create === 'function') {
      try {
        wrapper.classList.add('smoothScrollActive')

        smoother = ScrollSmoother.create({
          wrapper: wrapper,
          content: content,
          smooth: 1,
          effects: true,
          smoothTouch: 0,
          normalizeScroll: false
        })

        smootherRef.current = smoother
      } catch (error) {
        console.warn('ScrollSmoother initialization failed. Falling back to native scroll.', error.message)
        wrapper.classList.remove('smoothScrollActive')
      }
    }

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
      wrapper.classList.remove('smoothScrollActive')
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
