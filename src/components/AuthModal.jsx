import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './Modal.css'

export default function AuthModal({ onClose, onSuccess }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signin') { await signIn(form.email, form.password); toast.success('Welcome back!') }
      else { await signUp(form.email, form.password); toast.success('Account created!') }
      onSuccess()
    } catch (err) { toast.error(err.message || 'Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><FiX size={20} /></button>
        <div className="modal-header">
          <h3>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h3>
          <p>{mode === 'signin' ? 'Sign in to rate our services' : 'Join to share your experience'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email *</label><input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required /></div>
          <div className="form-group"><label>Password *</label><input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} /></div>
          <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
        </form>
        <div className="auth-switch">
          {mode === 'signin' ? <p>Don't have an account? <button onClick={() => setMode('signup')}>Sign up</button></p> : <p>Already have an account? <button onClick={() => setMode('signin')}>Sign in</button></p>}
        </div>
      </div>
    </div>
  )
}
