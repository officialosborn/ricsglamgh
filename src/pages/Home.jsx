import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { FaStar, FaWhatsapp } from 'react-icons/fa'
import { FiChevronDown, FiArrowRight } from 'react-icons/fi'
import AuthModal from '../components/AuthModal'
import OrderModal from '../components/OrderModal'
import RatingModal from '../components/RatingModal'
import toast from 'react-hot-toast'
import './Home.css'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [ratings, setRatings] = useState([])
  const [ctaBanner, setCtaBanner] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [{ data: svc }, { data: prod }, { data: test }, { data: rat }, { data: set }] = await Promise.all([
      supabase.from('services').select('*').eq('show_on_homepage', true),
      supabase.from('products').select('*').eq('featured', true).limit(8),
      supabase.from('testimonials').select('*').limit(3),
      supabase.from('ratings').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(6),
      supabase.from('settings').select('*').eq('key', 'cta_banner').single(),
    ])
    if (svc) setServices(svc)
    if (prod) setFeaturedProducts(prod)
    if (test) setTestimonials(test)
    if (rat) setRatings(rat)
    if (set?.value) setCtaBanner(set.value)
  }

  const handleOrderClick = (product) => {
    setSelectedProduct(product)
    setOrderModalOpen(true)
  }

  const handleRatingSubmit = () => {
    if (!user) {
      setAuthModalOpen(true)
    } else {
      setRatingModalOpen(true)
    }
  }

  const scrollToBooking = () => {
    navigate('/services', { state: { scrollToBooking: true } })
  }

  return (
    <div className="home page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <div className="hero-text">
            <span className="hero-eyebrow">Welcome to</span>
            <h1 className="hero-title">
              Ric's <em>Glam</em>
            </h1>
            <p className="hero-subtitle">
              Premium wigs, lashes & beauty services — crafted for the woman who demands nothing less than extraordinary.
            </p>
            <div className="hero-actions">
              {/* Shop Now with dropdown */}
              <div className="hero-dropdown-wrap">
                <button
                  className="btn-primary hero-btn"
                  onClick={() => setShopDropdownOpen(prev => !prev)}
                >
                  Shop Now <FiChevronDown size={16} />
                </button>
                {shopDropdownOpen && (
                  <div className="hero-dropdown">
                    <Link to="/shop?category=wigs" onClick={() => setShopDropdownOpen(false)}>
                      Wigs
                    </Link>
                    <Link to="/shop?category=lashes" onClick={() => setShopDropdownOpen(false)}>
                      Lashes
                    </Link>
                    <Link to="/shop" onClick={() => setShopDropdownOpen(false)}>
                      All Products
                    </Link>
                  </div>
                )}
              </div>
              <button className="btn-outline hero-btn" onClick={scrollToBooking}>
                Book a Service
              </button>
            </div>
          </div>
          <div className="hero-decor">
            <div className="hero-circle hero-circle-1" />
            <div className="hero-circle hero-circle-2" />
            <div className="hero-brand-text">Glam</div>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* SERVICES SNAPSHOT */}
      {services.length > 0 && (
        <section className="section services-snapshot">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">What We Offer</span>
              <h2 className="section-title">Our Services</h2>
              <div className="divider" />
            </div>
            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-card-accent" />
                  <h3>{service.name}</h3>
                  <p>{service.description || 'Professional beauty service tailored just for you.'}</p>
                  <span className="service-price">Price on Consultation</span>
                  <Link to="/services#booking" className="service-book-btn">
                    Book Now <FiArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
            <div className="section-cta">
              <Link to="/services" className="btn-outline">View All Services</Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="section featured-products">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Handpicked For You</span>
              <h2 className="section-title">Featured Products</h2>
              <div className="divider" />
            </div>
            <div className="products-grid">
              {featuredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/shop/${product.id}`} className="product-image-wrap">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>Ric's Glam</span>
                      </div>
                    )}
                    <div className="product-overlay">
                      <span>View Details</span>
                    </div>
                    {!product.in_stock && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                  </Link>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h4>{product.name}</h4>
                    <div className="product-footer">
                      <span className="product-price">GH₵ {product.price}</span>
                      <button
                        className={`order-btn ${!product.in_stock ? 'disabled' : ''}`}
                        onClick={() => product.in_stock && handleOrderClick(product)}
                        disabled={!product.in_stock}
                      >
                        {product.in_stock ? 'Order' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-cta">
              <Link to="/shop" className="btn-outline">View All Products</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="cta-banner-section">
        {ctaBanner ? (
          <div className="cta-banner-image" style={{ backgroundImage: `url(${ctaBanner})` }}>
            <div className="cta-banner-overlay">
              <h2>Ready to Glam Up?</h2>
              <div className="cta-banner-btns">
                <Link to="/shop" className="btn-primary">Shop Now</Link>
                <button className="btn-outline" onClick={scrollToBooking} style={{ color: 'white', borderColor: 'white' }}>
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="cta-banner-default">
            <div className="cta-banner-decor" />
            <div className="cta-banner-content">
              <span className="section-subtitle">Elevate Your Look</span>
              <h2>Ready to Glam Up?</h2>
              <p>Discover premium wigs and lashes, or book your beauty appointment today.</p>
              <div className="cta-banner-btns">
                <Link to="/shop" className="btn-primary">Shop Now</Link>
                <button className="btn-gold" onClick={scrollToBooking}>
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="section testimonials-section">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Kind Words</span>
              <h2 className="section-title">What Clients Say</h2>
              <div className="divider" />
            </div>
            <div className="testimonials-grid">
              {testimonials.map(t => (
                <div key={t.id} className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p>{t.review}</p>
                  <span className="testimonial-name">— {t.customer_name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RATINGS */}
      <section className="section ratings-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Our Community</span>
            <h2 className="section-title">Client Ratings</h2>
            <div className="divider" />
          </div>

          {ratings.length > 0 && (
            <div className="ratings-grid">
              {ratings.map(r => (
                <div key={r.id} className="rating-card">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={14}
                        color={i < r.star_rating ? 'var(--accent-gold)' : 'var(--border)'}
                      />
                    ))}
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <span className="rating-name">— {r.customer_name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="ratings-cta">
            <p>Enjoyed our services? Share your experience.</p>
            <button className="btn-primary" onClick={handleRatingSubmit}>
              Rate Our Services
            </button>
          </div>
        </div>
      </section>

      {/* MODALS */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false)
            setRatingModalOpen(true)
          }}
        />
      )}

      {orderModalOpen && selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setOrderModalOpen(false)}
        />
      )}

      {ratingModalOpen && (
        <RatingModal
          onClose={() => setRatingModalOpen(false)}
          onSuccess={() => {
            setRatingModalOpen(false)
            toast.success('Thank you! Your rating has been submitted for review.')
          }}
        />
      )}
    </div>
  )
}
