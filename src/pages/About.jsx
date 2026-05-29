import { FaWhatsapp, FaTiktok, FaSnapchatGhost } from 'react-icons/fa'
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md'
import './About.css'

export default function About() {
  return (
    <div className="about-page page-enter">
      {/* Header */}
      <div className="about-header">
        <div className="container">
          <span className="section-subtitle">Our Story</span>
          <h1 className="section-title">About Ric's Glam</h1>
          <div className="divider" />
        </div>
      </div>

      {/* About Content */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Where Glamour Meets Expertise</h2>
              <p>
                Ric's Glam is Accra's premier destination for premium wigs, lashes, and professional beauty services. We believe every woman deserves to feel extraordinary — and we're here to make that effortless.
              </p>
              <p>
                From flawless wig installations to stunning lash extensions, our skilled team combines artistry with precision to deliver results that exceed expectations. Every service is tailored to you, because no two clients are the same.
              </p>
              <p>
                Whether you're shopping for a premium wig or booking a full glam appointment, Ric's Glam is your trusted partner in beauty — right here in Accra, Ghana.
              </p>

              <div className="about-values">
                {[
                  { title: 'Quality', desc: 'Premium products, professional results — every time.' },
                  { title: 'Expertise', desc: 'Skilled hands with a passion for beauty.' },
                  { title: 'You First', desc: 'Every look crafted specifically for the individual.' },
                ].map(v => (
                  <div key={v.title} className="value-item">
                    <h4>{v.title}</h4>
                    <p>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-decor">
              <div className="about-brand-block">
                <span className="about-brand-name">Ric's</span>
                <span className="about-brand-glam">Glam</span>
                <p>Accra, Ghana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Get in Touch</span>
            <h2 className="section-title">Contact Us</h2>
            <div className="divider" />
          </div>

          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <div className="contact-card">
                <a href="https://wa.me/233209823469" target="_blank" rel="noreferrer" className="contact-item">
                  <div className="contact-icon whatsapp-icon">
                    <FaWhatsapp size={24} />
                  </div>
                  <div>
                    <span className="contact-label">WhatsApp / Call</span>
                    <span className="contact-value">0209823469</span>
                  </div>
                </a>

                <a href="mailto:ritchinduka@gmail.com" className="contact-item">
                  <div className="contact-icon email-icon">
                    <MdEmail size={24} />
                  </div>
                  <div>
                    <span className="contact-label">Email</span>
                    <span className="contact-value">ritchinduka@gmail.com</span>
                  </div>
                </a>

                <div className="contact-item">
                  <div className="contact-icon location-icon">
                    <MdLocationOn size={24} />
                  </div>
                  <div>
                    <span className="contact-label">Location</span>
                    <span className="contact-value">Accra, Ghana</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a
                    href="https://wa.me/233209823469"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link-item whatsapp"
                  >
                    <FaWhatsapp size={22} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@chinenye414?_r=1&_t=ZS-95IEeK1RXmq"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link-item tiktok"
                  >
                    <FaTiktok size={20} />
                    <span>TikTok</span>
                  </a>
                  <a
                    href="https://snapchat.com/t/A6DUP6tb"
                    target="_blank"
                    rel="noreferrer"
                    className="social-link-item snapchat"
                  >
                    <FaSnapchatGhost size={22} />
                    <span>Snapchat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="map-container">
              <iframe
                title="Ric's Glam Location - Accra, Ghana"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254508.3087711938!2d-0.3196755!3d5.5912699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
