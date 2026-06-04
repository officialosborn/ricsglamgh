import { useState } from 'react'
import { FiX, FiMinus, FiPlus } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import './Modal.css'

export default function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name:'', phone:'', address:'', quantity:1, notes:'' })
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const adjustQty = (delta) => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + delta) }))

  const handleOrder = (e) => {
    e.preventDefault()
    const price = product.price ? `GH₵${product.price}` : 'Price on Request'
    const total = product.price ? `GH₵${(product.price * form.quantity).toFixed(2)}` : 'Price on Request'
    const message =
      `*New Order — Ric's Glam* 🌸%0A%0A` +
      `*Product:* ${product.name}%0A` +
      `*Category:* ${product.category}%0A` +
      `*Price:* ${price}%0A` +
      `*Quantity:* ${form.quantity}%0A` +
      `*Total:* ${total}%0A%0A` +
      `*Customer Name:* ${form.name}%0A` +
      `*Phone:* ${form.phone}%0A` +
      `*Delivery Address:* ${form.address}%0A` +
      `${form.notes ? `*Notes:* ${form.notes}` : ''}`
    window.open(`https://wa.me/233209823469?text=${message}`, '_blank')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><FiX size={20} /></button>
        <div className="modal-header">
          <h3>Place Order</h3>
          <p>{product.name}</p>
        </div>
        <div className="order-product-preview">
          {product.images?.[0] && <img src={product.images[0]} alt={product.name} />}
          <div>
            <span className="order-product-name">{product.name}</span>
            <span className="order-product-price">{product.price ? `GH₵ ${product.price}` : 'Price on Request'}</span>
          </div>
        </div>
        <form onSubmit={handleOrder}>
          <div className="form-group"><label>Your Name *</label><input name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>Phone Number *</label><input name="phone" type="tel" placeholder="e.g. 0244000000" value={form.phone} onChange={handleChange} required /></div>
          <div className="form-group"><label>Delivery Address *</label><input name="address" type="text" placeholder="Your delivery address in Accra" value={form.address} onChange={handleChange} required /></div>
          <div className="form-group">
            <label>Quantity</label>
            <div className="qty-control">
              <button type="button" onClick={() => adjustQty(-1)}><FiMinus size={14} /></button>
              <span>{form.quantity}</span>
              <button type="button" onClick={() => adjustQty(1)}><FiPlus size={14} /></button>
            </div>
          </div>
          <div className="form-group"><label>Additional Notes</label><textarea name="notes" placeholder="Any special requests..." value={form.notes} onChange={handleChange} rows={3} /></div>
          <div className="order-total">
            <span>Total</span>
            <span className="total-amount">{product.price ? `GH₵ ${(product.price * form.quantity).toFixed(2)}` : 'Price on Request'}</span>
          </div>
          <button type="submit" className="whatsapp-order-btn"><FaWhatsapp size={20} />Order via WhatsApp</button>
        </form>
      </div>
    </div>
  )
}
