import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StatsPage from './pages/StatsPage.jsx'

const isStatsPage = window.location.pathname.replace(/\/+$/, '') === '/thongke'

createRoot(document.getElementById('root')).render(
  <StrictMode>{isStatsPage ? <StatsPage /> : <App />}</StrictMode>,
)
