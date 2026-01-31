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
      scale: 1,
      z: 0,
      filter: 'blur(0px)' // Add blur for smoother fade effect
    }

    switch (animation) {
      case 'fadeIn':
        initialStyles.opacity = 0
        initialStyles.filter = 'blur(8px)' // Add subtle blur
        break
      case 'fadeInUp':
        initialStyles.opacity = 0
        initialStyles.y = 120 // Increased from 80 to 120 for more dramatic effect
        initialStyles.filter = 'blur(10px)' // Add blur for smoother effect
        break
      case 'fadeInDown':
        initialStyles.opacity = 0
        initialStyles.y = -80 // Increased from -50 to -80
        initialStyles.filter = 'blur(8px)'
        break
      case 'fadeInLeft':
        initialStyles.opacity = 0
        initialStyles.x = -100 // Increased from -50 to -100 for more dramatic slide
        initialStyles.filter = 'blur(10px)'
        break
      case 'fadeInRight':
        initialStyles.opacity = 0
        initialStyles.x = 100 // Increased from 50 to 100 for more dramatic slide
        initialStyles.filter = 'blur(10px)'
        break
      case 'scaleIn':
        initialStyles.opacity = 0
        initialStyles.scale = 0.6 // Increased from 0.8 to 0.6 for more dramatic scale
        initialStyles.filter = 'blur(5px)' // Less blur for scale animations
        break
      case 'slideUp':
        initialStyles.y = 150 // Increased from 100 to 150
        initialStyles.filter = 'blur(8px)'
        break
      case 'slideInFwdCenter':
        initialStyles.opacity = 0
        initialStyles.scale = 0.8
        initialStyles.z = -200 // 3D depth for forward motion
        initialStyles.filter = 'blur(15px)'
        break
      case 'topToOriginal':
        initialStyles.opacity = 0
        initialStyles.y = -100 // Start from top
        initialStyles.filter = 'blur(8px)'
        break
      case 'bottomToOriginal':
        initialStyles.opacity = 0
        initialStyles.y = 100 // Start from bottom
        initialStyles.filter = 'blur(8px)'
        break
      case 'rightToOriginal':
        initialStyles.opacity = 0
        initialStyles.x = 150 // Start from right
        initialStyles.filter = 'blur(10px)'
        break
      default:
        initialStyles.opacity = 0
        initialStyles.y = 50 // Increased from 30 to 50
        initialStyles.filter = 'blur(8px)'
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

    // Animate to final state with more pronounced easing
    let easeType = 'power4.out'
    let finalProps = {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      z: 0,
      filter: 'blur(0px)',
      duration: duration,
      force3D: true
    }

    if (animation === 'scaleIn') {
      easeType = 'back.out(1.4)'
    } else if (animation === 'slideInFwdCenter') {
      easeType = 'power3.out'
      // z is already set to 0 in finalProps
    } else if (animation === 'topToOriginal' || animation === 'bottomToOriginal' || animation === 'rightToOriginal') {
      easeType = 'power4.out'
    }
    
    tl.to(element, {
      ...finalProps,
      ease: easeType
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

