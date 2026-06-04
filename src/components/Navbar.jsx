import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import './Navbar.css'

const ADMIN_EMAIL = 'ricsglam@admin.com'
const ADMIN_PASSWORD = 'Ndukaglam2018@'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogoClick = () => {
    clickCountRef.current += 1
    clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) setAdminModalOpen(true)
      clickCountRef.current = 0
    }, 500)
  }

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem('ricsglam_admin', 'true')
      setAdminModalOpen(false)
      setAdminError('')
      navigate('/admin')
    } else {
      setAdminError('Invalid credentials')
    }
  }

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
  ]

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          <div className="navbar-logo" onClick={handleLogoClick}>
            <span className="logo-text">Ric's Glam</span>
          </div>
          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} className={location.pathname === link.path ? 'active' : ''}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className={location.pathname === link.path ? 'active' : ''} onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
          </div>
        )}
      </nav>

      {adminModalOpen && (
        <div className="modal-overlay" onClick={() => setAdminModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAdminModalOpen(false)}><FiX size={20} /></button>
            <h3>Admin Access</h3>
            <p>Enter your credentials to continue</p>
            <form onSubmit={handleAdminLogin}>
              <input type="email" placeholder="Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
              {adminError && <span className="error">{adminError}</span>}
              <button type="submit" className="btn-primary">Login</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
