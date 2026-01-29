import { useScrollAnimation } from '../hooks/useScrollAnimation'

export default function AnimatedElement({ 
  children, 
  animationClass, 
  delay = 0, 
  className = '',
  as: Component = 'div',
  ...props 
}) {
  const ref = useScrollAnimation(animationClass, delay)
  
  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  )
}

