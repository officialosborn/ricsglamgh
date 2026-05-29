import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import OrderModal from '../components/OrderModal'
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  async function fetchProduct() {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (data) setProduct(data)
    setLoading(false)
  }

  const nextImage = () => setActiveImage(prev => (prev + 1) % product.images.length)
  const prevImage = () => setActiveImage(prev => (prev - 1 + product.images.length) % product.images.length)

  if (loading) return (
    <div className="detail-loading">
      <div className="detail-skeleton" />
    </div>
  )

  if (!product) return (
    <div className="detail-not-found">
      <p>Product not found.</p>
      <Link to="/shop" className="btn-outline">Back to Shop</Link>
    </div>
  )

  const images = product.images?.length > 0 ? product.images : []

  return (
    <div className="product-detail page-enter">
      <div className="container">
        <Link to="/shop" className="back-link">
          <FiArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="detail-grid">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="main-image-wrap">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="main-image"
                    key={activeImage}
                  />
                  {images.length > 1 && (
                    <>
                      <button className="gallery-prev" onClick={prevImage}><FiChevronLeft size={20} /></button>
                      <button className="gallery-next" onClick={nextImage}><FiChevronRight size={20} /></button>
                    </>
                  )}
                </>
              ) : (
                <div className="detail-image-placeholder">
                  <span>Ric's Glam</span>
                </div>
              )}
              {!product.in_stock && (
                <div className="detail-out-badge">Out of Stock</div>
              )}
            </div>

            {/* Thumbnails (desktop) */}
            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${i === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="divider" />
            <div className="detail-price">GH₵ {product.price}</div>

            {product.description && (
              <p className="detail-description">{product.description}</p>
            )}

            <div className="detail-actions">
              <button
                className={`btn-primary ${!product.in_stock ? 'btn-disabled' : ''}`}
                onClick={() => product.in_stock && setOrderModalOpen(true)}
                disabled={!product.in_stock}
                style={{ opacity: product.in_stock ? 1 : 0.5, cursor: product.in_stock ? 'pointer' : 'not-allowed' }}
              >
                {product.in_stock ? 'Order Now' : 'Out of Stock'}
              </button>
              <Link to="/services" className="btn-outline">Book a Service</Link>
            </div>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{product.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Availability</span>
                <span className={`meta-value ${product.in_stock ? 'in-stock' : 'out-stock'}`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Delivery</span>
                <span className="meta-value">Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {orderModalOpen && (
        <OrderModal product={product} onClose={() => setOrderModalOpen(false)} />
      )}
    </div>
  )
}
