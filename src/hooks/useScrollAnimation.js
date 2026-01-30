import { useEffect, useRef } from 'react'

// We only want to trigger "scroll animations" after *real user scroll intent*,
// not programmatic scroll (like window.scrollTo on route change).
let userHasScrolled = false
let listenersAdded = false

function markUserScrolled() {
  userHasScrolled = true
}

function resetUserScrollFlag() {
  userHasScrolled = false
}

function initUserScrollTracking() {
  if (listenersAdded) return
  listenersAdded = true

  // Reset per "page" in this hash-router
  window.addEventListener('hashchange', resetUserScrollFlag)

  // These represent user scroll intent; programmatic scrollTo won't fire wheel/touchmove
  window.addEventListener('wheel', markUserScrolled, { passive: true })
  window.addEventListener('touchmove', markUserScrolled, { passive: true })
  window.addEventListener('keydown', (e) => {
    const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']
    if (keys.includes(e.key)) markUserScrolled()
  })
}

export function useScrollAnimation(animationClass, delay = 0) {
  const elementRef = useRef(null)
  const hasAnimatedRef = useRef(false)
  const pendingScrollHandlerRef = useRef(null)

  useEffect(() => {
    initUserScrollTracking()

    const element = elementRef.current
    if (!element) return

    // Reset state on mount / re-mount (route changes)
    hasAnimatedRef.current = false
    element.classList.remove(animationClass, 'is-visible')
    element.classList.add('animate-on-scroll')

    const animateNow = () => {
      if (hasAnimatedRef.current) return
      hasAnimatedRef.current = true
      window.setTimeout(() => {
        element.classList.add(animationClass)
        element.classList.add('is-visible')
        element.style.opacity = '1'
      }, delay)
    }

    const rect = element.getBoundingClientRect()
    const isInInitialViewport = rect.top < window.innerHeight && rect.bottom > 0

    // "Landing section" behavior (fine-tuned):
    // - If it's visible at page top, make it visible immediately (no hidden flash)
    // - Optionally still animate it (next frame), but without waiting for user scroll.
    if (isInInitialViewport && window.scrollY === 0) {
      element.style.opacity = '1'
      element.classList.add('is-visible')
      // Apply the animation class on the next frame so it feels smooth (no preload flash)
      window.requestAnimationFrame(() => {
        element.classList.add(animationClass)
      })
      hasAnimatedRef.current = true
      return
    }

    // Non-landing elements start hidden and will reveal later.
    element.style.opacity = '0'

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            if (userHasScrolled) {
              animateNow()
              observer.unobserve(entry.target)
              return
            }

            // If user hasn't scrolled yet but the element is in view (e.g. small pages),
            // wait for the first real user scroll intent, then animate if still visible.
            if (!pendingScrollHandlerRef.current) {
              pendingScrollHandlerRef.current = () => {
                if (!userHasScrolled || hasAnimatedRef.current) return
                const r = element.getBoundingClientRect()
                const stillVisible = r.top < window.innerHeight && r.bottom > 0
                if (stillVisible) {
                  animateNow()
                  observer.unobserve(element)
                }
                window.removeEventListener('wheel', pendingScrollHandlerRef.current)
                window.removeEventListener('touchmove', pendingScrollHandlerRef.current)
                window.removeEventListener('keydown', pendingScrollHandlerRef.current)
                pendingScrollHandlerRef.current = null
              }

              window.addEventListener('wheel', pendingScrollHandlerRef.current, { passive: true })
              window.addEventListener('touchmove', pendingScrollHandlerRef.current, { passive: true })
              window.addEventListener('keydown', pendingScrollHandlerRef.current)
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    observer.observe(element)

    return () => {
      if (pendingScrollHandlerRef.current) {
        window.removeEventListener('wheel', pendingScrollHandlerRef.current)
        window.removeEventListener('touchmove', pendingScrollHandlerRef.current)
        window.removeEventListener('keydown', pendingScrollHandlerRef.current)
        pendingScrollHandlerRef.current = null
      }
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [animationClass, delay])

  return elementRef
}
