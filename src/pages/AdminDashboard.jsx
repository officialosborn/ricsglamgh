import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/cloudinary'
import toast from 'react-hot-toast'
import { FiLogOut, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUpload, FiHome } from 'react-icons/fi'
import './AdminDashboard.css'

const ADMIN_EMAIL = 'ricsglam@admin.com'
const ADMIN_PASSWORD = 'Ndukaglam2018@'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [loginForm, setLoginForm] = useState({ email:'', password:'' })
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  const [ratingsFilter, setRatingsFilter] = useState('all')
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [ratings, setRatings] = useState([])
  const [settings, setSettings] = useState({})
  const [showProductForm, setShowProductForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [productForm, setProductForm] = useState({ name:'', category:'wigs', description:'', price:'', in_stock:true, featured:false, images:[] })
  const [serviceForm, setServiceForm] = useState({ name:'', description:'', show_on_homepage:false })
  const [testimonialForm, setTestimonialForm] = useState({ customer_name:'', review:'' })

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('ricsglam_admin')
    if (isAdmin) { setAuthed(true); fetchAll() }
  }, [])

  async function fetchAll() {
    const [{ data: prod }, { data: svc }, { data: test }, { data: rat }, { data: set }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('created_at'),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('ratings').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*'),
    ])
    if (prod) setProducts(prod)
    if (svc) setServices(svc)
    if (test) setTestimonials(test)
    if (rat) setRatings(rat)
    if (set) { const obj = {}; set.forEach(s => { obj[s.key] = s.value }); setSettings(obj) }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('ricsglam_admin', 'true')
      setAuthed(true); fetchAll()
    } else { setLoginError('Invalid credentials') }
  }

  const handleLogout = () => { sessionStorage.removeItem('ricsglam_admin'); navigate('/') }

  // Products
  const openProductForm = (product = null) => {
    if (product) { setEditingItem(product); setProductForm({ name:product.name, category:product.category, description:product.description||'', price:product.price||'', in_stock:product.in_stock, featured:product.featured, images:product.images||[] }) }
    else { setEditingItem(null); setProductForm({ name:'', category:'wigs', description:'', price:'', in_stock:true, featured:false, images:[] }) }
    setShowProductForm(true)
  }

  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploads = await Promise.all(files.map(f => uploadImage(f)))
      setProductForm(prev => ({ ...prev, images: [...prev.images, ...uploads.map(u => u.url)] }))
      toast.success(`${files.length} image(s) uploaded`)
    } catch { toast.error('Image upload failed') }
    finally { setUploading(false) }
  }

  const removeProductImage = (index) => setProductForm(prev => ({ ...prev, images: prev.images.filter((_,i) => i !== index) }))

  const saveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name) { toast.error('Product name is required'); return }
    const payload = { name:productForm.name, category:productForm.category, description:productForm.description, price:productForm.price ? parseFloat(productForm.price) : null, in_stock:productForm.in_stock, featured:productForm.featured, images:productForm.images }
    try {
      if (editingItem) { const { error } = await supabase.from('products').update(payload).eq('id', editingItem.id); if (error) throw error; toast.success('Product updated') }
      else { const { error } = await supabase.from('products').insert(payload); if (error) throw error; toast.success('Product added') }
      setShowProductForm(false); setEditingItem(null); fetchAll()
    } catch { toast.error('Failed to save product') }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Product deleted'); fetchAll()
  }

  const toggleProductField = async (id, field, value) => { await supabase.from('products').update({ [field]: !value }).eq('id', id); fetchAll() }

  // Services
  const openServiceForm = (service = null) => {
    if (service) { setEditingItem(service); setServiceForm({ name:service.name, description:service.description||'', show_on_homepage:service.show_on_homepage }) }
    else { setEditingItem(null); setServiceForm({ name:'', description:'', show_on_homepage:false }) }
    setShowServiceForm(true)
  }

  const saveService = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) { await supabase.from('services').update(serviceForm).eq('id', editingItem.id); toast.success('Service updated') }
      else { await supabase.from('services').insert(serviceForm); toast.success('Service added') }
      setShowServiceForm(false); setEditingItem(null); fetchAll()
    } catch { toast.error('Failed to save service') }
  }

  const deleteService = async (id) => { if (!confirm('Delete this service?')) return; await supabase.from('services').delete().eq('id', id); toast.success('Deleted'); fetchAll() }
  const toggleServiceHomepage = async (id, current) => { await supabase.from('services').update({ show_on_homepage: !current }).eq('id', id); fetchAll() }

  // Testimonials
  const openTestimonialForm = (t = null) => {
    if (t) { setEditingItem(t); setTestimonialForm({ customer_name:t.customer_name, review:t.review }) }
    else { setEditingItem(null); setTestimonialForm({ customer_name:'', review:'' }) }
    setShowTestimonialForm(true)
  }

  const saveTestimonial = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) { await supabase.from('testimonials').update(testimonialForm).eq('id', editingItem.id); toast.success('Updated') }
      else { await supabase.from('testimonials').insert(testimonialForm); toast.success('Added') }
      setShowTestimonialForm(false); setEditingItem(null); fetchAll()
    } catch { toast.error('Failed to save testimonial') }
  }

  const deleteTestimonial = async (id) => { if (!confirm('Delete?')) return; await supabase.from('testimonials').delete().eq('id', id); toast.success('Deleted'); fetchAll() }

  // Ratings
  const updateRatingStatus = async (id, status) => { await supabase.from('ratings').update({ status }).eq('id', id); toast.success(`Rating ${status}`); fetchAll() }

  // Settings
  const updateSetting = async (key, value) => { await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' }); toast.success('Saved'); fetchAll() }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try { const { url } = await uploadImage(file); await updateSetting('cta_banner', url) }
    catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleHeroUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try { const { url } = await uploadImage(file); await updateSetting('hero_image', url); setSettings(prev => ({ ...prev, hero_image: url })) }
    catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (!authed) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <h2>Ric's Glam</h2>
          <p>Admin Dashboard</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email:e.target.value})} required />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password:e.target.value})} required />
            {loginError && <span className="login-error">{loginError}</span>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    )
  }

  const pendingRatings = ratings.filter(r => r.status === 'pending')
  const filteredRatings = ratingsFilter === 'all' ? ratings : ratings.filter(r => r.status === ratingsFilter)

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">Ric's Glam</div>
        <nav className="admin-nav">
          {[
            { key:'products', label:'Products' },
            { key:'services', label:'Services' },
            { key:'testimonials', label:'Testimonials' },
            { key:'ratings', label:`Ratings${pendingRatings.length > 0 ? ` (${pendingRatings.length})` : ''}` },
            { key:'settings', label:'Settings' },
          ].map(tab => (
            <button key={tab.key} className={`admin-nav-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-action-btn" onClick={() => navigate('/')}><FiHome size={16} /> View Site</button>
          <button className="admin-action-btn logout" onClick={handleLogout}><FiLogOut size={16} /> Logout</button>
        </div>
      </aside>

      <main className="admin-main">

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Products</h2>
              <button className="admin-add-btn" onClick={() => openProductForm()}><FiPlus size={16} /> Add Product</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>In Stock</th><th>Featured</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.length === 0 ? <tr><td colSpan={7} className="empty-row">No products yet.</td></tr> : products.map(p => (
                    <tr key={p.id}>
                      <td>{p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="table-thumb" /> : <div className="table-thumb-placeholder">—</div>}</td>
                      <td className="td-name">{p.name}</td>
                      <td><span className="category-badge">{p.category}</span></td>
                      <td>{p.price ? `GH₵${p.price}` : '—'}</td>
                      <td><button className={`toggle-btn ${p.in_stock ? 'on' : 'off'}`} onClick={() => toggleProductField(p.id, 'in_stock', p.in_stock)}>{p.in_stock ? 'In Stock' : 'Out of Stock'}</button></td>
                      <td><button className={`toggle-btn ${p.featured ? 'on' : 'off'}`} onClick={() => toggleProductField(p.id, 'featured', p.featured)}>{p.featured ? 'Featured' : 'Not Featured'}</button></td>
                      <td><div className="table-actions"><button className="icon-btn edit" onClick={() => openProductForm(p)}><FiEdit2 size={15} /></button><button className="icon-btn delete" onClick={() => deleteProduct(p.id)}><FiTrash2 size={15} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showProductForm && (
              <div className="admin-modal-overlay" onClick={() => setShowProductForm(false)}>
                <div className="admin-form-modal" onClick={e => e.stopPropagation()}>
                  <div className="admin-modal-header"><h3>{editingItem ? 'Edit Product' : 'Add Product'}</h3><button onClick={() => setShowProductForm(false)}><FiX size={18} /></button></div>
                  <form onSubmit={saveProduct}>
                    <div className="admin-form-grid">
                      <div className="form-group"><label>Product Name *</label><input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name:e.target.value})} required /></div>
                      <div className="form-group"><label>Category *</label>
                        <select value={productForm.category} onChange={e => setProductForm({...productForm, category:e.target.value})}>
                          <option value="wigs">Wigs</option>
                          <option value="lashes">Lashes</option>
                          <option value="serum & oil">Serum & Oil</option>
                        </select>
                      </div>
                      <div className="form-group"><label>Price (GH₵)</label><input type="number" step="0.01" min="0" placeholder="Leave empty to hide price" value={productForm.price} onChange={e => setProductForm({...productForm, price:e.target.value})} /></div>
                      <div className="form-group form-toggles">
                        <label className="toggle-label"><input type="checkbox" checked={productForm.in_stock} onChange={e => setProductForm({...productForm, in_stock:e.target.checked})} /> In Stock</label>
                        <label className="toggle-label"><input type="checkbox" checked={productForm.featured} onChange={e => setProductForm({...productForm, featured:e.target.checked})} /> Featured on Homepage</label>
                      </div>
                      <div className="form-group full-width"><label>Description</label><textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description:e.target.value})} placeholder="Describe this product..." /></div>
                      <div className="form-group full-width">
                        <label>Images</label>
                        <label className="upload-area"><FiUpload size={20} /><span>{uploading ? 'Uploading...' : 'Click to upload images'}</span><input type="file" accept="image/*" multiple onChange={handleProductImageUpload} style={{display:'none'}} disabled={uploading} /></label>
                        {productForm.images.length > 0 && (
                          <div className="image-preview-grid">
                            {productForm.images.map((url, i) => (
                              <div key={i} className="image-preview-item">
                                <img src={url} alt={`Preview ${i+1}`} />
                                <button type="button" className="remove-image-btn" onClick={() => removeProductImage(i)}><FiX size={12} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="admin-form-actions">
                      <button type="button" className="btn-cancel" onClick={() => setShowProductForm(false)}>Cancel</button>
                      <button type="submit" className="btn-save" disabled={uploading}>{editingItem ? 'Update Product' : 'Add Product'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <div className="admin-section">
            <div className="admin-section-header"><h2>Services</h2><button className="admin-add-btn" onClick={() => openServiceForm()}><FiPlus size={16} /> Add Service</button></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Service Name</th><th>Description</th><th>Show on Homepage</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.length === 0 ? <tr><td colSpan={4} className="empty-row">No services yet.</td></tr> : services.map(s => (
                    <tr key={s.id}>
                      <td className="td-name">{s.name}</td>
                      <td className="td-desc">{s.description || '—'}</td>
                      <td><button className={`toggle-btn ${s.show_on_homepage ? 'on' : 'off'}`} onClick={() => toggleServiceHomepage(s.id, s.show_on_homepage)}>{s.show_on_homepage ? 'Visible' : 'Hidden'}</button></td>
                      <td><div className="table-actions"><button className="icon-btn edit" onClick={() => openServiceForm(s)}><FiEdit2 size={15} /></button><button className="icon-btn delete" onClick={() => deleteService(s.id)}><FiTrash2 size={15} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showServiceForm && (
              <div className="admin-modal-overlay" onClick={() => setShowServiceForm(false)}>
                <div className="admin-form-modal small" onClick={e => e.stopPropagation()}>
                  <div className="admin-modal-header"><h3>{editingItem ? 'Edit Service' : 'Add Service'}</h3><button onClick={() => setShowServiceForm(false)}><FiX size={18} /></button></div>
                  <form onSubmit={saveService}>
                    <div className="form-group"><label>Service Name *</label><input type="text" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name:e.target.value})} required /></div>
                    <div className="form-group"><label>Description</label><textarea rows={3} value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description:e.target.value})} placeholder="Briefly describe this service..." /></div>
                    <div className="form-group"><label className="toggle-label"><input type="checkbox" checked={serviceForm.show_on_homepage} onChange={e => setServiceForm({...serviceForm, show_on_homepage:e.target.checked})} /> Show on Homepage</label></div>
                    <div className="admin-form-actions"><button type="button" className="btn-cancel" onClick={() => setShowServiceForm(false)}>Cancel</button><button type="submit" className="btn-save">{editingItem ? 'Update' : 'Add Service'}</button></div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div className="admin-section">
            <div className="admin-section-header"><h2>Testimonials</h2><button className="admin-add-btn" onClick={() => openTestimonialForm()}><FiPlus size={16} /> Add Testimonial</button></div>
            <div className="testimonials-admin-grid">
              {testimonials.length === 0 ? <p className="empty-msg">No testimonials yet.</p> : testimonials.map(t => (
                <div key={t.id} className="testimonial-admin-card">
                  <p>"{t.review}"</p>
                  <span>— {t.customer_name}</span>
                  <div className="table-actions"><button className="icon-btn edit" onClick={() => openTestimonialForm(t)}><FiEdit2 size={15} /></button><button className="icon-btn delete" onClick={() => deleteTestimonial(t.id)}><FiTrash2 size={15} /></button></div>
                </div>
              ))}
            </div>
            {showTestimonialForm && (
              <div className="admin-modal-overlay" onClick={() => setShowTestimonialForm(false)}>
                <div className="admin-form-modal small" onClick={e => e.stopPropagation()}>
                  <div className="admin-modal-header"><h3>{editingItem ? 'Edit Testimonial' : 'Add Testimonial'}</h3><button onClick={() => setShowTestimonialForm(false)}><FiX size={18} /></button></div>
                  <form onSubmit={saveTestimonial}>
                    <div className="form-group"><label>Customer Name *</label><input type="text" value={testimonialForm.customer_name} onChange={e => setTestimonialForm({...testimonialForm, customer_name:e.target.value})} required /></div>
                    <div className="form-group"><label>Review *</label><textarea rows={4} value={testimonialForm.review} onChange={e => setTestimonialForm({...testimonialForm, review:e.target.value})} required placeholder="Customer's review..." /></div>
                    <div className="admin-form-actions"><button type="button" className="btn-cancel" onClick={() => setShowTestimonialForm(false)}>Cancel</button><button type="submit" className="btn-save">{editingItem ? 'Update' : 'Add Testimonial'}</button></div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RATINGS */}
        {activeTab === 'ratings' && (
          <div className="admin-section">
            <div className="admin-section-header"><h2>Ratings</h2><span className="pending-badge">{pendingRatings.length} pending</span></div>
            <div className="ratings-filter-tabs">
              {['all','pending','approved','rejected'].map(status => (
                <button key={status} className={`ratings-tab ${ratingsFilter === status ? 'active' : ''}`} onClick={() => setRatingsFilter(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Customer</th><th>Stars</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredRatings.length === 0 ? <tr><td colSpan={5} className="empty-row">No ratings found.</td></tr> : filteredRatings.map(r => (
                    <tr key={r.id}>
                      <td className="td-name">{r.customer_name}</td>
                      <td>{'★'.repeat(r.star_rating)}{'☆'.repeat(5-r.star_rating)}</td>
                      <td className="td-desc">{r.comment || '—'}</td>
                      <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                      <td>
                        <div className="table-actions">
                          {r.status !== 'approved' && <button className="icon-btn approve" onClick={() => updateRatingStatus(r.id,'approved')} title="Approve"><FiCheck size={15} /></button>}
                          {r.status !== 'rejected' && <button className="icon-btn delete" onClick={() => updateRatingStatus(r.id,'rejected')} title="Reject"><FiX size={15} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="admin-section">
            <div className="admin-section-header"><h2>Settings</h2></div>
            <div className="settings-grid">
              <div className="settings-card">
                <h4>Homepage Hero Image</h4>
                <p style={{fontSize:'0.85rem',color:'#888',marginBottom:'0.75rem'}}>Background image for the hero section. Leave empty for the default styled design.</p>
                {settings.hero_image && <img src={settings.hero_image} alt="Hero" className="banner-preview" />}
                <label className="upload-area"><FiUpload size={18} /><span>{uploading ? 'Uploading...' : 'Upload hero background image'}</span><input type="file" accept="image/*" onChange={handleHeroUpload} style={{display:'none'}} disabled={uploading} /></label>
                {settings.hero_image && <button className="btn-cancel" style={{marginTop:'0.5rem',width:'100%'}} onClick={async () => { await updateSetting('hero_image',''); setSettings(prev => ({...prev, hero_image:''})) }}>Remove Hero Image</button>}
              </div>
              <div className="settings-card">
                <h4>Homepage CTA Banner</h4>
                {settings.cta_banner && <img src={settings.cta_banner} alt="CTA Banner" className="banner-preview" />}
                <label className="upload-area"><FiUpload size={18} /><span>{uploading ? 'Uploading...' : 'Upload new banner image'}</span><input type="file" accept="image/*" onChange={handleBannerUpload} style={{display:'none'}} disabled={uploading} /></label>
              </div>
              {[
                { key:'whatsapp', label:'WhatsApp Number', placeholder:'233209823469' },
                { key:'email', label:'Email Address', placeholder:'ritchinduka@gmail.com' },
                { key:'tiktok', label:'TikTok URL', placeholder:'https://tiktok.com/@...' },
                { key:'snapchat', label:'Snapchat URL', placeholder:'https://snapchat.com/...' },
                { key:'location', label:'Location', placeholder:'Accra, Ghana' },
              ].map(field => (
                <div key={field.key} className="settings-card">
                  <h4>{field.label}</h4>
                  <div className="settings-input-row">
                    <input type="text" value={settings[field.key]||''} onChange={e => setSettings({...settings, [field.key]:e.target.value})} placeholder={field.placeholder} />
                    <button className="btn-save" onClick={() => updateSetting(field.key, settings[field.key])}>Save</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
