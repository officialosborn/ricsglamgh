import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Services = lazy(() => import('./pages/Services'))
const About = lazy(() => import('./pages/About'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function PageLoader() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
        <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2.2rem', fontStyle:'italic', color:'var(--accent-primary)', animation:'pulse 1.5s ease-in-out infinite' }}>
          Ric's Glam
        </span>
        <div style={{ width:'40px', height:'2px', background:'var(--accent-primary)', animation:'loadBar 1.5s ease-in-out infinite', transformOrigin:'left' }} />
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes loadBar { 0%{transform:scaleX(0)} 50%{transform:scaleX(1)} 100%{transform:scaleX(0)} }
      `}</style>
    </div>
  )
}

function Layout({ children }) {
  return <><Navbar />{children}<Footer /></>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ style: { background:'var(--bg-card)', color:'var(--text-primary)', border:'1px solid var(--border)', fontFamily:'Jost,sans-serif', fontSize:'1rem' } }} />
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/shop" element={<Layout><Shop /></Layout>} />
              <Route path="/shop/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/services" element={<Layout><Services /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
