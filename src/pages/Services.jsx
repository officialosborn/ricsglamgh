import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FaWhatsapp } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import './Services.css'

export default function Services() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name:'', phone:'', service:'', date:'', time:'', notes:'' })
  const bookingRef = useRef(null)
  const location = useLocation()

  useEffect(() => { fetchServices() }, [])

  useEffect(() => {
    const shouldScroll = window.location.hash === '#booking' || location.state?.scrollToBooking
    if (shouldScroll) {
      setTimeout(() => { bookingRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 400)
    }
  }, [services, location.state])

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').order('created_at')
    if (data) setServices(data)
  }

  const handleBookNow = (serviceName) => {
    setForm(prev => ({ ...prev, service: serviceName }))
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const message =
      `*Appointment Request — Ric's Glam* 💅%0A%0A` +
      `*Name:* ${form.name}%0A` +
      `*Phone:* ${form.phone}%0A` +
      `*Service:* ${form.service}%0A` +
      `*Preferred Date:* ${form.date}%0A` +
      `${form.time ? `*Preferred Time:* ${form.time}%0A` : ''}` +
      `${form.notes ? `*Notes:* ${form.notes}` : ''}`
    window.open(`https://wa.me/233209823469?text=${message}`, '_blank')
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="services-page page-enter">
      <div className="services-header">
        <div className="container">
          <span className="section-subtitle">What We Offer</span>
          <h1 className="section-title">Our Services</h1>
          <div className="divider" />
          <p className="services-intro">Professional beauty services tailored to bring out your best. Visit us in Accra, Ghana.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {services.length === 0 ? (
            <div className="services-empty"><p>Services coming soon. Contact us via WhatsApp for bookings.</p></div>
          ) : (
            <div className="services-full-grid">
              {services.map((service, i) => (
                <div key={service.id} className="service-full-card">
                  <div className="service-number">0{i + 1}</div>
                  <div className="service-full-content">
                    <h3>{service.name}</h3>
                    <p>{service.description || 'Professional service delivered with care and expertise.'}</p>
                    <span className="service-price-tag">Price on Consultation</span>
                  </div>
                  <button className="service-full-book" onClick={() => handleBookNow(service.name)}>
                    Book Now <FiArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="booking-section" id="booking" ref={bookingRef}>
        <div className="container">
          <div className="booking-grid">
            <div className="booking-info">
              <span className="section-subtitle">Make an Appointment</span>
              <h2 className="section-title">Book a Service</h2>
              <div className="divider" />
              <p>Fill in the form and we'll confirm your appointment via WhatsApp.</p>
              <div className="booking-contact">
                <a href="https://wa.me/233209823469" target="_blank" rel="noreferrer" className="booking-whatsapp">
                  <FaWhatsapp size={22} color="#25D366" /><span>Chat directly on WhatsApp</span>
                </a>
                <div className="booking-location"><span>📍 Accra, Ghana</span></div>
              </div>
            </div>
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-group"><label>Full Name *</label><input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Phone Number *</label><input name="phone" type="tel" placeholder="e.g. 0244000000" value={form.phone} onChange={handleChange} required /></div>
              <div className="form-group">
                <label>Service *</label>
                <select name="service" value={form.service} onChange={handleChange} required>
                  <option value="">Select a service</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Preferred Date *</label><input name="date" type="date" min={minDate} value={form.date} onChange={handleChange} required /></div>
                <div className="form-group"><label>Preferred Time <span className="optional">(optional)</span></label><input name="time" type="time" value={form.time} onChange={handleChange} /></div>
              </div>
              <div className="form-group"><label>Additional Notes</label><textarea name="notes" placeholder="Any special requests..." value={form.notes} onChange={handleChange} rows={4} /></div>
              <button type="submit" className="booking-submit"><FaWhatsapp size={20} />Send Booking via WhatsApp</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
