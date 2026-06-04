import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './Modal.css'

export default function RatingModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [hoveredStar, setHoveredStar] = useState(0)
  const [form, setForm] = useState({ customer_name:'', star_rating:0, comment:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.star_rating === 0) { toast.error('Please select a star rating'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('ratings').insert({ customer_name:form.customer_name, star_rating:form.star_rating, comment:form.comment, status:'pending', user_id: user?.id || null })
      if (error) throw error
      onSuccess()
    } catch { toast.error('Failed to submit rating. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><FiX size={20} /></button>
        <div className="modal-header"><h3>Rate Our Services</h3><p>Your feedback means everything to us</p></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Your Name *</label><input type="text" placeholder="How should we credit you?" value={form.customer_name} onChange={e => setForm({...form, customer_name:e.target.value})} required /></div>
          <div className="form-group">
            <label>Rating *</label>
            <div className="star-picker">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setForm({...form, star_rating:star})} className="star-btn">
                  <FaStar size={28} color={star <= (hoveredStar || form.star_rating) ? 'var(--accent-gold)' : 'var(--border)'} />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group"><label>Comment</label><textarea placeholder="Tell us about your experience..." value={form.comment} onChange={e => setForm({...form, comment:e.target.value})} rows={4} /></div>
          <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>{loading ? 'Submitting...' : 'Submit Rating'}</button>
        </form>
      </div>
    </div>
  )
}
