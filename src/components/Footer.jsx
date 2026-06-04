import { Link } from 'react-router-dom'
import { FaWhatsapp, FaTiktok, FaSnapchatGhost } from 'react-icons/fa'
import { MdEmail, MdLocationOn } from 'react-icons/md'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <h3 className="footer-logo">Ric's Glam</h3>
          <p>Premium wigs, lashes & beauty services in Accra, Ghana. Glamour made effortless.</p>
          <div className="footer-socials">
            <a href="https://wa.me/233209823469" target="_blank" rel="noreferrer" className="social-icon whatsapp"><FaWhatsapp size={20} /></a>
            <a href="https://www.tiktok.com/@chinenye414?_r=1&_t=ZS-95IEeK1RXmq" target="_blank" rel="noreferrer" className="social-icon tiktok"><FaTiktok size={18} /></a>
            <a href="https://snapchat.com/t/A6DUP6tb" target="_blank" rel="noreferrer" className="social-icon snapchat"><FaSnapchatGhost size={20} /></a>
          </div>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <ul>
            <li><a href="https://wa.me/233209823469" target="_blank" rel="noreferrer"><FaWhatsapp size={16} color="#25D366" /><span>0209823469</span></a></li>
            <li><a href="mailto:ritchinduka@gmail.com"><MdEmail size={16} /><span>ritchinduka@gmail.com</span></a></li>
            <li><span className="contact-item"><MdLocationOn size={16} /><span>Accra, Ghana</span></span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} Ric's Glam. All rights reserved.</p>
        <p>Designed with <span style={{color:'var(--accent-primary)'}}>♥</span> in Accra</p>
      </div>
    </footer>
  )
}
