import { useEffect, useRef } from 'react'

export function useScrollAnimation(animationClass, delay = 0) {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set initial state
    element.classList.add('animate-on-scroll')
    element.style.opacity = '0'

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add(animationClass)
              entry.target.classList.add('is-visible')
              entry.target.style.opacity = '1'
            }, delay)
            observer.unobserve(entry.target)
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
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [animationClass, delay])

  return elementRef
}
