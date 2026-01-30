import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Custom hook for GSAP scroll-triggered animations
 * 
 * @param {Object} options - Animation options
 * @param {string} options.animation - Animation type: 'fadeIn', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'scaleIn', 'slideUp'
 * @param {number} options.delay - Delay in seconds before animation starts
 * @param {number} options.duration - Animation duration in seconds
 * @param {string} options.start - ScrollTrigger start position (default: 'top 80%')
 * @param {boolean} options.once - Whether to animate only once (default: true)
 * @returns {React.RefObject} - Ref to attach to the element
 */
export function useGSAPScroll({
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.8,
  start = 'top 80%',
  once = true
} = {}) {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set initial state based on animation type
    const initialStyles = {
      opacity: 0,
      y: 0,
      x: 0,
      scale: 1
    }

    switch (animation) {
      case 'fadeIn':
        initialStyles.opacity = 0
        break
      case 'fadeInUp':
        initialStyles.opacity = 0
        initialStyles.y = 80 // Increased movement distance for more visible effect
        break
      case 'fadeInDown':
        initialStyles.opacity = 0
        initialStyles.y = -50
        break
      case 'fadeInLeft':
        initialStyles.opacity = 0
        initialStyles.x = -50
        break
      case 'fadeInRight':
        initialStyles.opacity = 0
        initialStyles.x = 50
        break
      case 'scaleIn':
        initialStyles.opacity = 0
        initialStyles.scale = 0.8
        break
      case 'slideUp':
        initialStyles.y = 100
        break
      default:
        initialStyles.opacity = 0
        initialStyles.y = 30
    }

    // Apply initial styles immediately to ensure elements start hidden
    gsap.set(element, {
      ...initialStyles,
      immediateRender: true
    })

    // Create animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: start,
        toggleActions: once ? 'play none none none' : 'play none none reverse',
        once: once
      },
      delay: delay // Delay the entire timeline for stagger effect
    })

    // Animate to final state
    tl.to(element, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: duration,
      ease: 'power3.out'
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [animation, delay, duration, start, once])

  return elementRef
}

/**
 * Hook for parallax/speed effects (requires ScrollSmoother)
 * 
 * @param {number} speed - Speed multiplier (negative = slower, positive = faster)
 * @returns {React.RefObject} - Ref to attach to the element
 */
export function useParallax(speed = 0.5) {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Add data-speed attribute for ScrollSmoother
    element.setAttribute('data-speed', speed.toString())

    return () => {
      if (element) {
        element.removeAttribute('data-speed')
      }
    }
  }, [speed])

  return elementRef
}

