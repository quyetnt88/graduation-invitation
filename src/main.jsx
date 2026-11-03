import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.js'
import './index.css'
import App from './App.jsx'
import StatsPage from './pages/StatsPage.jsx'
import HostPage from './pages/HostPage.jsx'

const PAGES = { '/thongke': StatsPage, '/taothiep': HostPage }
const Page = PAGES[window.location.pathname.replace(/\/+$/, '')] ?? App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
