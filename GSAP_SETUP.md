# GSAP & ScrollSmoother Setup Guide

This project uses **GSAP (GreenSock Animation Platform)** for smooth scrolling and scroll-triggered animations.

## 📦 What's Installed

- **GSAP** - Core animation library (free)
- **ScrollTrigger** - Scroll-based animations plugin (free)
- **ScrollSmoother** - Smooth scrolling plugin (premium - requires Club GreenSock membership)

## 🎯 Current Implementation

### 1. GSAP Provider (`src/components/GSAPProvider.jsx`)

The `GSAPProvider` component wraps the entire app and:
- Initializes ScrollSmoother (if license available)
- Sets up ScrollTrigger for scroll animations
- Handles route changes and window resizing
- Provides fallback behavior if ScrollSmoother is unavailable

### 2. Scroll Animation Hook (`src/hooks/useGSAPScroll.js`)

A custom React hook for easy scroll-triggered animations:

```jsx
import { useGSAPScroll } from '../hooks/useGSAPScroll'

function MyComponent() {
  const elementRef = useGSAPScroll({
    animation: 'fadeInUp',  // Animation type
    delay: 0.1,              // Delay in seconds
    duration: 0.8,           // Animation duration
    start: 'top 80%',        // ScrollTrigger start position
    once: true               // Animate only once
  })

  return <div ref={elementRef}>Animated content</div>
}
```

### Available Animation Types:
- `fadeIn` - Simple fade in
- `fadeInUp` - Fade in from bottom
- `fadeInDown` - Fade in from top
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right
- `scaleIn` - Scale from small to normal
- `slideUp` - Slide up from bottom

### 3. Parallax Effects (`useParallax` hook)

For parallax/speed effects (requires ScrollSmoother):

```jsx
import { useParallax } from '../hooks/useGSAPScroll'

function MyComponent() {
  const parallaxRef = useParallax(0.5) // Speed multiplier

  return <div ref={parallaxRef} data-speed="0.5">Parallax content</div>
}
```

## 🔑 ScrollSmoother License

**ScrollSmoother is a premium plugin** that requires a **Club GreenSock membership**.

### To Enable ScrollSmoother:

1. **Purchase a Club GreenSock membership** from https://greensock.com/club/
2. **Register your license** in your project:

```javascript
// In src/components/GSAPProvider.jsx or a separate file
import { gsap } from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

// Register with your license key
gsap.registerPlugin(ScrollSmoother)
```

3. The `GSAPProvider` will automatically detect and use ScrollSmoother if available.

### Without a License:

- ScrollTrigger animations will still work (free)
- Smooth scrolling will be disabled
- The app will function normally with standard browser scrolling

## 📝 Usage Examples

### Example 1: Basic Scroll Animation

```jsx
import { useGSAPScroll } from '../hooks/useGSAPScroll'

export default function MyPage() {
  const titleRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.1 })
  const textRef = useGSAPScroll({ animation: 'fadeInUp', delay: 0.2 })

  return (
    <div>
      <h1 ref={titleRef}>Animated Title</h1>
      <p ref={textRef}>Animated text content</p>
    </div>
  )
}
```

### Example 2: Staggered Animations

```jsx
import { useGSAPScroll } from '../hooks/useGSAPScroll'

export default function CardGrid() {
  const cards = [1, 2, 3, 4]
  
  return (
    <div className="grid">
      {cards.map((card, index) => {
        const cardRef = useGSAPScroll({
          animation: 'fadeInUp',
          delay: index * 0.1, // Stagger delay
          duration: 0.6
        })
        return <div key={card} ref={cardRef}>Card {card}</div>
      })}
    </div>
  )
}
```

### Example 3: Custom GSAP Timeline

For more complex animations, use GSAP directly:

```jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function CustomAnimation() {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    })

    tl.from(element, {
      opacity: 0,
      y: 50,
      rotation: -10,
      duration: 1,
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
  }, [])

  return <div ref={elementRef}>Custom animated content</div>
}
```

## 🎨 ScrollSmoother Data Attributes

When ScrollSmoother is active, you can use these data attributes:

- `data-speed="0.5"` - Parallax speed (negative = slower, positive = faster)
- `data-lag="0.3"` - Lag effect for smooth following

```html
<div data-speed="0.5">Slower parallax</div>
<div data-speed="-0.5">Faster parallax</div>
<div data-lag="0.3">Lag effect</div>
```

## 🔧 Configuration

### ScrollSmoother Settings

Edit `src/components/GSAPProvider.jsx` to customize:

```javascript
ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.5,        // Smoothness (1 = no smoothing, higher = smoother)
  effects: true,      // Enable data-speed and data-lag
  smoothTouch: 0.1,   // Touch device smoothing (0 = disabled)
  normalizeScroll: true // Normalize across browsers
})
```

### ScrollTrigger Settings

Default settings in `useGSAPScroll`:
- `start: 'top 80%'` - Animation starts when element is 80% from top
- `once: true` - Animate only once
- `duration: 0.8` - Animation duration in seconds

## 🐛 Troubleshooting

### ScrollSmoother Not Working

1. Check browser console for license errors
2. Verify Club GreenSock membership is active
3. Ensure license is registered: `gsap.registerPlugin(ScrollSmoother)`
4. The app will fall back to ScrollTrigger-only mode

### Animations Not Triggering

1. Ensure elements are visible in viewport
2. Check ScrollTrigger refresh on route changes
3. Verify refs are properly attached to elements
4. Check browser console for GSAP errors

### Performance Issues

1. Reduce number of simultaneous animations
2. Use `will-change` CSS property sparingly
3. Consider using `once: true` to prevent re-animations
4. Optimize images and assets

## 📚 Resources

- **GSAP Documentation**: https://greensock.com/docs/
- **ScrollTrigger Docs**: https://greensock.com/docs/v3/Plugins/ScrollTrigger
- **ScrollSmoother Docs**: https://greensock.com/docs/v3/Plugins/ScrollSmoother
- **Club GreenSock**: https://greensock.com/club/
- **GSAP Forums**: https://greensock.com/forums/

## ✅ Current Implementation Status

- ✅ GSAP installed and configured
- ✅ ScrollTrigger working (free)
- ✅ ScrollSmoother structure in place (requires license)
- ✅ Custom hooks for easy animations
- ✅ Example animations on Home page
- ✅ Route change handling
- ✅ Responsive behavior

## 🚀 Next Steps

1. **Add animations to other pages** (Events, Space, PricingFAQ, etc.)
2. **Purchase Club GreenSock membership** to enable ScrollSmoother
3. **Customize animation timings** per page/section
4. **Add parallax effects** to hero sections
5. **Optimize performance** for production

---

**Note**: This implementation gracefully handles both licensed and unlicensed scenarios, ensuring the app works perfectly with or without ScrollSmoother.

