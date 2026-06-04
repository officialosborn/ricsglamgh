import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import OrderModal from '../components/OrderModal'
import './Shop.css'

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [availability, setAvailability] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [maxPrice, setMaxPrice] = useState(5000)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => { fetchProducts() }, [])
  useEffect(() => { applyFilters() }, [products, category, availability, priceRange])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) {
      setProducts(data)
      const prices = data.filter(p => p.price).map(p => p.price)
      const max = prices.length ? Math.max(...prices) : 500
      setMaxPrice(max)
      setPriceRange([0, max])
    }
    setLoading(false)
  }

  function applyFilters() {
    let result = [...products]
    if (category !== 'all') result = result.filter(p => p.category === category)
    if (availability === 'in_stock') result = result.filter(p => p.in_stock)
    if (availability === 'out_of_stock') result = result.filter(p => !p.in_stock)
    result = result.filter(p => !p.price || (p.price >= priceRange[0] && p.price <= priceRange[1]))
    setFiltered(result)
  }

  return (
    <div className="shop-page page-enter">
      <div className="shop-header">
        <div className="container">
          <span className="section-subtitle">Browse Collection</span>
          <h1 className="section-title">Our Products</h1>
          <div className="divider" />
        </div>
      </div>

      <div className="shop-body container">
        <aside className="shop-filters">
          <div className="filter-group">
            <h4>Category</h4>
            {['all', 'wigs', 'lashes', 'serum & oil'].map(cat => (
              <button key={cat} className={`filter-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <h4>Availability</h4>
            {[{ value:'all', label:'All' }, { value:'in_stock', label:'In Stock' }, { value:'out_of_stock', label:'Out of Stock' }].map(opt => (
              <button key={opt.value} className={`filter-btn ${availability === opt.value ? 'active' : ''}`} onClick={() => setAvailability(opt.value)}>{opt.label}</button>
            ))}
          </div>
          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="price-range">
              <span>GH₵ {priceRange[0]} — GH₵ {priceRange[1]}</span>
              <input type="range" min={0} max={maxPrice} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} />
            </div>
          </div>
          <div className="filter-results"><span>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span></div>
        </aside>

        <div className="shop-grid-area">
          {loading ? (
            <div className="shop-loading">{[...Array(8)].map((_,i) => <div key={i} className="product-skeleton" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="shop-empty"><p>No products found. Try adjusting your filters.</p></div>
          ) : (
            <div className="shop-grid">
              {filtered.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/shop/${product.id}`} className="product-image-wrap">
                    {product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <div className="product-image-placeholder"><span>Ric's Glam</span></div>}
                    <div className="product-overlay"><span>View Details</span></div>
                    {!product.in_stock && <div className="out-of-stock-badge">Out of Stock</div>}
                  </Link>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h4>{product.name}</h4>
                    <div className="product-footer">
                      <span className="product-price">{product.price ? `GH₵ ${product.price}` : 'Price on Request'}</span>
                      <button className={`order-btn ${!product.in_stock ? 'disabled' : ''}`} onClick={() => product.in_stock && setSelectedProduct(product)} disabled={!product.in_stock}>
                        {product.in_stock ? 'Order' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProduct && <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}
