import { useState, useRef } from 'react'
import './ImageSlider.css'

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

export default function ImageSlider({ slides = DEFAULT_SLIDES }) {
  const [items, setItems] = useState(slides)
  const [isAnimating, setIsAnimating] = useState(false)
  const slideRef = useRef(null)

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    
    setItems(prev => {
      const newItems = [...prev]
      const first = newItems.shift()
      newItems.push(first)
      return newItems
    })
    
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    
    setItems(prev => {
      const newItems = [...prev]
      const last = newItems.pop()
      newItems.unshift(last)
      return newItems
    })
    
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <div className="imageSlider">
      <div className="sliderContainer">
        <div className="sliderSlide" ref={slideRef}>
          {items.map((slide, index) => (
            <div
              key={`${slide.name}-${index}`}
              className="sliderItem"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="sliderContent">
                <div className="sliderName">{slide.name}</div>
                <div className="sliderDes">{slide.description}</div>
                <a href="#/book" className="sliderSeeMore">
                  <button>Book Now</button>
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="sliderButtons">
          <button className="sliderPrev" onClick={handlePrev}>◁</button>
          <button className="sliderNext" onClick={handleNext}>▷</button>
        </div>
      </div>
    </div>
  )
}

