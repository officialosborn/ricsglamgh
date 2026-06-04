import { useState, useEffect } from 'react'
import { FiArrowUp } from 'react-icons/fi'
import './ScrollToTop.css'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      className={`scroll-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollUp}
      aria-label="Scroll to top"
    >
      <FiArrowUp size={20} />
    </button>
  )
}
